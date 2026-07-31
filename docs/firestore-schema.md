# Firestore schema — Bleetary Travels

All client writes to these collections are denied. Mutations run exclusively
through server-side API routes using the Firebase Admin SDK. The public
`host_leads` create contract is the only exception (Phase 0 lead quiz).

Timestamps are stored as Firestore `Timestamp` objects. Monetary values are
stored as **integer cents** (e.g. `199500` = $1,995.00) with a separate
ISO 4217 `currency` string (e.g. `"USD"`).

Full TypeScript interfaces: [`lib/db/schema.ts`](../lib/db/schema.ts)  
Collection name registry: [`lib/data-model.ts`](../lib/data-model.ts)

---

## Collection access contracts

| Collection | Public read | Authenticated read | Admin read |
|---|---|---|---|
| `users` | ✗ | Own document only | ✓ any |
| `hostApplications` | ✗ | Own document (ownerUid) | ✓ list + get |
| `hostProfiles` | Published only | Own draft (ownerUid) | ✓ any |
| `destinations` | Published only | Published only | ✓ any |
| `itineraries` | Published only | Host draft (ownerUid) | ✓ any |
| `trips` | Published only | Host draft (hostUid/ownerUid) | ✓ any |
| `tripDepartures` | Published only | Host draft (hostUid/ownerUid) | ✓ any |
| `interestResponses` | ✗ | Survey host (ownerUid) or respondent (travelerUid) | ✓ any |
| `bookings` | ✗ | Traveler (travelerUid) or host (hostUid) | ✓ any |
| `paymentSchedules` | ✗ | Traveler or host | ✓ any |
| `payments` | ✗ | Traveler or host | ✓ any |
| `referrals` | ✗ | Referrer or referred user | ✓ any |
| `supportArticles` | Published only | Published only | ✓ any |
| `auditEvents` | ✗ | ✗ | ✓ get + list |

---

## Field reference

### `users/{uid}`
| Field | Type | Notes |
|---|---|---|
| `uid` | `string` | Firebase Auth UID |
| `email` | `string` | Verified email |
| `displayName` | `string` | |
| `role` | `"traveler"\|"host"\|"admin"` | Stored in custom claims + document |
| `status` | `"active"\|"disabled"` | |
| `emailVerified` | `boolean` | |
| `photoPath` | `string\|null` | Storage path |
| `referralCode` | `string\|null` | Unique code for referral programme |
| `createdAt` | `Timestamp` | |
| `updatedAt` | `Timestamp` | |
| `lastLoginAt` | `Timestamp?` | Set on session creation |

---

### `hostApplications/{applicationId}`
| Field | Type | Notes |
|---|---|---|
| `ownerUid` | `string` | Applicant UID |
| `status` | union | `submitted\|under_review\|approved\|rejected\|waitlisted` |
| `submittedAt` | `Timestamp` | |
| `communityName` | `string` | |
| `communityType` | `string` | e.g. `newsletter`, `podcast`, `social` |
| `audienceSize` | `number\|null` | |
| `communityUrl` | `string\|null` | |
| `instagramHandle` | `string\|null` | |
| `tiktokHandle` | `string\|null` | |
| `bio` | `string` | |
| `proposedDestinations` | `string[]` | Free-text wishlist |
| `hasHostedBefore` | `boolean` | |
| `previousHostingDetails` | `string\|null` | |
| `reviewedAt` | `Timestamp\|null` | |
| `reviewedByUid` | `string\|null` | Admin UID |
| `reviewNotes` | `string\|null` | |
| `createdAt` / `updatedAt` | `Timestamp` | |

---

### `hostProfiles/{hostUid}`
Document ID = host's Firebase Auth UID.

| Field | Type | Notes |
|---|---|---|
| `ownerUid` | `string` | |
| `displayName` | `string` | |
| `bio` | `string` | |
| `imagePath` | `string\|null` | Storage path |
| `status` | `PublicationStatus` | `draft\|published\|archived` |
| `instagramHandle` | `string\|null` | |
| `tiktokHandle` | `string\|null` | |
| `websiteUrl` | `string\|null` | |
| `tripsCount` | `number` | Denormalized |
| `totalTravelersHosted` | `number` | Denormalized |
| `averageRating` | `number\|null` | |
| `reviewCount` | `number` | |
| `publishedAt` | `Timestamp\|null` | |
| `createdAt` / `updatedAt` | `Timestamp` | |

---

### `destinations/{destinationId}`
| Field | Type | Notes |
|---|---|---|
| `slug` | `string` | URL-safe, unique |
| `name` | `string` | |
| `region` | `string` | e.g. `Southeast Asia` |
| `country` | `string` | |
| `countryCode` | `string` | ISO 3166-1 alpha-2 |
| `imagePath` | `string` | Storage path |
| `heroImagePath` | `string` | Storage path |
| `description` | `string` | |
| `status` | `PublicationStatus` | |
| `featuredOrder` | `number\|null` | null = not featured |
| `publishedAt` | `Timestamp\|null` | |
| `createdAt` / `updatedAt` | `Timestamp` | |

---

### `itineraries/{itineraryId}`
| Field | Type | Notes |
|---|---|---|
| `ownerUid` | `string` | Host UID |
| `destinationId` | `string` | |
| `title` | `string` | |
| `durationDays` | `number` | |
| `status` | `PublicationStatus` | |
| `days` | `ItineraryDay[]` | Embedded array of day objects |
| `publishedAt` | `Timestamp\|null` | |
| `createdAt` / `updatedAt` | `Timestamp` | |

`ItineraryDay`: `{ dayNumber, title, description, activities: ItineraryActivity[] }`  
`ItineraryActivity`: `{ title, description, durationMinutes: number\|null }`

---

### `trips/{tripId}`
| Field | Type | Notes |
|---|---|---|
| `ownerUid` | `string` | Host UID |
| `hostUid` | `string` | Denormalized for rules |
| `hostProfileId` | `string` | |
| `itineraryId` | `string` | |
| `destinationId` | `string` | |
| `slug` | `string` | URL-safe, unique |
| `title` | `string` | |
| `tagline` | `string` | |
| `status` | `PublicationStatus` | |
| `currency` | `string` | ISO 4217 |
| `basePriceCents` | `number` | Integer cents |
| `earlyBirdPriceCents` | `number\|null` | |
| `earlyBirdCutoffDate` | `Timestamp\|null` | |
| `maxGroupSize` | `number` | |
| `imagePaths` | `string[]` | Ordered Storage paths |
| `tags` | `string[]` | |
| `badgeLabel` | `string\|null` | e.g. `2 EARLY BIRDS LEFT` |
| `badgeType` | `"early"\|"hot"\|null` | |
| `publishedAt` | `Timestamp\|null` | |
| `createdAt` / `updatedAt` | `Timestamp` | |

---

### `tripDepartures/{departureId}`
| Field | Type | Notes |
|---|---|---|
| `tripId` | `string` | Parent trip |
| `ownerUid` | `string` | Host UID |
| `hostUid` | `string` | Denormalized for rules |
| `status` | `PublicationStatus` | |
| `startDate` | `Timestamp` | |
| `endDate` | `Timestamp` | |
| `capacity` | `number` | Total seats |
| `confirmedCount` | `number` | Denormalized |
| `waitlistCount` | `number` | Denormalized |
| `currency` | `string` | ISO 4217 |
| `basePriceCents` | `number` | May override trip-level price |
| `earlyBirdPriceCents` | `number\|null` | |
| `earlyBirdCutoffDate` | `Timestamp\|null` | |
| `depositPercent` | `number` | 0–100 |
| `finalBalanceDueDays` | `number` | Days before `startDate` |
| `publishedAt` | `Timestamp\|null` | |
| `createdAt` / `updatedAt` | `Timestamp` | |

---

### `interestResponses/{responseId}`
Host audience survey — not a booking. Hosts share unique survey links with
their community to gauge destination interest before proposing a specific trip.

| Field | Type | Notes |
|---|---|---|
| `ownerUid` | `string` | Host UID (survey owner) |
| `travelerUid` | `string\|null` | null for anonymous respondents |
| `surveyLinkId` | `string` | Unique survey link slug |
| `respondentEmail` | `string` | |
| `respondentName` | `string` | |
| `destinationInterests` | `string[]` | |
| `travelMonths` | `string[]` | ISO month strings, e.g. `2026-09` |
| `groupSizePreference` | `number\|null` | |
| `budgetRangeCents` | `{ min, max }\|null` | Integer cents |
| `notes` | `string` | |
| `createdAt` | `Timestamp` | |

---

### `bookings/{bookingId}`
| Field | Type | Notes |
|---|---|---|
| `travelerUid` | `string` | |
| `hostUid` | `string` | |
| `tripId` | `string` | |
| `departureId` | `string` | |
| `currency` | `string` | ISO 4217 |
| `basePriceCents` | `number` | Snapshot at booking time |
| `earlyBirdDiscountCents` | `number` | |
| `roomTypePremiumCents` | `number` | |
| `totalAmountCents` | `number` | |
| `depositAmountCents` | `number` | |
| `roomType` | `"standard"\|"private"\|"shared"\|null` | |
| `guestCount` | `number` | Seats booked |
| `status` | union | `pending_payment\|confirmed\|waitlisted\|cancelled\|refunded` |
| `cancelledAt` | `Timestamp\|null` | |
| `cancellationReason` | `string\|null` | |
| `refundAmountCents` | `number\|null` | |
| `specialRequests` | `string` | |
| `dietaryRequirements` | `string[]` | |
| `createdAt` / `updatedAt` | `Timestamp` | |

---

### `paymentSchedules/{scheduleId}`
| Field | Type | Notes |
|---|---|---|
| `bookingId` | `string` | |
| `travelerUid` / `hostUid` | `string` | |
| `tripId` / `departureId` | `string` | |
| `currency` | `string` | |
| `totalAmountCents` | `number` | |
| `installments` | `PaymentInstallment[]` | Embedded array |
| `status` | `"active"\|"complete"\|"cancelled"` | |
| `createdAt` / `updatedAt` | `Timestamp` | |

`PaymentInstallment`: `{ sequence, labelKey, amountCents, dueDate, status, paymentId\|null, paidAt\|null }`

---

### `payments/{paymentId}`
| Field | Type | Notes |
|---|---|---|
| `bookingId` / `scheduleId` | `string` | |
| `travelerUid` / `hostUid` | `string` | |
| `currency` | `string` | |
| `amountCents` | `number` | |
| `paymentType` | union | `deposit\|installment\|final_balance\|refund` |
| `status` | union | `pending\|processing\|succeeded\|failed\|refunded` |
| `stripePaymentIntentId` | `string\|null` | |
| `stripeChargeId` | `string\|null` | |
| `paidAt` | `Timestamp\|null` | |
| `failureReason` | `string\|null` | |
| `createdAt` / `updatedAt` | `Timestamp` | |

---

### `referrals/{referralId}`
| Field | Type | Notes |
|---|---|---|
| `referrerUid` | `string` | |
| `referredUid` | `string\|null` | null until referred user registers |
| `referralCode` | `string` | |
| `status` | `"pending"\|"registered"\|"credited"` | |
| `creditedAt` | `Timestamp\|null` | |
| `creditAmountCents` | `number` | |
| `currency` | `string` | |
| `createdAt` / `updatedAt` | `Timestamp` | |

---

### `supportArticles/{articleId}`
| Field | Type | Notes |
|---|---|---|
| `slug` | `string` | URL-safe, unique |
| `title` | `string` | |
| `category` | `string` | e.g. `bookings`, `payments`, `hosts` |
| `body` | `string` | Markdown |
| `status` | `PublicationStatus` | |
| `publishedAt` | `Timestamp\|null` | |
| `createdAt` / `updatedAt` | `Timestamp` | |

---

### `auditEvents/{eventId}`
| Field | Type | Notes |
|---|---|---|
| `actorUid` | `string` | UID of actor or system |
| `action` | `string` | e.g. `user.role_changed`, `booking.cancelled` |
| `targetType` | `string` | Collection name |
| `targetId` | `string` | Document ID |
| `metadata` | `Record<string, unknown>` | |
| `reason` | `string` | |
| `createdAt` | `Timestamp` | |

---

## Common ownership fields

| Field | Meaning |
|---|---|
| `ownerUid` | Generic owner UID |
| `travelerUid` | Traveler associated with a booking or payment |
| `hostUid` | Assigned host (denormalized for security rule evaluation) |
| `status` | `draft \| published \| archived` on public content documents |
| `createdAt` / `updatedAt` / `publishedAt` | Server timestamps |
