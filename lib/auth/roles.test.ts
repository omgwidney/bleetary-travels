import { describe, expect, it } from "vitest";
import { isUserRole, roleHome } from "@/lib/auth/roles";

describe("roles", () => {
  it("accepts only supported custom-claim roles", () => {
    expect(isUserRole("traveler")).toBe(true);
    expect(isUserRole("host")).toBe(true);
    expect(isUserRole("admin")).toBe(true);
    expect(isUserRole("owner")).toBe(false);
    expect(isUserRole(undefined)).toBe(false);
  });

  it("routes each role to its protected workspace", () => {
    expect(roleHome("traveler")).toBe("/account");
    expect(roleHome("host")).toBe("/host/dashboard");
    expect(roleHome("admin")).toBe("/admin");
  });
});
