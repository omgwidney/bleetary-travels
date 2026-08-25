"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Lock } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

interface ReserveSpotButtonProps {
  tripId: string;
  departureId: string;
  tripSlug: string;
  isSoldOut: boolean;
  depositPercent: number;
}

export default function ReserveSpotButton({
  tripId,
  departureId,
  tripSlug,
  isSoldOut,
  depositPercent,
}: ReserveSpotButtonProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isSoldOut) {
    return (
      <button
        disabled
        className="mt-4 w-full flex items-center justify-center font-bold py-3 rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed text-sm"
      >
        Sold Out
      </button>
    );
  }

  async function handleReserve() {
    setError(null);

    // If user is not authenticated, redirect to login with callback
    if (!user) {
      router.push(`/login?next=/trips/${encodeURIComponent(tripSlug)}`);
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          departureId,
          guestCount: 1,
          roomType: "standard",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to initiate booking checkout.");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned from payment server.");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to connect to checkout.",
      );
      setPending(false);
    }
  }

  return (
    <div className="mt-4 space-y-2">
      {error && (
        <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 p-2 rounded-lg font-medium">
          {error}
        </p>
      )}

      <button
        onClick={handleReserve}
        disabled={pending || authLoading}
        className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-all duration-200 text-sm bg-[#f05c40] hover:bg-[#d94e34] text-white shadow-[0_4px_14px_rgba(240,92,64,0.3)] hover:shadow-[0_6px_20px_rgba(240,92,64,0.4)] hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer"
      >
        {pending ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Connecting to Checkout...
          </>
        ) : !user ? (
          <>
            <Lock size={15} /> Sign in to Reserve ({depositPercent}% Deposit)
          </>
        ) : (
          <>
            Reserve Spot ({depositPercent}% Deposit) <ArrowRight size={15} />
          </>
        )}
      </button>
    </div>
  );
}
