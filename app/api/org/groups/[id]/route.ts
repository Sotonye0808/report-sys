/**
 * app/api/org/groups/[id]/route.ts
 * GET /api/org/groups/:id
 * PUT /api/org/groups/:id  (SUPERADMIN)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";
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

    const group = await mockDb.orgGroups.findFirst({ where: { id } });
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
    const group = await mockDb.orgGroups.findFirst({ where: { id } });
    if (!group) {
        return NextResponse.json({ success: false, error: "Group not found." }, { status: 404 });
    }

    const updated = await mockDb.orgGroups.update({
        where: { id },
        data: { ...body, leaderId: body.leaderId ?? undefined, updatedAt: new Date().toISOString() } as Partial<OrgGroup>,
    });

    await mockCache.invalidatePattern("org:groups:*");
    return NextResponse.json({ success: true, data: updated });
}
