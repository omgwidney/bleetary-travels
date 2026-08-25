import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Settings,
  ChevronRight,
} from "lucide-react";
import {
  HostMobileNavigation,
  HostSidebar,
} from "@/components/host/HostNavigation";
import { requireSession } from "@/lib/auth/session";
import { getUserHostState } from "@/lib/db/hosts";
import { getHostInterestResponses } from "@/lib/db/interests";
import { getHostReferralSummary } from "@/lib/db/referrals";
import HostUnderReviewBanner from "@/components/host/HostUnderReviewBanner";
import HostInterestWidget from "@/components/host/HostInterestWidget";
import HostRewardsSummary from "@/components/host/HostRewardsSummary";

export const metadata: Metadata = {
  title: "Host Dashboard — Bleetary Travels",
  description: "Manage your trips, track rewards, and grow your hosting community.",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function LaunchSteps({ hasInterest }: { hasInterest: boolean }) {
  const steps = [
    {
      num: 1,
      title: "Explore Destinations & Itineraries",
      desc: "Discover destinations and itineraries your community will love.",
      locked: false,
      cta: "View Itineraries",
      href: "/trips",
    },
    {
      num: 2,
      title: "Gather Interest Before You Plan Your Trip",
      desc: "Collect 100 emails from people excited to travel with you.",
      locked: false,
      cta: "Share Survey Link",
      href: "#start-surveying-btn",
    },
    {
      num: 3,
      title: "Choose an Itinerary and Reserve Your Trip",
      desc: "Lock in your dates and destination.",
      locked: !hasInterest,
      cta: hasInterest ? "Reserve Trip" : null,
      href: hasInterest ? "/trips" : null,
    },
    {
      num: 4,
      title: "Choose Your Launch Date",
      desc: "Set the date you'll open bookings to your community.",
      locked: true,
      cta: null,
      href: null,
    },
  ];

  return (
    <section className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden min-w-0">
      <div className="px-6 py-5 border-b border-gray-100">
        <h3 className="text-lg font-black text-gray-900">Let&apos;s Launch Your First Trip!</h3>
        <p className="text-gray-500 text-sm mt-0.5">Here&apos;s what you need to do next:</p>
      </div>
      <div className="divide-y divide-gray-100">
        {steps.map((step) => (
          <div key={step.num} className="px-6 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${
                    step.locked
                      ? "bg-gray-100 text-gray-400"
                      : "bg-[#13b5b1]/15 text-[#0d9b97]"
                  }`}
                >
                  {step.locked ? "🔒" : "📍"} STEP {step.num}
                </span>
                <div>
                  <p className={`text-sm font-bold ${step.locked ? "text-gray-400" : "text-gray-900"}`}>
                    {step.title}
                  </p>
                  {!step.locked && (
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
                  )}
                </div>
              </div>
              {step.cta && step.href && (
                <Link
                  href={step.href}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#f05c40] px-4 py-2 text-xs font-bold text-white shadow-[0_2px_8px_rgba(240,92,64,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#d94e34] sm:w-auto sm:shrink-0"
                >
                  {step.cta} <ChevronRight size={13} />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HostDashboardPage() {
  const session = await requireSession("/host/dashboard");

  // Determine host permission status & pending application state
  const isPrivileged = session.role === "host" || session.role === "admin";
  const hostState = await getUserHostState(session.uid);

  // If traveler has no active host application, route them to apply
  if (!isPrivileged && !hostState.hasApplication) {
    redirect("/become-a-host");
  }

  // Fetch live database widgets concurrently
  const [interestResponses, referralSummary] = await Promise.all([
    getHostInterestResponses(session.uid),
    getHostReferralSummary(session.uid),
  ]);

  const firstName = session.displayName.split(/\s+/)[0];
  const referralLink = `https://bleetary.com/public/l/referral/${session.uid}`;
  const surveyLink = `https://bleetary.com/survey/${session.uid}`;

  const isPending =
    !isPrivileged &&
    (hostState.application?.status === "submitted" ||
      hostState.application?.status === "under_review");

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex">
      <HostSidebar user={session} />

      <div className="flex-1 flex flex-col min-w-0">
        <HostMobileNavigation user={session} />

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Host review alert banner if application is still under review */}
            {isPending && hostState.application && (
              <HostUnderReviewBanner status={hostState.application.status} />
            )}

            {/* Page heading */}
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                Welcome back, {firstName} 👋
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Here&apos;s everything you need to launch your first Bleetary trip.
              </p>
            </div>

            {/* Two-column layout on large screens */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left main column */}
              <div className="xl:col-span-2 space-y-6 min-w-0">
                <LaunchSteps hasInterest={interestResponses.length >= 10} />
                <HostInterestWidget
                  surveyLink={surveyLink}
                  interestResponses={interestResponses}
                />
              </div>

              {/* Right sidebar column */}
              <div className="space-y-6 min-w-0">
                <HostRewardsSummary
                  referralLink={referralLink}
                  summary={referralSummary}
                />

                {/* Important Dates widget */}
                <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
                  <h3 className="text-base font-black text-gray-900 mb-4">
                    Important Dates
                  </h3>
                  <div className="border-t border-gray-100 pt-6 flex flex-col items-center text-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Settings size={20} className="text-gray-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600">
                      No important dates yet
                    </p>
                    <p className="text-xs text-gray-400">
                      Dates related to your trips and bookings will appear here.
                    </p>
                  </div>
                </div>

                {/* Host level card */}
                <div className="bg-gradient-to-br from-[#0d9b97] to-[#13b5b1] rounded-2xl p-5 text-white">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
                    Host Level
                  </p>
                  <p className="text-lg font-black mb-3">
                    {isPrivileged ? "Verified Host 🚀" : "Application Pending ⏳"}
                  </p>
                  <p className="text-sm text-white/80 leading-relaxed mb-4">
                    {isPrivileged
                      ? "Design and launch your upcoming trips to unlock higher tier rewards."
                      : "Complete your audience survey to fast-track your host verification review."}
                  </p>
                  <Link
                    href="/trips"
                    className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-bold px-4 py-2 rounded-full transition-all duration-200"
                  >
                    Explore Itineraries <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
