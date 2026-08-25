import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  sendEmail,
  sendBookingConfirmationEmail,
  sendHostApplicationDecisionEmail,
  sendNewBookingHostAlertEmail,
} from "@/lib/email";

describe("lib/email", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("handles fallback logging gracefully when RESEND_API_KEY is not set", async () => {
    delete process.env.RESEND_API_KEY;

    const result = await sendEmail({
      to: "traveler@example.com",
      subject: "Test Subject",
      html: "<p>Test Content</p>",
      text: "Test Content",
    });

    expect(result.success).toBe(true);
    expect(result.mocked).toBe(true);
  });

  it("generates and dispatches booking confirmation email payload", async () => {
    delete process.env.RESEND_API_KEY;

    const result = await sendBookingConfirmationEmail({
      travelerEmail: "traveler@example.com",
      travelerName: "Alice Traveler",
      tripTitle: "Bali Yoga Retreat",
      departureDates: "Sep 10 – Sep 18, 2027",
      depositAmountCents: 60000,
      totalAmountCents: 200000,
      bookingId: "bk-12345678",
    });

    expect(result.success).toBe(true);
  });

  it("generates and dispatches host approval email", async () => {
    delete process.env.RESEND_API_KEY;

    const result = await sendHostApplicationDecisionEmail({
      applicantEmail: "host@example.com",
      applicantName: "Sam Leader",
      decision: "approved",
      reviewNotes: "Welcome to the network!",
    });

    expect(result.success).toBe(true);
  });

  it("generates and dispatches host rejection/waitlist email", async () => {
    delete process.env.RESEND_API_KEY;

    const result = await sendHostApplicationDecisionEmail({
      applicantEmail: "applicant@example.com",
      applicantName: "Bob Applicant",
      decision: "waitlisted",
      reviewNotes: "We are currently at capacity for this region.",
    });

    expect(result.success).toBe(true);
  });

  it("generates and dispatches host new booking alert", async () => {
    delete process.env.RESEND_API_KEY;

    const result = await sendNewBookingHostAlertEmail({
      hostEmail: "host@example.com",
      hostName: "Sam Leader",
      tripTitle: "Kyoto Photography Tour",
      departureDates: "Oct 5 – Oct 14, 2027",
      travelerName: "Alice Traveler",
      guestCount: 2,
    });

    expect(result.success).toBe(true);
  });
});
