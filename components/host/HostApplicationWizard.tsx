"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  Compass,
  CheckCircle2,
  Loader2,
  Globe,
  Camera,
  Video,
  Send,
  Lock,
  ArrowRight,
  Plus,
} from "lucide-react";
import {
  COMMUNITY_TYPES,
  type CommunityType,
  type HostApplicationInput,
} from "@/lib/validation/host-application";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { firebaseErrorMessage } from "@/components/auth/auth-ui";

interface AvailableDestination {
  id: string;
  name: string;
  country: string;
  region: string;
}

interface HostApplicationWizardProps {
  initialUser: {
    uid: string;
    email: string;
    displayName: string;
  } | null;
  availableDestinations: AvailableDestination[];
}

const STORAGE_KEY = "bleetary_host_app_draft";

const DEFAULT_FORM_DATA: HostApplicationInput = {
  communityName: "",
  communityType: "social",
  audienceSize: 5000,
  communityUrl: "",
  instagramHandle: "",
  tiktokHandle: "",
  bio: "",
  proposedDestinations: [],
  hasHostedBefore: false,
  previousHostingDetails: "",
};

function getInitialFormData(): HostApplicationInput {
  if (typeof window === "undefined") return DEFAULT_FORM_DATA;
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_FORM_DATA, ...JSON.parse(saved) };
    }
  } catch {
    // Ignore storage parse errors
  }
  return DEFAULT_FORM_DATA;
}

const AUDIENCE_PRESETS = [
  { label: "1K – 5K", value: 3000 },
  { label: "5K – 25K", value: 15000 },
  { label: "25K – 100K", value: 50000 },
  { label: "100K+", value: 150000 },
];

const DEFAULT_POPULAR_DESTINATIONS = [
  "Bali, Indonesia",
  "Kyoto, Japan",
  "Costa Rica Rainforest",
  "Amalfi Coast, Italy",
  "Marrakech, Morocco",
  "Cape Town, South Africa",
  "Vumba Mountains, Zimbabwe",
  "Hanoi & Halong Bay, Vietnam",
];

export default function HostApplicationWizard({
  initialUser,
  availableDestinations,
}: HostApplicationWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State initialized from sessionStorage if available
  const [formData, setFormData] = useState<HostApplicationInput>(getInitialFormData);

  const [customDestination, setCustomDestination] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auth bridge state (Step 4)
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Save draft whenever formData changes
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch {
      // Ignore quota errors
    }
  }, [formData]);

  // Destination suggestions combining DB items and curated list
  const destinationSuggestions = Array.from(
    new Set([
      ...availableDestinations.map((d) => `${d.name}, ${d.country}`),
      ...DEFAULT_POPULAR_DESTINATIONS,
    ]),
  );

  function validateStep(currentStep: number): boolean {
    const errors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.communityName.trim() || formData.communityName.trim().length < 2) {
        errors.communityName = "Please enter your community or brand name (2+ characters).";
      }
      if (!formData.communityType) {
        errors.communityType = "Please select a community type.";
      }
    }

    if (currentStep === 2) {
      if (formData.audienceSize === null || isNaN(formData.audienceSize) || formData.audienceSize < 0) {
        errors.audienceSize = "Please enter a valid audience size.";
      }
    }

    if (currentStep === 3) {
      if (!formData.bio.trim() || formData.bio.trim().length < 20) {
        errors.bio = "Please write at least 20 characters describing your community and vision.";
      }
      if (!formData.proposedDestinations || formData.proposedDestinations.length === 0) {
        errors.proposedDestinations = "Please select or add at least one destination.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleNext() {
    if (validateStep(step)) {
      setStep((prev) => Math.min(4, prev + 1) as 1 | 2 | 3 | 4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleBack() {
    setFormErrors({});
    setApiError(null);
    setStep((prev) => Math.max(1, prev - 1) as 1 | 2 | 3 | 4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleDestination(dest: string) {
    setFormData((prev) => {
      const exists = prev.proposedDestinations.includes(dest);
      const updated = exists
        ? prev.proposedDestinations.filter((d) => d !== dest)
        : [...prev.proposedDestinations, dest];
      return { ...prev, proposedDestinations: updated };
    });
    if (formErrors.proposedDestinations) {
      setFormErrors((prev) => ({ ...prev, proposedDestinations: "" }));
    }
  }

  function addCustomDestination() {
    const trimmed = customDestination.trim();
    if (!trimmed) return;
    if (!formData.proposedDestinations.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        proposedDestinations: [...prev.proposedDestinations, trimmed],
      }));
    }
    setCustomDestination("");
    if (formErrors.proposedDestinations) {
      setFormErrors((prev) => ({ ...prev, proposedDestinations: "" }));
    }
  }

  // Handle final submission to /api/host/apply
  async function submitApplication() {
    setSubmitting(true);
    setApiError(null);

    try {
      const response = await fetch("/api/host/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit host application.");
      }

      sessionStorage.removeItem(STORAGE_KEY);
      setIsSuccess(true);
      router.refresh();
    } catch (err: unknown) {
      setApiError(
        err instanceof Error ? err.message : "Submission failed. Please check your details.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Auth bridge submission handler for Step 4
  async function handleAuthBridgeSubmit(e: FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (authMode === "register") {
        if (!authName.trim() || authName.length < 2) {
          throw new Error("Please enter your full name.");
        }
        if (!authEmail.trim()) throw new Error("Email is required.");
        if (authPassword.length < 8) {
          throw new Error("Password must be at least 8 characters.");
        }

        const cred = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        await updateProfile(cred.user, { displayName: authName });
        const idToken = await cred.user.getIdToken();

        // Register user doc on backend
        const regRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken, displayName: authName }),
        });

        if (!regRes.ok) {
          const payload = await regRes.json();
          throw new Error(payload.error || "Failed to initialize account.");
        }

        // Establish session cookie
        const sessionRes = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        if (!sessionRes.ok) {
          throw new Error("Account created! Please sign in to verify session.");
        }

        setCurrentUser({
          uid: cred.user.uid,
          email: cred.user.email || authEmail,
          displayName: authName,
        });

        // Submit application immediately
        await submitApplication();
      } else {
        // Login mode
        if (!authEmail.trim() || !authPassword) {
          throw new Error("Please enter your email and password.");
        }

        const cred = await signInWithEmailAndPassword(auth, authEmail, authPassword);

        if (!cred.user.emailVerified) {
          await sendEmailVerification(cred.user, {
            url: `${window.location.origin}/verify-email`,
            handleCodeInApp: true,
          });
          await signOut(auth);
          throw new Error(
            "Please verify your email first. We sent a verification link to your inbox.",
          );
        }

        const idToken = await cred.user.getIdToken(true);
        const sessionRes = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        if (!sessionRes.ok) {
          throw new Error("Could not initialize session.");
        }

        setCurrentUser({
          uid: cred.user.uid,
          email: cred.user.email || authEmail,
          displayName: cred.user.displayName || "Host",
        });

        // Submit application immediately
        await submitApplication();
      }
    } catch (err: unknown) {
      setAuthError(
        err instanceof Error && !("code" in err)
          ? err.message
          : firebaseErrorMessage(err),
      );
    } finally {
      setAuthLoading(false);
    }
  }

  // ── Success State ─────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto w-full px-4 py-16 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle2 size={36} />
        </div>
        <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full mb-3">
          Application Received
        </span>
        <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
          You&apos;re officially in the queue!
        </h1>
        <p className="text-gray-600 text-base leading-relaxed mb-8">
          Thank you for applying to host with Bleetary Travels. Our curator team is reviewing your community details and target destinations.
        </p>

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-left space-y-3 mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            What happens next:
          </p>
          <div className="flex items-start gap-3 text-xs text-gray-700">
            <span className="w-5 h-5 rounded-full bg-[#13b5b1] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              1
            </span>
            <span>We review your audience fit and travel preferences (24–48 hrs).</span>
          </div>
          <div className="flex items-start gap-3 text-xs text-gray-700">
            <span className="w-5 h-5 rounded-full bg-[#13b5b1] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              2
            </span>
            <span>You&apos;ll receive an intro email or invitation to explore our custom trip builder.</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/host/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-[#13b5b1] hover:bg-[#0fa09c] text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-[0_2px_10px_rgba(19,181,177,0.3)] hover:-translate-y-0.5"
          >
            Go to Host Dashboard <ArrowRight size={16} />
          </Link>
          <Link
            href="/trips"
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold px-6 py-3 rounded-xl text-sm transition-all"
          >
            Explore Trip Catalog
          </Link>
        </div>
      </div>
    );
  }

  const progressPercent = (step / 4) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Step progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-2">
          <span>
            Step {step} of 4:{" "}
            {step === 1
              ? "Community Details"
              : step === 2
                ? "Audience & Socials"
                : step === 3
                  ? "Hosting Vision"
                  : "Review & Submit"}
          </span>
          <span className="text-[#13b5b1] font-mono">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#13b5b1] to-[#f05c40] transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Back button */}
      {step > 1 && (
        <button
          onClick={handleBack}
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors mb-6"
        >
          <ChevronLeft size={16} /> Back to Step {step - 1}
        </button>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-6 sm:p-10">
        {/* ── STEP 1: Community Details ────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#13b5b1] bg-teal-50 px-3 py-1 rounded-full mb-2">
                <Users size={13} /> Step 1: Your Community
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Tell us about your audience
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Bleetary helps community leaders and creators design trips their audience will cherish.
              </p>
            </div>

            <div>
              <label
                htmlFor="communityName"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"
              >
                Community or Brand Name *
              </label>
              <input
                id="communityName"
                type="text"
                value={formData.communityName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, communityName: e.target.value }))
                }
                placeholder="e.g. Nomad Creatives Club, Yoga with Sarah, Tech Founders Hub"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#13b5b1] focus:border-transparent transition-all"
              />
              {formErrors.communityName && (
                <p className="text-xs text-rose-500 font-semibold mt-1">
                  {formErrors.communityName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Primary Community Channel / Type *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {COMMUNITY_TYPES.map((type) => {
                  const isSelected = formData.communityType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          communityType: type as CommunityType,
                        }))
                      }
                      className={`px-3.5 py-3 rounded-xl text-xs font-bold capitalize transition-all border text-left flex items-center justify-between ${
                        isSelected
                          ? "bg-teal-50 border-[#13b5b1] text-[#0d9b97] shadow-sm ring-2 ring-[#13b5b1]/20"
                          : "bg-gray-50 border-gray-200/80 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span>{type.replace("_", " ")}</span>
                      {isSelected && <CheckCircle2 size={14} className="text-[#13b5b1]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="communityUrl"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"
              >
                Website, Substack, or Community URL (Optional)
              </label>
              <div className="relative">
                <Globe
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="communityUrl"
                  type="url"
                  value={formData.communityUrl || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, communityUrl: e.target.value }))
                  }
                  placeholder="https://yourbrand.com or https://newsletter.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#13b5b1] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              onClick={handleNext}
              type="button"
              className="w-full mt-4 flex items-center justify-center gap-2 bg-[#13b5b1] hover:bg-[#0fa09c] text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-[0_4px_14px_rgba(19,181,177,0.3)] hover:-translate-y-0.5"
            >
              Continue to Audience & Reach <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ── STEP 2: Audience & Reach ────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#13b5b1] bg-teal-50 px-3 py-1 rounded-full mb-2">
                <Sparkles size={13} /> Step 2: Reach & Socials
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Audience size & social handles
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Help us estimate your group trip capacity and conversion velocity.
              </p>
            </div>

            <div>
              <label
                htmlFor="audienceSize"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"
              >
                Estimated Total Community / Follower Size *
              </label>
              <input
                id="audienceSize"
                type="number"
                min="0"
                step="500"
                value={formData.audienceSize ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    audienceSize: parseInt(e.target.value, 10) || 0,
                  }))
                }
                placeholder="5000"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#13b5b1] focus:border-transparent transition-all"
              />
              {formErrors.audienceSize && (
                <p className="text-xs text-rose-500 font-semibold mt-1">
                  {formErrors.audienceSize}
                </p>
              )}

              {/* Presets */}
              <div className="flex flex-wrap gap-2 mt-2.5">
                <span className="text-xs text-gray-400 self-center mr-1">Quick Select:</span>
                {AUDIENCE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, audienceSize: preset.value }))
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                      formData.audienceSize === preset.value
                        ? "bg-[#13b5b1] text-white border-[#13b5b1]"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="instagramHandle"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"
                >
                  Instagram Handle
                </label>
                <div className="relative">
                  <Camera
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="instagramHandle"
                    type="text"
                    value={formData.instagramHandle || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, instagramHandle: e.target.value }))
                    }
                    placeholder="@yourhandle"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#13b5b1] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="tiktokHandle"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"
                >
                  TikTok or YouTube Handle
                </label>
                <div className="relative">
                  <Video
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="tiktokHandle"
                    type="text"
                    value={formData.tiktokHandle || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, tiktokHandle: e.target.value }))
                    }
                    placeholder="@yourtiktok"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#13b5b1] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              type="button"
              className="w-full mt-4 flex items-center justify-center gap-2 bg-[#13b5b1] hover:bg-[#0fa09c] text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-[0_4px_14px_rgba(19,181,177,0.3)] hover:-translate-y-0.5"
            >
              Continue to Hosting Vision <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ── STEP 3: Hosting Vision & Destinations ────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#13b5b1] bg-teal-50 px-3 py-1 rounded-full mb-2">
                <Compass size={13} /> Step 3: Vision & Destinations
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Where would you like to travel?
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Select your wishlist destinations and describe your ideal group journey.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Target Destinations (Pick 1 to 10) *
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {destinationSuggestions.map((dest) => {
                  const isSelected = formData.proposedDestinations.includes(dest);
                  return (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => toggleDestination(dest)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-[#13b5b1] text-white border-[#13b5b1] shadow-sm"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span>{dest}</span>
                      {isSelected ? <CheckCircle2 size={13} /> : <Plus size={13} />}
                    </button>
                  );
                })}
              </div>

              {/* Custom destination input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customDestination}
                  onChange={(e) => setCustomDestination(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomDestination();
                    }
                  }}
                  placeholder="Or type a custom destination (e.g. Patagonia, Chile)"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#13b5b1]"
                />
                <button
                  type="button"
                  onClick={addCustomDestination}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors"
                >
                  Add
                </button>
              </div>

              {formErrors.proposedDestinations && (
                <p className="text-xs text-rose-500 font-semibold mt-1.5">
                  {formErrors.proposedDestinations}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="bio"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"
              >
                Tell us about yourself & your dream trip (20+ chars) *
              </label>
              <textarea
                id="bio"
                rows={4}
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
                }
                placeholder="What excites you about bringing your community together in real life? What experiences, workshops, or adventures would you lead?"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#13b5b1] focus:border-transparent transition-all resize-none"
              />
              <div className="flex justify-between items-center mt-1 text-[11px] text-gray-400">
                <span>Min 20 characters</span>
                <span
                  className={
                    formData.bio.length < 20 ? "text-amber-500" : "text-emerald-600"
                  }
                >
                  {formData.bio.length} / 2000
                </span>
              </div>
              {formErrors.bio && (
                <p className="text-xs text-rose-500 font-semibold mt-1">
                  {formErrors.bio}
                </p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-800">
                    Have you organized group trips or retreats before?
                  </p>
                  <p className="text-[11px] text-gray-500">
                    No prior experience required — Bleetary handles all operations!
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, hasHostedBefore: false }))
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      !formData.hasHostedBefore
                        ? "bg-[#13b5b1] text-white border-[#13b5b1]"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, hasHostedBefore: true }))
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      formData.hasHostedBefore
                        ? "bg-[#13b5b1] text-white border-[#13b5b1]"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>

              {formData.hasHostedBefore && (
                <input
                  type="text"
                  value={formData.previousHostingDetails || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      previousHostingDetails: e.target.value,
                    }))
                  }
                  placeholder="Briefly describe past retreats, trips, or events you ran"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#13b5b1]"
                />
              )}
            </div>

            <button
              onClick={handleNext}
              type="button"
              className="w-full mt-4 flex items-center justify-center gap-2 bg-[#13b5b1] hover:bg-[#0fa09c] text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-[0_4px_14px_rgba(19,181,177,0.3)] hover:-translate-y-0.5"
            >
              Review & Submit Application <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ── STEP 4: Review & Auth Bridge ────────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#13b5b1] bg-teal-50 px-3 py-1 rounded-full mb-2">
                <Send size={13} /> Step 4: Final Step
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Review & Confirm Application
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Please confirm your details before submitting to the curator team.
              </p>
            </div>

            {/* Summary card */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/80 space-y-4">
              <div className="flex justify-between items-start pb-3 border-b border-gray-200">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Community
                  </p>
                  <p className="text-base font-black text-gray-900">
                    {formData.communityName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {formData.communityType} • {formData.audienceSize?.toLocaleString()} audience
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-[#13b5b1] hover:underline"
                >
                  Edit
                </button>
              </div>

              <div className="flex justify-between items-start pb-3 border-b border-gray-200">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Destinations
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {formData.proposedDestinations.map((d) => (
                      <span
                        key={d}
                        className="bg-white border border-gray-200 text-gray-800 text-[11px] font-semibold px-2 py-0.5 rounded-md"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-xs font-bold text-[#13b5b1] hover:underline"
                >
                  Edit
                </button>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
                  Bio / Pitch
                </p>
                <p className="text-xs text-gray-700 line-clamp-3 leading-relaxed italic">
                  &ldquo;{formData.bio}&rdquo;
                </p>
              </div>
            </div>

            {apiError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                {apiError}
              </div>
            )}

            {/* Authenticated user: direct submit */}
            {currentUser ? (
              <div className="pt-2 space-y-4">
                <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#13b5b1] text-white flex items-center justify-center font-bold text-xs">
                      {currentUser.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Submitting as</p>
                      <p className="text-xs font-bold text-gray-900">
                        {currentUser.displayName} ({currentUser.email})
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-[#13b5b1]/15 text-[#0d9b97] px-2 py-0.5 rounded-full">
                    Authenticated
                  </span>
                </div>

                <button
                  onClick={submitApplication}
                  disabled={submitting}
                  type="button"
                  className="w-full flex items-center justify-center gap-2 bg-[#13b5b1] hover:bg-[#0fa09c] text-white font-bold py-4 rounded-xl text-sm transition-all shadow-[0_4px_16px_rgba(19,181,177,0.35)] hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Submitting Application...
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Submit Host Application
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Unauthenticated user: in-line auth bridge */
              <div className="pt-2 space-y-4">
                <div className="border border-gray-200 rounded-2xl p-5 bg-white space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Lock size={16} className="text-[#f05c40]" />
                      <h3 className="text-sm font-black text-gray-900">
                        Account Required to Submit
                      </h3>
                    </div>
                    <div className="flex rounded-lg bg-gray-100 p-1">
                      <button
                        type="button"
                        onClick={() => setAuthMode("register")}
                        className={`text-xs font-bold px-3 py-1 rounded-md transition-all ${
                          authMode === "register"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        Create Account
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthMode("login")}
                        className={`text-xs font-bold px-3 py-1 rounded-md transition-all ${
                          authMode === "login"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        Sign In
                      </button>
                    </div>
                  </div>

                  {authError && (
                    <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-lg font-medium">
                      {authError}
                    </p>
                  )}

                  <form onSubmit={handleAuthBridgeSubmit} className="space-y-3">
                    {authMode === "register" && (
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          placeholder="e.g. Sarah Jenkins"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#13b5b1]"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#13b5b1]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#13b5b1]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full mt-3 flex items-center justify-center gap-2 bg-[#f05c40] hover:bg-[#d94e34] text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-[0_4px_14px_rgba(240,92,64,0.3)] hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {authLoading ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />{" "}
                          {authMode === "register"
                            ? "Creating Account & Submitting..."
                            : "Signing In & Submitting..."}
                        </>
                      ) : (
                        <>
                          <Send size={14} />{" "}
                          {authMode === "register"
                            ? "Create Account & Submit Application"
                            : "Sign In & Submit Application"}
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
