import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminPortal from "@/components/admin/AdminPortal";
import type {
  AdminOverviewMetrics,
  AdminHostApplicationRow,
  AdminTripRow,
  AdminAuditEventRow,
} from "@/lib/db/admin";

vi.mock("@/lib/firebase", () => ({
  auth: { currentUser: null },
}));

describe("AdminPortal", () => {
  const mockMetrics: AdminOverviewMetrics = {
    totalBookings: 15,
    totalRevenueCents: 900000,
    pendingApplicationsCount: 3,
    activeHostsCount: 8,
    publishedTripsCount: 6,
  };

  const mockApplications: AdminHostApplicationRow[] = [
    {
      id: "app-1",
      ownerUid: "host-1",
      communityName: "Creative Nomad Writers",
      communityType: "writers",
      bio: "Writing retreats across Europe",
      audienceSize: 12000,
      instagramHandle: "@nomadwriters",
      tiktokHandle: null,
      communityUrl: "https://writers.example.com",
      proposedDestinations: ["Tuscany", "Kyoto"],
      hasHostedBefore: true,
      previousHostingDetails: "Hosted 3 workshops in Italy",
      status: "submitted",
      submittedAt: new Date("2026-08-20"),
      reviewedAt: null,
      reviewedByUid: null,
      reviewNotes: null,
      createdAt: null,
      updatedAt: null,
    },
  ];

  const mockTrips: AdminTripRow[] = [
    {
      id: "trip-1",
      ownerUid: "host-1",
      hostUid: "host-1",
      hostProfileId: "prof-1",
      itineraryId: "itin-1",
      destinationId: "dest-1",
      slug: "kyoto-zen-retreat",
      title: "Kyoto Zen Retreat",
      tagline: "Experience the tranquility of ancient Kyoto",
      currency: "USD",
      basePriceCents: 250000,
      earlyBirdPriceCents: null,
      earlyBirdCutoffDate: null,
      maxGroupSize: 12,
      imagePaths: ["/trips/kyoto.jpg"],
      tags: ["Culture", "Zen"],
      badgeLabel: null,
      badgeType: null,
      status: "published",
      publishedAt: null,
      createdAt: null,
      updatedAt: null,
      departuresCount: 2,
      totalConfirmedBookings: 8,
      hostName: "Zen Travel Guild",
    },
  ];

  const mockAuditEvents: AdminAuditEventRow[] = [
    {
      id: "audit-1",
      actorUid: "admin-1",
      action: "host.application_approved",
      targetType: "hostApplications",
      targetId: "app-1",
      metadata: { decision: "approved" },
      reason: "Approved by admin",
      createdAt: new Date("2026-08-25"),
    },
  ];

  it("renders key stats and overview metrics correctly", () => {
    render(
      <AdminPortal
        metrics={mockMetrics}
        applications={mockApplications}
        trips={mockTrips}
        auditEvents={mockAuditEvents}
      />,
    );

    expect(screen.getByText("Confirmed Bookings")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("Active Hosts")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("Published Trips")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("Creative Nomad Writers")).toBeInTheDocument();
  });

  it("navigates between tabs and renders corresponding tab views", () => {
    render(
      <AdminPortal
        metrics={mockMetrics}
        applications={mockApplications}
        trips={mockTrips}
        auditEvents={mockAuditEvents}
      />,
    );

    // Switch to Host Queue tab
    const hostsTabButton = screen.getAllByRole("button", {
      name: /Host Queue/i,
    })[0];
    fireEvent.click(hostsTabButton);
    expect(
      screen.getByText("Host Application Review Queue"),
    ).toBeInTheDocument();

    // Switch to Trips & Operations tab
    const tripsTabButton = screen.getAllByRole("button", {
      name: /Trips & Operations/i,
    })[0];
    fireEvent.click(tripsTabButton);
    expect(
      screen.getByText("Trip Catalog & Manifest Operations"),
    ).toBeInTheDocument();
    expect(screen.getByText("Kyoto Zen Retreat")).toBeInTheDocument();

    // Switch to Audit Trail tab
    const auditTabButton = screen.getAllByRole("button", {
      name: /Audit Trail/i,
    })[0];
    fireEvent.click(auditTabButton);
    expect(
      screen.getByText("Immutable Platform Audit Trail"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("host.application_approved"),
    ).toBeInTheDocument();
  });
});
