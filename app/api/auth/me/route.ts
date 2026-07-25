import { NextRequest, NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/auth/request";

export async function GET(request: NextRequest) {
  const auth = await authorizeRequest(request);
  if (!auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  return NextResponse.json({
    user: {
      uid: auth.session.uid,
      email: auth.session.email,
      displayName: auth.session.displayName,
      role: auth.session.role,
      emailVerified: auth.session.emailVerified,
    },
  });
}
