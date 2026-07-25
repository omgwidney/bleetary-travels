import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { authorizeRequest, isSameOrigin } from "@/lib/auth/request";
import { COLLECTIONS } from "@/lib/data-model";
import { getAdminDb } from "@/lib/firebase-admin";

const applicationSchema = z.object({
  communityDescription: z.string().trim().min(20).max(2000),
  audienceSize: z.number().int().min(0).max(100_000_000),
  channels: z.array(z.string().trim().min(1).max(50)).min(1).max(10),
  destinationInterests: z
    .array(z.string().trim().min(1).max(100))
    .min(1)
    .max(10),
  consent: z.literal(true),
});

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const auth = await authorizeRequest(request);
  if (!auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const parsed = applicationSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Complete every host application field." },
      { status: 400 },
    );
  }

  const db = getAdminDb();
  const applicationRef = db
    .collection(COLLECTIONS.hostApplications)
    .doc(auth.session.uid);
  const existing = await applicationRef.get();

  if (
    existing.exists &&
    ["submitted", "under_review", "approved"].includes(existing.data()?.status)
  ) {
    return NextResponse.json(
      { error: "An active host application already exists." },
      { status: 409 },
    );
  }

  await applicationRef.set({
    ...parsed.data,
    ownerUid: auth.session.uid,
    email: auth.session.email,
    status: "submitted",
    submittedAt: FieldValue.serverTimestamp(),
    createdAt:
      existing.data()?.createdAt ?? FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ id: applicationRef.id, status: "submitted" });
}
