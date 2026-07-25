import Link from "next/link";
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Users,
  DollarSign,
  ChevronRight,
  Flame,
  Bird,
} from "lucide-react";

// ─── Data ───────────────────────────────────────────────────────────────────

const TRIPS = [
  {
    id: 1,
    title: "Bali with Diem! 🇮🇩🌴🤙",
    destination: "Bali, Indonesia",
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
    title: "Vietnam with The Stickered Suitcase",
    destination: "Ha Long Bay, Vietnam",
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
    title: "Thailand with Rhythm!",
    destination: "Koh Lanta, Thailand",
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
    title: "Banff 2.0 with Ilaria Reed",
    destination: "Banff, Canada",
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
    title: "Explore Albania with Becx",
    destination: "Riviera, Albania",
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
    title: "Patagonia: Retreat Among Peaks",
    destination: "El Calafate, Argentina",
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

const DESTINATIONS = [
  { name: "Bali", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300&q=70" },
  { name: "Thailand", img: "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=300&q=70" },
  { name: "Canada", img: "https://images.unsplash.com/photo-1516592673884-4a382d1124c2?w=300&q=70" },
  { name: "Italy", img: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=300&q=70" },
  { name: "Peru", img: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=300&q=70" },
  { name: "Japan", img: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=300&q=70" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function Badge({ type, label }: { type: string; label: string }) {
  const isHot = type === "hot";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
        isHot
          ? "bg-[#f05c40] text-white"
          : "bg-[#13b5b1] text-white"
      }`}
    >
      {isHot ? <Flame size={10} /> : <Bird size={10} />}
      {label}
    </span>
  );
}

function TripCard({ trip }: { trip: (typeof TRIPS)[0] }) {
  return (
    <article className="group bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-1 cursor-pointer">
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={trip.image}
          alt={trip.destination}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Price pill */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 bg-[#13b5b1] text-white font-bold text-sm px-3 py-1.5 rounded-full shadow-lg">
            <DollarSign size={13} />
            {trip.price.toLocaleString()}
          </span>
        </div>
        {/* Badge */}
        <div className="absolute top-3 right-3">
          <Badge type={trip.badgeType} label={trip.badge} />
        </div>
      </div>

      {/* Content */}
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

        {/* Host row */}
        <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={trip.host.avatar}
            alt={trip.host.name}
            className="w-7 h-7 rounded-full object-cover ring-2 ring-[#13b5b1]/30"
          />
          <div className="text-xs text-gray-500">
            Hosted by{" "}
            <span className="font-semibold text-gray-800">{trip.host.name}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function DestinationCard({ name, img }: { name: string; img: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl aspect-square cursor-pointer">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img}
        alt={name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <p className="absolute bottom-3 left-3 text-white font-bold text-base">{name}</p>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-[Inter,sans-serif]">
      {/* ── Sticky Navbar ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#13b5b1] to-[#0d9b97] flex items-center justify-center">
              <MapPin size={16} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900">
              bleetary<span className="text-[#13b5b1]">.</span>
            </span>
          </Link>

          {/* Center nav */}
          <div className="hidden md:flex items-center gap-8">
            {["Travel", "Host", "About", "Blog"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-sm font-medium text-gray-700 hover:text-[#13b5b1] transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:block text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/become-a-host"
              id="nav-become-host-cta"
              className="inline-flex items-center gap-1.5 bg-[#f05c40] hover:bg-[#d94e34] text-white text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200 shadow-[0_4px_14px_rgba(240,92,64,0.35)] hover:shadow-[0_6px_20px_rgba(240,92,64,0.45)] hover:-translate-y-0.5"
            >
              Become a Host
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative min-h-[88vh] flex flex-col items-start justify-center bg-gray-900">
        {/* Cinematic background video placeholder */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80"
          >
            {/* Drop an .mp4 asset at /public/hero.mp4 to activate */}
            <source src="/hero.mp4" type="video/mp4" />
          </video>
          {/* Fallback image is the poster — gradient overlay */}
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

        {/* Hero copy */}
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
              From fitness crews to foodies to fandoms — there&apos;s a Bleetary
              trip made for you.
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

      {/* ── Search / Filter bar — sits between hero and trips, overlaps both ── */}
      <div className="relative z-20 -mt-10 px-4 sm:px-6 mb-0">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Where to */}
            <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 hover:border-[#13b5b1] focus-within:border-[#13b5b1] transition-colors">
              <Search size={18} className="text-gray-400 shrink-0" />
              <input
                id="search-destination"
                type="text"
                placeholder="Where to?"
                className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 outline-none bg-transparent"
              />
            </div>

            {/* Date picker */}
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 hover:border-[#13b5b1] transition-colors cursor-pointer sm:min-w-[150px]">
              <Calendar size={18} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-400">Pick dates</span>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 hover:border-[#13b5b1] transition-colors cursor-pointer sm:min-w-[130px]">
              <Clock size={18} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-400">Duration</span>
            </div>

            {/* Search CTA */}
            <button
              id="search-trips-btn"
              className="flex items-center justify-center gap-2 bg-[#f05c40] hover:bg-[#d94e34] text-white font-bold px-6 py-3 rounded-xl text-sm transition-all duration-200 shadow-[0_4px_14px_rgba(240,92,64,0.35)] hover:shadow-[0_6px_20px_rgba(240,92,64,0.45)] whitespace-nowrap"
            >
              <Search size={16} />
              Find a Trip
            </button>
          </div>
        </div>
      </div>

      {/* ── Trending Group Trips ── */}
      <section className="bg-[#f4f5f7] py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
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

          {/* Trip card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TRIPS.map((trip) => (
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

      {/* ── Explore Destinations ── */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900">
              Explore Destinations
            </h2>
            <p className="text-gray-500 mt-1">Find your people, everywhere in the world</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {DESTINATIONS.map((d) => (
              <DestinationCard key={d.name} name={d.name} img={d.img} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Become a Host CTA Banner ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0d9b97] to-[#13b5b1] py-20 px-4 sm:px-6">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
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

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-10">
            <div className="sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-[#13b5b1] flex items-center justify-center">
                  <MapPin size={14} className="text-white" />
                </div>
                <span className="text-xl font-black text-white">
                  bleetary<span className="text-[#13b5b1]">.</span>
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Group travel for every community. Find your adventure.
              </p>
            </div>
            {[
              { heading: "Travel", links: ["Find a Trip", "Destinations", "Reviews", "Blog"] },
              { heading: "Host", links: ["Become a Host", "Host Dashboard", "Refer a Host", "Resources"] },
              { heading: "Company", links: ["About", "Careers", "Press", "Help Center"] },
            ].map((col) => (
              <div key={col.heading}>
                <h4 className="text-white font-bold text-sm mb-3">{col.heading}</h4>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <Link
                        href="#"
                        className="text-sm text-gray-500 hover:text-[#13b5b1] transition-colors"
                      >
                        {l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} Bleetary Travels. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs text-gray-600">
              <Link href="#" className="hover:text-gray-400 transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-gray-400 transition-colors">Terms</Link>
              <Link href="#" className="hover:text-gray-400 transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
