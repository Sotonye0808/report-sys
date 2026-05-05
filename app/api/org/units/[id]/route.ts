/**
 * GET    /api/org/units/[id] — fetch a unit by id (auth-required)
 * PATCH  /api/org/units/[id] — update a unit (canManageOrg)
 * DELETE /api/org/units/[id] — soft-delete (archive) a unit + descendants
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import {
    successResponse,
    forbiddenResponse,
    badRequestResponse,
    notFoundResponse,
    handleApiError,
} from "@/lib/utils/api";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole } from "@/types/global";
import {
    getUnit,
    updateUnit,
    archiveUnit,
    OrgUnitValidationError,
} from "@/lib/data/orgUnit";
import { invalidateOrgUnitGraphCache } from "@/lib/data/orgUnitMatcher";

function canManageOrg(role: UserRole): boolean {
    return Boolean(ROLE_CONFIG[role]?.canManageOrg) || role === UserRole.SUPERADMIN;
}

const PatchSchema = z.object({
    code: z.string().max(120).nullable().optional(),
    level: z.string().min(1).max(64).optional(),
    name: z.string().min(1).max(200).optional(),
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

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        const { id } = await ctx.params;
        const unit = await getUnit(id);
        if (!unit) return NextResponse.json(notFoundResponse("Org unit not found"), { status: 404 });
        return NextResponse.json(successResponse(unit));
    } catch (err) {
        return handleApiError(err);
    }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
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
        const parsed = PatchSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid payload"),
                { status: 400 },
            );
        }
        try {
            const updated = await updateUnit(id, parsed.data);
            invalidateOrgUnitGraphCache();
            return NextResponse.json(successResponse(updated));
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

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        if (!canManageOrg(auth.user.role)) {
            return NextResponse.json(forbiddenResponse("Cannot manage org units"), { status: 403 });
        }
        const { id } = await ctx.params;
        const result = await archiveUnit(id);
        invalidateOrgUnitGraphCache();
        return NextResponse.json(successResponse(result));
    } catch (err) {
        return handleApiError(err);
    }
}
