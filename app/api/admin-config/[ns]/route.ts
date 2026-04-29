/**
 * GET  /api/admin-config/[ns]   — load a namespace snapshot
 * PUT  /api/admin-config/[ns]   — write a new version (optimistic-lock)
 *
 * Superadmin only. Optimistic-lock conflicts return 409.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import {
    successResponse,
    forbiddenResponse,
    badRequestResponse,
    errorResponse,
    handleApiError,
} from "@/lib/utils/api";
import {
    loadAdminConfig,
    writeAdminConfig,
    AdminConfigConflictError,
    type AdminConfigNamespaceName,
} from "@/lib/data/adminConfig";
import { sanitiseRoleConfigPayload } from "@/lib/auth/permissions";
import { UserRole } from "@/types/global";

const ALLOWED_NS: AdminConfigNamespaceName[] = [
    "roles",
    "hierarchy",
    "dashboardLayout",
    "templatesMapping",
    "imports",
    "pwaInstall",
    "bulkInvites",
    "analytics",
];

function resolveNs(raw: string): AdminConfigNamespaceName | null {
    return (ALLOWED_NS as string[]).includes(raw) ? (raw as AdminConfigNamespaceName) : null;
}

export async function GET(
    req: NextRequest,
    ctx: { params: Promise<{ ns: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        if (auth.user.role !== UserRole.SUPERADMIN) {
            return NextResponse.json(forbiddenResponse("Admin config requires superadmin"), { status: 403 });
        }
        const { ns: rawNs } = await ctx.params;
        const ns = resolveNs(rawNs);
        if (!ns) return NextResponse.json(badRequestResponse("Unknown namespace"), { status: 400 });
        const snap = await loadAdminConfig(ns);
        return NextResponse.json(successResponse(snap));
    } catch (err) {
        return handleApiError(err);
    }
}

const PutSchema = z.object({
    payload: z.record(z.string(), z.unknown()),
    baseVersion: z.number().int().nonnegative(),
    notes: z.string().max(500).optional(),
});

export async function PUT(
    req: NextRequest,
    ctx: { params: Promise<{ ns: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        if (auth.user.role !== UserRole.SUPERADMIN) {
            return NextResponse.json(forbiddenResponse("Admin config requires superadmin"), { status: 403 });
        }
        const { ns: rawNs } = await ctx.params;
        const ns = resolveNs(rawNs);
        if (!ns) return NextResponse.json(badRequestResponse("Unknown namespace"), { status: 400 });

        const body = await req.json();
        const parsed = PutSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid payload"), {
                status: 400,
            });
        }

        let payload = parsed.data.payload;
        if (ns === "roles" && payload && typeof payload === "object" && "roleConfig" in payload) {
            payload = {
                ...payload,
                roleConfig: sanitiseRoleConfigPayload(
                    payload.roleConfig as Partial<Record<UserRole, Partial<RoleConfig>>>,
                ),
            };
        }

        const snap = await writeAdminConfig({
            namespace: ns,
            payload,
            baseVersion: parsed.data.baseVersion,
            actorId: auth.user.id,
            notes: parsed.data.notes,
        });
        return NextResponse.json(successResponse(snap));
    } catch (err) {
        if (err instanceof AdminConfigConflictError) {
            return errorResponse(err.message, 409);
        }
        return handleApiError(err);
    }
}
