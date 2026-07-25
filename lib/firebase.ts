import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseClientConfig } from "@/lib/env";

const firebaseConfig = getFirebaseClientConfig();

// Prevent re-initializing on hot reloads in dev
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

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
