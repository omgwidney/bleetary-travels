"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  confirmPasswordReset,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  buttonClassName,
  firebaseErrorMessage,
  inputClassName,
} from "@/components/auth/auth-ui";

export default function PasswordResetForm({ oobCode }: { oobCode?: string }) {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");
    const data = new FormData(event.currentTarget);

    try {
      if (oobCode) {
        const password = String(data.get("password"));
        if (password.length < 8) {
          throw new Error("Use at least 8 characters for your password.");
        }
        if (password !== String(data.get("confirmPassword"))) {
          throw new Error("Passwords do not match.");
        }
        await confirmPasswordReset(auth, oobCode, password);
        setMessage("Password updated. You can now sign in.");
      } else {
        await sendPasswordResetEmail(auth, String(data.get("email")), {
          url: `${window.location.origin}/reset-password`,
          handleCodeInApp: true,
        });
        setMessage(
          "If that email belongs to an account, a reset link is on its way.",
        );
      }
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
      {message && (
        <p role="status" className="rounded-xl bg-teal-50 p-3 text-sm text-teal-800">
          {message}
        </p>
      )}
      {oobCode ? (
        <>
          <label className="block text-sm font-semibold text-gray-700">
            New password
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              className={inputClassName}
            />
          </label>
          <label className="block text-sm font-semibold text-gray-700">
            Confirm new password
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              className={inputClassName}
            />
          </label>
        </>
      ) : (
        <label className="block text-sm font-semibold text-gray-700">
          Account email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputClassName}
          />
        </label>
      )}
      <button type="submit" disabled={pending} className={buttonClassName}>
        {pending
          ? "Please wait…"
          : oobCode
            ? "Set new password"
            : "Send reset link"}
      </button>
      <p className="text-center text-sm">
        <Link href="/login" className="font-bold text-[#0d9b97] hover:underline">
          Return to sign in
        </Link>
      </p>
    </form>
  );
}
