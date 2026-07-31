/**
 * lib/data-model.ts
 *
 * Collection name registry and content-collection constants.
 * Full document interfaces live in lib/db/schema.ts.
 */

// ─── Re-export everything from the schema ─────────────────────────────────────

export type {
  AuditEventDocument,
  BaseDocument,
  BookingDocument,
  BookingStatus,
  CollectionDocumentMap,
  DestinationDocument,
  HostApplicationDocument,
  HostApplicationStatus,
  HostProfileDocument,
  InterestResponseDocument,
  ItineraryActivity,
  ItineraryDay,
  ItineraryDocument,
  OwnedDocument,
  PaymentDocument,
  PaymentInstallment,
  PaymentInstallmentStatus,
  PaymentScheduleDocument,
  PaymentStatus,
  PaymentType,
  PublicationStatus,
  PublishedDocument,
  ReferralDocument,
  ReferralStatus,
  RoomType,
  SupportArticleDocument,
  TripBadgeType,
  TripDepartureDocument,
  TripDocument,
  UserDocument,
  UserRole,
} from "@/lib/db/schema";

// ─── Collection name registry ─────────────────────────────────────────────────

export const COLLECTIONS = {
  users: "users",
  hostApplications: "hostApplications",
  hostProfiles: "hostProfiles",
  destinations: "destinations",
  itineraries: "itineraries",
  trips: "trips",
  tripDepartures: "tripDepartures",
  interestResponses: "interestResponses",
  bookings: "bookings",
  paymentSchedules: "paymentSchedules",
  payments: "payments",
  referrals: "referrals",
  supportArticles: "supportArticles",
  auditEvents: "auditEvents",
} as const;

export type CoreCollectionName =
  (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

// ─── Admin-managed content collections ───────────────────────────────────────
// These collections are seeded and published exclusively through server-side
// admin endpoints. Client writes are denied by Firestore security rules.

export const ADMIN_CONTENT_COLLECTIONS = [
  COLLECTIONS.destinations,
  COLLECTIONS.itineraries,
  COLLECTIONS.trips,
  COLLECTIONS.tripDepartures,
  COLLECTIONS.supportArticles,
] as const;

export type AdminContentCollection =
  (typeof ADMIN_CONTENT_COLLECTIONS)[number];
