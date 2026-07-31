"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  applyActionCode,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { roleHome, type UserRole } from "@/lib/auth/roles";
import {
  buttonClassName,
  firebaseErrorMessage,
} from "@/components/auth/auth-ui";

const POLL_INTERVAL_MS = 4000;

export default function VerifyEmailPanel({
  email,
  oobCode,
}: {
  email?: string;
  oobCode?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState(
    email ? `We sent a verification link to ${email}.` : "Check your inbox.",
  );
  const [error, setError] = useState("");
  const [pending, setPending] = useState(Boolean(oobCode));
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Apply action code from email link
  useEffect(() => {
    if (!oobCode) return;

    let active = true;
    applyActionCode(auth, oobCode)
      .then(() => {
        if (active) setMessage("Email verified. Continue to your account.");
      })
      .catch((caught) => {
        if (active) setError(firebaseErrorMessage(caught));
      })
      .finally(() => {
        if (active) setPending(false);
      });

    return () => {
      active = false;
    };
  }, [oobCode]);

  // Auto-poll when a user is signed in but unverified (verifying on another tab/device)
  useEffect(() => {
    if (oobCode) return; // don't poll if handling action code directly

    pollingRef.current = setInterval(async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        await user.reload();
        if (user.emailVerified) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setMessage("Email verified. Continue to your account.");
        }
      } catch {
        // silently ignore transient reload errors during polling
      }
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [oobCode]);

  async function continueToAccount() {
    setPending(true);
    setError("");
    try {
      const user = auth.currentUser;
      if (!user) {
        router.replace("/login?verified=1");
        return;
      }

      await user.reload();
      if (!user.emailVerified) {
        setError(
          "Verification is not complete yet. Open the link in your email.",
        );
        return;
      }

      const idToken = await user.getIdToken(true);
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const payload = (await response.json()) as {
        error?: string;
        role?: UserRole;
      };
      if (!response.ok || !payload.role) {
        throw new Error(payload.error ?? "Unable to create a session.");
      }
      if (pollingRef.current) clearInterval(pollingRef.current);
      router.replace(roleHome(payload.role));
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error && !("code" in caught)
          ? caught.message
          : firebaseErrorMessage(caught),
      );
    } finally {
      setPending(false);
    }
  }

  async function resend() {
    setError("");
    const user = auth.currentUser;
    if (!user) {
      router.replace("/login");
      return;
    }
    try {
      await sendEmailVerification(user, {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: true,
      });
      setMessage("A fresh verification link has been sent.");
    } catch (caught) {
      setError(firebaseErrorMessage(caught));
    }
  }

  async function useAnotherAccount() {
    if (pollingRef.current) clearInterval(pollingRef.current);
    await signOut(auth);
    router.replace("/login");
  }

  return (
    <div className="space-y-5">
      {error && (
        <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <p role="status" className="rounded-xl border border-teal-100 bg-teal-50 p-4 text-sm text-teal-800">
        {pending ? (
          <span className="flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Verifying your email…
          </span>
        ) : (
          message
        )}
      </p>

      <button
        type="button"
        onClick={continueToAccount}
        disabled={pending}
        className={buttonClassName}
      >
        Continue
      </button>

      <div className="flex justify-between text-xs font-semibold">
        <button
          type="button"
          onClick={resend}
          className="text-[#0d9b97] hover:underline"
        >
          Resend email
        </button>
        <button
          type="button"
          onClick={useAnotherAccount}
          className="text-gray-500 hover:underline"
        >
          Use another account
        </button>
      </div>

      <p className="text-center text-xs text-gray-400">
        Already verified?{" "}
        <Link href="/login" className="text-[#0d9b97] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
