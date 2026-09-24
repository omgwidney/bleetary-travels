"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, CreditCard, Lock, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

function MockStripeCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get("session_id") || "mock_session_default";
  const tripId = searchParams.get("tripId") || "";
  const departureId = searchParams.get("departureId") || "";
  const guestCount = parseInt(searchParams.get("guestCount") || "1", 10);
  const roomType = (searchParams.get("roomType") || "standard") as "standard" | "private" | "shared";
  const tripTitle = searchParams.get("tripTitle") || "Bleetary Group Adventure";
  const depositAmount = searchParams.get("amount") || "$425.00";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout/mock-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          departureId,
          guestCount,
          roomType,
          sessionId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Payment simulation failed.");
      }

      // Clean redirect into traveler account
      window.location.href = `/account?booking_success=true&session_id=${encodeURIComponent(sessionId)}`;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Payment processing error.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Stripe Header Simulation */}
        <div className="bg-[#635bff] text-white p-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-2">
            <Lock size={12} /> Stripe Checkout (Local Simulator)
          </div>
          <h1 className="text-xl font-bold tracking-tight">Bleetary Travels</h1>
          <p className="text-sm opacity-90 mt-1">{tripTitle}</p>
          <div className="mt-4 text-3xl font-extrabold tracking-tight">
            {depositAmount}
          </div>
          <p className="text-xs opacity-75 mt-0.5">Deposit due today (25%)</p>
        </div>

        {/* Card Form */}
        <form onSubmit={handlePayment} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Card Information
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value="4242 •••• •••• 4242"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono text-slate-800 focus:outline-none"
                />
                <CreditCard
                  size={18}
                  className="absolute right-3 top-3 text-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expires
                </label>
                <input
                  type="text"
                  readOnly
                  value="12 / 28"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CVC
                </label>
                <input
                  type="text"
                  readOnly
                  value="123"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#635bff] hover:bg-[#5349e4] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Authorizing Payment...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Pay {depositAmount} Deposit
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 pt-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Encrypted 256-bit SSL test transaction</span>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/trips"
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft size={12} /> Return to trip catalog
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MockStripeCheckoutPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading Checkout...</div>}>
      <MockStripeCheckoutContent />
    </Suspense>
  );
}
