"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ArrowRight,
  Sparkles,
  Compass,
  Users,
  Send,
} from "lucide-react";
import type { HostApplicationDocument, HostApplicationStatus } from "@/lib/db/schema";

interface HostApplicationStatusCardProps {
  application: HostApplicationDocument & { id: string };
  userDisplayName: string;
}

const STATUS_CONFIG: Record<
  HostApplicationStatus,
  {
    badgeLabel: string;
    badgeBg: string;
    badgeText: string;
    title: string;
    description: string;
    icon: typeof Clock;
    stepIndex: number;
  }
> = {
  submitted: {
    badgeLabel: "Application Submitted",
    badgeBg: "bg-blue-50 border-blue-200",
    badgeText: "text-blue-700",
    title: "Your application is in the queue!",
    description:
      "We've received your host application. Our host team reviews new submissions within 24–48 hours.",
    icon: Send,
    stepIndex: 1,
  },
  under_review: {
    badgeLabel: "Under Active Review",
    badgeBg: "bg-amber-50 border-amber-200",
    badgeText: "text-amber-700",
    title: "We're currently reviewing your profile",
    description:
      "Our team is assessing your community reach and requested destinations. We may reach out for a quick intro call.",
    icon: Clock,
    stepIndex: 2,
  },
  approved: {
    badgeLabel: "Approved Host 🎉",
    badgeBg: "bg-emerald-50 border-emerald-200",
    badgeText: "text-emerald-700",
    title: "Welcome to the Bleetary Host community!",
    description:
      "Your application is approved. You can now access full host features, build custom itineraries, and launch your trip.",
    icon: CheckCircle2,
    stepIndex: 4,
  },
  waitlisted: {
    badgeLabel: "Waitlisted",
    badgeBg: "bg-purple-50 border-purple-200",
    badgeText: "text-purple-700",
    title: "You're on our host priority waitlist",
    description:
      "We're scaling our host cohort in your niche and will notify you as soon as new destination slots open.",
    icon: AlertCircle,
    stepIndex: 2,
  },
  rejected: {
    badgeLabel: "Decision Finalized",
    badgeBg: "bg-rose-50 border-rose-200",
    badgeText: "text-rose-700",
    title: "Application not approved at this time",
    description:
      "Thank you for your interest. At this moment we couldn't match your destination/audience profile, but you may reapply after growing your community.",
    icon: XCircle,
    stepIndex: 1,
  },
};

const PIPELINE_STEPS = [
  { label: "Submitted", desc: "Initial intake" },
  { label: "Under Review", desc: "Community check" },
  { label: "Onboarding Call", desc: "Strategy alignment" },
  { label: "Host Live", desc: "Trip launch" },
];

export default function HostApplicationStatusCard({
  application,
  userDisplayName,
}: HostApplicationStatusCardProps) {
  const config = STATUS_CONFIG[application.status] || STATUS_CONFIG.submitted;
  const IconComponent = config.icon;

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="p-6 sm:p-10 border-b border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold ${config.badgeBg} ${config.badgeText}`}
            >
              <IconComponent size={14} />
              <span>{config.badgeLabel}</span>
            </div>
            <span className="text-xs text-gray-400 font-medium">
              Reference: #{application.id.slice(0, 8)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3 tracking-tight">
            {config.title}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Hi <span className="font-semibold text-gray-800">{userDisplayName}</span>, {config.description.toLowerCase()}
          </p>

          {/* Stepper */}
          <div className="mt-8 pt-8 border-t border-gray-100">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {PIPELINE_STEPS.map((step, idx) => {
                const stepNumber = idx + 1;
                const isPassed = stepNumber < config.stepIndex;
                const isCurrent = stepNumber === config.stepIndex;

                return (
                  <div key={step.label} className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          isPassed
                            ? "bg-emerald-500 text-white"
                            : isCurrent
                              ? "bg-[#13b5b1] text-white ring-4 ring-[#13b5b1]/20"
                              : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {isPassed ? <CheckCircle2 size={14} /> : stepNumber}
                      </div>
                      <div
                        className={`flex-1 h-1 rounded-full ${
                          isPassed
                            ? "bg-emerald-400"
                            : isCurrent
                              ? "bg-[#13b5b1]/40"
                              : "bg-gray-100"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        isCurrent
                          ? "text-gray-900"
                          : isPassed
                            ? "text-emerald-700"
                            : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="text-[11px] text-gray-400 hidden sm:inline">
                      {step.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Application details overview */}
        <div className="bg-[#fcfcfd] p-6 sm:p-10 space-y-6">
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-400">
            Submitted Application Snapshot
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#13b5b1] flex items-center justify-center shrink-0">
                <Users size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 font-medium">Community & Reach</p>
                <p className="text-sm font-bold text-gray-900 truncate">
                  {application.communityName}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 capitalize">
                  {application.communityType} • {application.audienceSize?.toLocaleString() || "N/A"} members
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#f05c40] flex items-center justify-center shrink-0">
                <Compass size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 font-medium">Target Destinations</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {application.proposedDestinations?.map((dest) => (
                    <span
                      key={dest}
                      className="inline-block bg-gray-100 text-gray-800 text-[11px] font-semibold px-2 py-0.5 rounded-md"
                    >
                      {dest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bio Preview */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <p className="text-xs text-gray-400 font-medium">Hosting Vision & Bio</p>
            <p className="text-xs text-gray-700 leading-relaxed italic">
              &ldquo;{application.bio}&rdquo;
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Sparkles size={14} className="text-[#13b5b1]" />
              <span>Questions? Email us at host-support@bleetary.com</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href="/host/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#13b5b1] hover:bg-[#0fa09c] text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-[0_2px_10px_rgba(19,181,177,0.3)] hover:-translate-y-0.5"
              >
                Open Host Dashboard <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
