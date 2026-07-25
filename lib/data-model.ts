import type { UserRole } from "@/lib/auth/roles";

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

export type PublicationStatus = "draft" | "published" | "archived";

export interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: "active" | "disabled";
  emailVerified: boolean;
  photoPath: string | null;
  createdAt: unknown;
  updatedAt: unknown;
  lastLoginAt?: unknown;
}

export interface OwnedDocument {
  ownerUid: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface PublishedDocument {
  status: PublicationStatus;
  publishedAt: unknown | null;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface HostApplicationDocument extends OwnedDocument {
  status: "submitted" | "under_review" | "approved" | "rejected" | "waitlisted";
  submittedAt: unknown;
}

export interface HostProfileDocument extends OwnedDocument {
  displayName: string;
  bio: string;
  imagePath: string | null;
  status: PublicationStatus;
}

export interface BookingOwnedDocument extends OwnedDocument {
  travelerUid: string;
  hostUid: string;
  tripId: string;
}

export const ADMIN_CONTENT_COLLECTIONS = [
  COLLECTIONS.destinations,
  COLLECTIONS.itineraries,
  COLLECTIONS.trips,
  COLLECTIONS.tripDepartures,
  COLLECTIONS.supportArticles,
] as const;

export type AdminContentCollection =
  (typeof ADMIN_CONTENT_COLLECTIONS)[number];
