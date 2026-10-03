import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/components/auth/auth-ui";

describe("safeNextPath", () => {
  it("keeps same-site paths", () => {
    expect(safeNextPath("/admin")).toBe("/admin");
    expect(safeNextPath("/trips/victoria-falls?ref=home")).toBe("/trips/victoria-falls?ref=home");
  });

  it("rejects external and protocol-relative targets", () => {
    expect(safeNextPath("https://evil.example")).toBeNull();
    expect(safeNextPath("//evil.example")).toBeNull();
    expect(safeNextPath(undefined)).toBeNull();
  });

  it("never sends a signed-in user back to the login page", () => {
    expect(safeNextPath("/login?next=/admin")).toBeNull();
    expect(safeNextPath("/login")).toBeNull();
  });
});
