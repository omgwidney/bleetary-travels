import Link from "next/link";
import Image from "next/image";
import {
  Bird,
  Calendar,
  Clock,
  DollarSign,
  Flame,
  MapPin,
  Users,
} from "lucide-react";
import type { Trip } from "@/lib/catalog";

function Badge({ trip }: { trip: Trip }) {
  const isHot = trip.badgeType === "hot";

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
        isHot ? "bg-[#f05c40] text-white" : "bg-[#13b5b1] text-white"
      }`}
    >
      {isHot ? <Flame size={10} /> : <Bird size={10} />}
      {trip.badge}
    </span>
  );
}

export interface TripCardProps {
  trip: Trip;
}

export default function TripCard({ trip }: TripCardProps) {
  return (
    <article className="group bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-1">
      <Link
        href={`/trips/${trip.slug}`}
        aria-label={`View ${trip.title}`}
        className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-[#13b5b1]/40"
      >
        <div className="relative h-52 overflow-hidden">
          <Image
            src={trip.image}
            alt={trip.destination}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute bottom-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 bg-[#13b5b1] text-white font-bold text-sm px-3 py-1.5 rounded-full shadow-lg">
              <DollarSign size={13} />
              {trip.price.toLocaleString()}
            </span>
          </div>
          <div className="absolute top-3 right-3 z-10">
            <Badge trip={trip} />
          </div>
        </div>

        <div className="p-4 space-y-3">
          <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">
            {trip.title}
          </h3>
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <MapPin size={12} className="text-[#13b5b1] shrink-0" />
            <span>{trip.destination}</span>
          </div>
          <div className="flex items-center gap-4 text-gray-500 text-xs">
            <span className="flex items-center gap-1">
              <Calendar size={12} className="text-[#13b5b1]" />
              {trip.dates}
            </span>
          </div>
          <div className="flex items-center gap-4 text-gray-500 text-xs">
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-[#13b5b1]" />
              {trip.days} Days
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} className="text-[#13b5b1]" />
              Group Trip
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
            <Image
              src={trip.host.avatar}
              alt={trip.host.name}
              width={28}
              height={28}
              className="w-7 h-7 rounded-full object-cover ring-2 ring-[#13b5b1]/30"
            />
            <div className="text-xs text-gray-500">
              Hosted by{" "}
              <span className="font-semibold text-gray-800">
                {trip.host.name}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
