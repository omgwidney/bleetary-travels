import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  ArrowRight,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import type { HydratedBooking } from "@/lib/db/bookings";
import { formatCents, formatDate, formatDateRange } from "@/lib/format";

interface BookingCardProps {
  bookingData: HydratedBooking;
}

export default function BookingCard({ bookingData }: BookingCardProps) {
  const { booking, trip, departure, destination, schedule } = bookingData;

  const totalCents = booking.totalAmountCents;
  const depositCents = booking.depositAmountCents;
  const balanceCents = Math.max(0, totalCents - depositCents);
  const paidPercent =
    totalCents > 0 ? Math.round((depositCents / totalCents) * 100) : 100;

  const isConfirmed = booking.status === "confirmed";

  // Find final balance installment if available
  const balanceInstallment = schedule?.installments.find(
    (i) => i.sequence === 2 || i.labelKey === "final_balance",
  );

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden space-y-6">
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isConfirmed
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <CheckCircle2 size={13} />
              <span className="capitalize">{booking.status}</span>
            </span>
            {destination && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-semibold">
                <Compass size={13} className="text-[#13b5b1]" />
                {destination.name}, {destination.country}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {trip ? trip.title : "Bleetary Community Trip"}
          </h2>
          {departure && (
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1 flex items-center gap-1.5">
              <Calendar size={14} className="text-gray-400" />
              {formatDateRange(departure.startDate, departure.endDate)}
            </p>
          )}
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Booking Total
          </p>
          <p className="text-2xl font-black text-gray-900">
            {formatCents(totalCents)}
          </p>
          <p className="text-[11px] text-gray-400">
            {booking.guestCount} traveler{booking.guestCount === 1 ? "" : "s"} • {booking.roomType} room
          </p>
        </div>
      </div>

      {/* Payment & Schedule Breakdown */}
      <div className="bg-[#f8fafc] rounded-2xl p-5 border border-gray-100 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-[#13b5b1]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-700">
              Payment Schedule & Balance
            </h3>
          </div>
          <span className="text-xs font-bold text-[#13b5b1]">
            {paidPercent}% Paid
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-gray-200/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#13b5b1] to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${paidPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Installment 1: Deposit */}
          <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-900">1. Initial Deposit</p>
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                <CheckCircle2 size={11} /> Paid via Stripe
              </p>
            </div>
            <span className="text-sm font-black text-gray-900">
              {formatCents(depositCents)}
            </span>
          </div>

          {/* Installment 2: Remaining Balance */}
          <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-900">2. Final Balance</p>
              <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                <Clock size={11} className="text-gray-400" />
                {balanceInstallment?.dueDate
                  ? `Due by ${formatDate(balanceInstallment.dueDate)}`
                  : "Due 60 days before trip"}
              </p>
            </div>
            <span className="text-sm font-black text-gray-900">
              {formatCents(balanceCents)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer action links */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span>Trip logistics and host support managed by Bleetary Travels</span>
        </div>

        {trip?.slug && (
          <Link
            href={`/trips/${trip.slug}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#13b5b1] hover:bg-[#0fa09c] text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-[0_2px_10px_rgba(19,181,177,0.3)] hover:-translate-y-0.5"
          >
            View Trip Details <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}
