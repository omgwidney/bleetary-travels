/**
 * lib/db/hosts.ts
 *
 * Server-side Admin SDK helpers for `hostProfiles` and `hostApplications`.
 * Import only from React Server Components or API routes — never from client code.
 */
import "server-only";

import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/data-model";
import type { HostProfileDocument, HostApplicationDocument } from "@/lib/db/schema";

// ─── Typed document helpers ───────────────────────────────────────────────

export type HostProfileRow = HostProfileDocument & { id: string };
export type HostApplicationRow = HostApplicationDocument & { id: string };

function toHostProfileRow(
  doc: FirebaseFirestore.DocumentSnapshot,
): HostProfileRow {
  return { id: doc.id, ...(doc.data() as HostProfileDocument) };
}

function toHostApplicationRow(
  doc: FirebaseFirestore.DocumentSnapshot,
): HostApplicationRow {
  return { id: doc.id, ...(doc.data() as HostApplicationDocument) };
}

// ─── Queries ──────────────────────────────────────────────────────────────

/**
 * Returns a host profile by UID (document ID = host's Firebase Auth UID).
 * Returns null if the profile doesn't exist or is not published.
 * Public pages should use this.
 */
export async function getHostProfile(
  hostUid: string,
): Promise<HostProfileRow | null> {
  const db = getAdminDb();
  const doc = await db.collection(COLLECTIONS.hostProfiles).doc(hostUid).get();

  if (!doc.exists) return null;

  const data = doc.data() as HostProfileDocument;
  if (data.status !== "published") return null;

  return toHostProfileRow(doc);
}

/**
 * Returns any host profile for the UID (including draft/archived).
 * Host dashboard or admin panels use this.
 */
export async function getHostProfileRaw(
  hostUid: string,
): Promise<HostProfileRow | null> {
  const db = getAdminDb();
  const doc = await db.collection(COLLECTIONS.hostProfiles).doc(hostUid).get();
  if (!doc.exists) return null;
  return toHostProfileRow(doc);
}

/**
 * Returns the host application document for a given UID, or null if none exists.
 */
export async function getHostApplication(
  uid: string,
): Promise<HostApplicationRow | null> {
  const db = getAdminDb();
  const doc = await db.collection(COLLECTIONS.hostApplications).doc(uid).get();
  if (!doc.exists) return null;
  return toHostApplicationRow(doc);
}

export interface UserHostState {
  hasApplication: boolean;
  application: HostApplicationRow | null;
  isHostVerified: boolean;
  profile: HostProfileRow | null;
}

/**
 * Convenience helper to determine a user's full host status:
 * Checks both application state and host profile.
 */
export async function getUserHostState(uid: string): Promise<UserHostState> {
  const [appRow, profileRow] = await Promise.all([
    getHostApplication(uid),
    getHostProfileRaw(uid),
  ]);

  return {
    hasApplication: appRow !== null,
    application: appRow,
    isHostVerified: profileRow !== null || appRow?.status === "approved",
    profile: profileRow,
  };
}
