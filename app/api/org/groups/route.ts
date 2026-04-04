/**
 * app/api/org/groups/route.ts
 * GET  /api/org/groups  — list org groups
 * POST /api/org/groups  — create group (SUPERADMIN)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { getRequestContext } from "@/lib/server/requestContext";
import { createGroup } from "@/modules/org/services/orgWriteService";
import {
    errorResponse,
    handleApiError,
    successResponse,
    unauthorizedResponse,
} from "@/lib/utils/api";
import { logServerInfo } from "@/lib/utils/serverLogger";
import { UserRole } from "@/types/global";

const CreateGroupSchema = z.object({
    name: z.string().min(1).max(80),
    country: z.string().max(60).optional(),
    organisationId: z.string().min(1),
    leaderId: z.string().uuid().optional(),
});

export async function GET(req: NextRequest) {
    const ctx = getRequestContext(req);
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return unauthorizedResponse(auth.error, ctx.requestId);
        }

        const cached = await cache.get("org:groups:list");
        if (cached) {
            const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
            return NextResponse.json(parsed, { headers: { "x-request-id": ctx.requestId } });
        }

        const groups = await db.orgGroup.findMany({ orderBy: { name: "asc" } });
        const response = successResponse(groups, ctx.requestId);
        await cache.set("org:groups:list", JSON.stringify(response), 120);
        return NextResponse.json(response, { headers: { "x-request-id": ctx.requestId } });
    } catch (err) {
        return handleApiError(err, { requestId: ctx.requestId, route: ctx.route });
    }
}

export async function POST(req: NextRequest) {
    const ctx = getRequestContext(req);
    try {
        const auth = await verifyAuth(req, [UserRole.SUPERADMIN]);
        if (!auth.success) {
            return unauthorizedResponse(auth.error, ctx.requestId);
        }

        const body = CreateGroupSchema.parse(await req.json());
        const result = await createGroup({
            name: body.name,
            country: body.country,
            leaderId: body.leaderId,
        });
        if (!result.success) {
            return errorResponse(result.error, result.code, ctx.requestId);
        }

        logServerInfo("[org/groups] created", {
            requestId: ctx.requestId,
            route: ctx.route,
            actorId: auth.user.id,
            groupId: result.data.id,
        });

        return NextResponse.json(successResponse(result.data, ctx.requestId), {
            status: 201,
            headers: { "x-request-id": ctx.requestId },
        });
    } catch (err) {
        return handleApiError(err, { requestId: ctx.requestId, route: ctx.route });
    }
}
