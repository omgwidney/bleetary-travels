import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { authorizeRequest, isSameOrigin } from "@/lib/auth/request";
import { COLLECTIONS } from "@/lib/data-model";
import { getAdminDb } from "@/lib/firebase-admin";
import { hostApplicationSchema } from "@/lib/validation/host-application";
import { logAuditEvent } from "@/lib/db/audit";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  }

  const auth = await authorizeRequest(request);
  if (!auth.session) {
    return NextResponse.json(
      { error: auth.error || "Authentication required." },
      { status: auth.status || 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = hostApplicationSchema.safeParse(body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Invalid host application data.";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const db = getAdminDb();
  const applicationRef = db
    .collection(COLLECTIONS.hostApplications)
    .doc(auth.session.uid);

  const existing = await applicationRef.get();
  if (existing.exists) {
    const existingData = existing.data();
    const activeStatuses = ["submitted", "under_review", "approved"];
    if (activeStatuses.includes(existingData?.status)) {
      return NextResponse.json(
        {
          error: "An active host application already exists for this account.",
          status: existingData?.status,
        },
        { status: 409 },
      );
    }
  }

  const now = FieldValue.serverTimestamp();
  const applicationData = {
    ...parsed.data,
    ownerUid: auth.session.uid,
    status: "submitted" as const,
    submittedAt: now,
    reviewedAt: null,
    reviewedByUid: null,
    reviewNotes: null,
    createdAt: existing.exists ? existing.data()?.createdAt ?? now : now,
    updatedAt: now,
  };

  await applicationRef.set(applicationData);

  // Record audit trail
  await logAuditEvent({
    actorUid: auth.session.uid,
    action: "host.application_submitted",
    targetType: COLLECTIONS.hostApplications,
    targetId: auth.session.uid,
    metadata: {
      communityName: parsed.data.communityName,
      communityType: parsed.data.communityType,
      audienceSize: parsed.data.audienceSize,
      destinationsCount: parsed.data.proposedDestinations.length,
    },
    reason: "Host submitted application via multi-step wizard",
  });

  return NextResponse.json({
    success: true,
    id: auth.session.uid,
    status: "submitted",
  });
}
