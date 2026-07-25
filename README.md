# Bleetary Travels

Bleetary Travels is a community-led group travel marketplace. This repository
currently contains the Phase 0 engineering baseline: the public prototype, host
lead quiz, host dashboard preview, shared UI primitives, a static searchable
catalog, Firebase client integration, and local/CI quality tooling.

## Requirements

- Node.js 22 LTS
- npm 10 or newer
- Java 21 or newer when running the Firebase Emulator Suite
- A Firebase web application for live lead collection

## Local setup

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

3. Replace every Firebase placeholder in `.env.local` with the web SDK values
   for the intended development project.

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
and fails with a targeted configuration error when values are missing.

## Quality commands

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run check
```

`npm run check` runs lint, TypeScript, and unit/component tests. Playwright
starts the app on port 3100 for browser smoke tests.

## Firebase emulators

Copy `.firebaserc.example` to `.firebaserc`, replace the project ID, then run:

```bash
npm run emulators
```

The configured local ports are:

- Emulator UI: `4000`
- Firestore: `8080`
- Authentication: `9099`
- Storage: `9199`

The Phase 0 Firestore rules allow validated public creation of `host_leads` and
deny all other client access. Storage is denied until authenticated asset flows
are implemented.

## Current routes

- `/` — public landing page
- `/trips` — searchable prototype catalog
- `/trips/[slug]` — prototype trip preview
- `/become-a-host` — host qualification and lead form
- `/host/dashboard` — host dashboard preview
- `/coming-soon` — safe destination for later-phase workflows

Unknown URLs render the branded application 404.

## Continuous integration

GitHub Actions runs lint, type checking, unit/component tests, production build,
and Chromium smoke tests. Once a GitHub remote is connected, apply the rules in
[`.github/BRANCH_PROTECTION.md`](.github/BRANCH_PROTECTION.md) to `main`.

## Phase boundaries

Phase 0 deliberately does not claim production authentication, booking,
payments, host operations, or administration. Those workflows remain visible
as previews or route to the coming-soon page until their server-side contracts
and security controls are implemented.
