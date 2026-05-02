/**
 * lib/data/insights.ts
 *
 * Pure analytical functions used by dashboard widgets, analytics pages, and
 * insight summary cards. No DB access; everything operates on in-memory
 * report payloads loaded by the caller. Easy to unit-test in isolation.
 */

import { ReportStatus } from "@/types/global";

/* ── Generic helpers ────────────────────────────────────────────────────── */

interface ReportLike {
    id: string;
    campusId: string;
    periodYear: number;
    periodMonth?: number | null;
    periodWeek?: number | null;
    status: ReportStatus;
    sections?: unknown[];
}

function periodOrder(r: Pick<ReportLike, "periodYear" | "periodMonth" | "periodWeek">): number {
    return r.periodYear * 1_000 + (r.periodMonth ?? 0) * 50 + (r.periodWeek ?? 0);
}

interface MetricCellLike {
    templateMetricId: string;
    monthlyAchieved?: number | null;
    monthlyGoal?: number | null;
}

function extractMetricCells(report: ReportLike): MetricCellLike[] {
    const out: MetricCellLike[] = [];
    for (const sec of (report.sections ?? []) as Array<{ metrics?: MetricCellLike[] }>) {
        for (const m of sec.metrics ?? []) {
            out.push(m);
        }
    }
    return out;
}

/* ── Pearson correlation ───────────────────────────────────────────────── */

export function pearsonCorrelation(samplesA: number[], samplesB: number[], minSamples = 5): number | null {
    if (samplesA.length !== samplesB.length) return null;
    if (samplesA.length < minSamples) return null;
    const n = samplesA.length;
    let sumA = 0;
    let sumB = 0;
    let sumAA = 0;
    let sumBB = 0;
    let sumAB = 0;
    for (let i = 0; i < n; i++) {
        const a = samplesA[i];
        const b = samplesB[i];
        sumA += a;
        sumB += b;
        sumAA += a * a;
        sumBB += b * b;
        sumAB += a * b;
    }
    const numerator = n * sumAB - sumA * sumB;
    const denominator = Math.sqrt((n * sumAA - sumA * sumA) * (n * sumBB - sumB * sumB));
    if (denominator === 0) return null;
    return numerator / denominator;
}

/* ── Top movers ────────────────────────────────────────────────────────── */

export interface TopMoverEntry {
    campusId: string;
    delta: number;
    percent: number;
    direction: "up" | "down";
}

/**
 * For a given templateMetricId, ranks campuses by their absolute
 * period-over-period delta in monthlyAchieved. Considers up to `windowPeriods`
 * most recent periods per campus.
 */
export function topMover(
    reports: ReportLike[],
    templateMetricId: string,
    windowPeriods = 4,
): TopMoverEntry[] {
    const byCampus = new Map<string, ReportLike[]>();
    for (const r of reports) {
        if (!byCampus.has(r.campusId)) byCampus.set(r.campusId, []);
        byCampus.get(r.campusId)!.push(r);
    }
    const out: TopMoverEntry[] = [];
    for (const [campusId, list] of byCampus.entries()) {
        const sorted = list.slice().sort((a, b) => periodOrder(a) - periodOrder(b));
        const window = sorted.slice(-windowPeriods);
        const values = window
            .map((r) => extractMetricCells(r).find((c) => c.templateMetricId === templateMetricId)?.monthlyAchieved)
            .filter((v): v is number => typeof v === "number");
        if (values.length < 2) continue;
        const first = values[0];
        const last = values[values.length - 1];
        const delta = last - first;
        const percent = first === 0 ? 0 : Math.round((delta / Math.abs(first)) * 100);
        out.push({ campusId, delta, percent, direction: delta >= 0 ? "up" : "down" });
    }
    out.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
    return out;
}

/* ── Biggest gap ───────────────────────────────────────────────────────── */

export interface BiggestGapEntry {
    templateMetricId: string;
    goal: number;
    achieved: number;
    gap: number;
}

export function biggestGap(reports: ReportLike[]): BiggestGapEntry[] {
    const byMetric = new Map<string, { goal: number; achieved: number }>();
    for (const r of reports) {
        for (const cell of extractMetricCells(r)) {
            const goal = cell.monthlyGoal ?? 0;
            const achieved = cell.monthlyAchieved ?? 0;
            const cur = byMetric.get(cell.templateMetricId) ?? { goal: 0, achieved: 0 };
            cur.goal += goal;
            cur.achieved += achieved;
            byMetric.set(cell.templateMetricId, cur);
        }
    }
    const out: BiggestGapEntry[] = [];
    for (const [templateMetricId, agg] of byMetric.entries()) {
        out.push({
            templateMetricId,
            goal: agg.goal,
            achieved: agg.achieved,
            gap: agg.goal - agg.achieved,
        });
    }
    out.sort((a, b) => b.gap - a.gap);
    return out;
}

/* ── Trend slope (simple linear regression) ────────────────────────────── */

export function trendSlope(values: number[]): number {
    const n = values.length;
    if (n < 2) return 0;
    const xs = values.map((_, i) => i);
    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = values.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
        num += (xs[i] - meanX) * (values[i] - meanY);
        den += (xs[i] - meanX) ** 2;
    }
    return den === 0 ? 0 : num / den;
}

/* ── Compliance delta (period-over-period) ─────────────────────────────── */

const COMPLETED = new Set<ReportStatus>([
    ReportStatus.APPROVED,
    ReportStatus.REVIEWED,
    ReportStatus.LOCKED,
]);

export function complianceRate(reports: ReportLike[]): number {
    if (reports.length === 0) return 0;
    const completed = reports.filter((r) => COMPLETED.has(r.status)).length;
    return Math.round((completed / reports.length) * 100);
}

export function complianceDelta(currentReports: ReportLike[], previousReports: ReportLike[]): number {
    return complianceRate(currentReports) - complianceRate(previousReports);
}

/* ── Correlation matrix for a template-defined group ───────────────────── */

export interface CorrelationCell {
    a: string;
    b: string;
    r: number | null;
    n: number;
}

interface TemplateLike {
    sections: Array<{
        correlationGroup?: string | null;
        metrics?: Array<{ id: string; correlationGroup?: string | null }>;
    }>;
}

export function correlationMatrix(
    reports: ReportLike[],
    template: TemplateLike,
    groupName: string,
    minSamples = 5,
): CorrelationCell[] {
    const metricsInGroup = new Set<string>();
    for (const sec of template.sections ?? []) {
        const secGroup = sec.correlationGroup ?? null;
        for (const m of sec.metrics ?? []) {
            const mGroup = m.correlationGroup ?? secGroup;
            if (mGroup === groupName) metricsInGroup.add(m.id);
        }
    }
    const ids = Array.from(metricsInGroup);
    if (ids.length < 2) return [];

    const seriesById = new Map<string, number[]>();
    for (const id of ids) seriesById.set(id, []);
    for (const r of reports) {
        for (const cell of extractMetricCells(r)) {
            if (!ids.includes(cell.templateMetricId)) continue;
            if (typeof cell.monthlyAchieved !== "number") continue;
            seriesById.get(cell.templateMetricId)!.push(cell.monthlyAchieved);
        }
    }

    const out: CorrelationCell[] = [];
    for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
            const a = ids[i];
            const b = ids[j];
            const sa = seriesById.get(a) ?? [];
            const sb = seriesById.get(b) ?? [];
            const len = Math.min(sa.length, sb.length);
            const r = pearsonCorrelation(sa.slice(0, len), sb.slice(0, len), minSamples);
            out.push({ a, b, r, n: len });
        }
    }
    return out;
}

/* ── High-level summariser ─────────────────────────────────────────────── */

export interface InsightSummary {
    topMover?: TopMoverEntry & { metricId: string };
    biggestGap?: BiggestGapEntry;
    complianceDelta?: { current: number; previous: number; delta: number };
}

export function summariseInsights(
    currentReports: ReportLike[],
    previousReports: ReportLike[],
    options: { topMoverMetricId?: string; topMoverWindow?: number } = {},
): InsightSummary {
    const out: InsightSummary = {};

    if (options.topMoverMetricId) {
        const movers = topMover(currentReports, options.topMoverMetricId, options.topMoverWindow);
        if (movers.length > 0) out.topMover = { ...movers[0], metricId: options.topMoverMetricId };
    }

    const gaps = biggestGap(currentReports);
    if (gaps.length > 0 && gaps[0].gap > 0) out.biggestGap = gaps[0];

    const current = complianceRate(currentReports);
    const previous = complianceRate(previousReports);
    out.complianceDelta = { current, previous, delta: current - previous };

    return out;
}
