/**
 * app/api/analytics/overview/route.ts
 * GET /api/analytics/overview
 *
 * Returns aggregated report-level metrics for the caller's scope.
 * Additionally returns quarterly compliance rates and goal achievement summary.
 *
 * Query params:
 *   campusId?  — filter to a single campus
 *   groupId?   — filter to a group
 *   year?      — filter by year (defaults to all)
 *   periodType? — filter by WEEKLY | MONTHLY | YEARLY
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole, ReportStatus } from "@/types/global";

const QuerySchema = z.object({
    campusId: z.string().optional(),
    groupId: z.string().optional(),
    periodType: z.string().optional(),
    year: z.coerce.number().optional(),
    includeDrafts: z.coerce.boolean().default(true),
    statuses: z.array(z.nativeEnum(ReportStatus)).optional(),
});

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const query = QuerySchema.parse(Object.fromEntries(new URL(req.url).searchParams));

    const cacheKey = `analytics:overview:${auth.user.id}:${JSON.stringify(query)}`;
    const cached = await cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    const roleConfig = ROLE_CONFIG[auth.user.role as UserRole];

    /* ── Build Prisma where clause ─────────────────────────────────────── */
    const where: Record<string, unknown> = {};
    if (roleConfig?.reportVisibilityScope === "campus" && auth.user.campusId) {
        where.campusId = auth.user.campusId;
    }
    if (query.campusId) where.campusId = query.campusId;
    if (query.groupId) where.orgGroupId = query.groupId;
    if (query.periodType) where.periodType = query.periodType;
    if (query.year) where.periodYear = query.year;

    if (query.statuses && query.statuses.length > 0) {
        where.status = { in: query.statuses };
    } else if (!query.includeDrafts) {
        where.status = { not: ReportStatus.DRAFT };
    }

    const reports = await db.report.findMany({ where });

    /* ── Status totals ─────────────────────────────────────────────────────── */
    const total = reports.length;
    const submitted = reports.filter((r) => r.status === ReportStatus.SUBMITTED).length;
    const approved = reports.filter((r) => r.status === ReportStatus.APPROVED).length;
    const reviewed = reports.filter((r) => r.status === ReportStatus.REVIEWED).length;
    const locked = reports.filter((r) => r.status === ReportStatus.LOCKED).length;
    const draft = reports.filter((r) => r.status === ReportStatus.DRAFT).length;
    const requiresEdits = reports.filter((r) => r.status === ReportStatus.REQUIRES_EDITS).length;

    const eligible = total - draft;
    const compliant = approved + reviewed + locked;
    const compliance = eligible > 0 ? Math.round((compliant / eligible) * 100) : 0;

    /* ── Submission trend — group by month (last 12) ───────────────────────── */
    const submissionsByMonth: Record<string, number> = {};
    for (const r of reports) {
        if (r.status !== ReportStatus.DRAFT && r.periodMonth != null) {
            const key = `${r.periodYear}-${String(r.periodMonth).padStart(2, "0")}`;
            submissionsByMonth[key] = (submissionsByMonth[key] ?? 0) + 1;
        }
    }
    const submissionTrend = Object.entries(submissionsByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([month, count]) => ({ month, count }));

    /* ── Quarterly compliance trend ─────────────────────────────────────────── */
    const quarterlyMap: Record<string, { submitted: number; approved: number }> = {};
    for (const r of reports) {
        if (r.periodMonth == null) continue;
        const q = Math.ceil(r.periodMonth / 3);
        const key = `${r.periodYear}-Q${q}`;
        if (!quarterlyMap[key]) quarterlyMap[key] = { submitted: 0, approved: 0 };
        if (r.status !== ReportStatus.DRAFT) quarterlyMap[key].submitted++;
        if ([ReportStatus.APPROVED, ReportStatus.REVIEWED, ReportStatus.LOCKED].includes(r.status as ReportStatus)) {
            quarterlyMap[key].approved++;
        }
    }
    const quarterlyTrend = Object.entries(quarterlyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([quarter, stats]) => ({
            quarter,
            submitted: stats.submitted,
            approved: stats.approved,
            complianceRate: stats.submitted > 0 ? Math.round((stats.approved / stats.submitted) * 100) : 0,
        }));

    /* ── Status over months (for stacked bar) ──────────────────────────────── */
    const statusByMonth: Record<string, Record<string, number>> = {};
    for (const r of reports) {
        if (r.periodMonth == null) continue;
        const key = `${r.periodYear}-${String(r.periodMonth).padStart(2, "0")}`;
        if (!statusByMonth[key]) statusByMonth[key] = {};
        statusByMonth[key][r.status] = (statusByMonth[key][r.status] ?? 0) + 1;
    }
    const statusTrend = Object.entries(statusByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([month, statuses]) => ({ month, ...statuses }));

    /* ── Campus breakdown ──────────────────────────────────────────────────── */
    const campusMap: Record<string, { submitted: number; approved: number; total: number }> = {};
    for (const r of reports) {
        if (!campusMap[r.campusId]) campusMap[r.campusId] = { submitted: 0, approved: 0, total: 0 };
        campusMap[r.campusId].total++;
        if (r.status !== ReportStatus.DRAFT) campusMap[r.campusId].submitted++;
        if ([ReportStatus.APPROVED, ReportStatus.REVIEWED, ReportStatus.LOCKED].includes(r.status as ReportStatus)) {
            campusMap[r.campusId].approved++;
        }
    }
    const campusBreakdown = Object.entries(campusMap).map(([campusId, stats]) => ({
        campusId,
        total: stats.total,
        submitted: stats.submitted,
        approved: stats.approved,
        complianceRate: stats.submitted > 0 ? Math.round((stats.approved / stats.submitted) * 100) : 0,
    }));

    const data = {
        totals: { total, submitted, approved, reviewed, locked, draft, requiresEdits },
        compliance,
        submissionTrend,
        quarterlyTrend,
        statusTrend,
        campusBreakdown,
    };

    const response = { success: true, data };
    await cache.set(cacheKey, JSON.stringify(response), 60);
    return NextResponse.json(response);
}

