/**
 * app/api/org/hierarchy/route.ts
 * GET /api/org/hierarchy  — returns org tree with group->campus structure
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { getOrgHierarchy, scopeByRole, filterHierarchyByScope, OrgHierarchy } from "@/lib/data/orgHierarchy";
import { getRequestContext } from "@/lib/server/requestContext";
import { handleApiError, successResponse, unauthorizedResponse } from "@/lib/utils/api";
import { logServerWarn } from "@/lib/utils/serverLogger";

export async function GET(req: NextRequest) {
    const ctx = getRequestContext(req);
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return unauthorizedResponse(auth.error, ctx.requestId);
        }

        const cached = await cache.get("org:hierarchy");
        if (cached) {
            const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
            return NextResponse.json(parsed, { headers: { "x-request-id": ctx.requestId } });
        }

        let raw;
        try {
            raw = await getOrgHierarchy();
        } catch (err) {
            logServerWarn("[api] org/hierarchy primary fetch failed, trying fallback", {
                requestId: ctx.requestId,
                route: ctx.route,
                error: err instanceof Error ? err.message : String(err),
            });
            // fallback to explicit query in case helper fails due Prisma client settings
            const groups = await db.orgGroup.findMany({
                orderBy: { name: "asc" },
                include: { campuses: { orderBy: { name: "asc" } } },
            });
            raw = groups.map((group) => ({
                id: group.id,
                name: group.name,
                orgLevel: "GROUP",
                isActive: group.isActive,
                country: group.country ?? "",
                leaderId: group.leaderId ?? undefined,
                campuses: (group.campuses ?? []).map((campus) => ({
                    id: campus.id,
                    name: campus.name,
                    orgLevel: "CAMPUS",
                    parentId: campus.parentId,
                    isActive: campus.isActive,
                    country: campus.country ?? "",
                    location: campus.location ?? "",
                })),
            }));
        }

        const scope = scopeByRole(auth.user);
        const hierarchy = filterHierarchyByScope(raw as OrgHierarchy, scope);

        const data = successResponse(hierarchy, ctx.requestId);
        await cache.set("org:hierarchy", JSON.stringify(data), 120);

        return NextResponse.json(data, { headers: { "x-request-id": ctx.requestId } });
    } catch (err) {
        return handleApiError(err, { requestId: ctx.requestId, route: ctx.route });
    }
}
