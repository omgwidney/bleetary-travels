import { z } from "zod";

export const MAX_TRIP_IMAGE_BYTES = 100 * 1024 * 1024;
export const TRIP_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, "Enter a valid calendar date.");
export const adminTripSchema = z.object({
  title: z.string().trim().min(3).max(150),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).min(3).max(100),
  tagline: z.string().trim().min(10).max(500),
  hostUid: z.string().min(1).max(128).refine(v => !v.includes("/")),
  destinationId: z.string().max(128).refine(v => !v.includes("/")).default(""),
  destination: z.object({ name: z.string().trim().max(120), country: z.string().trim().max(120), countryCode: z.string().max(2), region: z.string().trim().max(120), description: z.string().trim().max(3000) }),
  startDate: date, endDate: date,
  basePriceCents: z.number().int().min(100).max(100000000),
  capacity: z.number().int().min(1).max(500),
  depositPercent: z.number().int().min(1).max(100),
  finalBalanceDueDays: z.number().int().min(0).max(365),
  status: z.enum(["draft", "published"]),
  tags: z.array(z.string().trim().min(1).max(50)).max(12),
  days: z.array(z.object({ title: z.string().trim().min(2).max(150), description: z.string().trim().min(5).max(4000), activities: z.array(z.string().trim().min(1).max(500)).max(30) })).min(1).max(60),
  images: z.array(z.object({ path: z.string().startsWith("published/trip-originals/").max(500), url: z.string().url().max(2000), name: z.string().max(255), size: z.number().int().positive().max(MAX_TRIP_IMAGE_BYTES), contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/avif"]) })).min(1).max(20),
}).superRefine((value, ctx) => {
  if (value.endDate < value.startDate) ctx.addIssue({ code: "custom", path: ["endDate"], message: "End date must be on or after the start date." });
  if (!value.destinationId && (!value.destination.name || !value.destination.country || !/^[A-Z]{2}$/.test(value.destination.countryCode) || !value.destination.region || value.destination.description.length < 10)) ctx.addIssue({ code: "custom", path: ["destination"], message: "Complete the new destination, including its two-letter country code and description." });
});
export type AdminTripInput = z.infer<typeof adminTripSchema>;
