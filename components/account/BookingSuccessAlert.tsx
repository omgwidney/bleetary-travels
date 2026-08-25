"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2, Sparkles } from "lucide-react";

export default function BookingSuccessAlert() {
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("booking_success") === "true";

  if (!isSuccess) return null;

  return (
    <div className="mb-8 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-600 to-[#13b5b1] p-6 text-white shadow-[0_4px_24px_rgba(16,185,129,0.25)] animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
          <CheckCircle2 size={26} className="text-white" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
              Booking Confirmed
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-white/90">
              <Sparkles size={12} /> Deposit Received
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight">
            Your adventure is officially locked in! 🎉
          </h2>
          <p className="text-sm text-white/90 leading-relaxed max-w-2xl">
            We&apos;ve sent your booking confirmation and deposit receipt to your email. You can review your trip itinerary and payment schedule below.
          </p>
        </div>
      </div>
    </div>
  );
}
