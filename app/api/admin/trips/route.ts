import { NextRequest, NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { authorizeRequest, isSameOrigin } from "@/lib/auth/request";
import { getAdminAuth, getAdminBucket, getAdminDb } from "@/lib/firebase-admin";
import { adminTripSchema } from "@/lib/validation/admin-trip";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const auth = await authorizeRequest(request, ["admin"]);
  if (!auth.session) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const parsed = adminTripSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(" ") }, { status: 400 });
  const input = parsed.data;
  const db = getAdminDb();
  try {
    const host = await getAdminAuth().getUser(input.hostUid);
    if (host.disabled || !host.emailVerified || !["host", "admin"].includes(host.customClaims?.role)) return NextResponse.json({ error: "Select an approved, active host." }, { status: 400 });
    const profile = await db.collection("hostProfiles").doc(input.hostUid).get();
    if (!profile.exists || profile.data()?.status !== "published") return NextResponse.json({ error: "The host needs a published profile. Approve their application in Host Queue first." }, { status: 400 });
    if (input.status === "published" && input.startDate < new Date().toISOString().slice(0, 10)) return NextResponse.json({ error: "Published trips must have an upcoming departure." }, { status: 400 });
    const bucket = getAdminBucket();
    for (const image of input.images) {
      const url = new URL(image.url);
      const expectedPath = `/v0/b/${bucket.name}/o/${encodeURIComponent(image.path)}`;
      const local = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
      const allowedOrigin = local ? "http://127.0.0.1:9199" : "https://firebasestorage.googleapis.com";
      if (url.origin !== allowedOrigin || url.pathname !== expectedPath || url.searchParams.get("alt") !== "media") throw new Error("Invalid image URL. Upload originals using this editor.");
      const [metadata] = await bucket.file(image.path).getMetadata();
      const tokens = String(metadata.metadata?.firebaseStorageDownloadTokens ?? "").split(",");
      if (Number(metadata.size) !== image.size || metadata.contentType !== image.contentType || !tokens.includes(url.searchParams.get("token") ?? "")) throw new Error("Image upload is incomplete or its metadata does not match.");
    }
    const tripRef = db.collection("trips").doc(input.slug);
    const itineraryRef = db.collection("itineraries").doc();
    const departureRef = db.collection("tripDepartures").doc();
    const destinationRef = input.destinationId ? db.collection("destinations").doc(input.destinationId) : db.collection("destinations").doc();
    const existingSlug = await db.collection("trips").where("slug", "==", input.slug).limit(1).get();
    if (!existingSlug.empty) return NextResponse.json({ error: "This trip address is already in use. Choose a different slug." }, { status: 409 });
    await db.runTransaction(async tx => {
      const existing = await tx.get(tripRef);
      const destination = await tx.get(destinationRef);
      if (existing.exists) throw new Error("This trip address is already in use.");
      if (input.destinationId && (!destination.exists || (input.status === "published" && destination.data()?.status !== "published"))) throw new Error("Select a published destination before publishing the trip.");
      const now = FieldValue.serverTimestamp();
      const base = { createdAt: now, updatedAt: now, status: input.status, publishedAt: input.status === "published" ? now : null };
      const owned = { ...base, ownerUid: input.hostUid };
      const images = input.images.map(i => i.url);
      if (!input.destinationId) tx.create(destinationRef, { ...base, ...input.destination, slug: `${input.slug}-destination`, imagePath: images[0], heroImagePath: images[0], featuredOrder: null });
      tx.create(itineraryRef, { ...owned, destinationId: destinationRef.id, title: input.title, durationDays: input.days.length, days: input.days.map((day, i) => ({ ...day, dayNumber: i + 1, activities: day.activities.map(title => ({ title, description: "", durationMinutes: null })) })) });
      tx.create(tripRef, { ...owned, managedDepartureId: departureRef.id, managedDestination: !input.destinationId, hostUid: input.hostUid, hostProfileId: input.hostUid, itineraryId: itineraryRef.id, destinationId: destinationRef.id, title: input.title, slug: input.slug, tagline: input.tagline, currency: "USD", basePriceCents: input.basePriceCents, earlyBirdPriceCents: null, earlyBirdCutoffDate: null, maxGroupSize: input.capacity, imagePaths: images, imageOriginals: input.images, tags: input.tags, badgeLabel: null, badgeType: null });
      tx.create(departureRef, { ...owned, tripId: tripRef.id, hostUid: input.hostUid, startDate: Timestamp.fromDate(new Date(`${input.startDate}T00:00:00Z`)), endDate: Timestamp.fromDate(new Date(`${input.endDate}T00:00:00Z`)), capacity: input.capacity, confirmedCount: 0, waitlistCount: 0, currency: "USD", basePriceCents: input.basePriceCents, earlyBirdPriceCents: null, earlyBirdCutoffDate: null, depositPercent: input.depositPercent, finalBalanceDueDays: input.finalBalanceDueDays });
      tx.create(db.collection("auditEvents").doc(), { actorUid: auth.session!.uid, action: "trip.created", targetType: "trips", targetId: tripRef.id, reason: "Created in admin trip editor", metadata: { hostUid: input.hostUid, itineraryId: itineraryRef.id, departureId: departureRef.id, status: input.status }, createdAt: now });
    });
    return NextResponse.json({ id: tripRef.id, slug: input.slug, status: input.status }, { status: 201 });
  } catch (error) {
    console.error("[Admin trip create]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save trip. Your form has been kept." }, { status: 400 });
  }
}
