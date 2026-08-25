import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/webhooks/stripe/route";

const {
  mockConstructEvent,
  mockTransactionGet,
  mockTransactionSet,
  mockTransactionUpdate,
  mockRunTransaction,
  mockPaymentQueryGet,
} = vi.hoisted(() => {
  const transactionGet = vi.fn();
  const transactionSet = vi.fn();
  const transactionUpdate = vi.fn();
  const runTransaction = vi.fn().mockImplementation(async (callback) => {
    return callback({
      get: transactionGet,
      set: transactionSet,
      update: transactionUpdate,
    });
  });

  return {
    mockConstructEvent: vi.fn(),
    mockTransactionGet: transactionGet,
    mockTransactionSet: transactionSet,
    mockTransactionUpdate: transactionUpdate,
    mockRunTransaction: runTransaction,
    mockPaymentQueryGet: vi.fn(),
  };
});

vi.mock("@/lib/stripe", () => ({
  getStripe: vi.fn().mockReturnValue({
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  }),
}));

vi.mock("@/lib/firebase-admin", () => ({
  getAdminDb: vi.fn().mockReturnValue({
    runTransaction: mockRunTransaction,
    collection: (col: string) => {
      if (col === "payments") {
        return {
          where: () => ({
            limit: () => ({
              get: mockPaymentQueryGet,
            }),
          }),
          doc: () => ({ id: "payment-doc-id" }),
        };
      }
      return {
        doc: (id?: string) => ({
          id: id || `${col}-doc-id`,
        }),
      };
    },
  }),
}));

vi.mock("@/lib/db/audit", () => ({
  logAuditEvent: vi.fn().mockResolvedValue("audit-123"),
}));

import { logAuditEvent } from "@/lib/db/audit";

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 if stripe-signature header is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: "raw-body",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Missing stripe-signature");
  });

  it("returns 400 if signature verification fails", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Signature verification failed");
    });

    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "stripe-signature": "sig_123",
      },
      body: "raw-body",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Signature verification failed");
  });

  it("processes checkout.session.completed atomically in transaction", async () => {
    const sessionEvent = {
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_123",
          payment_intent: "pi_123",
          metadata: {
            travelerUid: "user-123",
            hostUid: "host-123",
            tripId: "trip-123",
            departureId: "dep-123",
            currency: "USD",
            basePriceCents: "200000",
            totalAmountCents: "200000",
            depositAmountCents: "60000",
            guestCount: "1",
            roomType: "standard",
            tripTitle: "Bali Retreat",
            finalBalanceDueDays: "60",
          },
        },
      },
    };

    mockConstructEvent.mockReturnValue(sessionEvent);
    mockPaymentQueryGet.mockResolvedValue({ empty: true });

    mockTransactionGet.mockResolvedValue({
      exists: true,
      data: () => ({
        capacity: 10,
        confirmedCount: 2,
        startDate: new Date("2027-09-01"),
      }),
    });

    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "stripe-signature": "sig_valid",
      },
      body: JSON.stringify(sessionEvent),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.received).toBe(true);

    expect(mockRunTransaction).toHaveBeenCalled();
    expect(mockTransactionUpdate).toHaveBeenCalled();
    expect(mockTransactionSet).toHaveBeenCalledTimes(3); // booking, schedule, payment
    expect(logAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "booking.confirmed",
        targetType: "bookings",
      }),
    );
  });
});
