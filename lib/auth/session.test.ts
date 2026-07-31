import { describe, expect, it, vi } from "vitest";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
  sessionCookieOptions,
  verifySessionCookieValue,
} from "@/lib/auth/session";
import { getAdminAuth } from "@/lib/firebase-admin";

vi.mock("@/lib/firebase-admin", () => ({
  getAdminAuth: vi.fn(),
}));

describe("session helpers", () => {
  it("defines 5-day session cookie options", () => {
    expect(SESSION_COOKIE_NAME).toBe("__session");
    expect(SESSION_MAX_AGE_MS).toBe(5 * 24 * 60 * 60 * 1000);

    const options = sessionCookieOptions();
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
    expect(options.maxAge).toBe(5 * 24 * 60 * 60);
  });

  it("returns null when session cookie is undefined or empty", async () => {
    expect(await verifySessionCookieValue(undefined)).toBeNull();
    expect(await verifySessionCookieValue("")).toBeNull();
  });

  it("returns null if user email is unverified", async () => {
    const mockAuth = {
      verifySessionCookie: vi.fn().mockResolvedValue({ uid: "user123" }),
      getUser: vi.fn().mockResolvedValue({
        uid: "user123",
        email: "test@example.com",
        emailVerified: false,
        customClaims: { role: "traveler" },
      }),
    };
    vi.mocked(getAdminAuth).mockReturnValue(mockAuth as unknown as ReturnType<typeof getAdminAuth>);

    const result = await verifySessionCookieValue("valid-cookie");
    expect(result).toBeNull();
  });

  it("returns session payload when user is verified with valid role", async () => {
    const mockAuth = {
      verifySessionCookie: vi.fn().mockResolvedValue({ uid: "user123" }),
      getUser: vi.fn().mockResolvedValue({
        uid: "user123",
        email: "traveler@example.com",
        displayName: "Alex Traveler",
        emailVerified: true,
        customClaims: { role: "traveler" },
      }),
    };
    vi.mocked(getAdminAuth).mockReturnValue(mockAuth as unknown as ReturnType<typeof getAdminAuth>);

    const result = await verifySessionCookieValue("valid-cookie");
    expect(result).toEqual({
      uid: "user123",
      email: "traveler@example.com",
      displayName: "Alex Traveler",
      emailVerified: true,
      role: "traveler",
      claims: { uid: "user123" },
    });
  });

  it("returns null if user custom claim role is invalid", async () => {
    const mockAuth = {
      verifySessionCookie: vi.fn().mockResolvedValue({ uid: "user123" }),
      getUser: vi.fn().mockResolvedValue({
        uid: "user123",
        email: "test@example.com",
        emailVerified: true,
        customClaims: { role: "superadmin" },
      }),
    };
    vi.mocked(getAdminAuth).mockReturnValue(mockAuth as unknown as ReturnType<typeof getAdminAuth>);

    const result = await verifySessionCookieValue("valid-cookie");
    expect(result).toBeNull();
  });
});
