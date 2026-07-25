import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAuth } from "@/lib/firebase-admin";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { ensureUserDocument } from "@/lib/auth/users";
import { isSameOrigin } from "@/lib/auth/request";

const sessionSchema = z.object({ idToken: z.string().min(1) });
const MAX_AUTH_AGE_SECONDS = 5 * 60;

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const parsed = sessionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing ID token." }, { status: 400 });
  }

  try {
    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(parsed.data.idToken, true);
    const authAge = Math.floor(Date.now() / 1000) - decoded.auth_time;

    if (authAge > MAX_AUTH_AGE_SECONDS) {
      return NextResponse.json(
        { error: "Please sign in again before creating a session." },
        { status: 401 },
      );
    }
    if (!decoded.email_verified) {
      return NextResponse.json(
        { error: "Verify your email before signing in." },
        { status: 403 },
      );
    }

    const role = await ensureUserDocument(decoded, undefined, true);
    const sessionCookie = await auth.createSessionCookie(parsed.data.idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });
    const response = NextResponse.json({ role });
    response.cookies.set(
      SESSION_COOKIE_NAME,
      sessionCookie,
      sessionCookieOptions(),
    );
    return response;
  } catch {
    return NextResponse.json(
      { error: "Unable to create a secure session." },
      { status: 401 },
    );
  }
}
