export const inputClassName =
  "mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#13b5b1] focus:ring-4 focus:ring-[#13b5b1]/10";

export const buttonClassName =
  "inline-flex w-full items-center justify-center rounded-xl bg-[#f05c40] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_14px_rgba(240,92,64,0.3)] transition hover:bg-[#d94e34] disabled:cursor-not-allowed disabled:opacity-60";

export function firebaseErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error && "code" in error
      ? String(error.code)
      : "";

  const messages: Record<string, string> = {
    "auth/email-already-in-use": "An account already exists for this email.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Please wait and try again.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/weak-password": "Use a stronger password with at least 8 characters.",
    "auth/expired-action-code": "This link has expired. Request a new one.",
    "auth/invalid-action-code": "This link is invalid or has already been used.",
  };

  return messages[code] ?? "Something went wrong. Please try again.";
}

export function safeNextPath(value: string | undefined): string | null {
  if (!value?.startsWith("/") || value.startsWith("//")) return null;

  try {
    const base = new URL("https://bleetary.local");
    const target = new URL(value, base);
    if (target.origin !== base.origin) return null;
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return null;
  }
}
