/**
 * app/api/org/campuses/route.ts
 * GET  /api/org/campuses  — list campuses (all authenticated users)
 * POST /api/org/campuses  — create campus (SUPERADMIN)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { getRequestContext } from "@/lib/server/requestContext";
import { createCampus } from "@/modules/org/services/orgWriteService";
import {
    errorResponse,
    handleApiError,
    successResponse,
    unauthorizedResponse,
} from "@/lib/utils/api";
import { UserRole } from "@/types/global";

const CreateCampusSchema = z.object({
    name: z.string().min(1).max(80),
    country: z.string().min(1).max(60).optional(),
    location: z.string().max(120).optional(),
    groupId: z.string().uuid().optional(),
    organisationId: z.string().min(1),
    adminId: z.string().uuid().optional(),
});

export async function GET(req: NextRequest) {
    const ctx = getRequestContext(req);
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return unauthorizedResponse(auth.error, ctx.requestId);
        }

        const cached = await cache.get("org:campuses:list");
        if (cached) {
            const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
            return NextResponse.json(parsed, { headers: { "x-request-id": ctx.requestId } });
        }

        const campuses = await db.campus.findMany({ orderBy: { name: "asc" } });
        const response = successResponse(campuses, ctx.requestId);
        await cache.set("org:campuses:list", JSON.stringify(response), 120);
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

        const body = CreateCampusSchema.parse(await req.json());
        const result = await createCampus({
            name: body.name,
            country: body.country,
            location: body.location,
            groupId: body.groupId,
            adminId: body.adminId,
        });
        if (!result.success) {
            return errorResponse(result.error, result.code, ctx.requestId);
        }

        return NextResponse.json(successResponse(result.data, ctx.requestId), {
            status: 201,
            headers: { "x-request-id": ctx.requestId },
        });
    } catch (err) {
        return handleApiError(err, { requestId: ctx.requestId, route: ctx.route });
    }
}
