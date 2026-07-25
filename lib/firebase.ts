import { initializeApp, getApps, getApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import { getFirebaseClientConfig } from "@/lib/env";

const firebaseConfig = getFirebaseClientConfig();

// Prevent re-initializing on hot reloads in dev
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

const emulatorState = globalThis as typeof globalThis & {
  __bleetaryFirebaseEmulatorsConnected?: boolean;
};

if (
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true" &&
  !emulatorState.__bleetaryFirebaseEmulatorsConnected
) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", {
    disableWarnings: true,
  });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
  emulatorState.__bleetaryFirebaseEmulatorsConnected = true;
}

export interface HostLeadInput {
  name: string;
  email: string;
  hasCommunity: "yes" | "no" | null;
  communityStage: string | null;
  source: "host_quiz";
}

export async function saveHostLead(data: HostLeadInput): Promise<void> {
  await addDoc(collection(db, "host_leads"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}
