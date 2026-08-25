import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/host/apply/route";

vi.mock("@/lib/auth/request", () => ({
  isSameOrigin: vi.fn(),
  authorizeRequest: vi.fn(),
}));

vi.mock("@/lib/firebase-admin", () => {
  const setMock = vi.fn().mockResolvedValue(undefined);
  const getMock = vi.fn().mockResolvedValue({ exists: false });
  const docMock = vi.fn().mockReturnValue({ get: getMock, set: setMock });
  const collectionMock = vi.fn().mockReturnValue({ doc: docMock });

  return {
    getAdminDb: vi.fn().mockReturnValue({
      collection: collectionMock,
    }),
  };
});

vi.mock("@/lib/db/audit", () => ({
  logAuditEvent: vi.fn().mockResolvedValue("audit-123"),
}));

import { isSameOrigin, authorizeRequest } from "@/lib/auth/request";

describe("POST /api/host/apply", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 if origin is invalid", async () => {
    vi.mocked(isSameOrigin).mockReturnValue(false);

    const req = new NextRequest("http://localhost:3000/api/host/apply", {
      method: "POST",
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe("Invalid request origin.");
  });

  it("returns 401 if unauthenticated", async () => {
    vi.mocked(isSameOrigin).mockReturnValue(true);
    vi.mocked(authorizeRequest).mockResolvedValue({
      session: null,
      error: "Authentication required.",
      status: 401,
    });

    const req = new NextRequest("http://localhost:3000/api/host/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 if payload fails validation", async () => {
    vi.mocked(isSameOrigin).mockReturnValue(true);
    vi.mocked(authorizeRequest).mockResolvedValue({
      session: {
        uid: "test-user",
        email: "test@example.com",
        displayName: "Test User",
        emailVerified: true,
        role: "traveler",
        claims: {
          aud: "proj",
          auth_time: 123,
          exp: 456,
          firebase: { identities: {}, sign_in_provider: "custom" },
          iat: 123,
          iss: "iss",
          sub: "sub",
          uid: "test-user",
        },
      },
      error: null,
      status: 200,
    });

    const req = new NextRequest("http://localhost:3000/api/host/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: "http://localhost:3000",
        host: "localhost:3000",
      },
      body: JSON.stringify({
        communityName: "X", // too short
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("successfully creates application and returns 200 for valid submission", async () => {
    vi.mocked(isSameOrigin).mockReturnValue(true);
    vi.mocked(authorizeRequest).mockResolvedValue({
      session: {
        uid: "test-user",
        email: "test@example.com",
        displayName: "Test User",
        emailVerified: true,
        role: "traveler",
        claims: {
          aud: "proj",
          auth_time: 123,
          exp: 456,
          firebase: { identities: {}, sign_in_provider: "custom" },
          iat: 123,
          iss: "iss",
          sub: "sub",
          uid: "test-user",
        },
      },
      error: null,
      status: 200,
    });

    const validPayload = {
      communityName: "Nomad Leaders",
      communityType: "social",
      audienceSize: 10000,
      communityUrl: "https://nomadleaders.com",
      instagramHandle: "nomadleaders",
      tiktokHandle: "nomadtok",
      bio: "We are an experienced team of travel lovers creating high quality retreats.",
      proposedDestinations: ["Bali, Indonesia"],
      hasHostedBefore: false,
    };

    const req = new NextRequest("http://localhost:3000/api/host/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: "http://localhost:3000",
        host: "localhost:3000",
      },
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.id).toBe("test-user");
    expect(body.status).toBe("submitted");
  });
});
