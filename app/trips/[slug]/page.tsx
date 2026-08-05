import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Check, Clock, MapPin, Users, X } from "lucide-react";
import { notFound } from "next/navigation";
import Footer from "@/components/layout/Footer";
import Nav from "@/components/layout/Nav";
import { getTripBySlug, getTripDepartures } from "@/lib/db/trips";
import { getHostProfile } from "@/lib/db/hosts";
import { getDestinationById } from "@/lib/db/destinations";
import { formatDate, formatDateRange, formatCents } from "@/lib/format";
import type { TripDepartureDocument } from "@/lib/db/schema";

// Always server-render from Firestore (ISR can be added in Phase 6)
export const dynamic = "force-dynamic";

interface TripDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: TripDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);
  if (!trip) return { title: "Trip not found — Bleetary Travels" };

  return {
    title: `${trip.title} — Bleetary Travels`,
    description: trip.tagline,
  };
}

// ─── Departure card ───────────────────────────────────────────────────────

function DepartureCard({
  departure,
}: {
  departure: TripDepartureDocument & { id: string };
}) {
  const spotsLeft = departure.capacity - departure.confirmedCount;
  const isSoldOut = spotsLeft <= 0;
  const isAlmostFull = spotsLeft > 0 && spotsLeft <= 3;
  const displayPrice = departure.basePriceCents;
  const depositCents = Math.round(
    (displayPrice * departure.depositPercent) / 100,
  );

  // Pre-compute conditional JSX to avoid unknown | null → ReactNode errors
  const earlyBirdBadge =
    departure.earlyBirdPriceCents != null &&
    departure.earlyBirdCutoffDate != null ? (
      <p className="mt-1 text-xs text-[#13b5b1] font-semibold">
        Early bird {formatCents(departure.earlyBirdPriceCents)} until{" "}
        {formatDate(departure.earlyBirdCutoffDate)}
      </p>
    ) : null;

  return (
    <div
      className={`rounded-2xl border p-5 ${
        isSoldOut
          ? "border-gray-200 bg-gray-50 opacity-60"
          : "border-[#13b5b1]/30 bg-white shadow-sm"
      }`}
    >
      <p className="font-bold text-gray-900 text-base">
        {formatDateRange(departure.startDate, departure.endDate)}
      </p>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-black text-gray-900">
          {formatCents(displayPrice)}
        </span>
        <span className="text-xs text-gray-500">per traveler</span>
      </div>

      {earlyBirdBadge}

      <p className="mt-2 text-xs text-gray-500">
        {formatCents(depositCents)} deposit to reserve your spot (
        {departure.depositPercent}%)
      </p>

      <div className="mt-3 flex items-center gap-1.5">
        <div
          className={`w-2 h-2 rounded-full ${
            isSoldOut
              ? "bg-gray-400"
              : isAlmostFull
                ? "bg-[#f05c40]"
                : "bg-green-500"
          }`}
        />
        <span
          className={`text-xs font-semibold ${
            isSoldOut
              ? "text-gray-500"
              : isAlmostFull
                ? "text-[#f05c40]"
                : "text-green-700"
          }`}
        >
          {isSoldOut
            ? "Sold out"
            : isAlmostFull
              ? `${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left`
              : `${spotsLeft} of ${departure.capacity} spots available`}
        </span>
      </div>

      <Link
        href="/coming-soon"
        className={`mt-4 flex justify-center font-bold py-3 rounded-xl transition-colors text-sm ${
          isSoldOut
            ? "bg-gray-200 text-gray-500 cursor-not-allowed pointer-events-none"
            : "bg-[#f05c40] hover:bg-[#d94e34] text-white"
        }`}
        aria-disabled={isSoldOut}
      >
        {isSoldOut ? "Sold out" : "Reserve my spot"}
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const { slug } = await params;

  // Fetch all required data in parallel
  const trip = await getTripBySlug(slug);
  if (!trip) notFound();

  const [hostProfile, departures, destination] = await Promise.all([
    getHostProfile(trip.hostUid),
    getTripDepartures(trip.id),
    getDestinationById(trip.destinationId),
  ]);

  const heroImage = trip.imagePaths[0] ?? null;
  const galleryImages = trip.imagePaths.slice(1, 4);

  // Compute duration label outside JSX (avoids unknown → ReactNode type error)
  const durationLabel = (() => {
    const dep = departures[0];
    if (!dep) return "See departures";
    const toDate = (t: unknown): Date | null => {
      if (t && typeof (t as { toDate?: () => Date }).toDate === "function")
        return (t as { toDate: () => Date }).toDate();
      return null;
    };
    const s = toDate(dep.startDate);
    const e = toDate(dep.endDate);
    if (!s || !e) return "See departures";
    const days = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} days`;
  })();

  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <main>
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative min-h-[60vh] flex items-end overflow-hidden bg-gray-900">
          {heroImage && (
            <Image
              src={heroImage}
              alt={trip.title}
              fill
              sizes="100vw"
              priority
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 text-white">
            {destination && (
              <p className="text-sm font-bold uppercase tracking-widest text-[#68ded9] mb-2 flex items-center gap-1.5">
                <MapPin size={14} />
                {destination.name}, {destination.country}
              </p>
            )}
            <h1 className="text-4xl sm:text-6xl font-black max-w-3xl leading-tight">
              {trip.title}
            </h1>
            <p className="mt-4 text-lg text-white/80 max-w-2xl">{trip.tagline}</p>

            {/* Tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              {trip.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Body ──────────────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid lg:grid-cols-[1fr_380px] gap-10 items-start">
          {/* Left column */}
          <div className="space-y-10">
            {/* Quick stats */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 bg-[#f4f5f7] rounded-xl p-4">
                <Users size={18} className="text-[#13b5b1] shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Group size</p>
                  <p className="font-bold text-gray-900">
                    Up to {trip.maxGroupSize} travelers
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#f4f5f7] rounded-xl p-4">
                <Clock size={18} className="text-[#13b5b1] shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-bold text-gray-900">
                    {durationLabel}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#f4f5f7] rounded-xl p-4">
                <Calendar size={18} className="text-[#13b5b1] shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Next departure</p>
                  <p className="font-bold text-gray-900">
                    {departures[0]
                      ? formatDate(departures[0].startDate)
                      : "TBA"}
                  </p>
                </div>
              </div>
            </div>

            {/* Host card */}
            {hostProfile && (
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-4">
                  Your Host
                </h2>
                <div className="flex items-start gap-4 bg-[#f4f5f7] rounded-2xl p-5">
                  {hostProfile.imagePath ? (
                    <Image
                      src={hostProfile.imagePath}
                      alt={hostProfile.displayName}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-[#13b5b1]/20 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#13b5b1]/20 flex items-center justify-center shrink-0">
                      <span className="text-xl font-black text-[#13b5b1]">
                        {hostProfile.displayName[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-black text-gray-900 text-lg">
                      {hostProfile.displayName}
                    </p>
                    {hostProfile.averageRating && (
                      <p className="text-sm text-[#13b5b1] font-semibold">
                        ⭐ {hostProfile.averageRating.toFixed(1)} · {hostProfile.reviewCount} reviews
                      </p>
                    )}
                    <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                      {hostProfile.bio}
                    </p>
                    <div className="mt-3 flex gap-3 text-xs text-[#13b5b1] font-semibold">
                      {hostProfile.instagramHandle && (
                        <span>{hostProfile.instagramHandle}</span>
                      )}
                      {hostProfile.tiktokHandle && (
                        <span>{hostProfile.tiktokHandle}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Photo gallery */}
            {galleryImages.length > 0 && (
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-4">
                  Gallery
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {galleryImages.map((src, i) => (
                    <div
                      key={i}
                      className="relative aspect-video rounded-xl overflow-hidden bg-gray-100"
                    >
                      <Image
                        src={src}
                        alt={`${trip.title} photo ${i + 2}`}
                        fill
                        sizes="(max-width: 640px) 50vw, 33vw"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What's included placeholder */}
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-4">
                What&apos;s included
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "All accommodation (shared twin/double)",
                  "Airport transfers",
                  "Daily breakfast",
                  "All guided excursions",
                  "Expert local guide",
                  "24/7 host support",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                {[
                  "International flights",
                  "Travel insurance",
                  "Personal expenses",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-gray-500">
                    <X size={16} className="text-gray-400 shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column — Departures sidebar */}
          <aside className="lg:sticky lg:top-6 space-y-4">
            <h2 className="text-xl font-black text-gray-900">
              Choose a departure
            </h2>

            {departures.length > 0 ? (
              departures.map((departure) => (
                <DepartureCard key={departure.id} departure={departure} />
              ))
            ) : (
              <div className="bg-[#f4f5f7] rounded-2xl p-6 text-center">
                <p className="font-bold text-gray-700">No departures yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Dates are being finalized — check back soon.
                </p>
                <Link
                  href="/coming-soon"
                  className="mt-4 inline-block text-sm font-semibold text-[#13b5b1] hover:text-[#0d9b97]"
                >
                  Get notified →
                </Link>
              </div>
            )}

            <p className="text-xs text-gray-400 text-center pt-2">
              Full booking flow opens in Phase 4 · Questions?{" "}
              <Link href="/coming-soon" className="underline">
                Contact us
              </Link>
            </p>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}
