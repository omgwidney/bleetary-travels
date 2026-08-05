/**
 * lib/db/trips.ts
 *
 * Server-side Admin SDK helpers for the `trips` and `tripDepartures` collections.
 * Import only from React Server Components or API routes — never from client code.
 */
import "server-only";

import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/data-model";
import type { TripDocument, TripDepartureDocument } from "@/lib/db/schema";

// ─── Typed document helpers ───────────────────────────────────────────────

type TripRow = TripDocument & { id: string };
type DepartureRow = TripDepartureDocument & { id: string };

function toTripRow(
  doc: FirebaseFirestore.DocumentSnapshot,
): TripRow {
  return { id: doc.id, ...(doc.data() as TripDocument) };
}

function toDepartureRow(
  doc: FirebaseFirestore.DocumentSnapshot,
): DepartureRow {
  return { id: doc.id, ...(doc.data() as TripDepartureDocument) };
}

// ─── Queries ──────────────────────────────────────────────────────────────

/**
 * Returns all published trips ordered by most recently published first.
 * Pass `limit` to cap the result set (e.g. 3 for the homepage "Trending" section).
 */
export async function getPublishedTrips(limit?: number): Promise<TripRow[]> {
  const db = getAdminDb();
  let query = db
    .collection(COLLECTIONS.trips)
    .where("status", "==", "published")
    .orderBy("publishedAt", "desc") as FirebaseFirestore.Query;

  if (limit) query = query.limit(limit);

  const snapshot = await query.get();
  return snapshot.docs.map(toTripRow);
}

/**
 * Returns a single published trip by its URL slug, or null if not found.
 */
export async function getTripBySlug(slug: string): Promise<TripRow | null> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(COLLECTIONS.trips)
    .where("slug", "==", slug)
    .where("status", "==", "published")
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return toTripRow(snapshot.docs[0]);
}

/**
 * Returns all published departures for a trip, sorted earliest-first.
 */
export async function getTripDepartures(tripId: string): Promise<DepartureRow[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(COLLECTIONS.tripDepartures)
    .where("tripId", "==", tripId)
    .where("status", "==", "published")
    .orderBy("startDate", "asc")
    .get();

  return snapshot.docs.map(toDepartureRow);
}
