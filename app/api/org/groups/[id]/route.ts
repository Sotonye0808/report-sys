/**
 * app/api/org/groups/[id]/route.ts
 * GET /api/org/groups/:id
 * PUT /api/org/groups/:id  (SUPERADMIN)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db } from "@/lib/data/db";
import { getRequestContext } from "@/lib/server/requestContext";
import { updateGroup } from "@/modules/org/services/orgWriteService";
import {
    errorResponse,
    handleApiError,
    successResponse,
    unauthorizedResponse,
} from "@/lib/utils/api";
import { UserRole } from "@/types/global";

const UpdateGroupSchema = z.object({
    name: z.string().min(1).max(80).optional(),
    country: z.string().max(60).optional(),
    leaderId: z.string().uuid().nullable().optional(),
});

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const ctx = getRequestContext(req);
    try {
        const { id } = await params;
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return unauthorizedResponse(auth.error, ctx.requestId);
        }

        const group = await db.orgGroup.findUnique({ where: { id } });
        if (!group) {
            return errorResponse("Group not found.", 404, ctx.requestId);
        }
        return NextResponse.json(successResponse(group, ctx.requestId), {
            headers: { "x-request-id": ctx.requestId },
        });
    } catch (err) {
        return handleApiError(err, { requestId: ctx.requestId, route: ctx.route });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const ctx = getRequestContext(req);
    try {
        const { id } = await params;
        const auth = await verifyAuth(req, [UserRole.SUPERADMIN]);
        if (!auth.success) {
            return unauthorizedResponse(auth.error, ctx.requestId);
        }

        const body = UpdateGroupSchema.parse(await req.json());
        const result = await updateGroup(id, body);
        if (!result.success) {
            return errorResponse(result.error, result.code, ctx.requestId);
        }

        return NextResponse.json(successResponse(result.data, ctx.requestId), {
            headers: { "x-request-id": ctx.requestId },
        });
    } catch (err) {
        return handleApiError(err, { requestId: ctx.requestId, route: ctx.route });
    }
}
