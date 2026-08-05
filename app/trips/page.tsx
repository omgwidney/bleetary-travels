import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import Nav from "@/components/layout/Nav";
import TripCard from "@/components/trips/TripCard";
import TripSearch from "@/components/TripSearch";
import { getPublishedTrips, getTripDepartures } from "@/lib/db/trips";
import { getHostProfile } from "@/lib/db/hosts";

// Always re-render so search params are always fresh
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Group Trips — Bleetary Travels",
  description: "Browse community-led group trips around the world.",
};

interface TripsPageProps {
  searchParams: Promise<{
    q?: string;
    destination?: string;
  }>;
}

export default async function TripsPage({ searchParams }: TripsPageProps) {
  const { q, destination } = await searchParams;

  // Fetch all published trips from Firestore server-side
  const allTrips = await getPublishedTrips();

  // In-memory filter by text query and/or destination slug
  const normalizedQuery = q?.trim().toLowerCase();
  const normalizedDestination = destination?.trim().toLowerCase();

  const matchingTrips = allTrips.filter((trip) => {
    const matchesQuery =
      !normalizedQuery ||
      trip.title.toLowerCase().includes(normalizedQuery) ||
      trip.tagline.toLowerCase().includes(normalizedQuery) ||
      trip.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

    const matchesDestination =
      !normalizedDestination ||
      trip.slug.toLowerCase().includes(normalizedDestination) ||
      trip.tags.some((tag) => tag.toLowerCase().includes(normalizedDestination));

    return matchesQuery && matchesDestination;
  });

  // Fetch host profiles and departures for each matching trip in parallel
  const tripData = await Promise.all(
    matchingTrips.map(async (trip) => {
      const [hostProfile, departures] = await Promise.all([
        getHostProfile(trip.hostUid),
        getTripDepartures(trip.id),
      ]);
      return {
        trip,
        hostProfile: hostProfile ?? {
          displayName: "Bleetary Host",
          imagePath: null,
        },
        departure: departures[0] ?? null,
      };
    }),
  );

  const resultLabel =
    matchingTrips.length === 1 ? "1 trip found" : `${matchingTrips.length} trips found`;

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      <Nav />
      <main>
        <section className="bg-gradient-to-br from-[#0d9b97] to-[#13b5b1] px-4 sm:px-6 py-16 text-center text-white">
          <p className="text-sm font-bold uppercase tracking-widest text-white/70 mb-3">
            Community-led adventures
          </p>
          <h1 className="text-4xl sm:text-5xl font-black">
            Find your next group trip
          </h1>
          <p className="max-w-2xl mx-auto mt-4 text-white/80">
            Travel with people who share your interests, led by hosts you can
            trust.
          </p>
        </section>

        <section className="relative z-10 -mt-8 px-4 sm:px-6">
          <TripSearch defaultQuery={q} />
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                {resultLabel}
              </h2>
              {(q || destination) && (
                <p className="text-sm text-gray-500 mt-1">
                  {q && <span>Search: &ldquo;{q}&rdquo;</span>}
                  {q && destination && <span className="mx-1">·</span>}
                  {destination && <span>Destination: {destination}</span>}
                </p>
              )}
            </div>
            {(q || destination) && (
              <Link
                href="/trips"
                className="text-sm font-semibold text-[#0d9b97] hover:text-[#13b5b1] whitespace-nowrap"
              >
                Clear filters
              </Link>
            )}
          </div>

          {tripData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tripData.map(({ trip, hostProfile, departure }) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  hostProfile={hostProfile}
                  departure={departure}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
              <h2 className="text-xl font-black text-gray-900">
                No trips found
              </h2>
              <p className="text-gray-500 mt-2 mb-6">
                Try a different search term or browse all available trips.
              </p>
              <Link
                href="/trips"
                className="inline-flex bg-[#f05c40] text-white font-bold px-6 py-3 rounded-full hover:bg-[#d94e34] transition-colors"
              >
                View all trips
              </Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
