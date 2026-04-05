/**
 * app/api/reports/[id]/history/route.ts
 * GET /api/reports/:id/history — get all events for a report
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import {
    successResponse,
    unauthorizedResponse,
    notFoundResponse,
    handleApiError,
    errorResponse,
} from "@/lib/utils/api";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole } from "@/types/global";
import { parseCachedJsonSafe } from "@/lib/utils/cacheJson";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id } = await params;
        const report = await db.report.findUnique({ where: { id } });
        if (!report) return notFoundResponse("Report not found.");

        /* Scope check */
        const roleConfig = ROLE_CONFIG[auth.user.role as UserRole];
        if (roleConfig.reportVisibilityScope === "campus" && report.campusId !== auth.user.campusId) {
            return errorResponse("You do not have access to this report.", 403);
        }

        const cacheKey = `report:${id}:history`;
        const cached = await cache.get(cacheKey);
        const parsedCached = parseCachedJsonSafe<ReportEvent[]>(cached);
        if (parsedCached) return NextResponse.json(successResponse(parsedCached));

        const events = await db.reportEvent.findMany({
            where: { reportId: id },
            orderBy: { timestamp: "desc" },
        });

        await cache.set(cacheKey, JSON.stringify(events), 60);
        return NextResponse.json(successResponse(events));
    } catch (err) {
        return handleApiError(err);
    }
}
