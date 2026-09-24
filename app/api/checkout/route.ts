import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorizeRequest, isSameOrigin } from "@/lib/auth/request";
import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/data-model";
import { getStripe, hasRealStripeKey } from "@/lib/stripe";
import type { TripDocument, TripDepartureDocument } from "@/lib/db/schema";

const checkoutPayloadSchema = z.object({
  departureId: z.string().trim().min(1, "Departure ID is required"),
  tripId: z.string().trim().min(1, "Trip ID is required"),
  guestCount: z.number().int().min(1).max(10).default(1),
  roomType: z.enum(["standard", "private", "shared"]).default("standard"),
});

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
  const parsed = checkoutPayloadSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Invalid checkout payload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { departureId, tripId, guestCount, roomType } = parsed.data;
  const db = getAdminDb();

  const [departureDoc, tripDoc] = await Promise.all([
    db.collection(COLLECTIONS.tripDepartures).doc(departureId).get(),
    db.collection(COLLECTIONS.trips).doc(tripId).get(),
  ]);

  if (!departureDoc.exists || !tripDoc.exists) {
    return NextResponse.json(
      { error: "Selected trip or departure was not found." },
      { status: 404 },
    );
  }

  const departure = departureDoc.data() as TripDepartureDocument;
  const trip = tripDoc.data() as TripDocument;

  if (departure.status !== "published" || trip.status !== "published") {
    return NextResponse.json(
      { error: "This trip departure is not currently open for bookings." },
      { status: 400 },
    );
  }

  // Capacity verification
  const spotsLeft = departure.capacity - (departure.confirmedCount || 0);
  if (spotsLeft < guestCount) {
    return NextResponse.json(
      {
        error:
          spotsLeft <= 0
            ? "This departure is sold out."
            : `Only ${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} remaining on this departure.`,
      },
      { status: 409 },
    );
  }

  // Calculate pricing
  const effectiveBasePriceCents = departure.basePriceCents;
  const depositPercent = departure.depositPercent || 30;
  const unitDepositCents = Math.round(
    (effectiveBasePriceCents * depositPercent) / 100,
  );
  const totalDepositCents = unitDepositCents * guestCount;
  const totalTripAmountCents = effectiveBasePriceCents * guestCount;

  // Resolve origin for redirect URLs
  const origin =
    request.headers.get("origin") ||
    request.headers.get("referer") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  if (!hasRealStripeKey()) {
    if (process.env.ALLOW_MOCK_CHECKOUT !== "true") {
      return NextResponse.json(
        { error: "Payments are not configured on this server." },
        { status: 503 },
      );
    }

    const mockSessionId = `cs_test_mock_${Date.now()}`;
    const formattedDeposit = `$${(totalDepositCents / 100).toFixed(2)}`;
    const mockUrl = `${origin}/checkout/mock?session_id=${encodeURIComponent(
      mockSessionId,
    )}&tripId=${encodeURIComponent(tripId)}&departureId=${encodeURIComponent(
      departureId,
    )}&guestCount=${guestCount}&roomType=${encodeURIComponent(
      roomType,
    )}&tripTitle=${encodeURIComponent(trip.title)}&amount=${encodeURIComponent(
      formattedDeposit,
    )}`;

    return NextResponse.json({
      url: mockUrl,
      sessionId: mockSessionId,
    });
  }

  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: auth.session.email,
    client_reference_id: auth.session.uid,
    line_items: [
      {
        price_data: {
          currency: (departure.currency || "usd").toLowerCase(),
          product_data: {
            name: `${trip.title} — Deposit`,
            description: `${depositPercent}% Deposit for ${guestCount} traveler${guestCount === 1 ? "" : "s"}.`,
            images: trip.imagePaths?.length ? [trip.imagePaths[0]] : undefined,
          },
          unit_amount: unitDepositCents,
        },
        quantity: guestCount,
      },
    ],
    metadata: {
      travelerUid: auth.session.uid,
      travelerEmail: auth.session.email,
      travelerName: auth.session.displayName,
      hostUid: trip.hostUid,
      tripId,
      departureId,
      tripSlug: trip.slug,
      tripTitle: trip.title,
      currency: departure.currency || "USD",
      basePriceCents: effectiveBasePriceCents.toString(),
      totalAmountCents: totalTripAmountCents.toString(),
      depositAmountCents: totalDepositCents.toString(),
      depositPercent: depositPercent.toString(),
      finalBalanceDueDays: (departure.finalBalanceDueDays || 60).toString(),
      guestCount: guestCount.toString(),
      roomType,
    },
    success_url: `${origin}/account?booking_success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/trips/${trip.slug}?booking_cancelled=true`,
  });

  return NextResponse.json({
    url: session.url,
    sessionId: session.id,
  });
}
