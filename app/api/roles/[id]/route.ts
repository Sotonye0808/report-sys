/**
 * GET    /api/roles/[id] — fetch a role + its pinned units
 * PATCH  /api/roles/[id] — update a role (system rows: label/cadence only;
 *                         SUPERADMIN: rejected entirely)
 * DELETE /api/roles/[id] — soft-delete (archive) a non-system role
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
    getRole,
    updateRole,
    archiveRole,
    RoleValidationError,
} from "@/lib/data/role";

function canManageRoles(role: UserRole): boolean {
    return role === UserRole.SUPERADMIN || Boolean(ROLE_CONFIG[role]?.canManageAdminConfig);
}

const PatchSchema = z.object({
    code: z.string().min(2).max(64).optional(),
    label: z.string().min(1).max(120).optional(),
    description: z.string().max(2000).nullable().optional(),
    hierarchyOrder: z.number().int().min(0).max(99).optional(),
    dashboardMode: z.string().max(64).optional(),
    reportVisibilityScope: z.enum(["all", "group", "campus", "own"]).optional(),
    capabilities: z.record(z.string(), z.boolean()).optional(),
    cadence: z.record(z.string(), z.unknown()).nullable().optional(),
    scopeUnitIds: z.array(z.string().uuid()).max(500).optional(),
});

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        const { id } = await ctx.params;
        const row = await getRole(id);
        if (!row) return NextResponse.json(notFoundResponse("Role not found"), { status: 404 });
        return NextResponse.json(successResponse(row));
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
        if (!canManageRoles(auth.user.role)) {
            return NextResponse.json(forbiddenResponse("Cannot manage roles"), { status: 403 });
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
            const updated = await updateRole(id, parsed.data);
            return NextResponse.json(successResponse(updated));
        } catch (err) {
            if (err instanceof RoleValidationError) {
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
        if (!canManageRoles(auth.user.role)) {
            return NextResponse.json(forbiddenResponse("Cannot manage roles"), { status: 403 });
        }
        const { id } = await ctx.params;
        try {
            const archived = await archiveRole(id);
            return NextResponse.json(successResponse(archived));
        } catch (err) {
            if (err instanceof RoleValidationError) {
                return NextResponse.json(badRequestResponse(err.reason), { status: 400 });
            }
            throw err;
        }
    } catch (err) {
        return handleApiError(err);
    }
}
