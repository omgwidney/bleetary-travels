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
  fieldErrorClassName,
  firebaseErrorMessage,
  inputClassName,
  safeNextPath,
} from "@/components/auth/auth-ui";

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  function validate(email: string, password: string): FieldErrors {
    const errors: FieldErrors = {};
    if (!email) errors.email = "Email is required.";
    if (!password) errors.password = "Password is required.";
    return errors;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    setFieldErrors({});

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email")).trim();
    const password = String(data.get("password"));

    const errors = validate(email, password);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setPending(true);
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      if (!credential.user.emailVerified) {
        await sendEmailVerification(credential.user, {
          url: `${window.location.origin}/verify-email`,
          handleCodeInApp: true,
        });
        await signOut(auth);
        setSubmitError(
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
      setSubmitError(
        caught instanceof Error && !("code" in caught)
          ? caught.message
          : firebaseErrorMessage(caught),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {submitError && (
        <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          {submitError}
        </p>
      )}

      <div>
        <label
          htmlFor="login-email"
          className="block text-sm font-semibold text-gray-700"
        >
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
          aria-invalid={Boolean(fieldErrors.email)}
          className={fieldErrors.email ? "mt-1.5 w-full rounded-xl border border-red-400 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : inputClassName}
        />
        {fieldErrors.email && (
          <p id="login-email-error" className={fieldErrorClassName}>
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="login-password"
          className="block text-sm font-semibold text-gray-700"
        >
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
          aria-invalid={Boolean(fieldErrors.password)}
          className={fieldErrors.password ? "mt-1.5 w-full rounded-xl border border-red-400 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : inputClassName}
        />
        {fieldErrors.password && (
          <p id="login-password-error" className={fieldErrorClassName}>
            {fieldErrors.password}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-xs font-semibold text-[#0d9b97] hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <button type="submit" disabled={pending} className={buttonClassName}>
        {pending ? (
          <>
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
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
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
