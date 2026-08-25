import { describe, expect, it } from "vitest";
import {
  hostApplicationSchema,
  interestResponseSchema,
} from "@/lib/validation/host-application";

describe("hostApplicationSchema", () => {
  it("validates a valid host application payload", () => {
    const valid = {
      communityName: "Nomad Creators",
      communityType: "social",
      audienceSize: 12000,
      communityUrl: "https://nomadcreators.com",
      instagramHandle: "nomadcreators",
      tiktokHandle: "@nomadtok",
      bio: "We are a passionate community of digital nomads excited to explore Southeast Asia together.",
      proposedDestinations: ["Bali, Indonesia", "Kyoto, Japan"],
      hasHostedBefore: true,
      previousHostingDetails: "Hosted a 15-person retreat in Chiang Mai in 2025.",
    };

    const result = hostApplicationSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.instagramHandle).toBe("@nomadcreators");
      expect(result.data.tiktokHandle).toBe("@nomadtok");
    }
  });

  it("fails when community name is too short", () => {
    const invalid = {
      communityName: "A",
      communityType: "social",
      audienceSize: 5000,
      bio: "This is a valid length bio describing our community adventures across the world.",
      proposedDestinations: ["Bali"],
      hasHostedBefore: false,
    };

    const result = hostApplicationSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("fails when bio is under 20 characters", () => {
    const invalid = {
      communityName: "Nomad Club",
      communityType: "social",
      audienceSize: 5000,
      bio: "Too short",
      proposedDestinations: ["Bali"],
      hasHostedBefore: false,
    };

    const result = hostApplicationSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("fails when proposed destinations array is empty", () => {
    const invalid = {
      communityName: "Nomad Club",
      communityType: "social",
      audienceSize: 5000,
      bio: "This is a valid length bio describing our community adventures across the world.",
      proposedDestinations: [],
      hasHostedBefore: false,
    };

    const result = hostApplicationSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe("interestResponseSchema", () => {
  it("validates valid survey interest response", () => {
    const valid = {
      surveyLinkId: "host-uid-123",
      respondentName: "Jane Traveler",
      respondentEmail: "jane@example.com",
      destinationInterests: ["Bali, Indonesia", "Costa Rica"],
      travelMonths: ["2026-10", "2027-02"],
      groupSizePreference: 12,
      budgetRangeCents: { min: 150000, max: 250000 },
      notes: "Looking forward to yoga workshops.",
    };

    const result = interestResponseSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});
