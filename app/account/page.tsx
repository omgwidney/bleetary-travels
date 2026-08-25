import { Suspense } from "react";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import LogoutButton from "@/components/auth/LogoutButton";
import { requireSession } from "@/lib/auth/session";
import { getHydratedUserBookings } from "@/lib/db/bookings";
import BookingCard from "@/components/account/BookingCard";
import BookingSuccessAlert from "@/components/account/BookingSuccessAlert";
import { Compass, Sparkles } from "lucide-react";

export default async function AccountPage() {
  const session = await requireSession("/account");
  const bookings = await getHydratedUserBookings(session.uid);

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col justify-between">
      <Nav />
      <main className="mx-auto max-w-5xl w-full px-4 py-8 sm:py-12 sm:px-6 space-y-8 flex-1">
        {/* Booking success alert from Stripe redirect */}
        <Suspense fallback={null}>
          <BookingSuccessAlert />
        </Suspense>

        {/* User Account Overview */}
        <section className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#13b5b1]">
                {session.role} account
              </p>
              <h1 className="mt-1 text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                Welcome, {session.displayName}
              </h1>
              <p className="mt-1 text-sm text-gray-500">{session.email}</p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {session.role === "host" && (
                <Link
                  href="/host/dashboard"
                  className="rounded-xl bg-[#13b5b1] hover:bg-[#0fa09c] px-4 py-2.5 text-xs font-bold text-white transition-all shadow-sm"
                >
                  Host Dashboard
                </Link>
              )}
              {session.role === "admin" && (
                <Link
                  href="/admin"
                  className="rounded-xl bg-[#13b5b1] hover:bg-[#0fa09c] px-4 py-2.5 text-xs font-bold text-white transition-all shadow-sm"
                >
                  Admin Workspace
                </Link>
              )}
              {session.role === "traveler" && (
                <Link
                  href="/become-a-host"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 px-4 py-2.5 text-xs font-bold transition-all"
                >
                  <Sparkles size={13} className="text-[#13b5b1]" />
                  Become a Host
                </Link>
              )}
              <LogoutButton className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors" />
            </div>
          </div>
        </section>

        {/* Bookings & Itineraries Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Your Booked Trips & Itineraries
            </h2>
            <span className="text-xs font-bold text-gray-400">
              {bookings.length} {bookings.length === 1 ? "trip" : "trips"}
            </span>
          </div>

          {bookings.length > 0 ? (
            <div className="space-y-6">
              {bookings.map((bookingData) => (
                <BookingCard
                  key={bookingData.booking.id}
                  bookingData={bookingData}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-gray-100 bg-white p-8 sm:p-12 text-center shadow-sm space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#13b5b1] flex items-center justify-center mx-auto">
                <Compass size={28} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  No upcoming trips booked yet
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mt-1">
                  Ready to travel with your favorite communities and creators? Explore our featured departures worldwide.
                </p>
              </div>
              <Link
                href="/trips"
                className="inline-flex items-center gap-2 rounded-xl bg-[#f05c40] hover:bg-[#d94e34] text-white px-6 py-3 text-xs font-bold shadow-[0_4px_14px_rgba(240,92,64,0.3)] hover:-translate-y-0.5 transition-all"
              >
                Browse Upcoming Trips
              </Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
