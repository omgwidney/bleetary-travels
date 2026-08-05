/**
 * lib/db/hosts.ts
 *
 * Server-side Admin SDK helpers for the `hostProfiles` collection.
 * Import only from React Server Components or API routes — never from client code.
 */
import "server-only";

import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/data-model";
import type { HostProfileDocument } from "@/lib/db/schema";

// ─── Typed document helpers ───────────────────────────────────────────────

type HostProfileRow = HostProfileDocument & { id: string };

function toHostProfileRow(
  doc: FirebaseFirestore.DocumentSnapshot,
): HostProfileRow {
  return { id: doc.id, ...(doc.data() as HostProfileDocument) };
}

// ─── Queries ──────────────────────────────────────────────────────────────

/**
 * Returns a host profile by UID (document ID = host's Firebase Auth UID).
 * Returns null if the profile doesn't exist or is not published.
 * Server components that display host cards on public pages should use this.
 */
export async function getHostProfile(
  hostUid: string,
): Promise<HostProfileRow | null> {
  const db = getAdminDb();
  const doc = await db.collection(COLLECTIONS.hostProfiles).doc(hostUid).get();

  if (!doc.exists) return null;

  // Allow admins to see draft profiles via a separate admin helper.
  // Public pages only receive published profiles.
  const data = doc.data() as HostProfileDocument;
  if (data.status !== "published") return null;

  return toHostProfileRow(doc);
}
