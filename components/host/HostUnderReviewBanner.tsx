"use client";

import Link from "next/link";
import { Clock, Sparkles, ArrowRight } from "lucide-react";
import type { HostApplicationStatus } from "@/lib/db/schema";

interface HostUnderReviewBannerProps {
  status: HostApplicationStatus;
}

export default function HostUnderReviewBanner({
  status,
}: HostUnderReviewBannerProps) {
  const isPending = status === "submitted" || status === "under_review";
  if (!isPending) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 rounded-2xl p-4 sm:p-5 text-white shadow-[0_4px_20px_rgba(245,158,11,0.25)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <Clock size={20} className="text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              Preview Mode
            </span>
            <span className="text-xs font-semibold text-white/90">
              Host Application {status === "submitted" ? "Submitted" : "Under Review"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/95 mt-1 leading-relaxed">
            Your host application is being verified by our team. While under review, you can test audience survey links and explore our itinerary templates.
          </p>
        </div>
      </div>

      <Link
        href="/become-a-host"
        className="shrink-0 inline-flex items-center gap-1.5 bg-white hover:bg-white/90 text-amber-900 text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-sm hover:-translate-y-0.5"
      >
        <Sparkles size={14} className="text-amber-600" />
        View Status <ArrowRight size={14} />
      </Link>
    </div>
  );
}
