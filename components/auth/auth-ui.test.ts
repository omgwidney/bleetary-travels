import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/components/auth/auth-ui";

describe("safeNextPath", () => {
  it("accepts local application paths", () => {
    expect(safeNextPath("/account")).toBe("/account");
    expect(safeNextPath("/trips?destination=bali")).toBe(
      "/trips?destination=bali",
    );
  });

  it("rejects external and protocol-relative redirects", () => {
    expect(safeNextPath("https://example.com")).toBeNull();
    expect(safeNextPath("//example.com")).toBeNull();
    expect(safeNextPath("/\\example.com")).toBeNull();
    expect(safeNextPath(undefined)).toBeNull();
  });
});
