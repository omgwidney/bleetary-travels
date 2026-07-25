import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import TripCard from "@/components/TripCard";
import TripSearch from "@/components/TripSearch";
import { filterTrips } from "@/lib/catalog";

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
  const matchingTrips = filterTrips(q, destination);

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      <SiteHeader />
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
                {matchingTrips.length === 1
                  ? "1 trip found"
                  : `${matchingTrips.length} trips found`}
              </h2>
              {(q || destination) && (
                <p className="text-sm text-gray-500 mt-1">
                  Showing the current prototype catalog.
                </p>
              )}
            </div>
            {(q || destination) && (
              <Link
                href="/trips"
                className="text-sm font-semibold text-[#0d9b97] hover:text-[#13b5b1]"
              >
                Clear filters
              </Link>
            )}
          </div>

          {matchingTrips.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchingTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
              <h2 className="text-xl font-black text-gray-900">
                No matching trips yet
              </h2>
              <p className="text-gray-500 mt-2 mb-6">
                Try another destination or view all prototype trips.
              </p>
              <Link
                href="/trips"
                className="inline-flex bg-[#f05c40] text-white font-bold px-6 py-3 rounded-full"
              >
                View all trips
              </Link>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
