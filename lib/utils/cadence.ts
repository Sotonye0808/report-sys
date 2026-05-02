/**
 * lib/utils/cadence.ts
 *
 * Pure period math utilities for the role-cadence feature. No DB calls; no
 * config imports. Cadence frequencies are encoded as `ReportPeriodType` values
 * (`WEEKLY` | `MONTHLY` | `YEARLY`) plus the runtime-only sentinels
 * `TWICE_WEEKLY` (used by USHER) and `ANY` (used by DATA_ENTRY).
 */

import { getIsoWeekNumber } from "@/lib/utils/isoWeek";
import { ReportPeriodType } from "@/types/global";

export type CadenceFrequency = "WEEKLY" | "MONTHLY" | "YEARLY" | "TWICE_WEEKLY" | "ANY";

export interface PeriodKey {
    /** Stable string suitable as part of a unique-key tuple. */
    key: string;
    periodType: ReportPeriodType;
    periodYear: number;
    periodMonth?: number;
    periodWeek?: number;
}

/* ── Resolution ─────────────────────────────────────────────────────────── */

/**
 * Resolve the period boundary that a cadence frequency falls into for a given
 * point in time. Sentinels behave as follows:
 *   - "TWICE_WEEKLY" → keyed per ISO week, same as WEEKLY (the next-occurrence
 *     helpers below carry the day-of-week refinement).
 *   - "ANY"          → keyed by ISO week of the supplied date so back-fills
 *     don't all collide on a single bucket.
 */
export function getCurrentPeriod(frequency: CadenceFrequency, asOf: Date = new Date()): PeriodKey {
    const year = asOf.getUTCFullYear();
    if (frequency === ReportPeriodType.MONTHLY) {
        const month = asOf.getUTCMonth() + 1;
        return {
            key: `${year}-M${String(month).padStart(2, "0")}`,
            periodType: ReportPeriodType.MONTHLY,
            periodYear: year,
            periodMonth: month,
        };
    }
    if (frequency === ReportPeriodType.YEARLY) {
        return {
            key: `${year}-Y`,
            periodType: ReportPeriodType.YEARLY,
            periodYear: year,
        };
    }
    // WEEKLY, TWICE_WEEKLY, ANY all bucket to ISO week.
    const week = getIsoWeekNumber(asOf);
    return {
        key: `${year}-W${String(week).padStart(2, "0")}`,
        periodType: ReportPeriodType.WEEKLY,
        periodYear: year,
        periodWeek: week,
    };
}

/* ── Day-of-week helpers ───────────────────────────────────────────────── */

/**
 * Returns the next occurrence (>= asOf, midnight UTC) of the given weekday.
 * Weekday is 0=Sunday … 6=Saturday.
 */
export function nextOccurrence(weekday: number, asOf: Date = new Date()): Date {
    const out = new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate()));
    const delta = (weekday - out.getUTCDay() + 7) % 7;
    out.setUTCDate(out.getUTCDate() + delta);
    return out;
}

/**
 * Pick the most recent past occurrence of any of the supplied weekdays.
 * Used when computing the "expected entry date" for a cadence whose period
 * has multiple expected days (e.g. USHER: Sun + Wed).
 */
export function previousExpectedDay(
    expectedDays: number[],
    asOf: Date = new Date(),
): Date | null {
    if (expectedDays.length === 0) return null;
    const today = new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate()));
    let best: Date | null = null;
    for (const wd of expectedDays) {
        const candidate = new Date(today);
        const delta = (today.getUTCDay() - wd + 7) % 7;
        candidate.setUTCDate(today.getUTCDate() - delta);
        if (!best || candidate.getTime() > best.getTime()) best = candidate;
    }
    return best;
}

/* ── Deadline ──────────────────────────────────────────────────────────── */

/**
 * Compute a deadline timestamp from the period boundary + role deadline hours.
 * The boundary is the most recent expected-day occurrence; if no expected
 * days are set, falls back to the period-key's natural boundary.
 */
export function computeDeadline(
    expectedDays: number[],
    deadlineHours: number,
    asOf: Date = new Date(),
): Date | null {
    const anchor = previousExpectedDay(expectedDays, asOf) ?? asOf;
    return new Date(anchor.getTime() + deadlineHours * 3600_000);
}

/* ── Pretty period label ────────────────────────────────────────────────── */

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export function periodLabel(period: PeriodKey): string {
    if (period.periodType === ReportPeriodType.MONTHLY && period.periodMonth) {
        return `${MONTH_NAMES[period.periodMonth - 1]} ${period.periodYear}`;
    }
    if (period.periodType === ReportPeriodType.YEARLY) {
        return `${period.periodYear}`;
    }
    return `Week ${period.periodWeek} ${period.periodYear}`;
}

export function quarterFromMonth(month: number): number {
    return Math.ceil(month / 3);
}
