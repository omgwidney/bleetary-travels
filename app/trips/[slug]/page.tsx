import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { trips } from "@/lib/catalog";

interface TripDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return trips.map((trip) => ({ slug: trip.slug }));
}

export async function generateMetadata({
  params,
}: TripDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const trip = trips.find((candidate) => candidate.slug === slug);

  if (!trip) {
    return { title: "Trip not found — Bleetary Travels" };
  }

  return {
    title: `${trip.title} — Bleetary Travels`,
    description: `${trip.days}-day community trip to ${trip.destination}, hosted by ${trip.host.name}.`,
  };
}

export default async function TripDetailPage({
  params,
}: TripDetailPageProps) {
  const { slug } = await params;
  const trip = trips.find((candidate) => candidate.slug === slug);

  if (!trip) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main>
        <section className="relative min-h-[58vh] flex items-end overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={trip.image}
            alt={trip.destination}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 text-white">
            <p className="text-sm font-bold uppercase tracking-widest text-[#68ded9] mb-3">
              Prototype trip preview
            </p>
            <h1 className="text-4xl sm:text-6xl font-black max-w-3xl">
              {trip.title}
            </h1>
            <p className="mt-4 text-lg text-white/80">
              Hosted by {trip.host.name}
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid lg:grid-cols-[1fr_360px] gap-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900">
              Your community adventure
            </h2>
            <p className="text-gray-600 leading-relaxed mt-4 max-w-3xl">
              This Phase 0 preview confirms navigation and catalog structure.
              The complete itinerary, availability, inclusions, policies, and
              booking flow will be connected to live marketplace data in the
              next implementation phase.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              {[
                { icon: MapPin, label: trip.destination },
                { icon: Calendar, label: trip.dates },
                { icon: Clock, label: `${trip.days} days` },
                { icon: Users, label: "Community group trip" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 bg-[#f4f5f7] rounded-xl p-4"
                >
                  <Icon size={19} className="text-[#13b5b1]" />
                  <span className="text-sm font-semibold text-gray-700">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <aside className="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] h-fit">
            <p className="text-sm text-gray-500">From</p>
            <p className="text-3xl font-black text-gray-900 mt-1">
              ${trip.price.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">per traveler</p>
            <Link
              href="/coming-soon"
              className="mt-6 flex justify-center bg-[#f05c40] hover:bg-[#d94e34] text-white font-bold py-3.5 rounded-xl transition-colors"
            >
              Booking opens soon
            </Link>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
