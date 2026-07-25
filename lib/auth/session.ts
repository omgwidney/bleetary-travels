import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { DecodedIdToken } from "firebase-admin/auth";
import { getAdminAuth } from "@/lib/firebase-admin";
import { isUserRole, type UserRole } from "@/lib/auth/roles";

export const SESSION_COOKIE_NAME = "__session";
export const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000;

export interface AppSession {
  uid: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  role: UserRole;
  claims: DecodedIdToken;
}

export async function verifySessionCookieValue(
  sessionCookie: string | undefined,
): Promise<AppSession | null> {
  if (!sessionCookie) return null;

  try {
    const auth = getAdminAuth();
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    const user = await auth.getUser(decoded.uid);
    const role = user.customClaims?.role;

    if (!user.email || !user.emailVerified || !isUserRole(role)) {
      return null;
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split("@")[0],
      emailVerified: user.emailVerified,
      role,
      claims: decoded,
    };
  } catch {
    return null;
  }
}

export const getCurrentSession = cache(async (): Promise<AppSession | null> => {
  const cookieStore = await cookies();
  return verifySessionCookieValue(
    cookieStore.get(SESSION_COOKIE_NAME)?.value,
  );
});

export async function requireSession(
  nextPath = "/account",
): Promise<AppSession> {
  const session = await getCurrentSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return session;
}

export async function requireRole(
  roles: readonly UserRole[],
  nextPath: string,
): Promise<AppSession> {
  const session = await requireSession(nextPath);
  if (!roles.includes(session.role)) {
    redirect("/unauthorized");
  }
  return session;
}

export function sessionCookieOptions(maxAgeMs = SESSION_MAX_AGE_MS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: Math.floor(maxAgeMs / 1000),
    priority: "high" as const,
  };
}
