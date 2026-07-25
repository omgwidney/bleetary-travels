import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { authorizeRequest, isSameOrigin } from "@/lib/auth/request";
import {
  ADMIN_CONTENT_COLLECTIONS,
  COLLECTIONS,
  type AdminContentCollection,
} from "@/lib/data-model";
import { getAdminDb } from "@/lib/firebase-admin";

const contentSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]{1,119}$/),
  data: z.record(z.string(), z.unknown()),
  reason: z.string().trim().min(5).max(500),
});

function isAdminContentCollection(
  value: string,
): value is AdminContentCollection {
  return ADMIN_CONTENT_COLLECTIONS.includes(value as AdminContentCollection);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ collection: string }> },
) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const auth = await authorizeRequest(request, ["admin"]);
  if (!auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { collection } = await context.params;
  if (!isAdminContentCollection(collection)) {
    return NextResponse.json(
      { error: "Unsupported content collection." },
      { status: 404 },
    );
  }

  const parsed = contentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "A valid document ID, payload, and reason are required." },
      { status: 400 },
    );
  }

  const forbiddenFields = [
    "createdAt",
    "updatedAt",
    "publishedAt",
    "ownerUid",
  ];
  if (forbiddenFields.some((field) => field in parsed.data.data)) {
    return NextResponse.json(
      { error: "Server-managed fields cannot be supplied." },
      { status: 400 },
    );
  }

  const status = parsed.data.data.status;
  if (
    status !== undefined &&
    !["draft", "published", "archived"].includes(String(status))
  ) {
    return NextResponse.json(
      { error: "Invalid publication status." },
      { status: 400 },
    );
  }

  const db = getAdminDb();
  const docRef = db.collection(collection).doc(parsed.data.id);
  const existing = await docRef.get();
  const publishedAt =
    status === "published"
      ? existing.data()?.publishedAt ?? FieldValue.serverTimestamp()
      : existing.data()?.publishedAt ?? null;

  const batch = db.batch();
  batch.set(
    docRef,
    {
      ...parsed.data.data,
      createdAt:
        existing.data()?.createdAt ?? FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      publishedAt,
    },
    { merge: true },
  );
  const auditRef = db.collection(COLLECTIONS.auditEvents).doc();
  batch.set(auditRef, {
    actorUid: auth.session.uid,
    action: "content.upserted",
    targetType: collection,
    targetId: parsed.data.id,
    reason: parsed.data.reason,
    metadata: { status: status ?? existing.data()?.status ?? "draft" },
    createdAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();

  return NextResponse.json({ id: parsed.data.id, collection });
}
