# Firestore core data contract

Firestore creates collections when their first document is written. Phase 1
defines the collection names, ownership fields, publication states, server
mutation boundaries, and security rules. Empty placeholder documents are not
created because they pollute production queries.

| Collection | Primary access contract |
| --- | --- |
| `users` | User can read their record; server controls role and status |
| `hostApplications` | Applicant can read their own submission |
| `hostProfiles` | Published profiles are public; host can read their own draft |
| `destinations` | Published documents are public |
| `itineraries` | Published documents are public; assigned host can read drafts |
| `trips` | Published documents are public; assigned host can read drafts |
| `tripDepartures` | Published documents are public; assigned host can read drafts |
| `interestResponses` | Traveler/respondent and assigned host can read |
| `bookings` | Traveler and assigned host can read |
| `paymentSchedules` | Traveler and assigned host can read |
| `payments` | Traveler and assigned host can read |
| `referrals` | Referrer and referred account can read |
| `supportArticles` | Published documents are public |
| `auditEvents` | Admin read only |

All client writes to these collections are denied. Server endpoints use the
Firebase Admin SDK, validate authorization and input, and bypass client rules.
The public `host_leads` create contract remains available for the Phase 0 lead
quiz.

Common ownership fields:

- `ownerUid`: generic owner
- `travelerUid`: traveler account associated with a booking/payment record
- `hostUid`: assigned host
- `status`: publication status (`draft`, `published`, `archived`) on public
  content
- `createdAt`, `updatedAt`, `publishedAt`: server timestamps
