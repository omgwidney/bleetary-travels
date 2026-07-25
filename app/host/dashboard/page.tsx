import type { Metadata } from "next";
import Link from "next/link";
import {
  Settings,
  Users,
  CheckCircle2,
  DollarSign,
  Link2,
  BarChart3,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import CopyLinkButton from "@/components/host/CopyLinkButton";
import {
  HostMobileNavigation,
  HostSidebar,
} from "@/components/host/HostNavigation";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Host Dashboard — Bleetary Travels",
  description: "Manage your trips, track rewards, and grow your hosting community.",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function RewardsSummary({ referralLink }: { referralLink: string }) {
  const stats = [
    {
      label: "Total Referrals",
      value: "0",
      icon: Users,
      iconBg: "bg-teal-50",
      iconColor: "text-[#13b5b1]",
    },
    {
      label: "Confirmed Trips",
      value: "0",
      icon: CheckCircle2,
      iconBg: "bg-green-50",
      iconColor: "text-green-500",
    },
    {
      label: "Total Reward Unlocked",
      value: "$0",
      icon: DollarSign,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
    },
  ];

  return (
    <section className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden min-w-0">
      {/* Hero banner */}
      <div className="relative bg-gradient-to-r from-[#0d9b97] to-[#13b5b1] px-5 py-6 flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-black text-white mb-1">
            Give $1,000. Get $1,000.
          </h2>
          <p className="text-white/80 text-sm leading-relaxed">
            Know someone who would make a great Bleetary Host? Share your referral
            link and you&apos;ll both earn $1,000 after they confirm their first trip.
          </p>

          {/* Share link row */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 min-w-0 flex items-center gap-2 bg-white/15 border border-white/30 rounded-xl px-3 py-2.5">
              <Link2 size={14} className="text-white/70 shrink-0" />
              <span className="text-white text-xs font-mono truncate select-all">
                {referralLink}
              </span>
            </div>
            <CopyLinkButton
              value={referralLink}
              className="flex items-center gap-1.5 bg-[#f05c40] hover:bg-[#d94e34] text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all duration-200 shadow-[0_2px_8px_rgba(240,92,64,0.35)] hover:shadow-[0_4px_14px_rgba(240,92,64,0.45)] hover:-translate-y-0.5 shrink-0"
            />
          </div>
          <Link
            href="/coming-soon"
            className="inline-block mt-2 text-white/70 hover:text-white text-xs underline underline-offset-2 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div>
        <div className="px-6 pt-5 pb-2">
          <h3 className="text-lg font-black text-gray-900">Your Rewards Summary</h3>
          <p className="text-gray-500 text-xs mt-0.5">
            Track your referrals, their progress, and the rewards you&apos;ve earned.
            Payouts are issued once trips confirm.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 border-t border-gray-100">
          {stats.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
            <div key={label} className="px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-3xl font-black text-gray-900">{value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}>
                <Icon size={22} className={iconColor} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* No referrals state */}
      <div className="border-t border-gray-100 px-6 py-8 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <Users size={22} className="text-gray-400" />
        </div>
        <p className="text-sm font-semibold text-gray-700 mb-1">No Referrals Yet</p>
        <p className="text-xs text-gray-400 max-w-xs">
          You don&apos;t have any referrals right now. Share your link and start earning!
        </p>
        <CopyLinkButton
          value={referralLink}
          label="Share My Link"
          className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#13b5b1] border border-[#13b5b1] hover:bg-[#13b5b1] hover:text-white px-4 py-2 rounded-full transition-all duration-200"
        />
      </div>
    </section>
  );
}

function GatherInterestWidget({ surveyLink }: { surveyLink: string }) {
  return (
    <section className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#f05c40]/10 flex items-center justify-center">
            <BarChart3 size={20} className="text-[#f05c40]" />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900">Gather Interest</h3>
            <p className="text-xs text-gray-500">Survey your audience before you plan</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 bg-[#13b5b1]/10 text-[#0d9b97] text-xs font-bold px-2.5 py-1 rounded-full">
          <Sparkles size={11} /> New
        </span>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-5">
        <p className="text-sm text-gray-600 leading-relaxed">
          Collect 100 emails from people excited to travel with you. Reaching this
          milestone shows clear interest and helps you plan your trip with
          confidence. Email is a proven booking channel and drives around{" "}
          <span className="font-semibold text-gray-800">20% of bookings</span>.
        </p>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mb-2">
            <span>Interest Collected</span>
            <span className="text-[#13b5b1]">0 / 100</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#13b5b1] rounded-full w-0 transition-all duration-700" />
          </div>
        </div>

        {/* Your personalised survey link */}
        <div className="bg-[#f4f5f7] rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Your Personalised Survey Link
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5">
              <Link2 size={13} className="text-gray-400 shrink-0" />
              <span className="text-xs text-gray-600 font-mono truncate">{surveyLink}</span>
            </div>
            <CopyLinkButton
              value={surveyLink}
              className="flex items-center gap-1.5 bg-[#f05c40] hover:bg-[#d94e34] text-white text-xs font-bold px-3 py-2.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5 shadow-[0_2px_8px_rgba(240,92,64,0.3)] shrink-0"
            />
          </div>
          <p className="text-[11px] text-gray-400">
            Share this link on your social channels, newsletter, or with your community directly.
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/coming-soon"
          id="start-surveying-btn"
          className="w-full flex items-center justify-center gap-2 bg-[#f05c40] hover:bg-[#d94e34] text-white font-bold py-3 rounded-xl text-sm transition-all duration-200 shadow-[0_4px_14px_rgba(240,92,64,0.3)] hover:shadow-[0_6px_20px_rgba(240,92,64,0.4)] hover:-translate-y-0.5"
        >
          <BarChart3 size={16} />
          Start Surveying +
        </Link>
      </div>
    </section>
  );
}

function LaunchSteps() {
  const steps = [
    {
      num: 1,
      title: "Explore Destinations & Itineraries",
      desc: "Discover destinations and itineraries your community will love.",
      locked: false,
      cta: "View Itineraries",
      href: "/coming-soon",
    },
    {
      num: 2,
      title: "Gather Interest Before You Plan Your Trip",
      desc: "Collect 100 emails from people excited to travel with you.",
      locked: false,
      cta: "Collect or Upload Emails",
      href: "/coming-soon",
    },
    {
      num: 3,
      title: "Choose an Itinerary and Reserve Your Trip",
      desc: "Lock in your dates and destination.",
      locked: true,
      cta: null,
      href: null,
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
    <section className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
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
  const session = await requireRole(["host", "admin"], "/host/dashboard");
  const firstName = session.displayName.split(/\s+/)[0];
  const referralLink = `https://bleetary.com/public/l/referral/${session.uid}`;
  const surveyLink = `https://bleetary.com/survey/${session.uid}`;

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex">
      <HostSidebar user={session} />

      <div className="flex-1 flex flex-col min-w-0">
        <HostMobileNavigation user={session} />

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
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
              <div className="xl:col-span-2 space-y-6">
                <LaunchSteps />
                <GatherInterestWidget surveyLink={surveyLink} />
              </div>

              {/* Right sidebar column */}
              <div className="space-y-6 min-w-0">
                <RewardsSummary referralLink={referralLink} />

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
                  <p className="text-lg font-black mb-3">Account Created 🎉</p>
                  <p className="text-sm text-white/80 leading-relaxed mb-4">
                    Complete your profile and launch your first trip to level up and unlock higher rewards.
                  </p>
                  <Link
                    href="/coming-soon"
                    className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-bold px-4 py-2 rounded-full transition-all duration-200"
                  >
                    Complete Profile <ChevronRight size={14} />
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
