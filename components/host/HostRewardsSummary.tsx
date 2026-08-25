"use client";

import Link from "next/link";
import { Users, CheckCircle2, DollarSign, Link2 } from "lucide-react";
import CopyLinkButton from "@/components/host/CopyLinkButton";
import type { HostReferralSummary } from "@/lib/db/referrals";

interface HostRewardsSummaryProps {
  referralLink: string;
  summary: HostReferralSummary;
}

export default function HostRewardsSummary({
  referralLink,
  summary,
}: HostRewardsSummaryProps) {
  const formattedReward = `$${(summary.totalRewardUnlockedCents / 100).toLocaleString()}`;

  const stats = [
    {
      label: "Total Referrals",
      value: summary.totalReferrals.toString(),
      icon: Users,
      iconBg: "bg-teal-50",
      iconColor: "text-[#13b5b1]",
    },
    {
      label: "Confirmed Trips",
      value: summary.confirmedTrips.toString(),
      icon: CheckCircle2,
      iconBg: "bg-green-50",
      iconColor: "text-green-500",
    },
    {
      label: "Total Reward Unlocked",
      value: formattedReward,
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
            Know someone who would make a great Bleetary Host? Share your referral link and you&apos;ll both earn $1,000 after they confirm their first trip.
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
            Track your referrals, their progress, and the rewards you&apos;ve earned. Payouts are issued once trips confirm.
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

      {/* Referrals list / Empty state */}
      {summary.referrals.length === 0 ? (
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
      ) : (
        <div className="border-t border-gray-100 px-6 py-4 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Referred Hosts ({summary.referrals.length})
          </p>
          <div className="space-y-1.5">
            {summary.referrals.map((ref) => (
              <div
                key={ref.id}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-50 border border-gray-100"
              >
                <span className="font-mono text-gray-700">Code: {ref.referralCode}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    ref.status === "credited"
                      ? "bg-emerald-100 text-emerald-800"
                      : ref.status === "registered"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {ref.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
