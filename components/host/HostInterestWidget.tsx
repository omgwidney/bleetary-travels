"use client";

import Link from "next/link";
import { BarChart3, Sparkles, Link2 } from "lucide-react";
import CopyLinkButton from "@/components/host/CopyLinkButton";
import type { InterestResponseDocument } from "@/lib/db/schema";

interface HostInterestWidgetProps {
  surveyLink: string;
  interestResponses: (InterestResponseDocument & { id: string })[];
}

export default function HostInterestWidget({
  surveyLink,
  interestResponses,
}: HostInterestWidgetProps) {
  const count = interestResponses.length;
  const target = 100;
  const percentage = Math.min(100, Math.round((count / target) * 100));

  return (
    <section className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden min-w-0">
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
          <Sparkles size={11} /> Live Tracker
        </span>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-5">
        <p className="text-sm text-gray-600 leading-relaxed">
          Collect 100 emails from people excited to travel with you. Reaching this milestone shows clear interest and helps you plan your trip with confidence.
        </p>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mb-2">
            <span>Interest Collected</span>
            <span className="text-[#13b5b1] font-bold">
              {count} / {target} ({percentage}%)
            </span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#13b5b1] to-[#0d9b97] rounded-full transition-all duration-700"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Recent responses preview if any */}
        {count > 0 && (
          <div className="bg-[#f8fafc] rounded-xl p-3 border border-gray-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Recent Respondents
            </p>
            <div className="space-y-1.5">
              {interestResponses.slice(0, 3).map((res) => (
                <div
                  key={res.id}
                  className="flex items-center justify-between text-xs text-gray-700 bg-white p-2 rounded-lg border border-gray-100"
                >
                  <span className="font-medium truncate max-w-[150px]">
                    {res.respondentName}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {res.destinationInterests.join(", ") || "General Interest"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personalised survey link */}
        <div className="bg-[#f4f5f7] rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Your Personalised Survey Link
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 min-w-0">
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
          View Detailed Analytics
        </Link>
      </div>
    </section>
  );
}
