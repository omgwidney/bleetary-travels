import Link from "next/link";
import { ChevronRight } from "lucide-react";
import DestinationCard from "@/components/DestinationCard";
import Footer from "@/components/layout/Footer";
import Nav from "@/components/layout/Nav";
import TripCard from "@/components/trips/TripCard";
import TripSearch from "@/components/TripSearch";
import { destinations, trips } from "@/lib/catalog";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      <main>
        <section className="relative min-h-[88vh] flex flex-col items-start justify-center bg-gray-900">
          <div className="absolute inset-0 z-0">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-black/20" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pt-16 pb-32">
            <div className="max-w-xl">
              <p className="text-[#13b5b1] font-semibold text-sm uppercase tracking-widest mb-3">
                Community-Led Adventures
              </p>
              <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-4">
                Group Travel for{" "}
                <span className="text-[#f05c40]">Every Community</span>
              </h1>
              <p className="text-gray-200 text-lg leading-relaxed mb-8 max-w-md">
                From fitness crews to foodies to fandoms — there&apos;s a
                Bleetary trip made for you.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/trips"
                  id="hero-book-trip-cta"
                  className="inline-flex items-center gap-2 bg-[#f05c40] hover:bg-[#d94e34] text-white font-bold px-7 py-3.5 rounded-full text-base transition-all duration-200 shadow-[0_4px_20px_rgba(240,92,64,0.45)] hover:shadow-[0_6px_28px_rgba(240,92,64,0.55)] hover:-translate-y-0.5"
                >
                  Book a Trip
                </Link>
                <Link
                  href="/become-a-host"
                  id="hero-host-trip-cta"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/40 text-white font-bold px-7 py-3.5 rounded-full text-base backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5"
                >
                  Host a Trip
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="relative z-20 -mt-10 px-4 sm:px-6">
          <TripSearch />
        </div>

        <section className="bg-[#f4f5f7] py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-gray-900">
                  Trending Group Trips
                </h2>
                <p className="text-gray-500 mt-1 text-base">
                  Community-led adventures filling up fast
                </p>
              </div>
              <Link
                href="/trips"
                className="hidden sm:inline-flex items-center gap-1 text-[#13b5b1] font-semibold text-sm hover:text-[#0d9b97] transition-colors"
              >
                View All Trips <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>

            <div className="mt-8 flex justify-center sm:hidden">
              <Link
                href="/trips"
                className="inline-flex items-center gap-1 text-[#13b5b1] font-semibold text-sm border border-[#13b5b1] px-5 py-2.5 rounded-full hover:bg-[#13b5b1] hover:text-white transition-all"
              >
                View All Trips <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-gray-900">
                Explore Destinations
              </h2>
              <p className="text-gray-500 mt-1">
                Find your people, everywhere in the world
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {destinations.map((destination) => (
                <DestinationCard
                  key={destination.slug}
                  destination={destination}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-gradient-to-br from-[#0d9b97] to-[#13b5b1] py-20 px-4 sm:px-6">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-3">
              Turn your community into an adventure
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
              Host a Trip. Earn $1,000+.
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              We handle the logistics. You bring your community. Start earning
              while doing what you love.
            </p>
            <Link
              href="/become-a-host"
              id="banner-become-host-cta"
              className="inline-flex items-center gap-2 bg-[#f05c40] hover:bg-[#d94e34] text-white font-black px-8 py-4 rounded-full text-lg transition-all duration-200 shadow-[0_6px_24px_rgba(240,92,64,0.5)] hover:shadow-[0_8px_32px_rgba(240,92,64,0.6)] hover:-translate-y-1"
            >
              Become a Host <ChevronRight size={20} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
