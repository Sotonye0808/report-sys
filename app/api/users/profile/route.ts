/**
 * app/api/users/profile/route.ts
 * GET /api/users/profile  — get own profile
 * PUT /api/users/profile  — update own profile (name, phone)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { getRequestContext } from "@/lib/server/requestContext";
import { getOwnProfile, updateOwnProfile } from "@/modules/users/services/profileService";
import {
    handleApiError,
    successResponse,
    unauthorizedResponse,
    errorResponse,
} from "@/lib/utils/api";

/* ── Update schema ────────────────────────────────────────────────────────── */

const UpdateProfileSchema = z.object({
    firstName: z.string().min(1).max(60).optional(),
    lastName: z.string().min(1).max(60).optional(),
    phone: z.string().max(30).optional(),
});

/* ── GET /api/users/profile ───────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
    const ctx = getRequestContext(req);
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return unauthorizedResponse(auth.error, ctx.requestId);
        }

        const result = await getOwnProfile(auth.user.id);
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

/* ── PUT /api/users/profile ───────────────────────────────────────────────── */

export async function PUT(req: NextRequest) {
    const ctx = getRequestContext(req);
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return unauthorizedResponse(auth.error, ctx.requestId);
        }

        const body = UpdateProfileSchema.parse(await req.json());
        const result = await updateOwnProfile(auth.user.id, body);
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
