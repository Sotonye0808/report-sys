/**
 * app/api/org/groups/route.ts
 * GET  /api/org/groups  — list org groups
 * POST /api/org/groups  — create group (SUPERADMIN)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache, invalidateCache } from "@/lib/data/db";
import { UserRole } from "@/types/global";

const CreateGroupSchema = z.object({
    name: z.string().min(1).max(80),
    country: z.string().max(60).optional(),
    organisationId: z.string().min(1),
    leaderId: z.string().uuid().optional(),
});

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
        }

        const cached = await cache.get("org:groups:list");
        if (cached) return NextResponse.json(cached);

        const groups = await db.orgGroup.findMany({ orderBy: { name: "asc" } });
        const response = { success: true, data: groups };
        await cache.set("org:groups:list", JSON.stringify(response), 120);
        return NextResponse.json(response);
    } catch (err) {
        console.error("[api] Error in GET /api/org/groups", err);
        return NextResponse.json({ success: false, error: "Failed to load groups." }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req, [UserRole.SUPERADMIN]);
        if (!auth.success) {
            return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
        }

        const body = CreateGroupSchema.parse(await req.json());

        const group = await db.orgGroup.create({
            data: {
                name: body.name,
                country: body.country ?? "",
                leaderId: body.leaderId,
            },
        });

        await invalidateCache("org:campuses:*");
        await invalidateCache("org:groups:*");
        await invalidateCache("org:hierarchy");
        return NextResponse.json({ success: true, data: group }, { status: 201 });
    } catch (err) {
        console.error("[api] Error in POST /api/org/groups", err);
        return NextResponse.json({ success: false, error: "Failed to create group." }, { status: 500 });
    }
}
