import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "node:fs";
import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

let environment: RulesTestEnvironment;

beforeAll(async () => {
  environment = await initializeTestEnvironment({
    projectId: "demo-bleetary",
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: readFileSync("firestore.rules", "utf8"),
    },
  });
});

beforeEach(async () => {
  await environment.clearFirestore();
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all([
      setDoc(doc(db, "trips/published-trip"), {
        status: "published",
        hostUid: "host-1",
      }),
      setDoc(doc(db, "trips/draft-trip"), {
        status: "draft",
        hostUid: "host-1",
      }),
      setDoc(doc(db, "users/traveler-1"), {
        uid: "traveler-1",
        role: "traveler",
      }),
      setDoc(doc(db, "users/traveler-2"), {
        uid: "traveler-2",
        role: "traveler",
      }),
      setDoc(doc(db, "bookings/booking-1"), {
        travelerUid: "traveler-1",
        hostUid: "host-1",
      }),
    ]);
  });
});

afterAll(async () => {
  await environment.cleanup();
});

describe("Firestore rules", () => {
  it("allows public reads only for published marketplace content", async () => {
    const db = environment.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(db, "trips/published-trip")));
    await assertFails(getDoc(doc(db, "trips/draft-trip")));
  });

  it("limits traveler account reads to the signed-in user", async () => {
    const db = environment.authenticatedContext("traveler-1", {
      role: "traveler",
    }).firestore();
    await assertSucceeds(getDoc(doc(db, "users/traveler-1")));
    await assertFails(getDoc(doc(db, "users/traveler-2")));
  });

  it("allows hosts to read only their assigned draft records", async () => {
    const ownDb = environment.authenticatedContext("host-1", {
      role: "host",
    }).firestore();
    const otherDb = environment.authenticatedContext("host-2", {
      role: "host",
    }).firestore();
    await assertSucceeds(getDoc(doc(ownDb, "trips/draft-trip")));
    await assertFails(getDoc(doc(otherDb, "trips/draft-trip")));
  });

  it("allows booking reads by the traveler and assigned host", async () => {
    const travelerDb = environment.authenticatedContext("traveler-1", {
      role: "traveler",
    }).firestore();
    const hostDb = environment.authenticatedContext("host-1", {
      role: "host",
    }).firestore();
    const strangerDb = environment.authenticatedContext("traveler-2", {
      role: "traveler",
    }).firestore();
    await assertSucceeds(getDoc(doc(travelerDb, "bookings/booking-1")));
    await assertSucceeds(getDoc(doc(hostDb, "bookings/booking-1")));
    await assertFails(getDoc(doc(strangerDb, "bookings/booking-1")));
  });

  it("denies browser writes even when the claim says admin", async () => {
    const db = environment.authenticatedContext("admin-1", {
      role: "admin",
    }).firestore();
    await assertFails(
      setDoc(doc(db, "destinations/new-destination"), {
        status: "published",
      }),
    );
  });
});
