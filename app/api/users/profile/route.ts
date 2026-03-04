/**
 * app/api/users/profile/route.ts
 * GET /api/users/profile  — get own profile
 * PUT /api/users/profile  — update own profile (name, phone)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";

/* ── Update schema ────────────────────────────────────────────────────────── */

const UpdateProfileSchema = z.object({
    firstName: z.string().min(1).max(60).optional(),
    lastName: z.string().min(1).max(60).optional(),
    phone: z.string().max(30).optional(),
});

/* ── GET /api/users/profile ───────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const user = await mockDb.users.findFirst({ where: { id: auth.user.id } });
    if (!user) {
        return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    const { passwordHash: _ph, ...safeUser } = user as UserProfile & { passwordHash?: string };
    return NextResponse.json({ success: true, data: safeUser });
}

/* ── PUT /api/users/profile ───────────────────────────────────────────────── */

export async function PUT(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const body = UpdateProfileSchema.parse(await req.json());

    const user = await mockDb.users.findFirst({ where: { id: auth.user.id } });
    if (!user) {
        return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    const updated = await mockDb.users.update({
        where: { id: auth.user.id },
        data: { ...body, updatedAt: new Date().toISOString() },
    });

    await mockCache.invalidatePattern(`users:detail:${auth.user.id}`);

    const { passwordHash: _ph, ...safeUser } = updated as UserProfile & { passwordHash?: string };
    return NextResponse.json({ success: true, data: safeUser });
}
