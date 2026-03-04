/**
 * app/api/org/campuses/route.ts
 * GET  /api/org/campuses  — list campuses (all authenticated users)
 * POST /api/org/campuses  — create campus (SUPERADMIN)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";
import { UserRole } from "@/types/global";

const CreateCampusSchema = z.object({
    name: z.string().min(1).max(80),
    country: z.string().min(1).max(60).optional(),
    location: z.string().max(120).optional(),
    groupId: z.string().uuid().optional(),
    organisationId: z.string().min(1),
    adminId: z.string().uuid().optional(),
});

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const cached = await mockCache.get("org:campuses:list");
    if (cached) return NextResponse.json(JSON.parse(cached));

    const campuses = await mockDb.campuses.findMany({});
    const sorted = [...campuses].sort((a, b) => a.name.localeCompare(b.name));
    const response = { success: true, data: sorted };
    await mockCache.set("org:campuses:list", JSON.stringify(response), 120);
    return NextResponse.json(response);
}

export async function POST(req: NextRequest) {
    const auth = await verifyAuth(req, [UserRole.SUPERADMIN]);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const body = CreateCampusSchema.parse(await req.json());

    const campus = await mockDb.campuses.create({
        data: {
            id: crypto.randomUUID(),
            orgLevel: "CAMPUS",
            isActive: true,
            parentId: body.groupId ?? "",
            location: body.location ?? "",
            country: body.country ?? "",
            ...body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        } as Campus,
    });

    await mockCache.invalidatePattern("org:campuses:*");
    return NextResponse.json({ success: true, data: campus }, { status: 201 });
}
