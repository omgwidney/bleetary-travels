"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  buttonClassName,
  firebaseErrorMessage,
  inputClassName,
} from "@/components/auth/auth-ui";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const data = new FormData(event.currentTarget);
    const displayName = String(data.get("displayName")).trim();
    const email = String(data.get("email")).trim();
    const password = String(data.get("password"));

    if (password !== String(data.get("confirmPassword"))) {
      setError("Passwords do not match.");
      setPending(false);
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      setPending(false);
      return;
    }

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(credential.user, { displayName });
      const idToken = await credential.user.getIdToken();
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, displayName }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to finish registration.");
      }

      await sendEmailVerification(credential.user, {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: true,
      });
      router.replace(`/verify-email?email=${encodeURIComponent(email)}`);
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
        Full name
        <input
          name="displayName"
          autoComplete="name"
          minLength={2}
          maxLength={100}
          required
          className={inputClassName}
        />
      </label>
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
          autoComplete="new-password"
          minLength={8}
          required
          className={inputClassName}
        />
      </label>
      <label className="block text-sm font-semibold text-gray-700">
        Confirm password
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className={inputClassName}
        />
      </label>
      <button type="submit" disabled={pending} className={buttonClassName}>
        {pending ? "Creating account…" : "Create traveler account"}
      </button>
      <p className="text-center text-sm text-gray-500">
        Already registered?{" "}
        <Link href="/login" className="font-bold text-[#0d9b97] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
