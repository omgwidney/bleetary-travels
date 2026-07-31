import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { isSameOrigin } from "@/lib/auth/request";

describe("isSameOrigin", () => {
  it("returns false if origin header is missing", () => {
    const req = new NextRequest("http://localhost:3000/api/auth/session", {
      method: "POST",
    });
    expect(isSameOrigin(req)).toBe(false);
  });

  it("returns true when origin match request host and protocol", () => {
    const req = new NextRequest("http://localhost:3000/api/auth/session", {
      method: "POST",
      headers: {
        origin: "http://localhost:3000",
        host: "localhost:3000",
      },
    });
    expect(isSameOrigin(req)).toBe(true);
  });

  it("returns false when origin host differs from expected host", () => {
    const req = new NextRequest("http://localhost:3000/api/auth/session", {
      method: "POST",
      headers: {
        origin: "http://evil.com",
        host: "localhost:3000",
      },
    });
    expect(isSameOrigin(req)).toBe(false);
  });

  it("respects x-forwarded-host and x-forwarded-proto headers", () => {
    const req = new NextRequest("http://127.0.0.1:3000/api/auth/session", {
      method: "POST",
      headers: {
        origin: "https://bleetarytravels.com",
        "x-forwarded-host": "bleetarytravels.com",
        "x-forwarded-proto": "https",
      },
    });
    expect(isSameOrigin(req)).toBe(true);
  });
});
