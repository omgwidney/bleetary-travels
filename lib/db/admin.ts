import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/data-model";
import { logAuditEvent } from "@/lib/db/audit";
import type {
  HostApplicationDocument,
  HostApplicationStatus,
  HostProfileDocument,
  TripDocument,
  TripDepartureDocument,
  BookingDocument,
  AuditEventDocument,
  PublicationStatus,
} from "@/lib/db/schema";

export type AdminHostApplicationRow = HostApplicationDocument & {
  id: string;
  applicantEmail?: string;
  applicantDisplayName?: string;
};

export type AdminTripRow = TripDocument & {
  id: string;
  departuresCount: number;
  totalConfirmedBookings: number;
  hostName?: string;
};

export interface PassengerManifestItem {
  bookingId: string;
  travelerUid: string;
  travelerName: string;
  travelerEmail: string;
  guestCount: number;
  roomType: string;
  status: string;
  depositAmountCents: number;
  totalAmountCents: number;
  dietaryRequirements: string[];
  specialRequests: string;
  bookedAt: unknown;
}

export interface DepartureManifestData {
  departure: TripDepartureDocument & { id: string };
  trip: TripDocument & { id: string };
  passengers: PassengerManifestItem[];
  totalConfirmedGuests: number;
}

export type AdminAuditEventRow = AuditEventDocument & {
  id: string;
};

export interface AdminOverviewMetrics {
  totalBookings: number;
  totalRevenueCents: number;
  pendingApplicationsCount: number;
  activeHostsCount: number;
  publishedTripsCount: number;
}

// ─── Host Applications Admin Queries ────────────────────────────────────────

/**
 * Returns all host applications with optional status filtering.
 */
export async function getAllHostApplicationsAdmin(
  statusFilter?: HostApplicationStatus,
): Promise<AdminHostApplicationRow[]> {
  const db = getAdminDb();
  let query: FirebaseFirestore.Query = db.collection(COLLECTIONS.hostApplications);

  if (statusFilter) {
    query = query.where("status", "==", statusFilter);
  }

  const snapshot = await query.get();
  const rows: AdminHostApplicationRow[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as HostApplicationDocument),
  }));

  // Sort by submittedAt descending
  rows.sort((a, b) => {
    const aTime =
      typeof a.submittedAt === "object" &&
      a.submittedAt !== null &&
      "toMillis" in a.submittedAt
        ? (a.submittedAt as { toMillis: () => number }).toMillis()
        : 0;
    const bTime =
      typeof b.submittedAt === "object" &&
      b.submittedAt !== null &&
      "toMillis" in b.submittedAt
        ? (b.submittedAt as { toMillis: () => number }).toMillis()
        : 0;
    return bTime - aTime;
  });

  return rows;
}

/**
 * Reviews a host application: updates status, promotes user role if approved,
 * provisions host profile, and logs audit events.
 */
export async function reviewHostApplication(
  actorUid: string,
  applicationId: string,
  decision: "approved" | "rejected" | "waitlisted" | "under_review",
  reviewNotes = "",
): Promise<void> {
  const db = getAdminDb();
  const auth = getAdminAuth();

  const applicationRef = db
    .collection(COLLECTIONS.hostApplications)
    .doc(applicationId);
  const appDoc = await applicationRef.get();

  if (!appDoc.exists) {
    throw new Error("Host application not found.");
  }

  const appData = appDoc.data() as HostApplicationDocument;
  const now = FieldValue.serverTimestamp();

  if (decision === "approved") {
    // 1. Update application status
    await applicationRef.update({
      status: "approved",
      reviewedAt: now,
      reviewedByUid: actorUid,
      reviewNotes: reviewNotes.trim() || null,
      updatedAt: now,
    });

    // 2. Promote user custom claims in Auth
    try {
      const user = await auth.getUser(applicationId);
      await auth.setCustomUserClaims(applicationId, {
        ...user.customClaims,
        role: "host",
      });
      await auth.revokeRefreshTokens(applicationId);
    } catch (authErr) {
      console.warn("Could not set custom user claims:", authErr);
    }

    // 3. Update role in Firestore users collection
    const userRef = db.collection(COLLECTIONS.users).doc(applicationId);
    await userRef.set(
      {
        role: "host",
        updatedAt: now,
      },
      { merge: true },
    );

    // 4. Provision published host profile if not already present
    const profileRef = db
      .collection(COLLECTIONS.hostProfiles)
      .doc(applicationId);
    const existingProfile = await profileRef.get();

    if (!existingProfile.exists) {
      const newProfile: HostProfileDocument = {
        ownerUid: applicationId,
        displayName: appData.communityName || "Host",
        bio: appData.bio || "",
        imagePath: null,
        instagramHandle: appData.instagramHandle || null,
        tiktokHandle: appData.tiktokHandle || null,
        websiteUrl: appData.communityUrl || null,
        tripsCount: 0,
        totalTravelersHosted: 0,
        averageRating: null,
        reviewCount: 0,
        status: "published",
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      };
      await profileRef.set(newProfile);
    }

    // 5. Log audit event
    await logAuditEvent({
      actorUid,
      action: "host.application_approved",
      targetType: COLLECTIONS.hostApplications,
      targetId: applicationId,
      metadata: {
        communityName: appData.communityName,
        reviewNotes,
      },
      reason: reviewNotes || "Host application approved by administrator",
    });
  } else {
    // Rejected / Waitlisted / Under Review
    await applicationRef.update({
      status: decision,
      reviewedAt: now,
      reviewedByUid: actorUid,
      reviewNotes: reviewNotes.trim() || null,
      updatedAt: now,
    });

    await logAuditEvent({
      actorUid,
      action: `host.application_${decision}`,
      targetType: COLLECTIONS.hostApplications,
      targetId: applicationId,
      metadata: {
        decision,
        reviewNotes,
      },
      reason: reviewNotes || `Application marked as ${decision}`,
    });
  }
}

// ─── Trips Operations Admin Queries ─────────────────────────────────────────

/**
 * Returns all trips across all publication statuses with departure metrics.
 */
export async function getAllTripsAdmin(): Promise<AdminTripRow[]> {
  const db = getAdminDb();
  const [tripsSnap, departuresSnap, bookingsSnap, hostsSnap] = await Promise.all([
    db.collection(COLLECTIONS.trips).get(),
    db.collection(COLLECTIONS.tripDepartures).get(),
    db.collection(COLLECTIONS.bookings).where("status", "==", "confirmed").get(),
    db.collection(COLLECTIONS.hostProfiles).get(),
  ]);

  const hostsMap = new Map<string, string>();
  hostsSnap.docs.forEach((doc) => {
    const data = doc.data() as HostProfileDocument;
    hostsMap.set(doc.id, data.displayName);
  });

  const departuresByTrip = new Map<string, number>();
  departuresSnap.docs.forEach((doc) => {
    const d = doc.data() as TripDepartureDocument;
    departuresByTrip.set(d.tripId, (departuresByTrip.get(d.tripId) || 0) + 1);
  });

  const bookingsByTrip = new Map<string, number>();
  bookingsSnap.docs.forEach((doc) => {
    const b = doc.data() as BookingDocument;
    bookingsByTrip.set(
      b.tripId,
      (bookingsByTrip.get(b.tripId) || 0) + (b.guestCount || 1),
    );
  });

  const trips: AdminTripRow[] = tripsSnap.docs.map((doc) => {
    const data = doc.data() as TripDocument;
    return {
      id: doc.id,
      ...data,
      departuresCount: departuresByTrip.get(doc.id) || 0,
      totalConfirmedBookings: bookingsByTrip.get(doc.id) || 0,
      hostName: hostsMap.get(data.hostUid) || "Host",
    };
  });

  return trips;
}

/**
 * Updates publication status of a trip (`draft`, `published`, `archived`).
 */
export async function updateTripPublicationStatus(
  actorUid: string,
  tripId: string,
  status: PublicationStatus,
  reason = "",
): Promise<void> {
  const db = getAdminDb();
  const tripRef = db.collection(COLLECTIONS.trips).doc(tripId);
  const tripDoc = await tripRef.get();

  if (!tripDoc.exists) {
    throw new Error("Trip not found.");
  }

  const now = FieldValue.serverTimestamp();
  await tripRef.update({
    status,
    publishedAt: status === "published" ? now : null,
    updatedAt: now,
  });

  await logAuditEvent({
    actorUid,
    action: "trip.status_updated",
    targetType: COLLECTIONS.trips,
    targetId: tripId,
    metadata: { status },
    reason: reason || `Trip status updated to ${status}`,
  });
}

/**
 * Fetches passenger manifest for a specific departure.
 */
export async function getDepartureManifest(
  departureId: string,
): Promise<DepartureManifestData | null> {
  const db = getAdminDb();
  const [departureDoc, bookingsSnap] = await Promise.all([
    db.collection(COLLECTIONS.tripDepartures).doc(departureId).get(),
    db
      .collection(COLLECTIONS.bookings)
      .where("departureId", "==", departureId)
      .where("status", "==", "confirmed")
      .get(),
  ]);

  if (!departureDoc.exists) return null;
  const departure = {
    id: departureDoc.id,
    ...(departureDoc.data() as TripDepartureDocument),
  };

  const tripDoc = await db
    .collection(COLLECTIONS.trips)
    .doc(departure.tripId)
    .get();
  if (!tripDoc.exists) return null;
  const trip = { id: tripDoc.id, ...(tripDoc.data() as TripDocument) };

  // Fetch traveler users
  const travelerUids = Array.from(
    new Set(bookingsSnap.docs.map((d) => (d.data() as BookingDocument).travelerUid)),
  );

  const usersMap = new Map<string, { email: string; displayName: string }>();
  if (travelerUids.length > 0) {
    const userDocs = await Promise.all(
      travelerUids.map((uid) => db.collection(COLLECTIONS.users).doc(uid).get()),
    );
    userDocs.forEach((doc) => {
      if (doc.exists) {
        const u = doc.data();
        usersMap.set(doc.id, {
          email: u?.email || "",
          displayName: u?.displayName || "Traveler",
        });
      }
    });
  }

  let totalConfirmedGuests = 0;
  const passengers: PassengerManifestItem[] = bookingsSnap.docs.map((doc) => {
    const b = doc.data() as BookingDocument;
    const user = usersMap.get(b.travelerUid);
    const guestCount = b.guestCount || 1;
    totalConfirmedGuests += guestCount;

    return {
      bookingId: doc.id,
      travelerUid: b.travelerUid,
      travelerName: user?.displayName || "Traveler",
      travelerEmail: user?.email || "",
      guestCount,
      roomType: b.roomType || "standard",
      status: b.status,
      depositAmountCents: b.depositAmountCents || 0,
      totalAmountCents: b.totalAmountCents || 0,
      dietaryRequirements: b.dietaryRequirements || [],
      specialRequests: b.specialRequests || "",
      bookedAt: b.createdAt,
    };
  });

  return {
    departure,
    trip,
    passengers,
    totalConfirmedGuests,
  };
}

// ─── Audit Trail & Overview Queries ─────────────────────────────────────────

/**
 * Returns recent audit events.
 */
export async function getRecentAuditEvents(
  limit = 50,
): Promise<AdminAuditEventRow[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(COLLECTIONS.auditEvents)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as AuditEventDocument),
  }));
}

/**
 * Aggregates high-level platform statistics for the overview tab.
 */
export async function getAdminOverviewMetrics(): Promise<AdminOverviewMetrics> {
  const db = getAdminDb();
  const [appsSnap, tripsSnap, bookingsSnap, hostsSnap] = await Promise.all([
    db
      .collection(COLLECTIONS.hostApplications)
      .where("status", "in", ["submitted", "under_review"])
      .get(),
    db.collection(COLLECTIONS.trips).where("status", "==", "published").get(),
    db.collection(COLLECTIONS.bookings).where("status", "==", "confirmed").get(),
    db.collection(COLLECTIONS.hostProfiles).where("status", "==", "published").get(),
  ]);

  let totalRevenueCents = 0;
  bookingsSnap.docs.forEach((doc) => {
    const b = doc.data() as BookingDocument;
    totalRevenueCents += b.depositAmountCents || 0;
  });

  return {
    totalBookings: bookingsSnap.size,
    totalRevenueCents,
    pendingApplicationsCount: appsSnap.size,
    activeHostsCount: hostsSnap.size,
    publishedTripsCount: tripsSnap.size,
  };
}
