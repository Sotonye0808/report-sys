/**
 * GET  /api/org/units                  — list units (filterable)
 * GET  /api/org/units?tree=true        — return grouped tree(s) by rootKey
 * POST /api/org/units                  — create a unit (canManageOrg)
 *
 * Polymorphic substrate: callers don't need to know whether a unit is a
 * "Campus", "Group", or anything else admins have defined.
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
import {
    listUnits,
    tree,
    createUnit,
    OrgUnitValidationError,
} from "@/lib/data/orgUnit";
import { invalidateOrgUnitGraphCache } from "@/lib/data/orgUnitMatcher";

function canManageOrg(role: UserRole): boolean {
    return Boolean(ROLE_CONFIG[role]?.canManageOrg) || role === UserRole.SUPERADMIN;
}

const CreateSchema = z.object({
    id: z.string().uuid().optional(),
    code: z.string().max(120).optional(),
    level: z.string().min(1).max(64),
    name: z.string().min(1).max(200),
    description: z.string().max(2000).nullable().optional(),
    parentId: z.string().uuid().nullable().optional(),
    rootKey: z.string().min(1).max(120).optional(),
    country: z.string().max(120).nullable().optional(),
    location: z.string().max(120).nullable().optional(),
    address: z.string().max(500).nullable().optional(),
    phone: z.string().max(64).nullable().optional(),
    leaderId: z.string().uuid().nullable().optional(),
    adminId: z.string().uuid().nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
    isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        const url = new URL(req.url);
        const treeMode = url.searchParams.get("tree") === "true";
        const rootKey = url.searchParams.get("rootKey") ?? undefined;
        const level = url.searchParams.get("level") ?? undefined;
        const includeArchived = url.searchParams.get("includeArchived") === "true";

        if (treeMode) {
            const trees = await tree({ rootKey, includeArchived });
            return NextResponse.json(successResponse({ trees }));
        }
        const units = await listUnits({ rootKey, level, includeArchived });
        return NextResponse.json(successResponse(units));
    } catch (err) {
        return handleApiError(err);
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        if (!canManageOrg(auth.user.role)) {
            return NextResponse.json(forbiddenResponse("Cannot manage org units"), { status: 403 });
        }
        const body = await req.json().catch(() => ({}));
        const parsed = CreateSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid payload"),
                { status: 400 },
            );
        }
        try {
            const created = await createUnit(parsed.data);
            invalidateOrgUnitGraphCache();
            return NextResponse.json(successResponse(created));
        } catch (err) {
            if (err instanceof OrgUnitValidationError) {
                return NextResponse.json(badRequestResponse(err.reason), { status: 400 });
            }
            throw err;
        }
    } catch (err) {
        return handleApiError(err);
    }
}
