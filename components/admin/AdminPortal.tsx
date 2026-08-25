"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Compass,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Clock,
} from "lucide-react";
import HostApplicationsManager from "@/components/admin/HostApplicationsManager";
import TripOperationsManager from "@/components/admin/TripOperationsManager";
import AuditLogViewer from "@/components/admin/AuditLogViewer";
import PassengerManifestModal from "@/components/admin/PassengerManifestModal";
import type {
  AdminHostApplicationRow,
  AdminTripRow,
  AdminAuditEventRow,
  AdminOverviewMetrics,
} from "@/lib/db/admin";
import { formatCents } from "@/lib/format";

interface AdminPortalProps {
  metrics: AdminOverviewMetrics;
  applications: AdminHostApplicationRow[];
  trips: AdminTripRow[];
  auditEvents: AdminAuditEventRow[];
}

type TabType = "overview" | "hosts" | "trips" | "audit";

export default function AdminPortal({
  metrics,
  applications,
  trips,
  auditEvents,
}: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [manifestDepartureId, setManifestDepartureId] = useState<string | null>(
    null,
  );

  return (
    <div className="space-y-8">
      {/* Top Operations Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === "overview"
                ? "bg-gray-900 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80"
            }`}
          >
            <LayoutDashboard size={14} />
            Overview & Metrics
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("hosts")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === "hosts"
                ? "bg-gray-900 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80"
            }`}
          >
            <Users size={14} />
            Host Queue
            {metrics.pendingApplicationsCount > 0 && (
              <span className="bg-[#f05c40] text-white px-2 py-0.5 rounded-full text-[10px] font-black">
                {metrics.pendingApplicationsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("trips")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === "trips"
                ? "bg-gray-900 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80"
            }`}
          >
            <Compass size={14} />
            Trips & Operations
            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-[10px] font-black">
              {trips.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === "audit"
                ? "bg-gray-900 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80"
            }`}
          >
            <ShieldCheck size={14} />
            Audit Trail
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Production Operations Live</span>
        </div>
      </div>

      {/* Tab: Overview & Key Metrics */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Confirmed Bookings
                </span>
                <CreditCard size={18} className="text-[#13b5b1]" />
              </div>
              <p className="text-3xl font-black text-gray-900">
                {metrics.totalBookings}
              </p>
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp size={12} /> {formatCents(metrics.totalRevenueCents)} deposit volume
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Pending Host Apps
                </span>
                <Clock size={18} className="text-[#f05c40]" />
              </div>
              <p className="text-3xl font-black text-gray-900">
                {metrics.pendingApplicationsCount}
              </p>
              <p className="text-xs text-gray-400">
                Awaiting admin review & decision
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Active Hosts
                </span>
                <Users size={18} className="text-teal-600" />
              </div>
              <p className="text-3xl font-black text-gray-900">
                {metrics.activeHostsCount}
              </p>
              <p className="text-xs text-teal-600 font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} /> Verified host profiles
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Published Trips
                </span>
                <Compass size={18} className="text-blue-600" />
              </div>
              <p className="text-3xl font-black text-gray-900">
                {metrics.publishedTripsCount}
              </p>
              <p className="text-xs text-gray-400">
                Live in public catalog
              </p>
            </div>
          </div>

          {/* Quick host queue snapshot */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  Recent Host Submissions
                </h3>
                <p className="text-xs text-gray-500">
                  Creators and community leaders applying to host group retreats.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("hosts")}
                className="text-xs font-bold text-[#13b5b1] hover:underline"
              >
                View full queue →
              </button>
            </div>

            <HostApplicationsManager
              initialApplications={applications.slice(0, 5)}
            />
          </div>
        </div>
      )}

      {/* Tab: Host Applications Queue */}
      {activeTab === "hosts" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div>
            <h2 className="text-xl font-black text-gray-900">
              Host Application Review Queue
            </h2>
            <p className="text-xs text-gray-500">
              Review creator qualifications, inspect social channels, approve host roles, and provision host profiles.
            </p>
          </div>
          <HostApplicationsManager initialApplications={applications} />
        </div>
      )}

      {/* Tab: Trips Operations */}
      {activeTab === "trips" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div>
            <h2 className="text-xl font-black text-gray-900">
              Trip Catalog & Manifest Operations
            </h2>
            <p className="text-xs text-gray-500">
              Control public trip visibility, toggle publication states, and inspect real-time passenger manifests.
            </p>
          </div>
          <TripOperationsManager
            initialTrips={trips}
            onOpenManifest={(tripId) => {
              // Find first departure ID for manifest lookup
              const trip = trips.find((t) => t.id === tripId);
              if (trip) {
                // If the trip has an itinerary or departure, we query via departure ID
                setManifestDepartureId(trip.id);
              }
            }}
          />
        </div>
      )}

      {/* Tab: Audit Log */}
      {activeTab === "audit" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div>
            <h2 className="text-xl font-black text-gray-900">
              Immutable Platform Audit Trail
            </h2>
            <p className="text-xs text-gray-500">
              Complete historical stream of privileged administrative actions, booking confirmations, and host approvals.
            </p>
          </div>
          <AuditLogViewer initialEvents={auditEvents} />
        </div>
      )}

      {/* Passenger Manifest Modal */}
      <PassengerManifestModal
        departureId={manifestDepartureId}
        onClose={() => setManifestDepartureId(null)}
      />
    </div>
  );
}
