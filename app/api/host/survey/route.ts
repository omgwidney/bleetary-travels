import { NextRequest, NextResponse } from "next/server";
import { authorizeRequest, isSameOrigin } from "@/lib/auth/request";
import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/data-model";
import { interestResponseSchema } from "@/lib/validation/host-application";
import { saveInterestResponse } from "@/lib/db/interests";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  }

  // Survey respondents can be either unauthenticated or authenticated travelers
  const auth = await authorizeRequest(request).catch(() => ({
    session: null,
  }));
  const travelerUid = auth?.session?.uid ?? null;

  const body = await request.json().catch(() => null);
  const parsed = interestResponseSchema.safeParse(body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Invalid survey response data.";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  // Verify host target by surveyLinkId (which corresponds to host UID)
  const hostUid = parsed.data.surveyLinkId;
  const db = getAdminDb();
  const hostDoc = await db.collection(COLLECTIONS.users).doc(hostUid).get();

  if (!hostDoc.exists) {
    // Also check hostProfiles
    const hostProfileDoc = await db
      .collection(COLLECTIONS.hostProfiles)
      .doc(hostUid)
      .get();
    if (!hostProfileDoc.exists) {
      return NextResponse.json(
        { error: "Host survey not found." },
        { status: 404 },
      );
    }
  }

  const responseId = await saveInterestResponse(
    hostUid,
    parsed.data,
    travelerUid,
  );

  return NextResponse.json({
    success: true,
    id: responseId,
  });
}
