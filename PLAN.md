# Bleetary Travels Status Assessment and MVP Execution Plan

## Status Assessment

**Verdict:** the system is a polished prototype, not yet an operational travel marketplace. The documentation accurately describes the business model, but overstates the implementation as a “complete web frontend and Firebase backend pipeline.” :codex-file-citation{path="/Users/widneys/Desktop/🌍 Bleetary Travels.docx" artifact_kind="document" page_number="3"}

Currently implemented:

- A production-buildable Next.js 16 application with Tailwind, Firebase client configuration, and Bleetary branding.
- A static landing page with hero, six hard-coded trips, destination cards, search presentation, and marketing sections in [app/page.tsx](/Users/widneys/Documents/Projects/Bleetary%20Travels/bleetary-travels/app/page.tsx:16).
- A working three-step host lead form that writes submissions to `host_leads` in Firestore through [HostQuiz.tsx](/Users/widneys/Documents/Projects/Bleetary%20Travels/bleetary-travels/components/HostQuiz.tsx:1) and [firebase.ts](/Users/widneys/Documents/Projects/Bleetary%20Travels/bleetary-travels/lib/firebase.ts:1).
- A visually complete but hard-coded host dashboard in [page.tsx](/Users/widneys/Documents/Projects/Bleetary%20Travels/bleetary-travels/app/host/dashboard/page.tsx:1).
- The production build succeeds. Lint currently fails with one navigation error and one unused-import warning.
- Only `/`, `/become-a-host`, and `/host/dashboard` exist. Most displayed links lead to missing routes or `#`.
- The prototype is entirely uncommitted beyond the initial Create Next App commit.

Still missing compared with the 65 screenshots and Traveler Support reference:

- Firebase authentication, email verification, password setup/reset, protected routes, roles, and real user profiles.
- Functional trip search, filters, itinerary pages, trip details, saved trips, availability, pricing, and database-backed content.
- The full host application, approval, onboarding, profile, itinerary selection, audience survey, email list, referral, and launch workflow.
- Traveler accounts, checkout, installments, booking records, confirmations, cancellations, refunds, and payment recovery.
- An internal administration system.
- Public About, Host, Reviews, Blog, Help Center, guide capture, request-a-call, legal, and policy pages.
- Support content covering pre-booking, post-booking, safety, payments, accounts, and trip issues.
- Firebase security rules, backend validation, audit logs, automated email, tests, monitoring, analytics, and deployment configuration.

The screenshot folder should be treated as a UX and workflow reference—not as permission to copy TrovaTrip or JoinMyTrip branding, text, photography, or proprietary content.

## Execution Plan

### Phase 0 — Stabilize the prototype

- Commit the current prototype as a clearly labelled baseline.
- Fix lint, configure the correct Next.js workspace root, replace dead `#` links, and add a proper not-found experience.
- Separate reusable navigation, footer, trip-card, form, dashboard, and layout components.
- Add environment validation and create distinct local, staging, and production configurations.
- Add Vitest, React Testing Library, Playwright, Firebase Emulator Suite, CI, and branch protection.

### Phase 1 — Authentication, roles, and core data

- Implement Firebase email/password authentication with verification, password reset, and Firebase Admin session cookies.
- Introduce `traveler`, `host`, and `admin` roles using custom claims; protect host and admin routes server-side.
- Create Firestore collections for `users`, `hostApplications`, `hostProfiles`, `destinations`, `itineraries`, `trips`, `tripDepartures`, `interestResponses`, `bookings`, `paymentSchedules`, `payments`, `referrals`, `supportArticles`, and `auditEvents`.
- Add Firebase Storage for profile, itinerary, destination, and content imagery.
- Write Firestore and Storage rules so public users see only published content, hosts access only their records, and admin mutations run through trusted server endpoints.

### Phase 2 — Public marketplace

- Replace hard-coded trip data with published Firestore records.
- Build `/trips`, `/trips/[slug]`, `/destinations/[slug]`, functional filters, dates, duration, availability, pricing, host profiles, itinerary, inclusions, exclusions, FAQs, and cancellation terms.
- Make trip and destination cards navigable; preserve filters in the URL.
- Implement responsive About, Host, Help Center, Reviews, contact/request-call, privacy, terms, cancellation, safety, and community-guideline pages.
- Build a searchable support center with an admin-editable initial set of essential articles in the categories shown by the Traveler Support reference.

### Phase 3 — Complete host journey

- Expand the three-step form into a saved host application covering community, audience size, channels, monetization, destination interests, contact information, and consent.
- Add admin review states: `submitted`, `under_review`, `approved`, `rejected`, and `waitlisted`.
- On approval, send an expiring account-setup link and guide the host through password creation, onboarding, and profile completion.
- Build real host pages for dashboard, profile/account, itinerary browsing and saving, trip proposal, audience survey creation, interest responses, email import/export, referrals, and launch requests.
- Generate secure, unique public survey links and calculate the dashboard’s interest total from actual responses.
- Keep itinerary reservation and trip publication subject to admin approval.

### Phase 4 — Traveler bookings and full installments

- Use Stripe in USD. The deposit is paid through Stripe Checkout; its successful webhook creates the authoritative booking.
- Save the traveler’s payment method with explicit consent for scheduled off-session installment charges.
- Configure each departure with a deposit and dated installment schedule; snapshot that schedule onto each booking so later trip edits cannot alter existing obligations.
- Run a daily authenticated cron job that creates idempotent Stripe PaymentIntents for installments.
- On failure, retry after 3 and 7 days, notify the traveler, flag the booking for admin action, and never duplicate a charge.
- Add traveler booking pages showing participants, payment schedule, receipts, balance, forms, deadlines, and booking status.
- Support admin-initiated Stripe refunds and schedule adjustments with reason capture and audit logs.
- Track host/operator payout amounts and approval status, but send payouts manually in the MVP.

### Phase 5 — Built-in administration

- Build a protected admin dashboard for host applications, users, destinations, itineraries, departures, trips, bookings, installments, failed payments, refunds, referrals, support content, and audit history.
- Require confirmation and a reason for sensitive operations such as refunds, schedule changes, trip cancellation, publication, role changes, and payout approval.
- Add CSV exports for bookings, traveler manifests, interest responses, payment reconciliation, and payout ledgers.
- Add operational summaries for occupancy, revenue collected, outstanding balances, failed payments, host pipeline, and upcoming deadlines.

### Phase 6 — Communication, compliance, and launch

- Use Resend for verified transactional email: account setup, application status, booking confirmation, installment reminders, payment failure, refund, trip updates, and support acknowledgement.
- Add structured logging, Sentry, analytics, uptime checks, Stripe webhook alerts, and an admin-visible failed-job queue.
- Deploy the Next.js application to Vercel with Firebase and Stripe staging/production projects.
- Complete accessibility, SEO, image optimization, performance, mobile, security, and content reviews.
- Obtain legal review for terms, privacy, cancellation/refund policies, recurring payment consent, host agreements, operator agreements, and travel/insurance disclosures.
- Run a pilot using one host, one destination, one departure, and invited travelers before general launch.

## Public Interfaces and Invariants

- All writes affecting money, permissions, publication, or booking state must use authenticated server endpoints; the browser must never set roles, prices, balances, or payment status directly.
- Stripe webhooks are the payment source of truth and must be signature-verified and idempotent.
- A booking state follows `pending_payment → confirmed → payment_due/paid → completed`, with separate `cancelled` and `refunded` outcomes.
- A trip may be publicly visible only when its itinerary, departure, price, capacity, host, policies, and publication status are complete.
- Monetary values are stored as integer USD cents.
- Booking, pricing, cancellation, and payment-schedule data are snapshotted at purchase.
- Host and operator payouts remain admin-approved manual disbursements, recorded through a payout ledger.

## Test and Acceptance Plan

- Verify registration, verification, login, logout, password reset, role enforcement, and unauthorized-route blocking.
- Verify host application persistence, admin approval, setup-link expiry, onboarding, survey sharing, response counting, itinerary selection, and launch submission.
- Verify search/filter URLs, trip detail accuracy, sold-out handling, capacity concurrency, and unpublished-content protection.
- Test deposit success/failure, duplicate webhooks, installment due dates, retries, card replacement, refunds, cancellation, and reconciliation.
- Verify admin permissions and audit records for every sensitive action.
- Test email delivery and fallback handling without sending duplicate messages.
- Run unit, integration, Firebase rules, Stripe webhook, end-to-end, accessibility, responsive, production-build, and smoke tests in CI.
- Launch acceptance requires zero lint/type/build errors, no critical accessibility issues, passing payment test scenarios, reviewed legal content, backups, monitoring, and a successful pilot booking lifecycle.

## Assumptions

- Immediate target: a launchable MVP, followed by broader screenshot parity.
- Payments: Stripe in USD, assuming Bleetary has a legal entity and bank account in a Stripe-supported country.
- Traveler payments include deposits and full installment schedules.
- Host and operator payouts are recorded internally but paid manually after admin approval.
- Firebase remains the identity, database, and storage platform; Vercel hosts the Next.js application.
- Initial estimate for one experienced full-stack engineer is approximately 10–14 weeks, excluding legal review, merchant onboarding, production content entry, and operator contracting.
