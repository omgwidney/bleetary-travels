import { applicationDefault, cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
const projectId =
  process.env.FIREBASE_ADMIN_PROJECT_ID ??
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
const usingEmulator = Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST);

if (!email || !projectId) {
  throw new Error(
    "Set BOOTSTRAP_ADMIN_EMAIL and FIREBASE_ADMIN_PROJECT_ID before running this command.",
  );
}

if (!usingEmulator && (!clientEmail || !privateKey)) {
  throw new Error(
    "Production bootstrap requires FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY.",
  );
}

const credential =
  clientEmail && privateKey
    ? cert({ projectId, clientEmail, privateKey })
    : usingEmulator
      ? undefined
      : applicationDefault();

const app = initializeApp({
  ...(credential ? { credential } : {}),
  projectId,
});
const auth = getAuth(app);
const db = getFirestore(app);
const user = await auth.getUserByEmail(email);
const userRef = db.collection("users").doc(user.uid);
const existing = await userRef.get();

await auth.setCustomUserClaims(user.uid, {
  ...user.customClaims,
  role: "admin",
});

const batch = db.batch();
batch.set(
  userRef,
  {
    uid: user.uid,
    email: user.email ?? email,
    displayName: user.displayName ?? email.split("@")[0],
    emailVerified: user.emailVerified,
    role: "admin",
    status: user.disabled ? "disabled" : "active",
    photoPath: existing.data()?.photoPath ?? null,
    createdAt: existing.data()?.createdAt ?? FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  { merge: true },
);
batch.set(db.collection("auditEvents").doc(), {
  actorUid: "system:bootstrap-admin",
  action: "user.admin_bootstrapped",
  targetType: "user",
  targetId: user.uid,
  reason: "Initial administrator bootstrap",
  metadata: { email },
  createdAt: FieldValue.serverTimestamp(),
});
await batch.commit();
await auth.revokeRefreshTokens(user.uid);

console.log(`Admin role granted to ${email}. Existing sessions were revoked.`);
