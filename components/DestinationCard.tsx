import Link from "next/link";
import Image from "next/image";
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
      <Image
        src={destination.image}
        alt={destination.name}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10" />
      <span className="absolute bottom-3 left-3 text-white font-bold text-base z-20">
        {destination.name}
      </span>
    </Link>
  );
}
