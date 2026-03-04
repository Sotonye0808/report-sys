/**
 * app/api/reports/[id]/history/route.ts
 * GET /api/reports/:id/history — get all events for a report
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";
import {
    successResponse,
    unauthorizedResponse,
    notFoundResponse,
    handleApiError,
    errorResponse,
} from "@/lib/utils/api";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole } from "@/types/global";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id } = await params;
        const report = await mockDb.reports.findUnique({ where: { id } });
        if (!report) return notFoundResponse("Report not found.");

        /* Scope check */
        const roleConfig = ROLE_CONFIG[auth.user.role as UserRole];
        if (roleConfig.reportVisibilityScope === "campus" && report.campusId !== auth.user.campusId) {
            return errorResponse("You do not have access to this report.", 403);
        }

        const cacheKey = `report:${id}:history`;
        const cached = await mockCache.get(cacheKey);
        if (cached) return NextResponse.json(successResponse(JSON.parse(cached)));

        const events = await mockDb.reportEvents.findMany({
            where: (e: ReportEvent) => e.reportId === id,
        });

        const sorted = [...events].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );

        await mockCache.set(cacheKey, JSON.stringify(sorted), 60);
        return NextResponse.json(successResponse(sorted));
    } catch (err) {
        return handleApiError(err);
    }
}
