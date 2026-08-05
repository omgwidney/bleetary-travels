/**
 * lib/db/destinations.ts
 *
 * Server-side Admin SDK helpers for the `destinations` collection.
 * Import only from React Server Components or API routes — never from client code.
 */
import "server-only";

import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/data-model";
import type { DestinationDocument } from "@/lib/db/schema";

// ─── Typed document helpers ───────────────────────────────────────────────

type DestinationRow = DestinationDocument & { id: string };

function toDestinationRow(
  doc: FirebaseFirestore.DocumentSnapshot,
): DestinationRow {
  return { id: doc.id, ...(doc.data() as DestinationDocument) };
}

// ─── Queries ──────────────────────────────────────────────────────────────

/**
 * Returns all published destinations ordered by `featuredOrder` ascending
 * (lower number = higher priority). Destinations with featuredOrder = null
 * are sorted to the end.
 */
export async function getPublishedDestinations(): Promise<DestinationRow[]> {
  const db = getAdminDb();

  // Firestore can't ORDER BY a nullable field alongside an equality filter
  // without a composite index, so we fetch all published docs and sort in-memory.
  const snapshot = await db
    .collection(COLLECTIONS.destinations)
    .where("status", "==", "published")
    .get();

  const rows = snapshot.docs.map(toDestinationRow);

  // Sort: non-null featuredOrder ascending, then null at the end
  rows.sort((a, b) => {
    if (a.featuredOrder === null && b.featuredOrder === null) return 0;
    if (a.featuredOrder === null) return 1;
    if (b.featuredOrder === null) return -1;
    return a.featuredOrder - b.featuredOrder;
  });

  return rows;
}

/**
 * Returns a single published destination by its Firestore document ID, or null.
 */
export async function getDestinationById(
  id: string,
): Promise<DestinationRow | null> {
  const db = getAdminDb();
  const doc = await db.collection(COLLECTIONS.destinations).doc(id).get();
  if (!doc.exists || (doc.data() as DestinationDocument).status !== "published") {
    return null;
  }
  return toDestinationRow(doc);
}
