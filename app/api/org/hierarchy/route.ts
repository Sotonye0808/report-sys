/**
 * app/api/org/hierarchy/route.ts
 * GET /api/org/hierarchy  — returns org tree with group->campus structure
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { getOrgHierarchy, scopeByRole, filterHierarchyByScope, OrgHierarchy } from "@/lib/data/orgHierarchy";

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
        }

        const cached = await cache.get("org:hierarchy");
        if (cached) {
            const parsed = JSON.parse(cached as string);
            return NextResponse.json(parsed);
        }

        let raw;
        try {
            raw = await getOrgHierarchy();
        } catch (err) {
            console.error("[api] org/hierarchy primary fetch failed, trying fallback", err);
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

        const data = { success: true, data: hierarchy };
        await cache.set("org:hierarchy", JSON.stringify(data), 120);

        return NextResponse.json(data);
    } catch (err) {
        console.error("[api] Error in GET /api/org/hierarchy", err);
        return NextResponse.json({ success: false, error: "Failed to load org hierarchy." }, { status: 500 });
    }
}
