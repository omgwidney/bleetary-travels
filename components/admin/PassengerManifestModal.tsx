"use client";

import { useEffect, useState } from "react";
import {
  X,
  Download,
  Users,
  Calendar,
  Loader2,
  AlertCircle,
  Utensils,
} from "lucide-react";
import type { DepartureManifestData } from "@/lib/db/admin";
import { formatCents, formatDate, formatDateRange } from "@/lib/format";

interface PassengerManifestModalProps {
  departureId: string | null;
  onClose: () => void;
}

export default function PassengerManifestModal({
  departureId,
  onClose,
}: PassengerManifestModalProps) {
  const [data, setData] = useState<DepartureManifestData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!departureId) return;

    let ignore = false;

    async function fetchManifest() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/admin/departures/${departureId}/manifest`,
        );
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to load manifest.");
        }
        const json: DepartureManifestData = await res.json();
        if (!ignore) setData(json);
      } catch (err: unknown) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Error loading manifest.",
          );
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void fetchManifest();

    return () => {
      ignore = true;
    };
  }, [departureId]);

  if (!departureId) return null;

  function exportCSV() {
    if (!departureId || !data || data.passengers.length === 0) return;

    const headers = [
      "Booking ID",
      "Traveler Name",
      "Traveler Email",
      "Guests",
      "Room Type",
      "Deposit Paid",
      "Total Price",
      "Dietary Requirements",
      "Special Requests",
      "Booked Date",
    ];

    const rows = data.passengers.map((p) => [
      `"${p.bookingId}"`,
      `"${p.travelerName}"`,
      `"${p.travelerEmail}"`,
      p.guestCount,
      `"${p.roomType}"`,
      `"${formatCents(p.depositAmountCents)}"`,
      `"${formatCents(p.totalAmountCents)}"`,
      `"${p.dietaryRequirements.join("; ")}"`,
      `"${p.specialRequests.replace(/"/g, '""')}"`,
      `"${formatDate(p.bookedAt)}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `manifest-${data.trip.slug}-${departureId.slice(0, 8)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-gray-100 my-8">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-[#fafbfc]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#13b5b1] flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900">
                Passenger Manifest
              </h2>
              <p className="text-xs text-gray-500 font-mono">
                Departure: #{departureId.slice(0, 10)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {loading && (
            <div className="py-16 text-center text-gray-500 flex flex-col items-center gap-2">
              <Loader2 size={24} className="animate-spin text-[#13b5b1]" />
              <p className="text-xs font-semibold">Loading manifest details...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && data && (
            <div className="space-y-6">
              {/* Trip & Departure Summary Card */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-gray-900">
                    {data.trip.title}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <Calendar size={13} className="text-gray-400" />
                    {formatDateRange(
                      data.departure.startDate,
                      data.departure.endDate,
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-gray-400">
                      Confirmed Seats
                    </p>
                    <p className="text-sm font-black text-gray-900">
                      {data.totalConfirmedGuests} / {data.departure.capacity}
                    </p>
                  </div>

                  <button
                    onClick={exportCSV}
                    disabled={data.passengers.length === 0}
                    className="inline-flex items-center gap-1.5 bg-[#13b5b1] hover:bg-[#0fa09c] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs disabled:opacity-50"
                  >
                    <Download size={13} />
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Passengers Table */}
              {data.passengers.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold">
                    No confirmed bookings for this departure yet.
                  </p>
                </div>
              ) : (
                <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#f8fafc] text-gray-500 uppercase tracking-wider font-bold border-b border-gray-100 sticky top-0">
                        <tr>
                          <th className="py-3 px-4">Traveler</th>
                          <th className="py-3 px-4">Guests & Room</th>
                          <th className="py-3 px-4">Paid / Total</th>
                          <th className="py-3 px-4">Dietary / Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">
                        {data.passengers.map((p) => (
                          <tr key={p.bookingId} className="hover:bg-gray-50/80">
                            <td className="py-3 px-4">
                              <p className="font-bold text-gray-900">
                                {p.travelerName}
                              </p>
                              <p className="text-[11px] text-gray-400 font-mono">
                                {p.travelerEmail}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-semibold">
                                {p.guestCount} traveler{p.guestCount === 1 ? "" : "s"}
                              </span>
                              <span className="text-[11px] text-gray-400 block capitalize">
                                {p.roomType} room
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-bold text-emerald-700">
                                {formatCents(p.depositAmountCents)}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                Total: {formatCents(p.totalAmountCents)}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              {p.dietaryRequirements.length > 0 ? (
                                <div className="flex items-center gap-1 text-[11px] text-amber-700 font-medium">
                                  <Utensils size={11} />
                                  <span>{p.dietaryRequirements.join(", ")}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-[11px]">
                                  No restrictions
                                </span>
                              )}
                              {p.specialRequests && (
                                <p className="text-[11px] text-gray-500 italic mt-0.5 max-w-xs truncate">
                                  &ldquo;{p.specialRequests}&rdquo;
                                </p>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#fafbfc] border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
