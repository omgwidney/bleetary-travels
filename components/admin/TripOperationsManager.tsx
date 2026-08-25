"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Compass,
  ExternalLink,
  Users,
  Loader2,
} from "lucide-react";
import type { AdminTripRow } from "@/lib/db/admin";
import type { PublicationStatus } from "@/lib/db/schema";
import { formatCents } from "@/lib/format";

interface TripOperationsManagerProps {
  initialTrips: AdminTripRow[];
  onOpenManifest: (departureId: string) => void;
}

export default function TripOperationsManager({
  initialTrips,
  onOpenManifest,
}: TripOperationsManagerProps) {
  const [trips, setTrips] = useState(initialTrips);
  const [updatingTripId, setUpdatingTripId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = trips.filter((t) =>
    statusFilter === "all" ? true : t.status === statusFilter,
  );

  async function handleStatusChange(tripId: string, newStatus: PublicationStatus) {
    setUpdatingTripId(tripId);
    try {
      const res = await fetch(`/api/admin/trips/${tripId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update trip status.");
      }

      setTrips((prev) =>
        prev.map((t) => (t.id === tripId ? { ...t, status: newStatus } : t)),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error updating trip status");
    } finally {
      setUpdatingTripId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls & Filter */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 bg-white p-1 rounded-2xl border border-gray-200/80 shadow-xs">
          {["all", "published", "draft", "archived"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl capitalize transition-all ${
                statusFilter === status
                  ? "bg-[#13b5b1] text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <span className="text-xs text-gray-400 font-semibold">
          {filtered.length} {filtered.length === 1 ? "trip" : "trips"}
        </span>
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Compass size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-bold text-gray-800">No trips found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#f8fafc] text-gray-400 uppercase tracking-wider font-bold border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-6">Trip Title & Slug</th>
                  <th className="py-3.5 px-6">Host</th>
                  <th className="py-3.5 px-6">Price</th>
                  <th className="py-3.5 px-6">Departures / Bookings</th>
                  <th className="py-3.5 px-6">Publication Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">
                {filtered.map((trip) => {
                  const isUpdating = updatingTripId === trip.id;
                  return (
                    <tr
                      key={trip.id}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-gray-900 text-sm">
                            {trip.title}
                          </span>
                          <Link
                            href={`/trips/${trip.slug}`}
                            target="_blank"
                            className="text-gray-400 hover:text-[#13b5b1]"
                            title="Preview trip page"
                          >
                            <ExternalLink size={13} />
                          </Link>
                        </div>
                        <p className="text-[11px] text-gray-400 font-mono">
                          /{trip.slug}
                        </p>
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-800">
                        {trip.hostName || "Bleetary Host"}
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-900">
                        {formatCents(trip.basePriceCents)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-gray-900">
                          {trip.departuresCount} departure{trip.departuresCount === 1 ? "" : "s"}
                        </span>
                        <p className="text-[11px] text-emerald-600 font-medium">
                          {trip.totalConfirmedBookings} confirmed traveler{trip.totalConfirmedBookings === 1 ? "" : "s"}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-1.5">
                          {isUpdating ? (
                            <Loader2
                              size={14}
                              className="animate-spin text-[#13b5b1]"
                            />
                          ) : (
                            <select
                              value={trip.status}
                              disabled={isUpdating}
                              onChange={(e) =>
                                handleStatusChange(
                                  trip.id,
                                  e.target.value as PublicationStatus,
                                )
                              }
                              className={`text-xs font-bold px-2.5 py-1 rounded-xl border appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#13b5b1] ${
                                trip.status === "published"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : trip.status === "draft"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-gray-100 text-gray-600 border-gray-200"
                              }`}
                            >
                              <option value="published">Published</option>
                              <option value="draft">Draft</option>
                              <option value="archived">Archived</option>
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            // Open manifest for first departure or trigger modal
                            if (trip.departuresCount > 0) {
                              onOpenManifest(trip.id);
                            } else {
                              alert("No departures scheduled for this trip yet.");
                            }
                          }}
                          className="inline-flex items-center gap-1.5 bg-[#13b5b1]/10 hover:bg-[#13b5b1]/20 text-[#13b5b1] text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
                        >
                          <Users size={12} />
                          Manifest
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
