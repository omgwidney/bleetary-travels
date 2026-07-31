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
  fieldErrorClassName,
  firebaseErrorMessage,
  inputClassName,
} from "@/components/auth/auth-ui";

interface FieldErrors {
  displayName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  function validate(
    displayName: string,
    email: string,
    password: string,
    confirmPassword: string,
  ): FieldErrors {
    const errors: FieldErrors = {};
    if (!displayName || displayName.length < 2)
      errors.displayName = "Full name must be at least 2 characters.";
    if (!email) errors.email = "Email is required.";
    if (!password || password.length < 8)
      errors.password = "Password must be at least 8 characters.";
    if (password && confirmPassword && password !== confirmPassword)
      errors.confirmPassword = "Passwords do not match.";
    else if (!confirmPassword)
      errors.confirmPassword = "Please confirm your password.";
    return errors;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    setFieldErrors({});

    const data = new FormData(event.currentTarget);
    const displayName = String(data.get("displayName")).trim();
    const email = String(data.get("email")).trim();
    const password = String(data.get("password"));
    const confirmPassword = String(data.get("confirmPassword"));

    const errors = validate(displayName, email, password, confirmPassword);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setPending(true);
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
      setSubmitError(
        caught instanceof Error && !("code" in caught)
          ? caught.message
          : firebaseErrorMessage(caught),
      );
    } finally {
      setPending(false);
    }
  }

  const errorInput =
    "mt-1.5 w-full rounded-xl border border-red-400 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10";

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {submitError && (
        <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          {submitError}
        </p>
      )}

      <div>
        <label
          htmlFor="reg-displayName"
          className="block text-sm font-semibold text-gray-700"
        >
          Full name
        </label>
        <input
          id="reg-displayName"
          name="displayName"
          autoComplete="name"
          aria-describedby={fieldErrors.displayName ? "reg-displayName-error" : undefined}
          aria-invalid={Boolean(fieldErrors.displayName)}
          className={fieldErrors.displayName ? errorInput : inputClassName}
        />
        {fieldErrors.displayName && (
          <p id="reg-displayName-error" className={fieldErrorClassName}>
            {fieldErrors.displayName}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="reg-email"
          className="block text-sm font-semibold text-gray-700"
        >
          Email
        </label>
        <input
          id="reg-email"
          name="email"
          type="email"
          autoComplete="email"
          aria-describedby={fieldErrors.email ? "reg-email-error" : undefined}
          aria-invalid={Boolean(fieldErrors.email)}
          className={fieldErrors.email ? errorInput : inputClassName}
        />
        {fieldErrors.email && (
          <p id="reg-email-error" className={fieldErrorClassName}>
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="reg-password"
          className="block text-sm font-semibold text-gray-700"
        >
          Password
        </label>
        <input
          id="reg-password"
          name="password"
          type="password"
          autoComplete="new-password"
          aria-describedby={fieldErrors.password ? "reg-password-error" : undefined}
          aria-invalid={Boolean(fieldErrors.password)}
          className={fieldErrors.password ? errorInput : inputClassName}
        />
        {fieldErrors.password && (
          <p id="reg-password-error" className={fieldErrorClassName}>
            {fieldErrors.password}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="reg-confirmPassword"
          className="block text-sm font-semibold text-gray-700"
        >
          Confirm password
        </label>
        <input
          id="reg-confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-describedby={fieldErrors.confirmPassword ? "reg-confirmPassword-error" : undefined}
          aria-invalid={Boolean(fieldErrors.confirmPassword)}
          className={fieldErrors.confirmPassword ? errorInput : inputClassName}
        />
        {fieldErrors.confirmPassword && (
          <p id="reg-confirmPassword-error" className={fieldErrorClassName}>
            {fieldErrors.confirmPassword}
          </p>
        )}
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
            Creating account…
          </>
        ) : (
          "Create traveler account"
        )}
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
