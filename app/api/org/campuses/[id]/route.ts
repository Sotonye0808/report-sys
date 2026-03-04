/**
 * app/api/org/campuses/[id]/route.ts
 * GET /api/org/campuses/:id
 * PUT /api/org/campuses/:id  (SUPERADMIN)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";
import { UserRole } from "@/types/global";

const UpdateCampusSchema = z.object({
  name: z.string().min(1).max(80).optional(),
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

  const campus = await mockDb.campuses.findFirst({ where: { id } });
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
  const campus = await mockDb.campuses.findFirst({ where: { id } });
  if (!campus) {
    return NextResponse.json({ success: false, error: "Campus not found." }, { status: 404 });
  }

  const updated = await mockDb.campuses.update({
    where: { id },
    data: { ...body, adminId: body.adminId ?? undefined, updatedAt: new Date().toISOString() } as Partial<Campus>,
  });

  await mockCache.invalidatePattern("org:campuses:*");
  return NextResponse.json({ success: true, data: updated });
}
