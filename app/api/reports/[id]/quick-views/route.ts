/**
 * GET /api/reports/[id]/quick-views
 *
 * Returns monthly + quarterly + yearly aggregated rollups available for the
 * report's campus + period. Probe-only (no aggregation write); the caller
 * navigates into the existing /reports/aggregate page to materialise.
 *
 * Cached per (reportId) for 60 s — quick-view bar mounts on every report
 * detail load; we don't need real-time freshness here.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/data/prisma";
import { cache } from "@/lib/data/redis";
import { verifyAuth } from "@/lib/utils/auth";
import {
    successResponse,
    notFoundResponse,
    forbiddenResponse,
    handleApiError,
} from "@/lib/utils/api";
import { ReportPeriodType, ReportStatus, UserRole } from "@/types/global";
import { ROLE_CONFIG } from "@/config/roles";
import { quarterFromMonth } from "@/lib/utils/cadence";

interface QuickView {
    period: "MONTHLY" | "QUARTERLY" | "YEARLY";
    label: string;
    sourceCount: number;
    href: string;
}

function inferScope(viewerRole: UserRole, report: { campusId: string; orgGroupId: string }): {
    scope: "campus" | "group" | "global";
    scopeId?: string;
} {
    const cfg = ROLE_CONFIG[viewerRole];
    const visibility = cfg?.reportVisibilityScope ?? "own";
    if (visibility === "all") return { scope: "global" };
    if (visibility === "group") return { scope: "group", scopeId: report.orgGroupId };
    return { scope: "campus", scopeId: report.campusId };
}

async function countSourceReports(args: {
    scope: "campus" | "group" | "global";
    scopeId?: string;
    periodYear: number;
    periodMonth?: number;
    quarterMonths?: number[];
    periodType: ReportPeriodType;
}): Promise<number> {
    const where: Record<string, unknown> = {
        periodYear: args.periodYear,
        status: { not: ReportStatus.DRAFT },
    };
    if (args.scope === "campus" && args.scopeId) where.campusId = args.scopeId;
    if (args.scope === "group" && args.scopeId) where.orgGroupId = args.scopeId;
    if (args.periodType === ReportPeriodType.MONTHLY) {
        if (args.quarterMonths) where.periodMonth = { in: args.quarterMonths };
        else if (args.periodMonth) where.periodMonth = args.periodMonth;
    }
    return prisma.report.count({ where: where as never });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        const { id } = await ctx.params;
        const cacheKey = `quickViews:${id}:${auth.user.role}`;
        const cached = await cache.get(cacheKey);
        if (cached) return NextResponse.json(successResponse(cached));

        const report = await prisma.report.findUnique({
            where: { id },
            select: {
                id: true,
                campusId: true,
                orgGroupId: true,
                periodYear: true,
                periodMonth: true,
                periodType: true,
            },
        });
        if (!report) return NextResponse.json(notFoundResponse("Report not found"), { status: 404 });

        const cfg = ROLE_CONFIG[auth.user.role as UserRole];
        if (!cfg) return NextResponse.json(forbiddenResponse("Unknown role"), { status: 403 });

        const inferred = inferScope(auth.user.role as UserRole, report);
        const month = report.periodMonth ?? new Date().getUTCMonth() + 1;
        const quarter = quarterFromMonth(month);
        const quarterMonths = [quarter * 3 - 2, quarter * 3 - 1, quarter * 3];

        const [monthlyCount, quarterlyCount, yearlyCount] = await Promise.all([
            countSourceReports({
                scope: inferred.scope,
                scopeId: inferred.scopeId,
                periodYear: report.periodYear,
                periodMonth: month,
                periodType: ReportPeriodType.MONTHLY,
            }),
            countSourceReports({
                scope: inferred.scope,
                scopeId: inferred.scopeId,
                periodYear: report.periodYear,
                quarterMonths,
                periodType: ReportPeriodType.MONTHLY,
            }),
            countSourceReports({
                scope: inferred.scope,
                scopeId: inferred.scopeId,
                periodYear: report.periodYear,
                periodType: ReportPeriodType.YEARLY,
            }),
        ]);

        const params = new URLSearchParams({
            scope: inferred.scope,
            ...(inferred.scopeId ? { scopeId: inferred.scopeId } : {}),
            year: String(report.periodYear),
        });
        const monthly = new URLSearchParams(params);
        monthly.set("periodType", "MONTHLY");
        monthly.set("month", String(month));
        const quarterly = new URLSearchParams(params);
        quarterly.set("periodType", "QUARTERLY");
        quarterly.set("quarter", String(quarter));
        const yearly = new URLSearchParams(params);
        yearly.set("periodType", "YEARLY");

        const out: QuickView[] = [
            {
                period: "MONTHLY",
                label: `Monthly • Month ${month} ${report.periodYear}`,
                sourceCount: monthlyCount,
                href: `/reports/aggregate?${monthly.toString()}`,
            },
            {
                period: "QUARTERLY",
                label: `Quarterly • Q${quarter} ${report.periodYear}`,
                sourceCount: quarterlyCount,
                href: `/reports/aggregate?${quarterly.toString()}`,
            },
            {
                period: "YEARLY",
                label: `Yearly • ${report.periodYear}`,
                sourceCount: yearlyCount,
                href: `/reports/aggregate?${yearly.toString()}`,
            },
        ];

        const payload = { reportId: report.id, scope: inferred.scope, views: out };
        await cache.set(cacheKey, JSON.stringify(payload), 60);
        return NextResponse.json(successResponse(payload));
    } catch (err) {
        return handleApiError(err);
    }
}
