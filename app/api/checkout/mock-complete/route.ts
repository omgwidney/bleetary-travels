import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorizeRequest, isSameOrigin } from "@/lib/auth/request";
import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/data-model";
import { createBookingRecord } from "@/lib/db/bookings";
import type { TripDocument, TripDepartureDocument } from "@/lib/db/schema";

const mockCompleteSchema = z.object({
  departureId: z.string().min(1),
  tripId: z.string().min(1),
  guestCount: z.number().int().min(1).default(1),
  roomType: z.enum(["standard", "private", "shared"]).default("standard"),
  sessionId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  if (process.env.ALLOW_MOCK_CHECKOUT !== "true") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const auth = await authorizeRequest(request);
  if (!auth.session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = mockCompleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const { departureId, tripId, guestCount, roomType, sessionId } = parsed.data;
  const db = getAdminDb();

  const [departureDoc, tripDoc] = await Promise.all([
    db.collection(COLLECTIONS.tripDepartures).doc(departureId).get(),
    db.collection(COLLECTIONS.trips).doc(tripId).get(),
  ]);

  if (!departureDoc.exists || !tripDoc.exists) {
    return NextResponse.json({ error: "Trip or departure not found." }, { status: 404 });
  }

  const departure = departureDoc.data() as TripDepartureDocument;
  const trip = tripDoc.data() as TripDocument;

  const effectiveBasePriceCents = departure.basePriceCents;
  const depositPercent = departure.depositPercent || 30;
  const unitDepositCents = Math.round((effectiveBasePriceCents * depositPercent) / 100);
  const totalDepositCents = unitDepositCents * guestCount;
  const totalTripAmountCents = effectiveBasePriceCents * guestCount;

  const result = await createBookingRecord({
    travelerUid: auth.session.uid,
    travelerEmail: auth.session.email,
    travelerName: auth.session.displayName,
    hostUid: trip.hostUid,
    tripId,
    departureId,
    tripTitle: trip.title,
    currency: departure.currency || "USD",
    basePriceCents: effectiveBasePriceCents,
    totalAmountCents: totalTripAmountCents,
    depositAmountCents: totalDepositCents,
    guestCount,
    roomType,
    finalBalanceDueDays: departure.finalBalanceDueDays || 60,
    stripePaymentIntentId: `pi_mock_${sessionId}`,
    stripeChargeId: `ch_mock_${sessionId}`,
  });

  return NextResponse.json({ ok: true, bookingId: result.bookingId });
}
