import { z } from "zod";

export const COMMUNITY_TYPES = [
  "newsletter",
  "podcast",
  "social",
  "fitness",
  "travel_club",
  "blog",
  "other",
] as const;

export type CommunityType = (typeof COMMUNITY_TYPES)[number];

export const hostApplicationSchema = z.object({
  communityName: z
    .string()
    .trim()
    .min(2, "Community name must be at least 2 characters")
    .max(100, "Community name must be under 100 characters"),
  communityType: z.enum(COMMUNITY_TYPES, {
    message: "Please select a valid community type",
  }),
  audienceSize: z
    .number()
    .int("Audience size must be an integer")
    .min(0, "Audience size cannot be negative")
    .max(100_000_000, "Audience size must be realistic"),
  communityUrl: z
    .string()
    .trim()
    .url("Please enter a valid website or community URL")
    .nullable()
    .optional()
    .or(z.literal(""))
    .transform((val) => (!val ? null : val)),
  instagramHandle: z
    .string()
    .trim()
    .regex(/^@?[\w.]{1,30}$/, "Invalid Instagram handle format")
    .nullable()
    .optional()
    .or(z.literal(""))
    .transform((val) => {
      if (!val) return null;
      return val.startsWith("@") ? val : `@${val}`;
    }),
  tiktokHandle: z
    .string()
    .trim()
    .regex(/^@?[\w.]{1,30}$/, "Invalid TikTok handle format")
    .nullable()
    .optional()
    .or(z.literal(""))
    .transform((val) => {
      if (!val) return null;
      return val.startsWith("@") ? val : `@${val}`;
    }),
  bio: z
    .string()
    .trim()
    .min(20, "Please share at least 20 characters about yourself and your trip idea")
    .max(2000, "Bio must be under 2,000 characters"),
  proposedDestinations: z
    .array(z.string().trim().min(2).max(80))
    .min(1, "Please select or enter at least one target destination")
    .max(10, "You can select up to 10 destinations"),
  hasHostedBefore: z.boolean(),
  previousHostingDetails: z
    .string()
    .trim()
    .max(1000, "Previous hosting details must be under 1,000 characters")
    .nullable()
    .optional()
    .or(z.literal(""))
    .transform((val) => (!val ? null : val)),
});

export type HostApplicationInput = z.input<typeof hostApplicationSchema>;
export type HostApplicationOutput = z.output<typeof hostApplicationSchema>;

export const interestResponseSchema = z.object({
  surveyLinkId: z.string().trim().min(1, "Survey ID is required"),
  respondentName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  respondentEmail: z.string().trim().email("Please provide a valid email address").max(320),
  destinationInterests: z
    .array(z.string().trim().min(2).max(80))
    .min(1, "Please pick at least one destination interest")
    .max(10),
  travelMonths: z
    .array(z.string().trim().regex(/^\d{4}-\d{2}$/, "Format must be YYYY-MM"))
    .max(12)
    .default([]),
  groupSizePreference: z.number().int().min(1).max(100).nullable().default(null),
  budgetRangeCents: z
    .object({
      min: z.number().int().min(0),
      max: z.number().int().min(0),
    })
    .nullable()
    .default(null),
  notes: z.string().trim().max(1000).default(""),
});

export type InterestResponseInput = z.input<typeof interestResponseSchema>;
export type InterestResponseOutput = z.output<typeof interestResponseSchema>;
