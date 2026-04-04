/**
 * app/api/org/campuses/[id]/route.ts
 * GET /api/org/campuses/:id
 * PUT /api/org/campuses/:id  (SUPERADMIN)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db } from "@/lib/data/db";
import { getRequestContext } from "@/lib/server/requestContext";
import { updateCampus } from "@/modules/org/services/orgWriteService";
import {
  errorResponse,
  handleApiError,
  successResponse,
  unauthorizedResponse,
} from "@/lib/utils/api";
import { UserRole } from "@/types/global";

const UpdateCampusSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  groupId: z.string().uuid().optional(),
  country: z.string().max(60).optional(),
  location: z.string().max(120).optional(),
  adminId: z.string().uuid().nullable().optional(),
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

    const campus = await db.campus.findUnique({ where: { id } });
    if (!campus) {
      return errorResponse("Campus not found.", 404, ctx.requestId);
    }
    return NextResponse.json(successResponse(campus, ctx.requestId), {
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

    const body = UpdateCampusSchema.parse(await req.json());
    const result = await updateCampus(id, body);
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
