"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { roleHome, type UserRole } from "@/lib/auth/roles";
import {
  buttonClassName,
  firebaseErrorMessage,
  inputClassName,
  safeNextPath,
} from "@/components/auth/auth-ui";

export default function LoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const data = new FormData(event.currentTarget);
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        String(data.get("email")),
        String(data.get("password")),
      );

      if (!credential.user.emailVerified) {
        await sendEmailVerification(credential.user, {
          url: `${window.location.origin}/verify-email`,
          handleCodeInApp: true,
        });
        await signOut(auth);
        setError(
          "Verify your email before signing in. We sent you a fresh verification link.",
        );
        return;
      }

      const idToken = await credential.user.getIdToken(true);
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

      await credential.user.getIdToken(true);
      router.replace(safeNextPath(nextPath) ?? roleHome(payload.role));
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

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <label className="block text-sm font-semibold text-gray-700">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClassName}
        />
      </label>
      <label className="block text-sm font-semibold text-gray-700">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClassName}
        />
      </label>
      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-xs font-semibold text-[#0d9b97] hover:underline"
        >
          Forgot password?
        </Link>
      </div>
      <button type="submit" disabled={pending} className={buttonClassName}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-sm text-gray-500">
        New to Bleetary?{" "}
        <Link href="/register" className="font-bold text-[#0d9b97] hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
