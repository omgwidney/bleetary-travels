import "server-only";

import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function getProjectId(): string {
  return (
    process.env.FIREBASE_ADMIN_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
    ""
  );
}

function isUsingEmulators(): boolean {
  return Boolean(
    process.env.FIREBASE_AUTH_EMULATOR_HOST ||
      process.env.FIRESTORE_EMULATOR_HOST ||
      process.env.FIREBASE_STORAGE_EMULATOR_HOST,
  );
}

function initializeFirebaseAdmin(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId = getProjectId();
  if (!projectId) {
    throw new Error(
      "Missing FIREBASE_ADMIN_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID.",
    );
  }

  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  );

  if (!isUsingEmulators() && Boolean(clientEmail) !== Boolean(privateKey)) {
    throw new Error(
      "FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY must be configured together.",
    );
  }

  const credential =
    clientEmail && privateKey
      ? cert({ projectId, clientEmail, privateKey })
      : isUsingEmulators()
        ? undefined
        : applicationDefault();

  return initializeApp({
    ...(credential ? { credential } : {}),
    projectId,
    storageBucket:
      process.env.FIREBASE_ADMIN_STORAGE_BUCKET ??
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export function getAdminAuth() {
  return getAuth(initializeFirebaseAdmin());
}

export function getAdminDb() {
  return getFirestore(initializeFirebaseAdmin());
}

export function getAdminBucket() {
  return getStorage(initializeFirebaseAdmin()).bucket();
}
