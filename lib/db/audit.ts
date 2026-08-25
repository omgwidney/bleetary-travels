import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/data-model";

export interface LogAuditParams {
  actorUid: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
  reason?: string;
}

/**
 * Appends an immutable record to the `auditEvents` collection using the Admin SDK.
 */
export async function logAuditEvent({
  actorUid,
  action,
  targetType,
  targetId,
  metadata = {},
  reason = "",
}: LogAuditParams): Promise<string> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTIONS.auditEvents).doc();

  await ref.set({
    actorUid,
    action,
    targetType,
    targetId,
    metadata,
    reason,
    createdAt: FieldValue.serverTimestamp(),
  });

  return ref.id;
}
