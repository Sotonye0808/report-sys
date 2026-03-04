/**
 * app/api/invite-links/route.ts
 * POST /api/invite-links  — create invite link (SUPERADMIN + leaders)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { mockDb } from "@/lib/data/mockDb";
import { UserRole, InviteLinkType } from "@/types/global";

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

  const links = await mockDb.inviteLinks.findMany({
    where: (l: InviteLink) => l.createdById === auth.user.id,
  });
  const sorted = [...links].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return NextResponse.json({ success: true, data: sorted });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req, ALLOWED_ROLES);
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
  }

  const body = CreateInviteLinkSchema.parse(await req.json());

  const expiresAt = new Date(Date.now() + body.expiresInHours * 3600 * 1000).toISOString();
  const token = crypto.randomUUID().replace(/-/g, "");

  const link = await mockDb.inviteLinks.create({
    data: {
      id: crypto.randomUUID(),
      token,
      type: InviteLinkType.DIRECT,
      targetRole: body.targetRole,
      campusId: body.campusId ?? undefined,
      groupId: body.groupId ?? undefined,
      createdById: auth.user.id,
      expiresAt,
      usedAt: undefined,
      note: body.note ?? undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  });

  return NextResponse.json({ success: true, data: link }, { status: 201 });
}
