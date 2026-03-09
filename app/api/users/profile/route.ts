/**
 * app/api/users/profile/route.ts
 * GET /api/users/profile  — get own profile
 * PUT /api/users/profile  — update own profile (name, phone)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";

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

    const user = await db.user.findUnique({
        where: { id: auth.user.id },
        omit: { passwordHash: true },
    });
    if (!user) {
        return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
}

/* ── PUT /api/users/profile ───────────────────────────────────────────────── */

export async function PUT(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const body = UpdateProfileSchema.parse(await req.json());

    const user = await db.user.findUnique({ where: { id: auth.user.id } });
    if (!user) {
        return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    const updated = await db.user.update({
        where: { id: auth.user.id },
        data: body,
        omit: { passwordHash: true },
    });

    await cache.invalidatePattern(`users:detail:${auth.user.id}`);

    return NextResponse.json({ success: true, data: updated });
}
