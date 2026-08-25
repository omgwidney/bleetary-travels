import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/data-model";
import type { PaymentDocument, PaymentType, PaymentStatus } from "@/lib/db/schema";

export type PaymentRow = PaymentDocument & { id: string };

function toPaymentRow(doc: FirebaseFirestore.DocumentSnapshot): PaymentRow {
  return { id: doc.id, ...(doc.data() as PaymentDocument) };
}

/**
 * Returns all payment records associated with a specific booking.
 */
export async function getBookingPayments(
  bookingId: string,
): Promise<PaymentRow[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(COLLECTIONS.payments)
    .where("bookingId", "==", bookingId)
    .get();

  return snapshot.docs.map(toPaymentRow);
}

export interface RecordPaymentParams {
  bookingId: string;
  scheduleId: string;
  travelerUid: string;
  hostUid: string;
  currency: string;
  amountCents: number;
  paymentType: PaymentType;
  status: PaymentStatus;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  failureReason?: string | null;
}

/**
 * Writes a new payment transaction document to Firestore.
 */
export async function recordPayment(
  params: RecordPaymentParams,
): Promise<string> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTIONS.payments).doc();

  await ref.set({
    ...params,
    paidAt: params.status === "succeeded" ? FieldValue.serverTimestamp() : null,
    failureReason: params.failureReason || null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return ref.id;
}
