/**
 * app/api/org/groups/[id]/route.ts
 * GET /api/org/groups/:id
 * PUT /api/org/groups/:id  (SUPERADMIN)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
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
    const { id } = await params;
    const auth = await verifyAuth(req);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const group = await db.orgGroup.findUnique({ where: { id } });
    if (!group) {
        return NextResponse.json({ success: false, error: "Group not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: group });
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

    const body = UpdateGroupSchema.parse(await req.json());
    const group = await db.orgGroup.findUnique({ where: { id } });
    if (!group) {
        return NextResponse.json({ success: false, error: "Group not found." }, { status: 404 });
    }

    const updated = await db.orgGroup.update({
        where: { id },
        data: {
            ...(body.name !== undefined && { name: body.name }),
            ...(body.country !== undefined && { country: body.country }),
            ...(body.leaderId !== undefined && { leaderId: body.leaderId }),
        },
    });

    await cache.invalidatePattern("org:groups:*");
    return NextResponse.json({ success: true, data: updated });
}
