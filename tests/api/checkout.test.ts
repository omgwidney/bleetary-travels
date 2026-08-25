import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/checkout/route";

const { mockCreateSession, mockGetDeparture, mockGetTrip } = vi.hoisted(() => ({
  mockCreateSession: vi.fn(),
  mockGetDeparture: vi.fn(),
  mockGetTrip: vi.fn(),
}));

vi.mock("@/lib/auth/request", () => ({
  isSameOrigin: vi.fn(),
  authorizeRequest: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  getStripe: vi.fn().mockReturnValue({
    checkout: {
      sessions: {
        create: mockCreateSession,
      },
    },
  }),
}));

vi.mock("@/lib/firebase-admin", () => ({
  getAdminDb: vi.fn().mockReturnValue({
    collection: (col: string) => ({
      doc: (id: string) => ({
        get: () => {
          if (col === "tripDepartures") return mockGetDeparture(id);
          if (col === "trips") return mockGetTrip(id);
          return Promise.resolve({ exists: false });
        },
      }),
    }),
  }),
}));

import { isSameOrigin, authorizeRequest } from "@/lib/auth/request";

describe("POST /api/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when origin header is invalid", async () => {
    vi.mocked(isSameOrigin).mockReturnValue(false);

    const req = new NextRequest("http://localhost:3000/api/checkout", {
      method: "POST",
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(isSameOrigin).mockReturnValue(true);
    vi.mocked(authorizeRequest).mockResolvedValue({
      session: null,
      error: "Authentication required.",
      status: 401,
    });

    const req = new NextRequest("http://localhost:3000/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        departureId: "dep-1",
        tripId: "trip-1",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 409 when departure is sold out", async () => {
    vi.mocked(isSameOrigin).mockReturnValue(true);
    vi.mocked(authorizeRequest).mockResolvedValue({
      session: {
        uid: "user-123",
        email: "traveler@example.com",
        displayName: "Traveler",
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
          uid: "user-123",
        },
      },
      error: null,
      status: 200,
    });

    mockGetDeparture.mockResolvedValue({
      exists: true,
      data: () => ({
        status: "published",
        capacity: 10,
        confirmedCount: 10, // sold out
        basePriceCents: 200000,
        depositPercent: 30,
        currency: "USD",
      }),
    });

    mockGetTrip.mockResolvedValue({
      exists: true,
      data: () => ({
        status: "published",
        title: "Bali Retreat",
        slug: "bali-retreat",
        hostUid: "host-1",
      }),
    });

    const req = new NextRequest("http://localhost:3000/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: "http://localhost:3000",
        host: "localhost:3000",
      },
      body: JSON.stringify({
        departureId: "dep-1",
        tripId: "trip-1",
        guestCount: 1,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toContain("sold out");
  });

  it("creates Stripe checkout session and returns url on valid request", async () => {
    vi.mocked(isSameOrigin).mockReturnValue(true);
    vi.mocked(authorizeRequest).mockResolvedValue({
      session: {
        uid: "user-123",
        email: "traveler@example.com",
        displayName: "Traveler",
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
          uid: "user-123",
        },
      },
      error: null,
      status: 200,
    });

    mockGetDeparture.mockResolvedValue({
      exists: true,
      data: () => ({
        status: "published",
        capacity: 10,
        confirmedCount: 2,
        basePriceCents: 200000,
        depositPercent: 30,
        currency: "USD",
        finalBalanceDueDays: 60,
      }),
    });

    mockGetTrip.mockResolvedValue({
      exists: true,
      data: () => ({
        id: "trip-1",
        status: "published",
        title: "Bali Retreat",
        slug: "bali-retreat",
        hostUid: "host-1",
      }),
    });

    mockCreateSession.mockResolvedValue({
      id: "cs_test_123",
      url: "https://checkout.stripe.com/pay/cs_test_123",
    });

    const req = new NextRequest("http://localhost:3000/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: "http://localhost:3000",
        host: "localhost:3000",
      },
      body: JSON.stringify({
        departureId: "dep-1",
        tripId: "trip-1",
        guestCount: 1,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sessionId).toBe("cs_test_123");
    expect(body.url).toBe("https://checkout.stripe.com/pay/cs_test_123");
    expect(mockCreateSession).toHaveBeenCalled();
  });
});
