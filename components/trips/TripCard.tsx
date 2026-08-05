import Link from "next/link";
import Image from "next/image";
import { Bird, Calendar, Clock, DollarSign, Flame, MapPin, Users } from "lucide-react";
import type { TripDocument, TripDepartureDocument, HostProfileDocument } from "@/lib/db/schema";
import { formatDateRange } from "@/lib/format";

// ─── Props ────────────────────────────────────────────────────────────────

export interface TripCardProps {
  trip: TripDocument & { id: string };
  hostProfile: Pick<HostProfileDocument, "displayName" | "imagePath">;
  /** The earliest upcoming published departure, or null if none yet. */
  departure: Pick<
    TripDepartureDocument,
    | "startDate"
    | "endDate"
    | "basePriceCents"
    | "currency"
    | "confirmedCount"
    | "capacity"
  > | null;
}

// ─── Badge ────────────────────────────────────────────────────────────────

function TripBadge({ label, type }: { label: string; type: "early" | "hot" | null }) {
  if (!label || !type) return null;
  const isHot = type === "hot";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
        isHot ? "bg-[#f05c40] text-white" : "bg-[#13b5b1] text-white"
      }`}
    >
      {isHot ? <Flame size={10} /> : <Bird size={10} />}
      {label}
    </span>
  );
}

// ─── Availability indicator ───────────────────────────────────────────────

function SpotsLeft({ confirmed, capacity }: { confirmed: number; capacity: number }) {
  const remaining = capacity - confirmed;
  if (remaining <= 0) {
    return (
      <span className="text-xs font-semibold text-[#f05c40]">Sold out</span>
    );
  }
  if (remaining <= 3) {
    return (
      <span className="text-xs font-semibold text-[#f05c40]">
        {remaining} spot{remaining === 1 ? "" : "s"} left
      </span>
    );
  }
  return (
    <span className="text-xs text-gray-500">
      {remaining} / {capacity} spots
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────

export default function TripCard({ trip, hostProfile, departure }: TripCardProps) {
  const displayPriceCents = departure?.basePriceCents ?? trip.basePriceCents;
  const heroImage = trip.imagePaths[0] ?? null;

  return (
    <article className="group bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-1">
      <Link
        href={`/trips/${trip.slug}`}
        aria-label={`View ${trip.title}`}
        className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-[#13b5b1]/40"
      >
        {/* Hero image */}
        <div className="relative h-52 overflow-hidden bg-gray-100">
          {heroImage ? (
            <Image
              src={heroImage}
              alt={trip.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <MapPin size={32} className="text-gray-400" />
            </div>
          )}

          {/* Price badge */}
          <div className="absolute bottom-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 bg-[#13b5b1] text-white font-bold text-sm px-3 py-1.5 rounded-full shadow-lg">
              <DollarSign size={13} />
              {(displayPriceCents / 100).toLocaleString()}
            </span>
          </div>

          {/* Trip badge */}
          {trip.badgeLabel && (
            <div className="absolute top-3 right-3 z-10">
              <TripBadge label={trip.badgeLabel} type={trip.badgeType} />
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="p-4 space-y-3">
          <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">
            {trip.title}
          </h3>

          {/* Departure dates */}
          {departure ? (
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <Calendar size={12} className="text-[#13b5b1] shrink-0" />
              <span>{formatDateRange(departure.startDate, departure.endDate)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-gray-400 text-xs italic">
              <Calendar size={12} className="shrink-0" />
              <span>Dates TBA</span>
            </div>
          )}

          {/* Duration + group meta */}
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-[#13b5b1]" />
                {/* derive duration from departure or itinerary days */}
                Group Trip
              </span>
              <span className="flex items-center gap-1">
                <Users size={12} className="text-[#13b5b1]" />
                {trip.maxGroupSize} max
              </span>
            </div>
            {departure && (
              <SpotsLeft
                confirmed={departure.confirmedCount}
                capacity={departure.capacity}
              />
            )}
          </div>

          {/* Host row */}
          <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
            {hostProfile.imagePath ? (
              <Image
                src={hostProfile.imagePath}
                alt={hostProfile.displayName}
                width={28}
                height={28}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-[#13b5b1]/30 shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#13b5b1]/20 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-[#13b5b1]">
                  {hostProfile.displayName[0]}
                </span>
              </div>
            )}
            <div className="text-xs text-gray-500 min-w-0">
              Hosted by{" "}
              <span className="font-semibold text-gray-800 truncate">
                {hostProfile.displayName}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
