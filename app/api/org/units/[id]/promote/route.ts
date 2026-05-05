/**
 * POST /api/org/units/[id]/promote
 *
 * Promotes a unit (and its descendants) into a parallel root tree under the
 * supplied `rootKey`. Used when an admin wants e.g. a "Departments" tree to
 * live alongside the existing "primary" Group→Campus tree.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import {
    successResponse,
    forbiddenResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole } from "@/types/global";
import { promoteToRoot } from "@/lib/data/orgUnit";
import { invalidateOrgUnitGraphCache } from "@/lib/data/orgUnitMatcher";

function canManageOrg(role: UserRole): boolean {
    return Boolean(ROLE_CONFIG[role]?.canManageOrg) || role === UserRole.SUPERADMIN;
}

const Schema = z.object({
    rootKey: z.string().min(1).max(120),
});

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        if (!canManageOrg(auth.user.role)) {
            return NextResponse.json(forbiddenResponse("Cannot manage org units"), { status: 403 });
        }
        const { id } = await ctx.params;
        const body = await req.json().catch(() => ({}));
        const parsed = Schema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid payload"),
                { status: 400 },
            );
        }
        await promoteToRoot(id, parsed.data.rootKey);
        invalidateOrgUnitGraphCache();
        return NextResponse.json(successResponse({ id, rootKey: parsed.data.rootKey }));
    } catch (err) {
        return handleApiError(err);
    }
}
