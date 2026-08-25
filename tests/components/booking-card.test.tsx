import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BookingCard from "@/components/account/BookingCard";
import type { HydratedBooking } from "@/lib/db/bookings";

describe("BookingCard", () => {
  const mockBookingData: HydratedBooking = {
    booking: {
      id: "bk-123",
      travelerUid: "user-123",
      hostUid: "host-123",
      tripId: "trip-123",
      departureId: "dep-123",
      currency: "USD",
      basePriceCents: 200000,
      earlyBirdDiscountCents: 0,
      roomTypePremiumCents: 0,
      totalAmountCents: 200000,
      depositAmountCents: 60000,
      roomType: "standard",
      guestCount: 1,
      status: "confirmed",
      cancelledAt: null,
      cancellationReason: null,
      refundAmountCents: null,
      specialRequests: "",
      dietaryRequirements: [],
      createdAt: null,
      updatedAt: null,
    },
    trip: {
      id: "trip-123",
      ownerUid: "host-123",
      hostUid: "host-123",
      hostProfileId: "prof-123",
      itineraryId: "itin-123",
      destinationId: "dest-123",
      slug: "bali-yoga-retreat",
      title: "Bali Yoga Retreat",
      tagline: "Unwind in Ubud",
      currency: "USD",
      basePriceCents: 200000,
      earlyBirdPriceCents: null,
      earlyBirdCutoffDate: null,
      maxGroupSize: 12,
      imagePaths: ["/trips/bali.jpg"],
      tags: ["Yoga", "Wellness"],
      badgeLabel: null,
      badgeType: null,
      status: "published",
      publishedAt: null,
      createdAt: null,
      updatedAt: null,
    },
    departure: {
      id: "dep-123",
      ownerUid: "host-123",
      hostUid: "host-123",
      tripId: "trip-123",
      startDate: new Date("2027-09-10"),
      endDate: new Date("2027-09-18"),
      capacity: 12,
      confirmedCount: 3,
      waitlistCount: 0,
      currency: "USD",
      basePriceCents: 200000,
      earlyBirdPriceCents: null,
      earlyBirdCutoffDate: null,
      depositPercent: 30,
      finalBalanceDueDays: 60,
      status: "published",
      publishedAt: null,
      createdAt: null,
      updatedAt: null,
    },
    destination: {
      id: "dest-123",
      slug: "bali",
      name: "Bali",
      region: "Southeast Asia",
      country: "Indonesia",
      countryCode: "ID",
      imagePath: "/dest/bali.jpg",
      heroImagePath: "/dest/bali-hero.jpg",
      description: "Tropical paradise",
      featuredOrder: 1,
      status: "published",
      publishedAt: null,
      createdAt: null,
      updatedAt: null,
    },
    schedule: {
      id: "sched-123",
      bookingId: "bk-123",
      travelerUid: "user-123",
      hostUid: "host-123",
      tripId: "trip-123",
      departureId: "dep-123",
      currency: "USD",
      totalAmountCents: 200000,
      status: "active",
      installments: [
        {
          sequence: 1,
          labelKey: "deposit",
          amountCents: 60000,
          dueDate: new Date("2026-08-25"),
          status: "paid",
          paymentId: "pay-1",
          paidAt: new Date("2026-08-25"),
        },
        {
          sequence: 2,
          labelKey: "final_balance",
          amountCents: 140000,
          dueDate: new Date("2027-07-12"),
          status: "upcoming",
          paymentId: null,
          paidAt: null,
        },
      ],
      createdAt: null,
      updatedAt: null,
    },
  };

  it("renders booking details, confirmed badge, and payment progress", () => {
    render(<BookingCard bookingData={mockBookingData} />);

    expect(screen.getByText("Bali Yoga Retreat")).toBeInTheDocument();
    expect(screen.getByText("Bali, Indonesia")).toBeInTheDocument();
    expect(screen.getByText("confirmed")).toBeInTheDocument();
    expect(screen.getByText("$2,000")).toBeInTheDocument(); // total
    expect(screen.getByText("$600")).toBeInTheDocument(); // deposit
    expect(screen.getByText("$1,400")).toBeInTheDocument(); // remaining
    expect(screen.getByText("30% Paid")).toBeInTheDocument();
  });
});
