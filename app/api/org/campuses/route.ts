/**
 * app/api/org/campuses/route.ts
 * GET  /api/org/campuses  — list campuses (all authenticated users)
 * POST /api/org/campuses  — create campus (SUPERADMIN)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache, invalidateCache } from "@/lib/data/db";
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
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
        }

        const cached = await cache.get("org:campuses:list");
        if (cached) return NextResponse.json(cached);

        const campuses = await db.campus.findMany({ orderBy: { name: "asc" } });
        const response = { success: true, data: campuses };
        await cache.set("org:campuses:list", JSON.stringify(response), 120);
        return NextResponse.json(response);
    } catch (err) {
        console.error("[api] Error in GET /api/org/campuses", err);
        return NextResponse.json({ success: false, error: "Failed to load campuses." }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req, [UserRole.SUPERADMIN]);
        if (!auth.success) {
            return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
        }

        const body = CreateCampusSchema.parse(await req.json());

        const campus = await db.campus.create({
            data: {
                name: body.name,
                parentId: body.groupId ?? "",
                country: body.country ?? "",
                location: body.location ?? "",
                adminId: body.adminId,
                isActive: true,
            },
        });

        await invalidateCache("org:campuses:*");
        await invalidateCache("org:groups:*");
        await invalidateCache("org:hierarchy");
        return NextResponse.json({ success: true, data: campus }, { status: 201 });
    } catch (err) {
        console.error("[api] Error in POST /api/org/campuses", err);
        return NextResponse.json({ success: false, error: "Failed to create campus." }, { status: 500 });
    }
}
