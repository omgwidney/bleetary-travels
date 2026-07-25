import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { authorizeRequest, isSameOrigin } from "@/lib/auth/request";
import { getAdminBucket } from "@/lib/firebase-admin";

const CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const CATEGORIES = new Set(["profile", "itinerary", "destination", "content"]);
const MAX_BYTES = 10 * 1024 * 1024;

function safeFileName(name: string): string {
  const cleaned = name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
  return cleaned.slice(-100) || "image";
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const auth = await authorizeRequest(request, ["admin"]);
  if (!auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const category = formData.get("category");
  const published = formData.get("published") === "true";

  if (
    !(file instanceof File) ||
    typeof category !== "string" ||
    !CATEGORIES.has(category) ||
    !CONTENT_TYPES.has(file.type) ||
    file.size <= 0 ||
    file.size > MAX_BYTES
  ) {
    return NextResponse.json(
      { error: "Provide a JPEG, PNG, or WebP image no larger than 10 MB." },
      { status: 400 },
    );
  }

  const visibility = published ? "published" : "private";
  const path = `${visibility}/${category}/${randomUUID()}-${safeFileName(file.name)}`;
  const storageFile = getAdminBucket().file(path);
  await storageFile.save(Buffer.from(await file.arrayBuffer()), {
    resumable: false,
    contentType: file.type,
    metadata: {
      cacheControl: published
        ? "public,max-age=3600"
        : "private,max-age=0,no-store",
      metadata: {
        actorUid: auth.session.uid,
        category,
        visibility,
      },
    },
  });

  return NextResponse.json({ path, visibility });
}
