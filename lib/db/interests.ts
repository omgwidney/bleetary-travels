import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/data-model";
import type { InterestResponseDocument } from "@/lib/db/schema";
import type { InterestResponseOutput } from "@/lib/validation/host-application";

export type InterestResponseRow = InterestResponseDocument & { id: string };

function toInterestResponseRow(
  doc: FirebaseFirestore.DocumentSnapshot,
): InterestResponseRow {
  return { id: doc.id, ...(doc.data() as InterestResponseDocument) };
}

/**
 * Returns all interest responses collected by a specific host (ownerUid).
 */
export async function getHostInterestResponses(
  hostUid: string,
): Promise<InterestResponseRow[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(COLLECTIONS.interestResponses)
    .where("ownerUid", "==", hostUid)
    .get();

  return snapshot.docs.map(toInterestResponseRow);
}

/**
 * Records a new interest response for a host survey link.
 */
export async function saveInterestResponse(
  hostUid: string,
  data: InterestResponseOutput,
  travelerUid: string | null = null,
): Promise<string> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTIONS.interestResponses).doc();

  await ref.set({
    ownerUid: hostUid,
    travelerUid,
    surveyLinkId: data.surveyLinkId,
    respondentEmail: data.respondentEmail,
    respondentName: data.respondentName,
    destinationInterests: data.destinationInterests,
    travelMonths: data.travelMonths,
    groupSizePreference: data.groupSizePreference,
    budgetRangeCents: data.budgetRangeCents,
    notes: data.notes,
    createdAt: FieldValue.serverTimestamp(),
  });

  return ref.id;
}
