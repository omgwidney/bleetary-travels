"use client";

import { useState } from "react";
import {
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Search,
  AlertTriangle,
  UserCheck,
  CreditCard,
  Compass,
} from "lucide-react";
import type { AdminAuditEventRow } from "@/lib/db/admin";
import { formatDate } from "@/lib/format";

interface AuditLogViewerProps {
  initialEvents: AdminAuditEventRow[];
}

export default function AuditLogViewer({ initialEvents }: AuditLogViewerProps) {
  const [events] = useState(initialEvents);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");

  const filtered = events.filter((e) => {
    const matchesAction =
      actionFilter === "all" ? true : e.action.startsWith(actionFilter);
    const matchesSearch =
      e.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.actorUid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.targetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.reason || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAction && matchesSearch;
  });

  function getActionBadge(action: string) {
    if (action.includes("booking")) {
      return {
        icon: CreditCard,
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    }
    if (action.includes("host")) {
      return {
        icon: UserCheck,
        bg: "bg-teal-50 text-teal-800 border-teal-200",
      };
    }
    if (action.includes("trip")) {
      return {
        icon: Compass,
        bg: "bg-blue-50 text-blue-700 border-blue-200",
      };
    }
    return {
      icon: AlertTriangle,
      bg: "bg-gray-100 text-gray-700 border-gray-200",
    };
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-2xl border border-gray-200/80 shadow-xs">
          {["all", "host", "booking", "trip", "user"].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActionFilter(filter)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl capitalize transition-all ${
                actionFilter === filter
                  ? "bg-[#13b5b1] text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {filter}
            </button>
          ))}
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
            placeholder="Search action, actor, target..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#13b5b1]"
          />
        </div>
      </div>

      {/* Activity stream list */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <ShieldAlert size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-bold text-gray-800">No audit events</p>
          </div>
        ) : (
          filtered.map((event) => {
            const badge = getActionBadge(event.action);
            const Icon = badge.icon;
            const isExpanded = expandedId === event.id;

            return (
              <div
                key={event.id}
                className="p-4 sm:p-5 hover:bg-gray-50/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${badge.bg}`}
                    >
                      <Icon size={16} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-xs text-gray-900 font-mono">
                          {event.action}
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono">
                          Target: {event.targetType}/{event.targetId.slice(0, 10)}
                        </span>
                      </div>

                      {event.reason && (
                        <p className="text-xs text-gray-600">
                          {event.reason}
                        </p>
                      )}

                      <p className="text-[11px] text-gray-400 font-mono">
                        Actor: {event.actorUid} • {formatDate(event.createdAt)}
                      </p>
                    </div>
                  </div>

                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : event.id)
                      }
                      className="text-xs font-bold text-gray-400 hover:text-gray-700 flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span>Metadata</span>
                      {isExpanded ? (
                        <ChevronUp size={13} />
                      ) : (
                        <ChevronDown size={13} />
                      )}
                    </button>
                  )}
                </div>

                {isExpanded && event.metadata && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <pre className="p-3 bg-gray-950 text-teal-300 font-mono text-[11px] rounded-xl overflow-x-auto">
                      {JSON.stringify(event.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
