/**
 * app/api/analytics/overview/route.ts
 * GET /api/analytics/overview
 * Returns aggregated metrics for the caller's scope.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole, ReportStatus } from "@/types/global";

const QuerySchema = z.object({
  campusId:   z.string().uuid().optional(),
  groupId:    z.string().uuid().optional(),
  periodType: z.string().optional(),
  year:       z.coerce.number().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
  }

  const query = QuerySchema.parse(Object.fromEntries(new URL(req.url).searchParams));

  const cacheKey = `analytics:overview:${auth.user.id}:${JSON.stringify(query)}`;
  const cached = await mockCache.get(cacheKey);
  if (cached) return NextResponse.json(JSON.parse(cached));

  const roleConfig = ROLE_CONFIG[auth.user.role as UserRole];
  let reports: Report[] = await mockDb.reports.findMany({});

  /* Scope filter */
  if (roleConfig?.reportVisibilityScope === "campus" && auth.user.campusId) {
    reports = reports.filter((r) => r.campusId === auth.user.campusId);
  }

  /* Additional filters from query */
  if (query.campusId) reports = reports.filter((r) => r.campusId === query.campusId);
  if (query.year) {
    reports = reports.filter((r) => new Date(r.createdAt).getFullYear() === query.year);
  }

  const total      = reports.length;
  const submitted  = reports.filter((r) => r.status === ReportStatus.SUBMITTED).length;
  const approved   = reports.filter((r) => r.status === ReportStatus.APPROVED).length;
  const reviewed   = reports.filter((r) => r.status === ReportStatus.REVIEWED).length;
  const locked     = reports.filter((r) => r.status === ReportStatus.LOCKED).length;
  const draft      = reports.filter((r) => r.status === ReportStatus.DRAFT).length;
  const requiresEdits = reports.filter((r) => r.status === ReportStatus.REQUIRES_EDITS).length;

  /* Compliance: reports that reached APPROVED or beyond / total (excluding pure drafts) */
  const eligible   = total - draft;
  const compliant  = approved + reviewed + locked;
  const compliance = eligible > 0 ? Math.round((compliant / eligible) * 100) : 0;

  /* Submission trend — group by month */
  const submissionsByMonth: Record<string, number> = {};
  for (const r of reports) {
    if (r.status !== ReportStatus.DRAFT) {
      const key = r.createdAt.slice(0, 7); /* YYYY-MM */
      submissionsByMonth[key] = (submissionsByMonth[key] ?? 0) + 1;
    }
  }
  const submissionTrend = Object.entries(submissionsByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, count]) => ({ month, count }));

  /* Campus breakdown */
  const campusMap: Record<string, { submitted: number; approved: number }> = {};
  for (const r of reports) {
    if (!campusMap[r.campusId]) campusMap[r.campusId] = { submitted: 0, approved: 0 };
    if (r.status !== ReportStatus.DRAFT) campusMap[r.campusId].submitted++;
    if ([ReportStatus.APPROVED, ReportStatus.REVIEWED, ReportStatus.LOCKED].includes(r.status)) {
      campusMap[r.campusId].approved++;
    }
  }
  const campusBreakdown = Object.entries(campusMap).map(([campusId, stats]) => ({
    campusId,
    ...stats,
    complianceRate: stats.submitted > 0 ? Math.round((stats.approved / stats.submitted) * 100) : 0,
  }));

  const data = {
    totals: { total, submitted, approved, reviewed, locked, draft, requiresEdits },
    compliance,
    submissionTrend,
    campusBreakdown,
  };

  const response = { success: true, data };
  await mockCache.set(cacheKey, JSON.stringify(response), 60);
  return NextResponse.json(response);
}
