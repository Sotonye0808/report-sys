/**
 * app/api/org/groups/route.ts
 * GET  /api/org/groups  — list org groups
 * POST /api/org/groups  — create group (SUPERADMIN)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";
import { UserRole } from "@/types/global";

const CreateGroupSchema = z.object({
    name: z.string().min(1).max(80),
    country: z.string().max(60).optional(),
    organisationId: z.string().min(1),
    leaderId: z.string().uuid().optional(),
});

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const cached = await mockCache.get("org:groups:list");
    if (cached) return NextResponse.json(JSON.parse(cached));

    const groups = await mockDb.orgGroups.findMany({});
    const sorted = [...groups].sort((a, b) => a.name.localeCompare(b.name));
    const response = { success: true, data: sorted };
    await mockCache.set("org:groups:list", JSON.stringify(response), 120);
    return NextResponse.json(response);
}

export async function POST(req: NextRequest) {
    const auth = await verifyAuth(req, [UserRole.SUPERADMIN]);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const body = CreateGroupSchema.parse(await req.json());

    const group = await mockDb.orgGroups.create({
        data: {
            id: crypto.randomUUID(),
            orgLevel: "GROUP",
            isActive: true,
            country: body.country ?? "",
            leaderId: body.leaderId ?? "",
            ...body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        } as OrgGroup,
    });

    await mockCache.invalidatePattern("org:groups:*");
    return NextResponse.json({ success: true, data: group }, { status: 201 });
}
