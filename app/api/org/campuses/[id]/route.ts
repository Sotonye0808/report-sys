/**
 * app/api/org/campuses/[id]/route.ts
 * GET /api/org/campuses/:id
 * PUT /api/org/campuses/:id  (SUPERADMIN)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache, invalidateCache } from "@/lib/data/db";
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
  const { id } = await params;
  const auth = await verifyAuth(req);
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
  }

  const campus = await db.campus.findUnique({ where: { id } });
  if (!campus) {
    return NextResponse.json({ success: false, error: "Campus not found." }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: campus });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await verifyAuth(req, [UserRole.SUPERADMIN]);
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
  }

  const body = UpdateCampusSchema.parse(await req.json());
  const campus = await db.campus.findUnique({ where: { id } });
  if (!campus) {
    return NextResponse.json({ success: false, error: "Campus not found." }, { status: 404 });
  }

  const updated = await db.campus.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.groupId !== undefined && { parentId: body.groupId }),
      ...(body.country !== undefined && { country: body.country }),
      ...(body.location !== undefined && { location: body.location }),
      ...(body.adminId !== undefined && { adminId: body.adminId }),
    },
  });

  await invalidateCache("org:campuses:*");
  await invalidateCache("org:groups:*");
  await invalidateCache("org:hierarchy");
  return NextResponse.json({ success: true, data: updated });
}
