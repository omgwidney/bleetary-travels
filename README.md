# Bleetary Travels

Bleetary Travels is a community-led group travel marketplace. This repository
currently contains the Phase 0 engineering baseline plus the Phase 1 identity,
role, core-data, and Storage security foundation.

## Requirements

- Node.js 22 LTS
- npm 10 or newer
- Java 21 or newer when running the Firebase Emulator Suite
- A Firebase project with Email/Password Authentication, Firestore, and Storage

## Local setup

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

3. Replace the public Firebase placeholders and server-only Firebase Admin
   credentials for the intended development project. Preserve the escaped
   newlines in `FIREBASE_ADMIN_PRIVATE_KEY`.

4. Start Next.js:

   ```bash
   npm run dev
   ```

The application is available at [http://localhost:3000](http://localhost:3000).

## Environment strategy

- `.env.local`: developer-specific Firebase project; never committed.
- `.env.test`: deterministic non-secret values used by unit tests.
- Vercel Preview: staging Firebase values configured in project settings.
- Vercel Production: production Firebase values configured in project settings.

The application validates required public Firebase variables on initialization
and fails with a targeted configuration error when values are missing. Firebase
Admin credentials are lazy-loaded only by server routes and protected pages.

## Quality commands

```bash
npm run lint
npm run typecheck
npm run test
npm run test:rules
npm run test:e2e
npm run test:auth-e2e
npm run build
npm run check
npm run audit:production
```

`npm run check` runs lint, TypeScript, and unit/component tests. The rules and
authentication lifecycle commands start isolated Firebase emulators. Playwright
uses port 3100 for public smoke tests and 3101 for authentication tests.

## Firebase emulators

The committed `.firebaserc` uses the isolated `demo-bleetary` project ID, so
local emulator activity cannot reach a live Firebase project. Run:

```bash
npm run emulators
```

The configured local ports are:

- Emulator UI: `4000`
- Firestore: `8080`
- Authentication: `9099`
- Storage: `9199`

Set `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true` and the three emulator host
variables shown in `.env.example` when the Next.js app should use these local
services.

Firestore and Storage rules are deny-by-default. Public users can read published
content; travelers and hosts can read only records assigned to them; browsers
cannot perform admin mutations. Profile images use owner-scoped paths. Published
destination, itinerary, and content imagery is written through the protected
Admin Storage endpoint.

The complete collection and ownership contract is documented in
[`docs/firestore-schema.md`](docs/firestore-schema.md).

## Authentication and roles

- Registration creates a Firebase Email/Password account and assigns the
  `traveler` custom claim through a server endpoint.
- Email verification is required before a server session is issued.
- Session cookies are HTTP-only, SameSite Lax, Secure in production, checked for
  revocation, and expire after five days.
- `/account` requires any verified account.
- `/host/dashboard` requires `host` or `admin`.
- `/admin` requires `admin`.
- Role changes use `/api/admin/users/[uid]/role`, require an admin session and a
  reason, create an audit event, and revoke existing refresh tokens.
- Password reset and logout are fully implemented.

Firebase deliberately has no self-service first-admin path. First register and
verify the intended administrator through the application, then run the command
using that account's real email address. The bootstrap script loads `.env.local`
automatically:

```bash
BOOTSTRAP_ADMIN_EMAIL=admin@example.com npm run admin:bootstrap
```

When `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true`, the command connects to the
default local Auth and Firestore emulator ports and uses the demo project from
`.firebaserc` (or `FIREBASE_EMULATOR_PROJECT_ID` when set). For a real Firebase
project, set that flag to `false` and configure `FIREBASE_ADMIN_PROJECT_ID`,
`FIREBASE_ADMIN_CLIENT_EMAIL`, and `FIREBASE_ADMIN_PRIVATE_KEY` in `.env.local`.

The command records an audit event and revokes existing sessions. Later role
changes should use the authenticated admin endpoint.

## Current routes

- `/` — public landing page
- `/trips` — searchable prototype catalog
- `/trips/[slug]` — prototype trip preview
- `/become-a-host` — host qualification and lead form
- `/register`, `/login`, `/verify-email` — account lifecycle
- `/forgot-password`, `/reset-password` — password recovery
- `/account` — verified traveler account
- `/host/dashboard` — server-protected host dashboard
- `/admin` — server-protected core-data workspace
- `/coming-soon` — safe destination for later-phase workflows

Unknown URLs render the branded application 404.

## Continuous integration

GitHub Actions runs lint, type checking, unit/component tests, Firestore/Storage
rules tests, production build, public Chromium smoke tests, and the complete
Auth emulator lifecycle. Once a GitHub remote is connected, apply the rules in
[`.github/BRANCH_PROTECTION.md`](.github/BRANCH_PROTECTION.md) to `main`.

## Phase boundaries

Phase 1 establishes identity, roles, protected server boundaries, core
collection contracts, and image storage. It does not yet implement the Phase 2
database-backed marketplace, Phase 3 host operations, Phase 4 payments, or the
full Phase 5 administration interface.

## Dependency advisory baseline

The production audit currently reports upstream high/moderate advisories in the
latest stable Next.js and Firebase Admin dependency trees. npm offers only
force-based major downgrades for the remaining production paths, so those fixes
are not applied. CI fails on any critical production advisory, while the
remaining upstream fixes should be adopted as soon as compatible releases are
published.
