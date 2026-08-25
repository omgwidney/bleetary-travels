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
