import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/admin/hosts/review/route";

const {
  mockGetUser,
  mockSetCustomUserClaims,
  mockRevokeRefreshTokens,
  mockDocGet,
  mockDocUpdate,
  mockDocSet,
  mockLogAudit,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockSetCustomUserClaims: vi.fn(),
  mockRevokeRefreshTokens: vi.fn(),
  mockDocGet: vi.fn(),
  mockDocUpdate: vi.fn(),
  mockDocSet: vi.fn(),
  mockLogAudit: vi.fn().mockResolvedValue("audit-123"),
}));

vi.mock("@/lib/auth/request", () => ({
  isSameOrigin: vi.fn(),
  authorizeRequest: vi.fn(),
}));

vi.mock("@/lib/firebase-admin", () => ({
  getAdminAuth: vi.fn().mockReturnValue({
    getUser: mockGetUser,
    setCustomUserClaims: mockSetCustomUserClaims,
    revokeRefreshTokens: mockRevokeRefreshTokens,
  }),
  getAdminDb: vi.fn().mockReturnValue({
    collection: (col: string) => ({
      doc: (id: string) => ({
        get: () => mockDocGet(col, id),
        update: (data: unknown) => mockDocUpdate(col, id, data),
        set: (data: unknown, options?: unknown) =>
          mockDocSet(col, id, data, options),
      }),
    }),
  }),
}));

vi.mock("@/lib/db/audit", () => ({
  logAuditEvent: mockLogAudit,
}));

import { isSameOrigin, authorizeRequest } from "@/lib/auth/request";

describe("POST /api/admin/hosts/review", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when request origin is invalid", async () => {
    vi.mocked(isSameOrigin).mockReturnValue(false);

    const req = new NextRequest("http://localhost:3000/api/admin/hosts/review", {
      method: "POST",
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("returns 403 when user is not an admin", async () => {
    vi.mocked(isSameOrigin).mockReturnValue(true);
    vi.mocked(authorizeRequest).mockResolvedValue({
      session: null,
      error: "Admin privileges required.",
      status: 403,
    });

    const req = new NextRequest("http://localhost:3000/api/admin/hosts/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId: "user-123",
        decision: "approved",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("approves application, promotes user role, provisions profile, and logs audit", async () => {
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

    mockDocGet.mockImplementation((col: string) => {
      if (col === "hostApplications") {
        return Promise.resolve({
          exists: true,
          data: () => ({
            communityName: "Nomad Photographers",
            communityType: "photography",
            bio: "Travel photo community",
            instagramHandle: "@nomadphoto",
            status: "submitted",
          }),
        });
      }
      if (col === "hostProfiles") {
        return Promise.resolve({ exists: false });
      }
      return Promise.resolve({ exists: true, data: () => ({}) });
    });

    mockGetUser.mockResolvedValue({
      uid: "user-123",
      customClaims: { role: "traveler" },
    });

    const req = new NextRequest("http://localhost:3000/api/admin/hosts/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: "http://localhost:3000",
        host: "localhost:3000",
      },
      body: JSON.stringify({
        applicationId: "user-123",
        decision: "approved",
        reviewNotes: "Strong community following and verified Instagram.",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    expect(mockDocUpdate).toHaveBeenCalledWith(
      "hostApplications",
      "user-123",
      expect.objectContaining({ status: "approved" }),
    );
    expect(mockSetCustomUserClaims).toHaveBeenCalledWith("user-123", {
      role: "host",
    });
    expect(mockDocSet).toHaveBeenCalledWith(
      "hostProfiles",
      "user-123",
      expect.objectContaining({
        displayName: "Nomad Photographers",
        status: "published",
      }),
      undefined,
    );
    expect(mockLogAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "host.application_approved",
      }),
    );
  });
});
