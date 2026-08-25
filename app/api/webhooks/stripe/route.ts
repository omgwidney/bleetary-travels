import { NextRequest, NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/data-model";
import { logAuditEvent } from "@/lib/db/audit";
import type { TripDepartureDocument } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 },
    );
  }

  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET || "whsec_mock_test_secret";
  let event: Stripe.Event;

  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid webhook signature.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Handle checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    if (!metadata || !metadata.departureId || !metadata.travelerUid) {
      // Session was not initiated via our trip booking pipeline
      return NextResponse.json({ received: true });
    }

    const db = getAdminDb();
    const stripePaymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.id;

    // Idempotency check: see if payment with this stripePaymentIntentId already exists
    const existingPayments = await db
      .collection(COLLECTIONS.payments)
      .where("stripePaymentIntentId", "==", stripePaymentIntentId)
      .limit(1)
      .get();

    if (!existingPayments.empty) {
      return NextResponse.json({
        received: true,
        message: "Payment already processed.",
      });
    }

    const {
      travelerUid,
      hostUid,
      tripId,
      departureId,
      currency,
      basePriceCents,
      totalAmountCents,
      depositAmountCents,
      guestCount: rawGuestCount,
      roomType,
      tripTitle,
      finalBalanceDueDays: rawDueDays,
    } = metadata;

    const guestCount = parseInt(rawGuestCount || "1", 10);
    const depositCents = parseInt(depositAmountCents || "0", 10);
    const totalCents = parseInt(totalAmountCents || "0", 10);
    const baseCents = parseInt(basePriceCents || "0", 10);
    const finalBalanceDueDays = parseInt(rawDueDays || "60", 10);
    const balanceRemainingCents = Math.max(0, totalCents - depositCents);

    const departureRef = db
      .collection(COLLECTIONS.tripDepartures)
      .doc(departureId);

    const bookingRef = db.collection(COLLECTIONS.bookings).doc();
    const scheduleRef = db.collection(COLLECTIONS.paymentSchedules).doc();
    const paymentRef = db.collection(COLLECTIONS.payments).doc();

    const now = FieldValue.serverTimestamp();

    await db.runTransaction(async (transaction) => {
      const departureSnapshot = await transaction.get(departureRef);
      if (!departureSnapshot.exists) {
        throw new Error(`Departure ${departureId} does not exist.`);
      }

      const departureData = departureSnapshot.data() as TripDepartureDocument;
      const currentConfirmed = departureData.confirmedCount || 0;

      // 1. Atomically increment confirmed seat count
      transaction.update(departureRef, {
        confirmedCount: currentConfirmed + guestCount,
        updatedAt: now,
      });

      // 2. Create booking document
      transaction.set(bookingRef, {
        travelerUid,
        hostUid,
        tripId,
        departureId,
        currency: currency || "USD",
        basePriceCents: baseCents,
        earlyBirdDiscountCents: 0,
        roomTypePremiumCents: 0,
        totalAmountCents: totalCents,
        depositAmountCents: depositCents,
        roomType: roomType || "standard",
        guestCount,
        status: "confirmed" as const,
        cancelledAt: null,
        cancellationReason: null,
        refundAmountCents: null,
        specialRequests: "",
        dietaryRequirements: [],
        createdAt: now,
        updatedAt: now,
      });

      // 3. Compute final balance due date (departure.startDate - finalBalanceDueDays)
      let finalBalanceDueDate: FieldValue | Timestamp = now;
      if (departureData.startDate) {
        const start = departureData.startDate;
        const startMillis =
          typeof start === "object" && start !== null && "toMillis" in start
            ? (start as { toMillis: () => number }).toMillis()
            : start instanceof Date
              ? start.getTime()
              : new Date(String(start)).getTime();
        if (!isNaN(startMillis)) {
          const dueMillis =
            startMillis - finalBalanceDueDays * 24 * 60 * 60 * 1000;
          finalBalanceDueDate = Timestamp.fromMillis(dueMillis);
        }
      }

      // 4. Create payment schedule with installments
      transaction.set(scheduleRef, {
        bookingId: bookingRef.id,
        travelerUid,
        hostUid,
        tripId,
        departureId,
        currency: currency || "USD",
        totalAmountCents: totalCents,
        status: balanceRemainingCents === 0 ? "complete" : ("active" as const),
        installments: [
          {
            sequence: 1,
            labelKey: "deposit",
            amountCents: depositCents,
            dueDate: now,
            status: "paid" as const,
            paymentId: paymentRef.id,
            paidAt: now,
          },
          ...(balanceRemainingCents > 0
            ? [
                {
                  sequence: 2,
                  labelKey: "final_balance",
                  amountCents: balanceRemainingCents,
                  dueDate: finalBalanceDueDate,
                  status: "upcoming" as const,
                  paymentId: null,
                  paidAt: null,
                },
              ]
            : []),
        ],
        createdAt: now,
        updatedAt: now,
      });

      // 5. Create payment document
      transaction.set(paymentRef, {
        bookingId: bookingRef.id,
        scheduleId: scheduleRef.id,
        travelerUid,
        hostUid,
        currency: currency || "USD",
        amountCents: depositCents,
        paymentType: "deposit" as const,
        status: "succeeded" as const,
        stripePaymentIntentId,
        stripeChargeId: session.id,
        paidAt: now,
        failureReason: null,
        createdAt: now,
        updatedAt: now,
      });
    });

    // 6. Record audit trail
    await logAuditEvent({
      actorUid: travelerUid,
      action: "booking.confirmed",
      targetType: COLLECTIONS.bookings,
      targetId: bookingRef.id,
      metadata: {
        tripId,
        departureId,
        tripTitle: tripTitle || "Trip",
        depositAmountCents: depositCents,
        totalAmountCents: totalCents,
        guestCount,
        stripePaymentIntentId,
      },
      reason: "Stripe deposit checkout completed successfully",
    });
  }

  return NextResponse.json({ received: true });
}
