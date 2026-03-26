/**
 * app/api/org/hierarchy/route.ts
 * GET /api/org/hierarchy  — returns org tree with group->campus structure
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { cache } from "@/lib/data/db";
import { getOrgHierarchy, scopeByRole, filterHierarchyByScope } from "@/lib/data/orgHierarchy";

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

        const raw = await getOrgHierarchy();
        const scope = scopeByRole(auth.user);
        const hierarchy = filterHierarchyByScope(raw, scope);

        const data = { success: true, data: hierarchy };
        await cache.set("org:hierarchy", JSON.stringify(data), 120);

        return NextResponse.json(data);
    } catch (err) {
        console.error("[api] Error in GET /api/org/hierarchy", err);
        return NextResponse.json({ success: false, error: "Failed to load org hierarchy." }, { status: 500 });
    }
}
