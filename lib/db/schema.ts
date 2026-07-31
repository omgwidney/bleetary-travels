/**
 * lib/db/schema.ts
 *
 * Strict TypeScript interfaces for every Firestore collection used in
 * Bleetary Travels. All timestamps are stored as Firestore Timestamps on the
 * server but arrive as `unknown` when read through the Admin SDK or the client
 * SDK (before conversion). Use `Timestamp` from firebase-admin/firestore or
 * firebase/firestore when constructing values.
 *
 * Monetary amounts are stored as INTEGER CENTS to avoid floating-point
 * rounding. Currency is an ISO 4217 string (e.g. "USD").
 *
 * All client writes to these collections are denied by Firestore security
 * rules. Mutations go exclusively through server-side API routes that use the
 * Firebase Admin SDK.
 */

import type { UserRole } from "@/lib/auth/roles";

// ─── Re-export shared primitives ─────────────────────────────────────────────

export type { UserRole };

export type PublicationStatus = "draft" | "published" | "archived";

// ─── Shared base shapes ───────────────────────────────────────────────────────

/** Every document has server-managed timestamps. */
export interface BaseDocument {
  createdAt: unknown; // Firestore Timestamp
  updatedAt: unknown; // Firestore Timestamp
}

/** Documents with a single owner (generic). */
export interface OwnedDocument extends BaseDocument {
  ownerUid: string;
}

/** Content documents that go through a publication workflow. */
export interface PublishedDocument extends BaseDocument {
  status: PublicationStatus;
  publishedAt: unknown | null; // Firestore Timestamp | null
}

// ─── users/{uid} ─────────────────────────────────────────────────────────────

export interface UserDocument extends BaseDocument {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: "active" | "disabled";
  emailVerified: boolean;
  photoPath: string | null;
  /** Unique referral code generated at account creation. */
  referralCode: string | null;
  lastLoginAt?: unknown; // Firestore Timestamp
}

// ─── hostApplications/{applicationId} ────────────────────────────────────────

export type HostApplicationStatus =
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "waitlisted";

export interface HostApplicationDocument extends OwnedDocument {
  status: HostApplicationStatus;
  submittedAt: unknown; // Firestore Timestamp

  // Community & audience
  communityName: string;
  /** e.g. "newsletter" | "podcast" | "social" | "blog" | "other" */
  communityType: string;
  audienceSize: number | null;
  communityUrl: string | null;
  instagramHandle: string | null;
  tiktokHandle: string | null;

  // Host details
  bio: string;
  /** Free-text destination wishlist at application time. */
  proposedDestinations: string[];
  hasHostedBefore: boolean;
  previousHostingDetails: string | null;

  // Admin review
  reviewedAt: unknown | null; // Firestore Timestamp | null
  reviewedByUid: string | null;
  reviewNotes: string | null;
}

// ─── hostProfiles/{hostUid} ───────────────────────────────────────────────────
// Document ID = host's Firebase Auth UID.

export interface HostProfileDocument extends OwnedDocument, PublishedDocument {
  displayName: string;
  bio: string;
  imagePath: string | null;
  instagramHandle: string | null;
  tiktokHandle: string | null;
  websiteUrl: string | null;
  /** Denormalized counter — incremented by server on departure completion. */
  tripsCount: number;
  /** Denormalized total travelers hosted across all completed departures. */
  totalTravelersHosted: number;
  averageRating: number | null;
  reviewCount: number;
}

// ─── destinations/{destinationId} ────────────────────────────────────────────

export interface DestinationDocument extends PublishedDocument {
  /** URL-safe unique slug, e.g. "bali". */
  slug: string;
  name: string;
  /** Broad geographic region, e.g. "Southeast Asia". */
  region: string;
  country: string;
  /** ISO 3166-1 alpha-2, e.g. "ID". */
  countryCode: string;
  imagePath: string;
  heroImagePath: string;
  description: string;
  /** null = not featured; lower number = higher priority in catalog. */
  featuredOrder: number | null;
}

// ─── itineraries/{itineraryId} ───────────────────────────────────────────────

export interface ItineraryActivity {
  title: string;
  description: string;
  durationMinutes: number | null;
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  description: string;
  activities: ItineraryActivity[];
}

export interface ItineraryDocument extends OwnedDocument, PublishedDocument {
  destinationId: string;
  title: string;
  durationDays: number;
  days: ItineraryDay[];
}

// ─── trips/{tripId} ──────────────────────────────────────────────────────────

export type TripBadgeType = "early" | "hot";

export interface TripDocument extends OwnedDocument, PublishedDocument {
  /** Host's Firebase Auth UID — denormalized for security rule reads. */
  hostUid: string;
  hostProfileId: string;
  itineraryId: string;
  destinationId: string;
  /** URL-safe unique slug, e.g. "bali-with-diem". */
  slug: string;
  title: string;
  tagline: string;
  /** ISO 4217 currency code, e.g. "USD". */
  currency: string;
  /** Base price in integer cents, e.g. 199500 = $1,995.00. */
  basePriceCents: number;
  /** null when no early-bird pricing is active. */
  earlyBirdPriceCents: number | null;
  earlyBirdCutoffDate: unknown | null; // Firestore Timestamp | null
  maxGroupSize: number;
  /** Ordered list of Storage paths for trip gallery images. */
  imagePaths: string[];
  tags: string[];
  badgeLabel: string | null;
  badgeType: TripBadgeType | null;
}

// ─── tripDepartures/{departureId} ────────────────────────────────────────────

export interface TripDepartureDocument extends OwnedDocument, PublishedDocument {
  tripId: string;
  /** Host UID — denormalized for security rule reads. */
  hostUid: string;
  startDate: unknown; // Firestore Timestamp
  endDate: unknown; // Firestore Timestamp
  /** Total available seats for this departure. */
  capacity: number;
  /** Denormalized count of bookings with status ≥ "confirmed". */
  confirmedCount: number;
  waitlistCount: number;
  currency: string;
  /** Overrides trip-level base price for this specific departure. */
  basePriceCents: number;
  earlyBirdPriceCents: number | null;
  earlyBirdCutoffDate: unknown | null; // Firestore Timestamp | null
  /** Percentage of total required upfront (0–100), e.g. 30 = 30% deposit. */
  depositPercent: number;
  /** Days before startDate when the final balance payment is due. */
  finalBalanceDueDays: number;
}

// ─── interestResponses/{responseId} ──────────────────────────────────────────
// Host audience survey — NOT a booking. Hosts share a unique survey link with
// their community to gather destination interests before proposing any trip.

export interface InterestResponseDocument {
  /** Host UID — owner of the survey link. */
  ownerUid: string;
  /** null for anonymous (unauthenticated) respondents. */
  travelerUid: string | null;
  /** The unique survey link slug that generated this response. */
  surveyLinkId: string;
  respondentEmail: string;
  respondentName: string;
  /** Free-text or predefined destination names the respondent is interested in. */
  destinationInterests: string[];
  /** ISO month strings the respondent is available, e.g. ["2026-09", "2027-01"]. */
  travelMonths: string[];
  groupSizePreference: number | null;
  /** Budget range in integer cents. null if respondent skipped. */
  budgetRangeCents: { min: number; max: number } | null;
  notes: string;
  createdAt: unknown; // Firestore Timestamp
}

// ─── bookings/{bookingId} ────────────────────────────────────────────────────

export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "waitlisted"
  | "cancelled"
  | "refunded";

export type RoomType = "standard" | "private" | "shared";

export interface BookingDocument extends BaseDocument {
  travelerUid: string;
  hostUid: string;
  tripId: string;
  departureId: string;

  // ── Price snapshot at booking time (immutable after creation) ──
  currency: string;
  basePriceCents: number;
  earlyBirdDiscountCents: number;
  roomTypePremiumCents: number;
  totalAmountCents: number;
  depositAmountCents: number;

  roomType: RoomType | null;
  /** Number of seats booked — usually 1 for solo travelers. */
  guestCount: number;

  status: BookingStatus;
  cancelledAt: unknown | null; // Firestore Timestamp | null
  cancellationReason: string | null;
  refundAmountCents: number | null;

  specialRequests: string;
  dietaryRequirements: string[];
}

// ─── paymentSchedules/{scheduleId} ───────────────────────────────────────────

export type PaymentInstallmentStatus =
  | "upcoming"
  | "processing"
  | "paid"
  | "overdue"
  | "waived";

export interface PaymentInstallment {
  /** 1-indexed sequence number within this schedule. */
  sequence: number;
  /** i18n key or human label, e.g. "deposit" | "final_balance". */
  labelKey: string;
  amountCents: number;
  dueDate: unknown; // Firestore Timestamp
  status: PaymentInstallmentStatus;
  /** Populated once a payment document is created for this installment. */
  paymentId: string | null;
  paidAt: unknown | null; // Firestore Timestamp | null
}

export interface PaymentScheduleDocument extends BaseDocument {
  bookingId: string;
  travelerUid: string;
  hostUid: string;
  tripId: string;
  departureId: string;
  currency: string;
  totalAmountCents: number;
  installments: PaymentInstallment[];
  status: "active" | "complete" | "cancelled";
}

// ─── payments/{paymentId} ────────────────────────────────────────────────────

export type PaymentType =
  | "deposit"
  | "installment"
  | "final_balance"
  | "refund";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "refunded";

export interface PaymentDocument extends BaseDocument {
  bookingId: string;
  scheduleId: string;
  travelerUid: string;
  hostUid: string;
  currency: string;
  amountCents: number;
  paymentType: PaymentType;
  status: PaymentStatus;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  paidAt: unknown | null; // Firestore Timestamp | null
  failureReason: string | null;
}

// ─── referrals/{referralId} ──────────────────────────────────────────────────

export type ReferralStatus = "pending" | "registered" | "credited";

export interface ReferralDocument extends BaseDocument {
  referrerUid: string;
  /** null until the referred person creates an account. */
  referredUid: string | null;
  referralCode: string;
  status: ReferralStatus;
  creditedAt: unknown | null; // Firestore Timestamp | null
  creditAmountCents: number;
  currency: string;
}

// ─── supportArticles/{articleId} ─────────────────────────────────────────────

export interface SupportArticleDocument extends PublishedDocument {
  slug: string;
  title: string;
  /** e.g. "bookings" | "payments" | "hosts" | "general" */
  category: string;
  /** Article body in Markdown. */
  body: string;
}

// ─── auditEvents/{eventId} ───────────────────────────────────────────────────

export interface AuditEventDocument {
  /** UID of the user or system actor that triggered the event. */
  actorUid: string;
  /** Dot-namespaced action, e.g. "user.role_changed" | "booking.cancelled". */
  action: string;
  /** Firestore collection name of the target document. */
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown>;
  reason: string;
  createdAt: unknown; // Firestore Timestamp
}

// ─── Convenience union & map types ───────────────────────────────────────────

/** Map from collection name to its document interface. */
export interface CollectionDocumentMap {
  users: UserDocument;
  hostApplications: HostApplicationDocument;
  hostProfiles: HostProfileDocument;
  destinations: DestinationDocument;
  itineraries: ItineraryDocument;
  trips: TripDocument;
  tripDepartures: TripDepartureDocument;
  interestResponses: InterestResponseDocument;
  bookings: BookingDocument;
  paymentSchedules: PaymentScheduleDocument;
  payments: PaymentDocument;
  referrals: ReferralDocument;
  supportArticles: SupportArticleDocument;
  auditEvents: AuditEventDocument;
}
