export type TripBadgeType = "early" | "hot";

export interface Trip {
  id: number;
  slug: string;
  title: string;
  destination: string;
  destinationSlug: string;
  image: string;
  dates: string;
  days: number;
  price: number;
  badge: string;
  badgeType: TripBadgeType;
  host: {
    name: string;
    avatar: string;
  };
}

export interface Destination {
  name: string;
  slug: string;
  image: string;
}

export const trips: Trip[] = [
  {
    id: 1,
    slug: "bali-with-diem",
    title: "Bali with Diem! 🇮🇩🌴🤙",
    destination: "Bali, Indonesia",
    destinationSlug: "bali",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
    dates: "Sep 3 – Sep 11, 2027",
    days: 9,
    price: 1995,
    badge: "2 EARLY BIRDS LEFT",
    badgeType: "early",
    host: { name: "Diem N.", avatar: "https://i.pravatar.cc/40?img=47" },
  },
  {
    id: 2,
    slug: "vietnam-with-the-stickered-suitcase",
    title: "Vietnam with The Stickered Suitcase",
    destination: "Ha Long Bay, Vietnam",
    destinationSlug: "vietnam",
    image:
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80",
    dates: "Feb 28 – Mar 6, 2027",
    days: 7,
    price: 2150,
    badge: "1 EARLY BIRD LEFT",
    badgeType: "early",
    host: { name: "Stickered S.", avatar: "https://i.pravatar.cc/40?img=12" },
  },
  {
    id: 3,
    slug: "thailand-with-rhythm",
    title: "Thailand with Rhythm!",
    destination: "Koh Lanta, Thailand",
    destinationSlug: "thailand",
    image:
      "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=600&q=80",
    dates: "Nov 4 – Nov 10, 2026",
    days: 7,
    price: 2150,
    badge: "SELLING FAST",
    badgeType: "hot",
    host: { name: "Rhythm J.", avatar: "https://i.pravatar.cc/40?img=33" },
  },
  {
    id: 4,
    slug: "banff-with-ilaria-reed",
    title: "Banff 2.0 with Ilaria Reed",
    destination: "Banff, Canada",
    destinationSlug: "canada",
    image:
      "https://images.unsplash.com/photo-1444492417251-9c84a5fa18e0?w=600&q=80",
    dates: "Aug 26 – Aug 31, 2027",
    days: 6,
    price: 2250,
    badge: "2 EARLY BIRDS LEFT",
    badgeType: "early",
    host: { name: "Ilaria R.", avatar: "https://i.pravatar.cc/40?img=5" },
  },
  {
    id: 5,
    slug: "explore-albania-with-becx",
    title: "Explore Albania with Becx",
    destination: "Riviera, Albania",
    destinationSlug: "albania",
    image:
      "https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=600&q=80",
    dates: "Jun 26 – Jul 3, 2027",
    days: 8,
    price: 2425,
    badge: "2 EARLY BIRDS LEFT",
    badgeType: "early",
    host: { name: "Becx T.", avatar: "https://i.pravatar.cc/40?img=9" },
  },
  {
    id: 6,
    slug: "patagonia-retreat-among-peaks",
    title: "Patagonia: Retreat Among Peaks",
    destination: "El Calafate, Argentina",
    destinationSlug: "argentina",
    image:
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80",
    dates: "Mar 14 – Mar 21, 2027",
    days: 8,
    price: 3100,
    badge: "SELLING FAST",
    badgeType: "hot",
    host: { name: "Marco V.", avatar: "https://i.pravatar.cc/40?img=60" },
  },
];

export const destinations: Destination[] = [
  {
    name: "Bali",
    slug: "bali",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300&q=70",
  },
  {
    name: "Thailand",
    slug: "thailand",
    image:
      "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=300&q=70",
  },
  {
    name: "Canada",
    slug: "canada",
    image:
      "https://images.unsplash.com/photo-1516592673884-4a382d1124c2?w=300&q=70",
  },
  {
    name: "Italy",
    slug: "italy",
    image:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=300&q=70",
  },
  {
    name: "Peru",
    slug: "peru",
    image:
      "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=300&q=70",
  },
  {
    name: "Japan",
    slug: "japan",
    image:
      "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=300&q=70",
  },
];

export function filterTrips(query?: string, destination?: string): Trip[] {
  const normalizedQuery = query?.trim().toLowerCase();
  const normalizedDestination = destination?.trim().toLowerCase();

  return trips.filter((trip) => {
    const matchesQuery =
      !normalizedQuery ||
      trip.title.toLowerCase().includes(normalizedQuery) ||
      trip.destination.toLowerCase().includes(normalizedQuery);
    const matchesDestination =
      !normalizedDestination ||
      trip.destinationSlug === normalizedDestination ||
      trip.destination.toLowerCase().includes(normalizedDestination);

    return matchesQuery && matchesDestination;
  });
}
