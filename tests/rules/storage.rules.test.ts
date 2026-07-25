import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "node:fs";
import { ref, uploadBytes } from "firebase/storage";
import { afterAll, beforeAll, describe, it } from "vitest";

let environment: RulesTestEnvironment;

beforeAll(async () => {
  environment = await initializeTestEnvironment({
    projectId: "demo-bleetary",
    storage: {
      host: "127.0.0.1",
      port: 9199,
      rules: readFileSync("storage.rules", "utf8"),
    },
  });
});

afterAll(async () => {
  await environment.cleanup();
});

describe("Storage rules", () => {
  it("lets a user upload a supported image to their profile path", async () => {
    const storage = environment
      .authenticatedContext("traveler-1", { role: "traveler" })
      .storage();
    await assertSucceeds(
      uploadBytes(
        ref(storage, "users/traveler-1/profile/avatar.png"),
        new Uint8Array([1, 2, 3]),
        { contentType: "image/png" },
      ),
    );
  });

  it("blocks uploads to another user's profile path", async () => {
    const storage = environment
      .authenticatedContext("traveler-2", { role: "traveler" })
      .storage();
    await assertFails(
      uploadBytes(
        ref(storage, "users/traveler-1/profile/avatar.png"),
        new Uint8Array([1, 2, 3]),
        { contentType: "image/png" },
      ),
    );
  });

  it("blocks direct writes to published content, including for admins", async () => {
    const storage = environment
      .authenticatedContext("admin-1", { role: "admin" })
      .storage();
    await assertFails(
      uploadBytes(
        ref(storage, "published/destination/bali.png"),
        new Uint8Array([1, 2, 3]),
        { contentType: "image/png" },
      ),
    );
  });
});
