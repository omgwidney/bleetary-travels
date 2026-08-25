"use client";

import { useState } from "react";
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  Loader2,
  Globe,
  Camera,
  Search,
} from "lucide-react";
import type { AdminHostApplicationRow } from "@/lib/db/admin";
import type { HostApplicationStatus } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";

interface HostApplicationsManagerProps {
  initialApplications: AdminHostApplicationRow[];
}

const STATUS_BADGES: Record<
  HostApplicationStatus,
  { label: string; bg: string; text: string; icon: typeof Clock }
> = {
  submitted: {
    label: "Submitted",
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
    icon: Clock,
  },
  under_review: {
    label: "Under Review",
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    icon: CheckCircle2,
  },
  waitlisted: {
    label: "Waitlisted",
    bg: "bg-purple-50 border-purple-200",
    text: "text-purple-700",
    icon: AlertCircle,
  },
  rejected: {
    label: "Rejected",
    bg: "bg-rose-50 border-rose-200",
    text: "text-rose-700",
    icon: XCircle,
  },
};

export default function HostApplicationsManager({
  initialApplications,
}: HostApplicationsManagerProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<AdminHostApplicationRow | null>(
    null,
  );
  const [reviewNotes, setReviewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = applications.filter((app) => {
    const matchesStatus =
      selectedStatus === "all" || app.status === selectedStatus;
    const matchesSearch =
      app.communityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.proposedDestinations.some((d) =>
        d.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return matchesStatus && matchesSearch;
  });

  async function handleDecision(
    decision: "approved" | "rejected" | "waitlisted" | "under_review",
  ) {
    if (!selectedApp) return;

    setSubmitting(true);
    setActionError(null);

    try {
      const response = await fetch("/api/admin/hosts/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          decision,
          reviewNotes,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit host review.");
      }

      // Optimistically update local application record
      setApplications((prev) =>
        prev.map((app) =>
          app.id === selectedApp.id
            ? { ...app, status: decision, reviewNotes }
            : app,
        ),
      );

      setSelectedApp(null);
      setReviewNotes("");
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : "Error processing review.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls: Filter pills and search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-2xl border border-gray-200/80 shadow-xs">
          {["all", "submitted", "under_review", "approved", "waitlisted", "rejected"].map(
            (status) => (
              <button
                key={status}
                type="button"
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl capitalize transition-all ${
                  selectedStatus === status
                    ? "bg-[#13b5b1] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {status.replace("_", " ")}
              </button>
            ),
          )}
        </div>

        <div className="relative min-w-[240px]">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search community or destination..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#13b5b1]"
          />
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Users size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-bold text-gray-800">
              No host applications found
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Try adjusting your search query or filter selection.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#f8fafc] text-gray-400 uppercase tracking-wider font-bold border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-6">Community / Applicant</th>
                  <th className="py-3.5 px-6">Channel & Reach</th>
                  <th className="py-3.5 px-6">Destinations</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Submitted</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">
                {filtered.map((app) => {
                  const badge =
                    STATUS_BADGES[app.status] || STATUS_BADGES.submitted;
                  const Icon = badge.icon;
                  return (
                    <tr key={app.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-bold text-gray-900 text-sm">
                          {app.communityName}
                        </p>
                        <p className="text-[11px] text-gray-400 font-mono">
                          UID: {app.id.slice(0, 10)}...
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="capitalize font-semibold text-gray-800">
                          {app.communityType}
                        </span>
                        <p className="text-[11px] text-gray-400">
                          {app.audienceSize?.toLocaleString() || "0"} audience
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {app.proposedDestinations?.slice(0, 2).map((d) => (
                            <span
                              key={d}
                              className="bg-gray-100 text-gray-800 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                            >
                              {d}
                            </span>
                          ))}
                          {(app.proposedDestinations?.length || 0) > 2 && (
                            <span className="text-[10px] text-gray-400 self-center">
                              +{(app.proposedDestinations?.length || 0) - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${badge.bg} ${badge.text}`}
                        >
                          <Icon size={12} />
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-500 text-[11px]">
                        {formatDate(app.submittedAt)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setReviewNotes(app.reviewNotes || "");
                            setActionError(null);
                          }}
                          className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
                        >
                          <Eye size={13} />
                          Review
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

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-100 my-8">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-[#fafbfc]">
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  Review Host Application
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  ID: #{selectedApp.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="w-8 h-8 rounded-full hover:bg-gray-200 text-gray-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {actionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
                  {actionError}
                </div>
              )}

              {/* Applicant Summary */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Community
                  </p>
                  <p className="font-bold text-gray-900 mt-0.5">
                    {selectedApp.communityName}
                  </p>
                  <p className="text-gray-500 capitalize">
                    {selectedApp.communityType} • {selectedApp.audienceSize?.toLocaleString()} reach
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Socials / Links
                  </p>
                  <div className="mt-0.5 space-y-0.5">
                    {selectedApp.instagramHandle && (
                      <p className="text-gray-700 font-mono flex items-center gap-1">
                        <Camera size={11} className="text-gray-400" />
                        {selectedApp.instagramHandle}
                      </p>
                    )}
                    {selectedApp.communityUrl && (
                      <a
                        href={selectedApp.communityUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#13b5b1] hover:underline flex items-center gap-1"
                      >
                        <Globe size={11} /> Visit Website
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Target Destinations */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Target Destinations
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApp.proposedDestinations?.map((d) => (
                    <span
                      key={d}
                      className="bg-teal-50 border border-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-1 rounded-lg"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bio & Vision */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Hosting Vision & Bio
                </p>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs text-gray-700 leading-relaxed italic">
                  &ldquo;{selectedApp.bio}&rdquo;
                </div>
              </div>

              {/* Previous Experience */}
              {selectedApp.hasHostedBefore && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Prior Retreat Experience
                  </p>
                  <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {selectedApp.previousHostingDetails || "Yes (details unstated)"}
                  </p>
                </div>
              )}

              {/* Review Notes Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Admin Review Notes
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add internal review notes or feedback for this host decision..."
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#13b5b1] resize-none"
                />
              </div>
            </div>

            {/* Decision Action Buttons */}
            <div className="px-6 py-4 bg-[#fafbfc] border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800"
              >
                Cancel
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleDecision("rejected")}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                >
                  Reject
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleDecision("waitlisted")}
                  className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                >
                  Waitlist
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleDecision("under_review")}
                  className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                >
                  Under Review
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleDecision("approved")}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={13} />
                  )}
                  Approve Host & Promote Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
