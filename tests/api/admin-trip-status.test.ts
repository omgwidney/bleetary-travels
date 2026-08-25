import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { PATCH } from "@/app/api/admin/trips/[tripId]/status/route";

const { mockTripGet, mockTripUpdate, mockLogAudit } = vi.hoisted(() => ({
  mockTripGet: vi.fn(),
  mockTripUpdate: vi.fn(),
  mockLogAudit: vi.fn().mockResolvedValue("audit-123"),
}));

vi.mock("@/lib/auth/request", () => ({
  isSameOrigin: vi.fn(),
  authorizeRequest: vi.fn(),
}));

vi.mock("@/lib/firebase-admin", () => ({
  getAdminDb: vi.fn().mockReturnValue({
    collection: () => ({
      doc: () => ({
        get: mockTripGet,
        update: mockTripUpdate,
      }),
    }),
  }),
}));

vi.mock("@/lib/db/audit", () => ({
  logAuditEvent: mockLogAudit,
}));

import { isSameOrigin, authorizeRequest } from "@/lib/auth/request";

describe("PATCH /api/admin/trips/[tripId]/status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when caller is not an administrator", async () => {
    vi.mocked(isSameOrigin).mockReturnValue(true);
    vi.mocked(authorizeRequest).mockResolvedValue({
      session: null,
      error: "Admin privileges required.",
      status: 403,
    });

    const req = new NextRequest(
      "http://localhost:3000/api/admin/trips/trip-1/status",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      },
    );

    const res = await PATCH(req, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(res.status).toBe(403);
  });

  it("updates trip status and logs audit event on valid admin request", async () => {
    vi.mocked(isSameOrigin).mockReturnValue(true);
    vi.mocked(authorizeRequest).mockResolvedValue({
      session: {
        uid: "admin-1",
        email: "admin@bleetary.com",
        displayName: "Admin",
        emailVerified: true,
        role: "admin",
        claims: {
          aud: "proj",
          auth_time: 123,
          exp: 456,
          firebase: { identities: {}, sign_in_provider: "custom" },
          iat: 123,
          iss: "iss",
          sub: "sub",
          uid: "admin-1",
        },
      },
      error: null,
      status: 200,
    });

    mockTripGet.mockResolvedValue({
      exists: true,
      data: () => ({
        title: "Bali Retreat",
        status: "draft",
      }),
    });

    const req = new NextRequest(
      "http://localhost:3000/api/admin/trips/trip-1/status",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          origin: "http://localhost:3000",
          host: "localhost:3000",
        },
        body: JSON.stringify({
          status: "published",
          reason: "Approved after itinerary review",
        }),
      },
    );

    const res = await PATCH(req, {
      params: Promise.resolve({ tripId: "trip-1" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.status).toBe("published");

    expect(mockTripUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "published" }),
    );
    expect(mockLogAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "trip.status_updated",
        targetId: "trip-1",
      }),
    );
  });
});
