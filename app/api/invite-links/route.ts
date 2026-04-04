/**
 * app/api/invite-links/route.ts
 * POST /api/invite-links  — create invite link (SUPERADMIN + leaders)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db } from "@/lib/data/db";
import { getRequestContext } from "@/lib/server/requestContext";
import { createInviteLink } from "@/modules/users/services/inviteService";
import {
  handleApiError,
  successResponse,
  unauthorizedResponse,
  errorResponse,
} from "@/lib/utils/api";
import { logServerInfo } from "@/lib/utils/serverLogger";
import { UserRole } from "@/types/global";

const ALLOWED_ROLES = [
  UserRole.SUPERADMIN,
  UserRole.CAMPUS_ADMIN,
  UserRole.CAMPUS_PASTOR,
  UserRole.GROUP_ADMIN,
  UserRole.GROUP_PASTOR,
  UserRole.SPO,
  UserRole.CEO,
  UserRole.CHURCH_MINISTRY,
];

const CreateInviteLinkSchema = z.object({
  targetRole: z.nativeEnum(UserRole),
  recipientEmail: z.string().email().optional(),
  campusId: z.string().uuid().optional(),
  groupId: z.string().uuid().optional(),
  expiresInHours: z.coerce.number().min(1).max(720).default(72),
  note: z.string().max(200).optional(),
});

export async function GET(req: NextRequest) {
  const ctx = getRequestContext(req);
  try {
    const auth = await verifyAuth(req, ALLOWED_ROLES);
    if (!auth.success) {
      return unauthorizedResponse(auth.error, ctx.requestId);
    }

    const links = await db.inviteLink.findMany({
      where: { createdById: auth.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(successResponse(links, ctx.requestId), {
      headers: { "x-request-id": ctx.requestId },
    });
  } catch (err) {
    return handleApiError(err, { requestId: ctx.requestId, route: ctx.route });
  }
}

export async function POST(req: NextRequest) {
  const ctx = getRequestContext(req);
  try {
    const auth = await verifyAuth(req, ALLOWED_ROLES);
    if (!auth.success) {
      return unauthorizedResponse(auth.error, ctx.requestId);
    }

    const body = CreateInviteLinkSchema.parse(await req.json());
    const result = await createInviteLink(body, {
      id: auth.user.id,
      role: auth.user.role,
      firstName: auth.user.firstName,
      lastName: auth.user.lastName,
    });

    if (!result.success) {
      return errorResponse(result.error, result.code, ctx.requestId);
    }

    logServerInfo("[invite-links] created", {
      requestId: ctx.requestId,
      route: ctx.route,
      actorId: auth.user.id,
      targetRole: body.targetRole,
      hasRecipientEmail: Boolean(body.recipientEmail),
    });

    return NextResponse.json(successResponse(result.data, ctx.requestId), {
      status: 201,
      headers: { "x-request-id": ctx.requestId },
    });
  } catch (err) {
    return handleApiError(err, {
      requestId: ctx.requestId,
      route: ctx.route,
    });
  }
}
