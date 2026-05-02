/**
 * GET /api/impersonation/sessions
 * Paginated history of impersonation sessions for the calling SUPERADMIN.
 * Optional `?include=events` returns the per-session event list inline.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/data/prisma";
import { verifyAuth } from "@/lib/utils/auth";
import { successResponse, forbiddenResponse, handleApiError } from "@/lib/utils/api";
import { UserRole } from "@/types/global";

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        const actualRole = auth.user.actualRole ?? auth.user.role;
        if (actualRole !== UserRole.SUPERADMIN) {
            return NextResponse.json(forbiddenResponse("SUPERADMIN-only"), { status: 403 });
        }
        const url = new URL(req.url);
        const includeEvents = url.searchParams.get("include") === "events";
        const take = Math.min(Math.max(Number(url.searchParams.get("pageSize") ?? 25), 1), 100);
        const skip = Math.max(Number(url.searchParams.get("page") ?? 0), 0) * take;

        const [rows, total] = await Promise.all([
            prisma.impersonationSession.findMany({
                where: { superadminId: auth.user.id },
                orderBy: [{ startedAt: "desc" }],
                skip,
                take,
                include: includeEvents
                    ? { events: { orderBy: { createdAt: "asc" }, take: 200 } }
                    : undefined,
            }),
            prisma.impersonationSession.count({ where: { superadminId: auth.user.id } }),
        ]);

        return NextResponse.json(successResponse({ rows, total }));
    } catch (err) {
        return handleApiError(err);
    }
}
