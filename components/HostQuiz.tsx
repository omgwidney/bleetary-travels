"use client";

import { useState } from "react";
import { CheckCircle, Loader2, ChevronLeft, Users, Briefcase, TrendingUp, Compass } from "lucide-react";
import { saveHostLead } from "@/lib/firebase";

// ─── Types ───────────────────────────────────────────────────────────────────

interface QuizData {
  hasCommunity: "yes" | "no" | null;
  communityStage: string | null;
  email: string;
  name: string;
}

type Step = 1 | 2 | 3 | "success";

// ─── Constants ───────────────────────────────────────────────────────────────

const COMMUNITY_OPTIONS = [
  {
    id: "full-time",
    label: "It's my full-time income",
    icon: Briefcase,
    description: "My community is how I earn my living.",
  },
  {
    id: "side-project",
    label: "It's a side project",
    icon: TrendingUp,
    description: "I run it alongside other work.",
  },
  {
    id: "building",
    label: "Building toward earning",
    icon: Users,
    description: "I'm growing it with income as a goal.",
  },
  {
    id: "exploring",
    label: "Still exploring",
    icon: Compass,
    description: "I'm just seeing where this goes.",
  },
];

// ─── HostQuiz ────────────────────────────────────────────────────────────────

export default function HostQuiz() {
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<QuizData>({
    hasCommunity: null,
    communityStage: null,
    email: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 3;
  const currentStepNum = step === "success" ? totalSteps : (step as number);
  const progress = (currentStepNum / totalSteps) * 100;

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleCommunityAnswer(answer: "yes" | "no") {
    setData((prev) => ({ ...prev, hasCommunity: answer }));
    setStep(2);
  }

  function handleStageSelect(id: string) {
    setData((prev) => ({ ...prev, communityStage: id }));
  }

  function handleNext() {
    if (step === 2 && !data.communityStage) return;
    setStep((prev) => (prev as number) + 1 as Step);
  }

  function handleBack() {
    setStep((prev) => Math.max(1, (prev as number) - 1) as Step);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data.name.trim() || !data.email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await saveHostLead({
        name: data.name.trim(),
        email: data.email.trim(),
        hasCommunity: data.hasCommunity,
        communityStage: data.communityStage,
        source: "host_quiz",
      });
      setStep("success");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      {step !== "success" && (
        <div className="w-full h-1.5 bg-gray-100">
          <div
            className="h-full bg-[#f05c40] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Back button */}
      {step !== "success" && (step as number) > 1 && (
        <div className="max-w-xl mx-auto w-full px-4 pt-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors"
          >
            <ChevronLeft size={18} /> Back
          </button>
        </div>
      )}

      {/* Card container */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">

          {/* ── Step 1: Community Question ── */}
          {step === 1 && (
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-400">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#13b5b1] mb-6">
                Step 1 of {totalSteps}
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3 leading-tight">
                Do you lead a community that might travel together?
              </h2>
              <p className="text-gray-500 text-base mb-10">
                Think newsletters, social followings, fitness classes, online groups, or any other audience.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {(["yes", "no"] as const).map((answer) => (
                  <button
                    key={answer}
                    id={`quiz-community-${answer}`}
                    onClick={() => handleCommunityAnswer(answer)}
                    className={`flex-1 max-w-[200px] mx-auto sm:mx-0 py-4 px-6 rounded-2xl border-2 font-bold text-lg capitalize transition-all duration-200 cursor-pointer ${
                      data.hasCommunity === answer
                        ? "border-[#13b5b1] bg-[#13b5b1]/10 text-[#0d9b97]"
                        : "border-gray-200 text-gray-700 hover:border-[#13b5b1] hover:bg-[#13b5b1]/5"
                    }`}
                  >
                    {answer === "yes" ? "👥 Yes" : "🤔 Not yet"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Community Stage ── */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-400">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#13b5b1] mb-6 text-center">
                Step 2 of {totalSteps}
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 leading-tight text-center">
                Which best describes where you&apos;re at with your community today?
              </h2>
              <p className="text-gray-500 text-base mb-8 text-center">
                Be honest — there&apos;s no wrong answer.
              </p>

              <div className="space-y-3">
                {COMMUNITY_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = data.communityStage === opt.id;
                  return (
                    <button
                      key={opt.id}
                      id={`quiz-stage-${opt.id}`}
                      onClick={() => handleStageSelect(opt.id)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-[#13b5b1] bg-[#13b5b1]/10"
                          : "border-gray-200 hover:border-[#13b5b1]/50 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? "bg-[#13b5b1] text-white" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${isSelected ? "text-[#0d9b97]" : "text-gray-900"}`}>
                          {opt.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle size={20} className="text-[#13b5b1] ml-auto shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                id="quiz-step2-next"
                onClick={handleNext}
                disabled={!data.communityStage}
                className="w-full mt-6 bg-[#f05c40] hover:bg-[#d94e34] disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 font-bold py-4 rounded-2xl text-base transition-all duration-200 shadow-[0_4px_14px_rgba(240,92,64,0.3)] hover:shadow-[0_6px_20px_rgba(240,92,64,0.4)] hover:-translate-y-0.5 disabled:shadow-none disabled:translate-y-0"
              >
                Next →
              </button>
            </div>
          )}

          {/* ── Step 3: Contact Details ── */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-400">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#13b5b1] mb-6 text-center">
                Step 3 of {totalSteps}
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 leading-tight text-center">
                You&apos;re almost in! 🎉
              </h2>
              <p className="text-gray-500 text-base mb-8 text-center">
                Tell us where to send your hosting guide and personalised survey link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="quiz-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Your name
                  </label>
                  <input
                    id="quiz-name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Widney Nhandara"
                    required
                    className="w-full border-2 border-gray-200 focus:border-[#13b5b1] outline-none rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 text-sm transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="quiz-email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email address
                  </label>
                  <input
                    id="quiz-email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="you@example.com"
                    required
                    className="w-full border-2 border-gray-200 focus:border-[#13b5b1] outline-none rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 text-sm transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}

                <button
                  id="quiz-submit-btn"
                  type="submit"
                  disabled={loading || !data.name.trim() || !data.email.trim()}
                  className="w-full mt-2 bg-[#f05c40] hover:bg-[#d94e34] disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 font-bold py-4 rounded-2xl text-base transition-all duration-200 shadow-[0_4px_14px_rgba(240,92,64,0.3)] hover:shadow-[0_6px_20px_rgba(240,92,64,0.4)] hover:-translate-y-0.5 disabled:shadow-none disabled:translate-y-0 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    "Get My Hosting Guide →"
                  )}
                </button>

                <p className="text-center text-xs text-gray-400 mt-2">
                  No spam. We respect your inbox. Unsubscribe anytime.
                </p>
              </form>
            </div>
          )}

          {/* ── Success Screen ── */}
          {step === "success" && (
            <div className="text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-3">You&apos;re on the list! 🚀</h2>
              <p className="text-gray-500 text-base max-w-sm mx-auto">
                We&apos;ll send your personalised hosting guide and survey link to{" "}
                <strong className="text-gray-800">{data.email}</strong> shortly.
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 mt-8 bg-[#13b5b1] hover:bg-[#0d9b97] text-white font-bold px-7 py-3.5 rounded-full transition-all duration-200"
              >
                Explore Trips
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
