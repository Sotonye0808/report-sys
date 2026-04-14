/**
 * app/api/analytics/metrics/route.ts
 * GET /api/analytics/metrics
 *
 * Returns time-series metric data for analytics charts.
 * Supports weekly, monthly, and quarterly granularity.
 * Respects calculationType (SUM / AVERAGE / SNAPSHOT) when aggregating.
 *
 * Query params:
 *   metricId?       — filter to a specific template metric (returns all if omitted)
 *   campusId?       — filter to a specific campus
 *   groupId?        — filter to all campuses in a group
 *   year            — required; base year (e.g., 2025)
 *   compareYear?    — optional; second year for YoY comparison
 *   granularity?    — "weekly" | "monthly" | "quarterly" (default: "monthly")
 *   startMonth?     — 1-12, default 1
 *   endMonth?       — 1-12, default 12
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole, MetricCalculationType, ReportStatus } from "@/types/global";
import { resolveReportMonth } from "@/lib/utils/reportPeriod";
import { getIsoWeeksInYear } from "@/lib/utils/isoWeek";

const QuerySchema = z.object({
    metricId: z.string().optional(),
    sectionId: z.string().optional(),
    campusId: z.string().optional(),
    groupId: z.string().optional(),
    year: z.coerce.number().int().min(2000).max(2100),
    compareYear: z.coerce.number().int().min(2000).max(2100).optional(),
    granularity: z.enum(["weekly", "monthly", "quarterly"]).default("monthly"),
    startMonth: z.coerce.number().int().min(1).max(12).optional(),
    endMonth: z.coerce.number().int().min(1).max(12).optional(),
    startWeek: z.coerce.number().int().min(1).max(53).optional(),
    endWeek: z.coerce.number().int().min(1).max(53).optional(),
    includeDrafts: z.enum(["true", "false"]).optional().default("true"),
    statuses: z.array(z.nativeEnum(ReportStatus)).optional(),
});

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface MetricPoint {
    period: string;          // "YYYY-MM", "YYYY-WW", or "YYYY-QN"
    periodLabel: string;     // human-readable: "Jan 2025", "W01", "Q1"
    goal?: number;
    achieved?: number;
    yoy?: number;
    compareAchieved?: number; // compareYear achieved value for the same period
}

interface CampusMetricSeries {
    campusId: string;
    campusName: string;
    series: MetricPoint[];
    avgAchievementRate: number; // achieved/goal %, where goal exists
}

interface MetricAnalyticsPayload {
    metricId: string;
    metricName: string;
    sectionName: string;
    calculationType: MetricCalculationType;
    aggregate: MetricPoint[];         // cross-campus aggregate
    byCampus: CampusMetricSeries[];   // per-campus breakdown
    /** Available metrics in the default template for the selector */
    availableMetrics: { id: string; name: string; sectionName: string; calculationType: MetricCalculationType }[];
}

/* ── Helpers ───────────────────────────────────────────────────────────────── */

function periodKey(
    report: { periodType: string; periodYear: number; periodMonth?: number | null; periodWeek?: number | null },
    granularity: "weekly" | "monthly" | "quarterly" = "monthly",
): string | null {
    if (granularity === "weekly" && report.periodWeek != null) {
        const year = report.periodYear;
        const week = report.periodWeek;
        const wStr = String(week).padStart(2, "0");
        return `${year}-W${wStr}`;
    }
    const month = resolveReportMonth({
        periodType: report.periodType as "WEEKLY" | "MONTHLY" | "YEARLY",
        periodYear: report.periodYear,
        periodMonth: report.periodMonth,
        periodWeek: report.periodWeek,
    });
    if (granularity === "monthly" && month != null) {
        const year = report.periodYear;
        return `${year}-${String(month).padStart(2, "0")}`;
    }
    if (granularity === "quarterly" && month != null) {
        const year = report.periodYear;
        const q = Math.ceil(month / 3);
        return `${year}-Q${q}`;
    }
    return null;
}

function periodLabel(key: string): string {
    // YYYY-MM → "Jan 2025"
    if (/^\d{4}-\d{2}$/.test(key)) {
        const [y, mo] = key.split("-");
        const d = new Date(Number(y), Number(mo) - 1);
        return d.toLocaleString("en-GB", { month: "short", year: "numeric" });
    }
    // YYYY-WNN → "W01 2025"
    if (/^\d{4}-W\d{2}$/.test(key)) {
        const [y, w] = key.split("-");
        return `${w} ${y}`;
    }
    // YYYY-QN → "Q1 2025"
    if (/^\d{4}-Q\d/.test(key)) {
        const [y, q] = key.split("-");
        return `${q} ${y}`;
    }
    return key;
}

function aggregateValues(values: number[], calcType: MetricCalculationType): number {
    if (values.length === 0) return 0;
    switch (calcType) {
        case MetricCalculationType.SUM: return values.reduce((a, b) => a + b, 0);
        case MetricCalculationType.AVERAGE: return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
        case MetricCalculationType.SNAPSHOT: return values[values.length - 1]; // last value
        default: return values.reduce((a, b) => a + b, 0);
    }
}

/* ── Handler ───────────────────────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const searchParams = new URL(req.url).searchParams;
    const parsed = QuerySchema.safeParse({
        ...Object.fromEntries(searchParams),
        statuses: searchParams.getAll("statuses"),
    });
    if (!parsed.success) {
        return NextResponse.json({ success: false, error: "Invalid query parameters", details: parsed.error.flatten() }, { status: 400 });
    }
    const query = parsed.data;
    const includeDrafts = query.includeDrafts === "true";
    const startMonth = query.startMonth ?? 1;
    const endMonth = query.endMonth ?? 12;
    const maxIsoWeeks = getIsoWeeksInYear(query.year);
    const endWeek = query.endWeek ? Math.min(query.endWeek, maxIsoWeeks) : maxIsoWeeks;
    const startWeek = Math.min(query.startWeek ?? 1, endWeek);

    const cacheKey = `analytics:metrics:${auth.user.id}:${JSON.stringify(query)}`;
    const cached = await cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    /* ── Scope: enforce role visibility ──────────────────────────────────── */
    const roleConfig = ROLE_CONFIG[auth.user.role as UserRole];
    let allowedCampusIds: string[] | null = null;
    if (roleConfig?.reportVisibilityScope === "campus" && auth.user.campusId) {
        allowedCampusIds = [auth.user.campusId];
    }
    if (query.campusId) {
        // Further narrow — but only if within allowed scope
        if (allowedCampusIds && !allowedCampusIds.includes(query.campusId)) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }
        allowedCampusIds = [query.campusId];
    }

    /* ── Load reports in scope ───────────────────────────────────────────── */
    const years = [query.year, ...(query.compareYear != null ? [query.compareYear] : [])];

    /* Build Prisma where clause for reports */
    const reportWhere: Record<string, unknown> = {
        periodYear: { in: years },
    };
    if (allowedCampusIds) reportWhere.campusId = { in: allowedCampusIds };
    if (query.groupId) reportWhere.orgGroupId = query.groupId;
    if (query.statuses && query.statuses.length > 0) {
        reportWhere.status = { in: query.statuses };
    } else if (!includeDrafts) {
        reportWhere.status = { not: ReportStatus.DRAFT };
    }

    const [scopedReports, allCampuses] = await Promise.all([
        db.report.findMany({
            where: reportWhere,
            include: {
                sections: {
                    include: { metrics: true },
                },
            },
        }),
        db.campus.findMany({}),
    ]);

    const campusMap = new Map(allCampuses.map((c) => [c.id, c]));

    const availableMetricMap = new Map<string, MetricAnalyticsPayload["availableMetrics"][number]>();
    for (const report of scopedReports) {
        for (const section of report.sections) {
            for (const metric of section.metrics) {
                const existing = availableMetricMap.get(metric.templateMetricId);
                if (existing) continue;
                availableMetricMap.set(metric.templateMetricId, {
                    id: metric.templateMetricId,
                    name: metric.metricName,
                    sectionName: section.sectionName,
                    calculationType: metric.calculationType as MetricCalculationType,
                });
            }
        }
    }

    const availableMetrics = [...availableMetricMap.values()].sort((a, b) => {
        const sectionCmp = a.sectionName.localeCompare(b.sectionName);
        if (sectionCmp !== 0) return sectionCmp;
        return a.name.localeCompare(b.name);
    });
    if (availableMetrics.length === 0) {
        return NextResponse.json({
            success: true,
            data: {
                metricId: "",
                metricName: "",
                sectionName: "",
                calculationType: MetricCalculationType.SUM,
                aggregate: [],
                byCampus: [],
                availableMetrics: [],
            } satisfies MetricAnalyticsPayload,
        });
    }

    /* ── Resolve target metric ───────────────────────────────────────────── */
    let targetMetric = availableMetrics[0];
    if (query.metricId) {
        const found = availableMetrics.find((m) => m.id === query.metricId);
        if (!found) {
            return NextResponse.json({ success: false, error: "Metric not found in selected report scope" }, { status: 404 });
        }
        targetMetric = found;
    }

    /* ── Accumulator: [campusId][periodKey] → { goal[], achieved[], yoy[] } ─ */
    type BucketMap = Map<string, Map<string, { goal: number[]; achieved: number[]; yoy: number[] }>>;
    const buckets: BucketMap = new Map();

    for (const report of scopedReports) {
        for (const sec of report.sections) {
            const targetMetricEntry = sec.metrics.find((met) => met.templateMetricId === targetMetric.id);
            if (!targetMetricEntry) continue;

            const pk = periodKey(report, query.granularity);
            if (!pk) continue;

            // Separate primary and comparison year
            const isCompareYear = query.compareYear != null && report.periodYear === query.compareYear;
            const bucketKey = report.campusId;
            if (!buckets.has(bucketKey)) buckets.set(bucketKey, new Map());
            const campusBucket = buckets.get(bucketKey)!;
            if (!campusBucket.has(pk)) campusBucket.set(pk, { goal: [], achieved: [], yoy: [] });
            const slot = campusBucket.get(pk)!;

            if (!isCompareYear) {
                if (targetMetricEntry.monthlyGoal != null) slot.goal.push(targetMetricEntry.monthlyGoal);
                if (targetMetricEntry.monthlyAchieved != null) slot.achieved.push(targetMetricEntry.monthlyAchieved);
                if (targetMetricEntry.yoyGoal != null) slot.yoy.push(targetMetricEntry.yoyGoal);
            }
        }
    }

    /* ── Build per-campus series ─────────────────────────────────────────── */
    // Enumerate all periods in the range
    const allPeriods: string[] = [];
    if (query.granularity === "monthly") {
        for (let mo = startMonth; mo <= endMonth; mo++) {
            allPeriods.push(`${query.year}-${String(mo).padStart(2, "0")}`);
        }
    } else if (query.granularity === "quarterly") {
        const startQ = Math.ceil(startMonth / 3);
        const endQ = Math.ceil(endMonth / 3);
        for (let q = startQ; q <= endQ; q++) {
            allPeriods.push(`${query.year}-Q${q}`);
        }
    } else {
        for (let w = startWeek; w <= endWeek; w++) {
            allPeriods.push(`${query.year}-W${String(w).padStart(2, "0")}`);
        }
    }

    const byCampus: CampusMetricSeries[] = [];
    const aggregateBuckets = new Map<string, { goal: number[]; achieved: number[] }>();

    for (const period of allPeriods) {
        aggregateBuckets.set(period, { goal: [], achieved: [] });
    }

    for (const [campusId, campusBucket] of buckets) {
        const campus = campusMap.get(campusId);
        if (!campus) continue;

        const series: MetricPoint[] = allPeriods.map((pk) => {
            const slot = campusBucket.get(pk);
            const goal = slot?.goal.length ? aggregateValues(slot.goal, targetMetric.calculationType) : undefined;
            const achieved = slot?.achieved.length ? aggregateValues(slot.achieved, targetMetric.calculationType) : undefined;
            const yoy = slot?.yoy.length ? aggregateValues(slot.yoy, targetMetric.calculationType) : undefined;

            // Feed aggregate
            if (goal != null) aggregateBuckets.get(pk)!.goal.push(goal);
            if (achieved != null) aggregateBuckets.get(pk)!.achieved.push(achieved);

            return { period: pk, periodLabel: periodLabel(pk), goal, achieved, yoy };
        }).filter((pt) => pt.achieved != null || pt.goal != null);

        const achievementRates = series
            .filter((pt) => pt.goal != null && pt.goal > 0 && pt.achieved != null)
            .map((pt) => Math.round(((pt.achieved ?? 0) / (pt.goal ?? 1)) * 100));
        const avgRate = achievementRates.length
            ? Math.round(achievementRates.reduce((a, b) => a + b, 0) / achievementRates.length)
            : 0;

        byCampus.push({ campusId, campusName: campus.name, series, avgAchievementRate: avgRate });
    }

    /* ── Build aggregate series (cross-campus) ───────────────────────────── */
    const aggregate: MetricPoint[] = allPeriods.map((pk) => {
        const slot = aggregateBuckets.get(pk)!;
        const goal = slot.goal.length ? aggregateValues(slot.goal, MetricCalculationType.SUM) : undefined;
        const achieved = slot.achieved.length ? aggregateValues(slot.achieved, MetricCalculationType.SUM) : undefined;
        return { period: pk, periodLabel: periodLabel(pk), goal, achieved };
    }).filter((pt) => pt.achieved != null || pt.goal != null);

    const payload: MetricAnalyticsPayload = {
        metricId: targetMetric.id,
        metricName: targetMetric.name,
        sectionName: targetMetric.sectionName,
        calculationType: targetMetric.calculationType,
        aggregate,
        byCampus,
        availableMetrics,
    };

    const response = { success: true, data: payload };
    await cache.set(cacheKey, JSON.stringify(response), 60);
    return NextResponse.json(response);
}
