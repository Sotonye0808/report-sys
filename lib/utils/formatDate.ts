/**
 * lib/utils/formatDate.ts
 * Central date-formatting utility.
 * All dates in the UI must be rendered through these helpers —
 * never inline `toLocaleDateString()` calls in components.
 *
 * Target format: DD MMM YYYY  e.g. "04 Mar 2026"
 */

/**
 * Format an ISO date string or Date object as "DD MMM YYYY".
 * Returns "—" if the value is falsy or invalid.
 */
export function fmtDate(value: string | Date | null | undefined): string {
    if (!value) return "—";
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }); // → "04 Mar 2026"
}

/**
 * Format as "DD MMM YYYY, HH:MM" — for datetime displays (audit log, events).
 */
export function fmtDateTime(value: string | Date | null | undefined): string {
    if (!value) return "—";
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return "—";
    const date = d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
    const time = d.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
    return `${date}, ${time}`; // → "04 Mar 2026, 14:30"
}

/**
 * Time-ago string for notification/activity timestamps.
 * Falls back to fmtDateTime when > 7 days old.
 */
export function timeAgo(value: string | Date | null | undefined): string {
    if (!value) return "—";
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return "—";
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60_000);
    const hrs = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    return fmtDate(d);
}
