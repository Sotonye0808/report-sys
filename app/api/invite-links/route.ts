/**
 * app/api/invite-links/route.ts
 * POST /api/invite-links  — create invite link (SUPERADMIN + leaders)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db } from "@/lib/data/db";
import { UserRole, InviteLinkType, HIERARCHY_ORDER } from "@/types/global";

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
  campusId: z.string().uuid().optional(),
  groupId: z.string().uuid().optional(),
  expiresInHours: z.coerce.number().min(1).max(720).default(72),
  note: z.string().max(200).optional(),
});

export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req, ALLOWED_ROLES);
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
  }

  const links = await db.inviteLink.findMany({
    where: { createdById: auth.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, data: links });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req, ALLOWED_ROLES);
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
  }

  const body = CreateInviteLinkSchema.parse(await req.json());

  // Enforce role hierarchy: user can only invite roles below them (except SUPERADMIN who can invite any)
  const creatorOrder = HIERARCHY_ORDER[auth.user.role];
  const targetOrder = HIERARCHY_ORDER[body.targetRole];
  if (auth.user.role !== UserRole.SUPERADMIN && targetOrder <= creatorOrder) {
    return NextResponse.json(
      { success: false, error: "Cannot create invite for a role at or above your level" },
      { status: 403 },
    );
  }

  const expiresAt = new Date(Date.now() + body.expiresInHours * 3600 * 1000).toISOString();
  const token = crypto.randomUUID().replace(/-/g, "");

  const link = await db.inviteLink.create({
    data: {
      token,
      type: InviteLinkType.DIRECT,
      targetRole: body.targetRole,
      campusId: body.campusId,
      groupId: body.groupId,
      createdById: auth.user.id,
      expiresAt,
      note: body.note,
      isActive: true,
    },
  });

  return NextResponse.json({ success: true, data: link }, { status: 201 });
}
