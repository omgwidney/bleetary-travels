import "server-only";

import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionCookieValue } from "@/lib/auth/session";
import type { UserRole } from "@/lib/auth/roles";

export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    const originUrl = new URL(origin);
    const expectedHost =
      request.headers.get("x-forwarded-host") ??
      request.headers.get("host") ??
      request.nextUrl.host;
    const expectedProtocol =
      request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol;
    const normalizedProtocol = expectedProtocol.endsWith(":")
      ? expectedProtocol
      : `${expectedProtocol}:`;

    return (
      originUrl.host === expectedHost &&
      originUrl.protocol === normalizedProtocol
    );
  } catch {
    return false;
  }
}

export async function authorizeRequest(
  request: NextRequest,
  roles?: readonly UserRole[],
) {
  const session = await verifySessionCookieValue(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );

  if (!session) {
    return { session: null, error: "Authentication required.", status: 401 };
  }

  if (roles && !roles.includes(session.role)) {
    return { session: null, error: "Insufficient permissions.", status: 403 };
  }

  return { session, error: null, status: 200 };
}
