/**
 * app/api/analytics/quarterly/route.ts
 * GET /api/analytics/quarterly
 *
 * Returns a detailed quarterly summary: totals, compliance, QoQ delta,
 * and per-campus breakdown for the selected quarter.
 *
 * Query params:
 *   year?    — defaults to current year
 *   quarter? — 1-4, defaults to current quarter
 *   campusId? — filter to a single campus
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole, ReportStatus } from "@/types/global";
import { resolveReportMonth } from "@/lib/utils/reportPeriod";

const QuerySchema = z.object({
    year: z.coerce.number().optional(),
    quarter: z.coerce.number().min(1).max(4).optional(),
    campusId: z.string().optional(),
    includeDrafts: z.enum(["true", "false"]).optional().default("true"),
});

function getQuarterMonths(q: number): number[] {
    return [(q - 1) * 3 + 1, (q - 1) * 3 + 2, (q - 1) * 3 + 3];
}

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const query = QuerySchema.parse(Object.fromEntries(new URL(req.url).searchParams));
    const includeDrafts = query.includeDrafts === "true";

    const now = new Date();
    const year = query.year ?? now.getFullYear();
    const quarter = query.quarter ?? Math.ceil((now.getMonth() + 1) / 3);

    const cacheKey = `analytics:quarterly:${auth.user.id}:${year}:Q${quarter}:${query.campusId ?? "all"}:${includeDrafts ? "with-draft" : "no-draft"}`;
    const cached = await cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    const roleConfig = ROLE_CONFIG[auth.user.role as UserRole];

    /* ── Build where clause ─────────────────────────────────────────────── */
    const months = getQuarterMonths(quarter);
    const where: Record<string, unknown> = {
        periodYear: year,
    };
    if (roleConfig?.reportVisibilityScope === "campus" && auth.user.campusId) {
        where.campusId = auth.user.campusId;
    }
    if (query.campusId) where.campusId = query.campusId;
    if (!includeDrafts) {
        where.status = { not: ReportStatus.DRAFT };
    }

    const reportsAll = await db.report.findMany({ where });
    const reports = reportsAll.filter((report) => {
        const month = resolveReportMonth(report);
        return month != null && months.includes(month);
    });

    /* ── Previous quarter data for QoQ comparison ─────────────────────── */
    const prevQ = quarter === 1 ? 4 : quarter - 1;
    const prevYear = quarter === 1 ? year - 1 : year;
    const prevMonths = getQuarterMonths(prevQ);
    const prevWhere: Record<string, unknown> = {
        periodYear: prevYear,
    };
    if (where.campusId) prevWhere.campusId = where.campusId;
    if (roleConfig?.reportVisibilityScope === "campus" && auth.user.campusId) {
        prevWhere.campusId = auth.user.campusId;
    }
    if (!includeDrafts) {
        prevWhere.status = { not: ReportStatus.DRAFT };
    }
    const prevReportsAll = await db.report.findMany({ where: prevWhere });
    const prevReports = prevReportsAll.filter((report) => {
        const month = resolveReportMonth(report);
        return month != null && prevMonths.includes(month);
    });

    /* ── Compute totals ────────────────────────────────────────────────── */
    function computeTotals(rpts: typeof reports) {
        const total = rpts.length;
        const submitted = rpts.filter((r) => r.status !== ReportStatus.DRAFT).length;
        const approved = rpts.filter((r) =>
            [ReportStatus.APPROVED, ReportStatus.REVIEWED, ReportStatus.LOCKED].includes(r.status as ReportStatus),
        ).length;
        const compliance = submitted > 0 ? Math.round((approved / submitted) * 100) : 0;
        return { total, submitted, approved, compliance };
    }

    const current = computeTotals(reports);
    const previous = computeTotals(prevReports);

    const qoqDelta = {
        total: current.total - previous.total,
        submitted: current.submitted - previous.submitted,
        approved: current.approved - previous.approved,
        compliance: current.compliance - previous.compliance,
    };

    /* ── Campus breakdown ──────────────────────────────────────────────── */
    const campusMap: Record<string, { submitted: number; approved: number; total: number }> = {};
    for (const r of reports) {
        if (!campusMap[r.campusId]) campusMap[r.campusId] = { submitted: 0, approved: 0, total: 0 };
        campusMap[r.campusId].total++;
        if (r.status !== ReportStatus.DRAFT) campusMap[r.campusId].submitted++;
        if ([ReportStatus.APPROVED, ReportStatus.REVIEWED, ReportStatus.LOCKED].includes(r.status as ReportStatus)) {
            campusMap[r.campusId].approved++;
        }
    }
    const campusBreakdown = Object.entries(campusMap)
        .map(([campusId, stats]) => ({
            campusId,
            total: stats.total,
            submitted: stats.submitted,
            approved: stats.approved,
            complianceRate: stats.submitted > 0 ? Math.round((stats.approved / stats.submitted) * 100) : 0,
        }))
        .sort((a, b) => b.complianceRate - a.complianceRate);

    /* ── Monthly breakdown within quarter ──────────────────────────────── */
    const monthlyBreakdown = months.map((m) => {
        const monthReports = reports.filter((r) => resolveReportMonth(r) === m);
        const totals = computeTotals(monthReports);
        return { month: m, label: `${year}-${String(m).padStart(2, "0")}`, ...totals };
    });

    const data = {
        year,
        quarter,
        label: `${year} Q${quarter}`,
        current,
        previous: { ...previous, label: `${prevYear} Q${prevQ}` },
        qoqDelta,
        campusBreakdown,
        monthlyBreakdown,
    };

    const response = { success: true, data };
    await cache.set(cacheKey, JSON.stringify(response), 120);
    return NextResponse.json(response);
}
