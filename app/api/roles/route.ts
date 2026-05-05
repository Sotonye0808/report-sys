/**
 * GET  /api/roles      — list all (non-archived) roles + their pinned units
 * POST /api/roles      — create a new custom role (canManageAdminConfig)
 *
 * The existing `/api/admin-config/roles` endpoints stay untouched and serve
 * the legacy capability-overlay path. This surface is the runtime CRUD layer
 * that supports CREATE; it operates on the DB-backed Role table directly.
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
import { listRoles, createRole, RoleValidationError } from "@/lib/data/role";

function canManageRoles(role: UserRole): boolean {
    return role === UserRole.SUPERADMIN || Boolean(ROLE_CONFIG[role]?.canManageAdminConfig);
}

const CreateSchema = z.object({
    code: z.string().min(2).max(64),
    label: z.string().min(1).max(120),
    description: z.string().max(2000).nullable().optional(),
    hierarchyOrder: z.number().int().min(0).max(99).optional(),
    dashboardMode: z.string().max(64).optional(),
    reportVisibilityScope: z.enum(["all", "group", "campus", "own"]).optional(),
    capabilities: z.record(z.string(), z.boolean()).optional(),
    cadence: z.record(z.string(), z.unknown()).nullable().optional(),
    scopeUnitIds: z.array(z.string().uuid()).max(500).optional(),
});

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        const url = new URL(req.url);
        const includeArchived = url.searchParams.get("includeArchived") === "true";
        const rows = await listRoles({ includeArchived });
        return NextResponse.json(successResponse(rows));
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
        if (!canManageRoles(auth.user.role)) {
            return NextResponse.json(forbiddenResponse("Cannot create roles"), { status: 403 });
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
            const created = await createRole(parsed.data);
            return NextResponse.json(successResponse(created));
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
