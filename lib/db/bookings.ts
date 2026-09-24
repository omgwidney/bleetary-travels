import "server-only";

import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/data-model";
import type {
  BookingDocument,
  PaymentScheduleDocument,
  TripDocument,
  TripDepartureDocument,
  DestinationDocument,
} from "@/lib/db/schema";

export type BookingRow = BookingDocument & { id: string };
export type PaymentScheduleRow = PaymentScheduleDocument & { id: string };

function toBookingRow(doc: FirebaseFirestore.DocumentSnapshot): BookingRow {
  return { id: doc.id, ...(doc.data() as BookingDocument) };
}

function toPaymentScheduleRow(
  doc: FirebaseFirestore.DocumentSnapshot,
): PaymentScheduleRow {
  return { id: doc.id, ...(doc.data() as PaymentScheduleDocument) };
}

/**
 * Returns all bookings for a specific traveler.
 */
export async function getUserBookings(
  travelerUid: string,
): Promise<BookingRow[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(COLLECTIONS.bookings)
    .where("travelerUid", "==", travelerUid)
    .get();

  const rows = snapshot.docs.map(toBookingRow);
  // Sort in memory by createdAt descending
  rows.sort((a, b) => {
    const aTime =
      typeof a.createdAt === "object" &&
      a.createdAt !== null &&
      "toMillis" in a.createdAt
        ? (a.createdAt as { toMillis: () => number }).toMillis()
        : 0;
    const bTime =
      typeof b.createdAt === "object" &&
      b.createdAt !== null &&
      "toMillis" in b.createdAt
        ? (b.createdAt as { toMillis: () => number }).toMillis()
        : 0;
    return bTime - aTime;
  });

  return rows;
}

/**
 * Returns the payment schedule for a specific booking.
 */
export async function getBookingPaymentSchedule(
  bookingId: string,
): Promise<PaymentScheduleRow | null> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(COLLECTIONS.paymentSchedules)
    .where("bookingId", "==", bookingId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return toPaymentScheduleRow(snapshot.docs[0]);
}

export interface HydratedBooking {
  booking: BookingRow;
  trip: (TripDocument & { id: string }) | null;
  departure: (TripDepartureDocument & { id: string }) | null;
  destination: (DestinationDocument & { id: string }) | null;
  schedule: PaymentScheduleRow | null;
}

/**
 * Fetches all user bookings along with associated trip, departure,
 * destination, and payment schedule details.
 */
export async function getHydratedUserBookings(
  travelerUid: string,
): Promise<HydratedBooking[]> {
  const db = getAdminDb();
  const bookings = await getUserBookings(travelerUid);
  if (bookings.length === 0) return [];

  const hydrated = await Promise.all(
    bookings.map(async (booking) => {
      const [tripDoc, departureDoc, schedule] = await Promise.all([
        db.collection(COLLECTIONS.trips).doc(booking.tripId).get(),
        db.collection(COLLECTIONS.tripDepartures).doc(booking.departureId).get(),
        getBookingPaymentSchedule(booking.id),
      ]);

      const trip = tripDoc.exists
        ? { id: tripDoc.id, ...(tripDoc.data() as TripDocument) }
        : null;

      const departure = departureDoc.exists
        ? { id: departureDoc.id, ...(departureDoc.data() as TripDepartureDocument) }
        : null;

      let destination: (DestinationDocument & { id: string }) | null = null;
      if (trip?.destinationId) {
        const destDoc = await db
          .collection(COLLECTIONS.destinations)
          .doc(trip.destinationId)
          .get();
        if (destDoc.exists) {
          destination = { id: destDoc.id, ...(destDoc.data() as DestinationDocument) };
        }
      }

      return {
        booking,
        trip,
        departure,
        destination,
        schedule,
      };
    }),
  );

  return hydrated;
}

export interface CreateBookingRecordInput {
  travelerUid: string;
  travelerEmail?: string;
  travelerName?: string;
  hostUid: string;
  tripId: string;
  departureId: string;
  tripTitle?: string;
  currency?: string;
  basePriceCents: number;
  totalAmountCents: number;
  depositAmountCents: number;
  guestCount: number;
  roomType?: "standard" | "private" | "shared";
  finalBalanceDueDays?: number;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
}

/**
 * Creates booking, payment schedule, and initial payment in a Firestore transaction.
 */
export async function createBookingRecord(input: CreateBookingRecordInput) {
  const { FieldValue, Timestamp } = await import("firebase-admin/firestore");
  const { logAuditEvent } = await import("@/lib/db/audit");
  const db = getAdminDb();

  const balanceRemainingCents = Math.max(0, input.totalAmountCents - input.depositAmountCents);
  const departureRef = db.collection(COLLECTIONS.tripDepartures).doc(input.departureId);
  const bookingRef = db.collection(COLLECTIONS.bookings).doc();
  const scheduleRef = db.collection(COLLECTIONS.paymentSchedules).doc();
  const paymentRef = db.collection(COLLECTIONS.payments).doc();
  const now = FieldValue.serverTimestamp();

  await db.runTransaction(async (transaction) => {
    const departureSnapshot = await transaction.get(departureRef);
    if (!departureSnapshot.exists) {
      throw new Error(`Departure ${input.departureId} does not exist.`);
    }

    const departureData = departureSnapshot.data() as TripDepartureDocument;
    const currentConfirmed = departureData.confirmedCount || 0;

    // 1. Atomically increment confirmed seat count
    transaction.update(departureRef, {
      confirmedCount: currentConfirmed + input.guestCount,
      updatedAt: now,
    });

    // 2. Create booking document
    transaction.set(bookingRef, {
      travelerUid: input.travelerUid,
      hostUid: input.hostUid,
      tripId: input.tripId,
      departureId: input.departureId,
      currency: input.currency || "USD",
      basePriceCents: input.basePriceCents,
      earlyBirdDiscountCents: 0,
      roomTypePremiumCents: 0,
      totalAmountCents: input.totalAmountCents,
      depositAmountCents: input.depositAmountCents,
      roomType: input.roomType || "standard",
      guestCount: input.guestCount,
      status: "confirmed",
      cancelledAt: null,
      cancellationReason: null,
      refundAmountCents: null,
      specialRequests: "",
      dietaryRequirements: [],
      createdAt: now,
      updatedAt: now,
    });

    // 3. Compute final balance due date
    let finalBalanceDueDate: FirebaseFirestore.FieldValue | FirebaseFirestore.Timestamp = now;
    const dueDays = input.finalBalanceDueDays || 60;
    if (departureData.startDate) {
      const start = departureData.startDate;
      const startMillis =
        typeof start === "object" && start !== null && "toMillis" in start
          ? (start as { toMillis: () => number }).toMillis()
          : start instanceof Date
            ? start.getTime()
            : new Date(String(start)).getTime();
      if (!isNaN(startMillis)) {
        const dueMillis = startMillis - dueDays * 24 * 60 * 60 * 1000;
        finalBalanceDueDate = Timestamp.fromMillis(dueMillis);
      }
    }

    // 4. Create payment schedule
    transaction.set(scheduleRef, {
      bookingId: bookingRef.id,
      travelerUid: input.travelerUid,
      hostUid: input.hostUid,
      tripId: input.tripId,
      departureId: input.departureId,
      currency: input.currency || "USD",
      totalAmountCents: input.totalAmountCents,
      status: balanceRemainingCents === 0 ? "complete" : "active",
      installments: [
        {
          sequence: 1,
          labelKey: "deposit",
          amountCents: input.depositAmountCents,
          dueDate: Timestamp.now(),
          status: "paid",
          paymentId: paymentRef.id,
          paidAt: Timestamp.now(),
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
      travelerUid: input.travelerUid,
      hostUid: input.hostUid,
      currency: input.currency || "USD",
      amountCents: input.depositAmountCents,
      paymentType: "deposit",
      status: "succeeded",
      stripePaymentIntentId: input.stripePaymentIntentId || `pi_mock_${bookingRef.id}`,
      stripeChargeId: input.stripeChargeId || `ch_mock_${bookingRef.id}`,
      paidAt: now,
      failureReason: null,
      createdAt: now,
      updatedAt: now,
    });
  });

  // 6. Record audit trail
  await logAuditEvent({
    actorUid: input.travelerUid,
    action: "booking.confirmed",
    targetType: COLLECTIONS.bookings,
    targetId: bookingRef.id,
    metadata: {
      tripId: input.tripId,
      departureId: input.departureId,
      tripTitle: input.tripTitle || "Trip",
      depositAmountCents: input.depositAmountCents,
      totalAmountCents: input.totalAmountCents,
      guestCount: input.guestCount,
      stripePaymentIntentId: input.stripePaymentIntentId || `pi_mock_${bookingRef.id}`,
    },
    reason: "Deposit checkout completed successfully",
  });

  return {
    bookingId: bookingRef.id,
    scheduleId: scheduleRef.id,
    paymentId: paymentRef.id,
  };
}

