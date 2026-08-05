/**
 * lib/format.ts
 *
 * Lightweight formatting utilities for Firestore Timestamps and monetary values.
 * These functions are safe to use in both Server and Client components.
 * Does NOT import firebase-admin — works with any object that has `.toDate()`.
 */

// ─── Internal helpers ─────────────────────────────────────────────────────

/** Coerces any Firestore Timestamp-like value to a JS Date, or null. */
function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  // Firestore Timestamp (Admin SDK) and Client SDK both have .toDate()
  if (
    typeof value === "object" &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
}

// ─── Exports ──────────────────────────────────────────────────────────────

/**
 * Converts a Firestore Timestamp (or Date) to a human-readable date string.
 * e.g. "Sep 3, 2027"
 */
export function formatDate(timestamp: unknown): string {
  const date = toDate(timestamp);
  if (!date) return "TBD";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats a date range from two Timestamps.
 * e.g. "Sep 3 – Sep 11, 2027"
 */
export function formatDateRange(start: unknown, end: unknown): string {
  const s = toDate(start);
  const e = toDate(end);
  if (!s || !e) return "TBD";

  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = sameYear && s.getMonth() === e.getMonth();

  const startFmt = s.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
  const endFmt = e.toLocaleDateString("en-US", {
    month: sameMonth ? undefined : "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startFmt} – ${endFmt}`;
}

/**
 * Formats integer cents to a USD currency string.
 * e.g. 199500 → "$1,995"
 * Pass showCents=true to include decimal places: "$1,995.00"
 */
export function formatCents(cents: number, showCents = false): string {
  const dollars = cents / 100;
  return dollars.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  });
}
