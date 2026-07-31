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
  fieldErrorClassName,
  firebaseErrorMessage,
  inputClassName,
} from "@/components/auth/auth-ui";

interface FieldErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function PasswordResetForm({ oobCode }: { oobCode?: string }) {
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  function validateRequest(email: string): FieldErrors {
    if (!email) return { email: "Email is required." };
    return {};
  }

  function validateConfirm(
    password: string,
    confirmPassword: string,
  ): FieldErrors {
    const errors: FieldErrors = {};
    if (!password || password.length < 8)
      errors.password = "Password must be at least 8 characters.";
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your new password.";
    } else if (password && password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
    return errors;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    setFieldErrors({});
    setMessage("");

    const data = new FormData(event.currentTarget);

    if (oobCode) {
      const password = String(data.get("password"));
      const confirmPassword = String(data.get("confirmPassword"));
      const errors = validateConfirm(password, confirmPassword);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
      setPending(true);
      try {
        await confirmPasswordReset(auth, oobCode, password);
        setMessage("Password updated. You can now sign in.");
      } catch (caught) {
        setSubmitError(
          caught instanceof Error && !("code" in caught)
            ? caught.message
            : firebaseErrorMessage(caught),
        );
      } finally {
        setPending(false);
      }
    } else {
      const email = String(data.get("email")).trim();
      const errors = validateRequest(email);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
      setPending(true);
      try {
        await sendPasswordResetEmail(auth, email, {
          url: `${window.location.origin}/reset-password`,
          handleCodeInApp: true,
        });
        setMessage(
          "If that email belongs to an account, a reset link is on its way.",
        );
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
      {message && (
        <p role="status" className="rounded-xl border border-teal-100 bg-teal-50 p-3 text-sm text-teal-800">
          {message}
        </p>
      )}

      {oobCode ? (
        <>
          <div>
            <label
              htmlFor="reset-password"
              className="block text-sm font-semibold text-gray-700"
            >
              New password
            </label>
            <input
              id="reset-password"
              name="password"
              type="password"
              autoComplete="new-password"
              aria-describedby={fieldErrors.password ? "reset-password-error" : undefined}
              aria-invalid={Boolean(fieldErrors.password)}
              className={fieldErrors.password ? errorInput : inputClassName}
            />
            {fieldErrors.password && (
              <p id="reset-password-error" className={fieldErrorClassName}>
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="reset-confirmPassword"
              className="block text-sm font-semibold text-gray-700"
            >
              Confirm new password
            </label>
            <input
              id="reset-confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              aria-describedby={fieldErrors.confirmPassword ? "reset-confirmPassword-error" : undefined}
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              className={fieldErrors.confirmPassword ? errorInput : inputClassName}
            />
            {fieldErrors.confirmPassword && (
              <p id="reset-confirmPassword-error" className={fieldErrorClassName}>
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>
        </>
      ) : (
        <div>
          <label
            htmlFor="reset-email"
            className="block text-sm font-semibold text-gray-700"
          >
            Account email
          </label>
          <input
            id="reset-email"
            name="email"
            type="email"
            autoComplete="email"
            aria-describedby={fieldErrors.email ? "reset-email-error" : undefined}
            aria-invalid={Boolean(fieldErrors.email)}
            className={fieldErrors.email ? errorInput : inputClassName}
          />
          {fieldErrors.email && (
            <p id="reset-email-error" className={fieldErrorClassName}>
              {fieldErrors.email}
            </p>
          )}
        </div>
      )}

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
            Please wait…
          </>
        ) : oobCode ? (
          "Set new password"
        ) : (
          "Send reset link"
        )}
      </button>

      <p className="text-center text-sm">
        <Link href="/login" className="font-bold text-[#0d9b97] hover:underline">
          Return to sign in
        </Link>
      </p>
    </form>
  );
}
