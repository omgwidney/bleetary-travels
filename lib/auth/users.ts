import "server-only";

import type { DecodedIdToken, UserRecord } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/data-model";
import { isUserRole, type UserRole } from "@/lib/auth/roles";

function displayNameFor(user: UserRecord, fallback?: string): string {
  return (
    fallback?.trim() ||
    user.displayName?.trim() ||
    user.email?.split("@")[0] ||
    "Traveler"
  );
}

export async function ensureUserDocument(
  decoded: DecodedIdToken,
  requestedDisplayName?: string,
  recordLogin = false,
): Promise<UserRole> {
  const auth = getAdminAuth();
  const db = getAdminDb();
  let user = await auth.getUser(decoded.uid);
  const existingRole = user.customClaims?.role;
  const role: UserRole = isUserRole(existingRole) ? existingRole : "traveler";
  const displayName = displayNameFor(user, requestedDisplayName);

  if (!isUserRole(existingRole)) {
    await auth.setCustomUserClaims(user.uid, {
      ...user.customClaims,
      role,
    });
  }

  if (requestedDisplayName && requestedDisplayName !== user.displayName) {
    user = await auth.updateUser(user.uid, { displayName });
  }

  const userRef = db.collection(COLLECTIONS.users).doc(user.uid);
  const existing = await userRef.get();
  await userRef.set(
    {
      uid: user.uid,
      email: user.email ?? decoded.email ?? "",
      displayName,
      role,
      status: user.disabled ? "disabled" : "active",
      emailVerified: user.emailVerified,
      photoPath: existing.data()?.photoPath ?? null,
      createdAt:
        existing.data()?.createdAt ?? FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      ...(recordLogin ? { lastLoginAt: FieldValue.serverTimestamp() } : {}),
    },
    { merge: true },
  );

  return role;
}

export async function setUserRole(
  actorUid: string,
  targetUid: string,
  role: UserRole,
  reason: string,
): Promise<void> {
  const auth = getAdminAuth();
  const db = getAdminDb();
  const target = await auth.getUser(targetUid);
  const userRef = db.collection(COLLECTIONS.users).doc(targetUid);
  const existing = await userRef.get();

  await auth.setCustomUserClaims(targetUid, {
    ...target.customClaims,
    role,
  });
  await userRef.set(
    {
      uid: target.uid,
      email: target.email ?? "",
      displayName:
        target.displayName ?? target.email?.split("@")[0] ?? "Traveler",
      role,
      status: target.disabled ? "disabled" : "active",
      emailVerified: target.emailVerified,
      photoPath: existing.data()?.photoPath ?? null,
      createdAt:
        existing.data()?.createdAt ?? FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  await db.collection(COLLECTIONS.auditEvents).add({
    actorUid,
    action: "user.role_changed",
    targetType: "user",
    targetId: targetUid,
    reason,
    metadata: { role },
    createdAt: FieldValue.serverTimestamp(),
  });

  await auth.revokeRefreshTokens(targetUid);
}
