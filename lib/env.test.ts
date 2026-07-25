import { describe, expect, it } from "vitest";
import { validateFirebaseClientConfig } from "@/lib/env";

const validConfig = {
  apiKey: "test-api-key",
  authDomain: "test.firebaseapp.com",
  projectId: "test-project",
  storageBucket: "test.firebasestorage.app",
  messagingSenderId: "123",
  appId: "app-id",
};

describe("validateFirebaseClientConfig", () => {
  it("returns a complete Firebase client configuration", () => {
    expect(validateFirebaseClientConfig(validConfig)).toEqual(validConfig);
  });

  it("reports every missing required field", () => {
    expect(() =>
      validateFirebaseClientConfig({ ...validConfig, projectId: "" }),
    ).toThrow("projectId");
  });
});
