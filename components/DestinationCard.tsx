import Link from "next/link";
import type { Destination } from "@/lib/catalog";

export default function DestinationCard({
  destination,
}: {
  destination: Destination;
}) {
  return (
    <Link
      href={`/trips?destination=${destination.slug}`}
      className="group relative overflow-hidden rounded-2xl aspect-square focus:outline-none focus-visible:ring-4 focus-visible:ring-[#13b5b1]/40"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={destination.image}
        alt={destination.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <span className="absolute bottom-3 left-3 text-white font-bold text-base">
        {destination.name}
      </span>
    </Link>
  );
}
