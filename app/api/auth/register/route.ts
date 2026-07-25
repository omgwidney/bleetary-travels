import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAuth } from "@/lib/firebase-admin";
import { ensureUserDocument } from "@/lib/auth/users";
import { isSameOrigin } from "@/lib/auth/request";

const registerSchema = z.object({
  idToken: z.string().min(1),
  displayName: z.string().trim().min(2).max(100),
});

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Provide a valid name and authentication token." },
      { status: 400 },
    );
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(parsed.data.idToken, true);
    const role = await ensureUserDocument(decoded, parsed.data.displayName);
    return NextResponse.json({ role });
  } catch {
    return NextResponse.json(
      { error: "Unable to register this account." },
      { status: 401 },
    );
  }
}
