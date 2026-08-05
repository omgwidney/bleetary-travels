/**
 * scripts/seed-emulator.ts
 *
 * Populates the local Firestore emulator with mock data for Phase 2 development.
 * Uses the strict types from lib/db/schema.ts.
 *
 * Usage:
 *   npm run seed
 *
 * Prerequisites:
 *   - Firebase emulators must be running (`npm run emulators`)
 *   - .env.local must contain FIRESTORE_EMULATOR_HOST and FIREBASE_ADMIN_PROJECT_ID
 */

// Load emulator env vars before any Firebase import
import { config } from "dotenv";
import { resolve } from "path";

// dotenv defaults to .env; Next.js uses .env.local for local secrets
config({ path: resolve(process.cwd(), ".env.local") });


import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp, WriteBatch } from "firebase-admin/firestore";
import type {
  DestinationDocument,
  HostProfileDocument,
  ItineraryDay,
  ItineraryDocument,
  TripDepartureDocument,
  TripDocument,
} from "@/lib/db/schema";

// ─── Emulator guard ────────────────────────────────────────────────────────

const FIRESTORE_HOST = process.env.FIRESTORE_EMULATOR_HOST;
const PROJECT_ID =
  process.env.FIREBASE_ADMIN_PROJECT_ID ??
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!FIRESTORE_HOST) {
  console.error(
    "❌  FIRESTORE_EMULATOR_HOST is not set.\n" +
      "    Make sure the emulators are running and your .env.local is loaded.",
  );
  process.exit(1);
}
if (!PROJECT_ID) {
  console.error(
    "❌  FIREBASE_ADMIN_PROJECT_ID is not set in .env.local.",
  );
  process.exit(1);
}

// ─── Firebase Admin init ──────────────────────────────────────────────────

if (!getApps().length) {
  initializeApp({ projectId: PROJECT_ID });
}
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

// ─── Helpers ──────────────────────────────────────────────────────────────

function ts(dateStr: string): Timestamp {
  return Timestamp.fromDate(new Date(dateStr));
}

const NOW = Timestamp.now();

/** Commits a batch and returns a new one — keeps us under the 500-op limit. */
function freshBatch(): WriteBatch {
  return db.batch();
}

// ─── Seed IDs (stable so the script is idempotent across wipes) ───────────

const HOST_UID_DIEM = "host-uid-diem-seed";
const HOST_UID_ZIM  = "host-uid-zim-seed";

const DEST_ID_BALI  = "dest-bali";
const DEST_ID_VUMBA = "dest-vumba-mountains";

const ITIN_ID_BALI  = "itin-bali-9-day";
const ITIN_ID_VUMBA = "itin-vumba-7-day";

const TRIP_ID_BALI     = "trip-bali-with-diem";
const TRIP_ID_VIETNAM  = "trip-vietnam-stickered-suitcase";
const TRIP_ID_VUMBA    = "trip-vumba-excursion-with-zim";

const DEP_ID_BALI    = "dep-bali-sep-2027";
const DEP_ID_VIETNAM = "dep-vietnam-feb-2027";
const DEP_ID_VUMBA   = "dep-vumba-nov-2026";

// ─── Data definitions ─────────────────────────────────────────────────────

// — Destinations —

const destinations: Array<[string, DestinationDocument]> = [
  [
    DEST_ID_BALI,
    {
      slug: "bali",
      name: "Bali",
      region: "Southeast Asia",
      country: "Indonesia",
      countryCode: "ID",
      imagePath:
        "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300&q=70",
      heroImagePath:
        "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=80",
      description:
        "A paradise island of lush rice terraces, ancient temples, white-sand beaches, and vibrant arts. Bali's warm hospitality and spiritual energy make it one of the world's most beloved destinations for group adventures.",
      status: "published",
      featuredOrder: 1,
      publishedAt: ts("2026-01-01"),
      createdAt: ts("2026-01-01"),
      updatedAt: NOW,
    },
  ],
  [
    DEST_ID_VUMBA,
    {
      slug: "vumba-mountains",
      name: "Vumba Mountains",
      region: "Africa",
      country: "Zimbabwe",
      countryCode: "ZW",
      imagePath:
        "https://images.unsplash.com/photo-1516026672322-bc52d61a9bb0?w=300&q=70",
      heroImagePath:
        "https://images.unsplash.com/photo-1516026672322-bc52d61a9bb0?w=1600&q=80",
      description:
        "The Vumba (Eastern Highlands) is a misty montane paradise on Zimbabwe's border with Mozambique. Dense afromontane forest, cloud-draped peaks, exotic orchids, and spectacular birding await — an unforgettable off-the-beaten-path destination.",
      status: "published",
      featuredOrder: 2,
      publishedAt: ts("2026-01-15"),
      createdAt: ts("2026-01-15"),
      updatedAt: NOW,
    },
  ],
];

// — Host Profiles —

const hostProfiles: Array<[string, HostProfileDocument]> = [
  [
    HOST_UID_DIEM,
    {
      ownerUid: HOST_UID_DIEM,
      displayName: "Diem N.",
      bio: "Lifestyle creator and wellness advocate. I curate immersive trips for my community — we move, explore, and grow together. Bali has a permanent place in my heart.",
      imagePath:
        "https://i.pravatar.cc/200?img=47",
      instagramHandle: "@diem.travels",
      tiktokHandle: "@diemn",
      websiteUrl: null,
      status: "published",
      publishedAt: ts("2026-02-01"),
      tripsCount: 3,
      totalTravelersHosted: 48,
      averageRating: 4.9,
      reviewCount: 42,
      createdAt: ts("2026-02-01"),
      updatedAt: NOW,
    },
  ],
  [
    HOST_UID_ZIM,
    {
      ownerUid: HOST_UID_ZIM,
      displayName: "Zim Adventures",
      bio: "Born and raised in Zimbabwe's Eastern Highlands. We lead intimate small-group excursions through the Vumba Mountains, Nyanga, and the Chimanimani range — real wilderness, no crowds.",
      imagePath:
        "https://i.pravatar.cc/200?img=52",
      instagramHandle: "@zimadventures",
      tiktokHandle: null,
      websiteUrl: "https://zimadventures.example.com",
      status: "published",
      publishedAt: ts("2026-03-01"),
      tripsCount: 5,
      totalTravelersHosted: 67,
      averageRating: 4.8,
      reviewCount: 31,
      createdAt: ts("2026-03-01"),
      updatedAt: NOW,
    },
  ],
];

// — Itineraries —

const baliDays: ItineraryDay[] = [
  {
    dayNumber: 1,
    title: "Arrive & Unwind in Seminyak",
    description: "Airport pickup, hotel check-in, welcome dinner by the sea.",
    activities: [
      { title: "Airport transfer", description: "Private coach from Ngurah Rai International Airport.", durationMinutes: 60 },
      { title: "Welcome dinner", description: "Beachside Balinese feast with the group.", durationMinutes: 120 },
    ],
  },
  {
    dayNumber: 2,
    title: "Sacred Temples & Rice Terraces",
    description: "Tanah Lot at sunrise, Jatiluwih UNESCO terraces, Batukaru temple.",
    activities: [
      { title: "Tanah Lot Sunrise", description: "Watch dawn break over the sea temple.", durationMinutes: 90 },
      { title: "Jatiluwih Trek", description: "Gentle walk through the iconic terraced rice paddies.", durationMinutes: 150 },
    ],
  },
  {
    dayNumber: 3,
    title: "Ubud Arts & Wellness",
    description: "Monkey Forest, traditional market, Balinese cooking class, sound bath.",
    activities: [
      { title: "Ubud Monkey Forest", description: "Walk among macaques in the Sacred Monkey Forest Sanctuary.", durationMinutes: 60 },
      { title: "Cooking class", description: "Learn to make nasi goreng and satay from a local chef.", durationMinutes: 180 },
    ],
  },
  {
    dayNumber: 4,
    title: "Nusa Penida Day Trip",
    description: "Ferry to Nusa Penida, Kelingking Beach, Crystal Bay snorkelling.",
    activities: [
      { title: "Kelingking Beach viewpoint", description: "Iconic T-Rex cliff walk and photo stop.", durationMinutes: 90 },
      { title: "Crystal Bay snorkel", description: "Swim with manta rays in crystal-clear waters.", durationMinutes: 120 },
    ],
  },
  {
    dayNumber: 5,
    title: "Free Day / Spa & Beach",
    description: "Unstructured day — explore independently or join optional surf lesson.",
    activities: [
      { title: "Optional: Surf lesson", description: "Beginner-friendly lesson at Seminyak Beach.", durationMinutes: 120 },
    ],
  },
  {
    dayNumber: 6,
    title: "Mount Batur Sunrise Hike",
    description: "Pre-dawn drive to Kintamani, summit trek, breakfast with a volcano view.",
    activities: [
      { title: "Batur Summit Trek", description: "Guided 2-hour ascent to the active volcano rim.", durationMinutes: 120 },
      { title: "Volcano breakfast", description: "Eggs cooked in volcanic steam — only in Bali!", durationMinutes: 60 },
    ],
  },
  {
    dayNumber: 7,
    title: "Lempuyang Temple & Candidasa",
    description: "The Gates of Heaven, east coast fishing villages, beach lunch.",
    activities: [
      { title: "Lempuyang Temple", description: "The famous Gates of Heaven mirror shot.", durationMinutes: 120 },
    ],
  },
  {
    dayNumber: 8,
    title: "Farewell & Reflection",
    description: "Morning yoga on the rooftop, final group lunch, closing circle.",
    activities: [
      { title: "Sunrise yoga", description: "Guided rooftop flow with mountain views.", durationMinutes: 75 },
      { title: "Farewell dinner", description: "Group celebration — share memories and future plans.", durationMinutes: 150 },
    ],
  },
  {
    dayNumber: 9,
    title: "Departures",
    description: "Hotel checkout and airport transfers.",
    activities: [
      { title: "Airport drop-off", description: "Transfers staggered by flight time.", durationMinutes: 60 },
    ],
  },
];

const vumbaDays: ItineraryDay[] = [
  {
    dayNumber: 1,
    title: "Fly into Harare, drive to Mutare",
    description: "Welcome briefing, overnight in Mutare before heading into the highlands.",
    activities: [
      { title: "Airport pickup in Harare", description: "Group van transfer (~3 hrs) to Mutare.", durationMinutes: 180 },
      { title: "Briefing dinner", description: "Meet your guide and fellow adventurers.", durationMinutes: 90 },
    ],
  },
  {
    dayNumber: 2,
    title: "Into the Vumba — Bunga Forest Walk",
    description: "Enter the Eastern Highlands. First trail through montane forest with a birding expert.",
    activities: [
      { title: "Bunga Forest Reserve trail", description: "4 km loop through ancient Afromontane forest.", durationMinutes: 180 },
      { title: "Birding session", description: "Spot Swynnerton's robin, starred robin, and more rarities.", durationMinutes: 60 },
    ],
  },
  {
    dayNumber: 3,
    title: "Vumba Botanical Gardens & Cloud Forest",
    description: "Explore the famous orchid-filled gardens, afternoon cloud forest hike.",
    activities: [
      { title: "Botanical Gardens", description: "Guided orchid and protea identification walk.", durationMinutes: 120 },
      { title: "Cloud forest ridge hike", description: "Rewarding summit walk with views into Mozambique.", durationMinutes: 180 },
    ],
  },
  {
    dayNumber: 4,
    title: "Zimbabwe-Mozambique Border Ridgeline",
    description: "Full-day traverse along the border ridge. Pack lunch, exceptional views.",
    activities: [
      { title: "Border Ridge Traverse", description: "15 km guided day hike — the trip highlight.", durationMinutes: 420 },
    ],
  },
  {
    dayNumber: 5,
    title: "Village Cultural Immersion",
    description: "Visit a local Shona community, traditional cooking, drumming session.",
    activities: [
      { title: "Shona village visit", description: "Meet local families, see traditional crafts.", durationMinutes: 150 },
      { title: "Marimba & drumming", description: "Hands-on music session with village musicians.", durationMinutes: 90 },
    ],
  },
  {
    dayNumber: 6,
    title: "Leopard Rock & Leisure",
    description: "Hike to Leopard Rock viewpoint, afternoon at leisure, farewell braai.",
    activities: [
      { title: "Leopard Rock hike", description: "Short but steep hike to the iconic granite outcrop.", durationMinutes: 90 },
      { title: "Farewell braai", description: "Traditional Zimbabwean barbecue under the stars.", durationMinutes: 150 },
    ],
  },
  {
    dayNumber: 7,
    title: "Return to Harare & Departures",
    description: "Morning drive back to Harare. Optional Victoria Falls extension available.",
    activities: [
      { title: "Transfer to Harare", description: "Coach returns via Mutare.", durationMinutes: 180 },
    ],
  },
];

const itineraries: Array<[string, ItineraryDocument]> = [
  [
    ITIN_ID_BALI,
    {
      ownerUid: HOST_UID_DIEM,
      destinationId: DEST_ID_BALI,
      title: "Bali: Temples, Terraces & Transformation",
      durationDays: 9,
      days: baliDays,
      status: "published",
      publishedAt: ts("2026-02-15"),
      createdAt: ts("2026-02-15"),
      updatedAt: NOW,
    },
  ],
  [
    ITIN_ID_VUMBA,
    {
      ownerUid: HOST_UID_ZIM,
      destinationId: DEST_ID_VUMBA,
      title: "Vumba Mountains: Cloud Forest Excursion",
      durationDays: 7,
      days: vumbaDays,
      status: "published",
      publishedAt: ts("2026-03-15"),
      createdAt: ts("2026-03-15"),
      updatedAt: NOW,
    },
  ],
];

// — Trips —

const trips: Array<[string, TripDocument]> = [
  [
    TRIP_ID_BALI,
    {
      ownerUid: HOST_UID_DIEM,
      hostUid: HOST_UID_DIEM,
      hostProfileId: HOST_UID_DIEM,
      itineraryId: ITIN_ID_BALI,
      destinationId: DEST_ID_BALI,
      slug: "bali-with-diem",
      title: "Bali with Diem! 🇮🇩🌴🤙",
      tagline: "Nine days of temples, rice terraces, and transformative community vibes with Diem's crew.",
      status: "published",
      publishedAt: ts("2026-03-01"),
      currency: "USD",
      basePriceCents: 199500,
      earlyBirdPriceCents: 179500,
      earlyBirdCutoffDate: ts("2026-10-01"),
      maxGroupSize: 16,
      imagePaths: [
        "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
        "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=80",
        "https://images.unsplash.com/photo-1604999333679-b86d54738315?w=800&q=80",
      ],
      tags: ["wellness", "culture", "temples", "asia", "bali"],
      badgeLabel: "2 EARLY BIRDS LEFT",
      badgeType: "early",
      createdAt: ts("2026-03-01"),
      updatedAt: NOW,
    },
  ],
  [
    TRIP_ID_VIETNAM,
    {
      ownerUid: HOST_UID_DIEM,
      hostUid: HOST_UID_DIEM,
      hostProfileId: HOST_UID_DIEM,
      itineraryId: ITIN_ID_BALI, // reusing Bali itinerary as placeholder for Vietnam
      destinationId: DEST_ID_BALI, // placeholder — Phase 2 adds Vietnam destination
      slug: "vietnam-with-the-stickered-suitcase",
      title: "Vietnam with The Stickered Suitcase",
      tagline: "Ha Long Bay, Hoi An, and Hanoi street food — seven unforgettable days in Southeast Asia.",
      status: "published",
      publishedAt: ts("2026-03-10"),
      currency: "USD",
      basePriceCents: 215000,
      earlyBirdPriceCents: 195000,
      earlyBirdCutoffDate: ts("2026-11-01"),
      maxGroupSize: 14,
      imagePaths: [
        "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80",
        "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=800&q=80",
      ],
      tags: ["culture", "food", "asia", "vietnam", "halong-bay"],
      badgeLabel: "1 EARLY BIRD LEFT",
      badgeType: "early",
      createdAt: ts("2026-03-10"),
      updatedAt: NOW,
    },
  ],
  [
    TRIP_ID_VUMBA,
    {
      ownerUid: HOST_UID_ZIM,
      hostUid: HOST_UID_ZIM,
      hostProfileId: HOST_UID_ZIM,
      itineraryId: ITIN_ID_VUMBA,
      destinationId: DEST_ID_VUMBA,
      slug: "vumba-excursion-with-zim",
      title: "Vumba Mountain Excursion 🇿🇼🌿",
      tagline: "Seven days in Zimbabwe's misty Eastern Highlands — cloud forest hikes, border ridgelines, and rare birding with expert local guides.",
      status: "published",
      publishedAt: ts("2026-04-01"),
      currency: "USD",
      basePriceCents: 185000,
      earlyBirdPriceCents: null,
      earlyBirdCutoffDate: null,
      maxGroupSize: 10,
      imagePaths: [
        "https://images.unsplash.com/photo-1516026672322-bc52d61a9bb0?w=800&q=80",
        "https://images.unsplash.com/photo-1502780402662-acc01917949e?w=800&q=80",
        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80",
      ],
      tags: ["hiking", "nature", "africa", "zimbabwe", "birding"],
      badgeLabel: "SELLING FAST",
      badgeType: "hot",
      createdAt: ts("2026-04-01"),
      updatedAt: NOW,
    },
  ],
];

// — Trip Departures —

const tripDepartures: Array<[string, TripDepartureDocument]> = [
  [
    DEP_ID_BALI,
    {
      tripId: TRIP_ID_BALI,
      ownerUid: HOST_UID_DIEM,
      hostUid: HOST_UID_DIEM,
      status: "published",
      publishedAt: ts("2026-03-01"),
      startDate: ts("2027-09-03"),
      endDate: ts("2027-09-11"),
      capacity: 16,
      confirmedCount: 14,
      waitlistCount: 3,
      currency: "USD",
      basePriceCents: 199500,
      earlyBirdPriceCents: 179500,
      earlyBirdCutoffDate: ts("2026-10-01"),
      depositPercent: 30,
      finalBalanceDueDays: 60,
      createdAt: ts("2026-03-01"),
      updatedAt: NOW,
    },
  ],
  [
    DEP_ID_VIETNAM,
    {
      tripId: TRIP_ID_VIETNAM,
      ownerUid: HOST_UID_DIEM,
      hostUid: HOST_UID_DIEM,
      status: "published",
      publishedAt: ts("2026-03-10"),
      startDate: ts("2027-02-28"),
      endDate: ts("2027-03-06"),
      capacity: 14,
      confirmedCount: 13,
      waitlistCount: 1,
      currency: "USD",
      basePriceCents: 215000,
      earlyBirdPriceCents: 195000,
      earlyBirdCutoffDate: ts("2026-11-01"),
      depositPercent: 30,
      finalBalanceDueDays: 60,
      createdAt: ts("2026-03-10"),
      updatedAt: NOW,
    },
  ],
  [
    DEP_ID_VUMBA,
    {
      tripId: TRIP_ID_VUMBA,
      ownerUid: HOST_UID_ZIM,
      hostUid: HOST_UID_ZIM,
      status: "published",
      publishedAt: ts("2026-04-01"),
      startDate: ts("2026-11-08"),
      endDate: ts("2026-11-14"),
      capacity: 10,
      confirmedCount: 7,
      waitlistCount: 0,
      currency: "USD",
      basePriceCents: 185000,
      earlyBirdPriceCents: null,
      earlyBirdCutoffDate: null,
      depositPercent: 25,
      finalBalanceDueDays: 45,
      createdAt: ts("2026-04-01"),
      updatedAt: NOW,
    },
  ],
];

// ─── Seed runner ─────────────────────────────────────────────────────────

async function deleteCollection(collectionName: string): Promise<void> {
  const snapshot = await db.collection(collectionName).get();
  if (snapshot.empty) return;
  const batch = freshBatch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  console.log(`  🗑  Deleted ${snapshot.size} existing docs from ${collectionName}`);
}

async function seed() {
  console.log(`\n🌱  Seeding Firestore emulator at ${FIRESTORE_HOST} (project: ${PROJECT_ID})\n`);

  // Wipe existing seed data
  console.log("Wiping existing collections...");
  await Promise.all([
    deleteCollection("destinations"),
    deleteCollection("hostProfiles"),
    deleteCollection("itineraries"),
    deleteCollection("trips"),
    deleteCollection("tripDepartures"),
  ]);

  // Write new data
  const batch1 = freshBatch();

  for (const [id, data] of destinations) {
    batch1.set(db.collection("destinations").doc(id), data);
  }
  for (const [id, data] of hostProfiles) {
    batch1.set(db.collection("hostProfiles").doc(id), data);
  }
  for (const [id, data] of itineraries) {
    batch1.set(db.collection("itineraries").doc(id), data);
  }
  await batch1.commit();

  const batch2 = freshBatch();
  for (const [id, data] of trips) {
    batch2.set(db.collection("trips").doc(id), data);
  }
  for (const [id, data] of tripDepartures) {
    batch2.set(db.collection("tripDepartures").doc(id), data);
  }
  await batch2.commit();

  // Summary
  console.log("\n✅  Seed complete!\n");
  console.log("Collection          Docs");
  console.log("──────────────────  ────");
  console.log(`destinations        ${destinations.length}`);
  console.log(`hostProfiles        ${hostProfiles.length}`);
  console.log(`itineraries         ${itineraries.length}`);
  console.log(`trips               ${trips.length}`);
  console.log(`tripDepartures      ${tripDepartures.length}`);
  console.log(
    `\n🔗  Emulator UI: http://127.0.0.1:4000/firestore\n`,
  );
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
