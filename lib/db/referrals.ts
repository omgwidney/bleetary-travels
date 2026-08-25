import "server-only";

import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/data-model";
import type { ReferralDocument } from "@/lib/db/schema";

export type ReferralRow = ReferralDocument & { id: string };

function toReferralRow(doc: FirebaseFirestore.DocumentSnapshot): ReferralRow {
  return { id: doc.id, ...(doc.data() as ReferralDocument) };
}

export interface HostReferralSummary {
  totalReferrals: number;
  confirmedTrips: number;
  totalRewardUnlockedCents: number;
  referrals: ReferralRow[];
}

/**
 * Returns all referrals and aggregated metrics for a referrer UID.
 */
export async function getHostReferralSummary(
  referrerUid: string,
): Promise<HostReferralSummary> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(COLLECTIONS.referrals)
    .where("referrerUid", "==", referrerUid)
    .get();

  const referrals = snapshot.docs.map(toReferralRow);

  let confirmedTrips = 0;
  let totalRewardUnlockedCents = 0;

  for (const ref of referrals) {
    if (ref.status === "credited") {
      confirmedTrips += 1;
      totalRewardUnlockedCents += ref.creditAmountCents || 0;
    }
  }

  return {
    totalReferrals: referrals.length,
    confirmedTrips,
    totalRewardUnlockedCents,
    referrals,
  };
}
