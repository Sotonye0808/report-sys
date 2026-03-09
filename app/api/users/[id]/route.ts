/**
 * app/api/users/[id]/route.ts
 * GET  /api/users/:id  — get user detail (SUPERADMIN)
 * PUT  /api/users/:id  — update user role / active status (SUPERADMIN)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { UserRole } from "@/types/global";

/* ── Update schema ────────────────────────────────────────────────────────── */

const UpdateUserSchema = z.object({
    role: z.nativeEnum(UserRole).optional(),
    isActive: z.boolean().optional(),
    campusId: z.string().uuid().nullable().optional(),
    groupId: z.string().uuid().nullable().optional(),
    phone: z.string().optional(),
});

/* ── GET /api/users/:id ───────────────────────────────────────────────────── */

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const auth = await verifyAuth(req, [UserRole.SUPERADMIN]);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const cacheKey = `users:detail:${id}`;
    const cached = await cache.get(cacheKey);
    if (cached) return NextResponse.json(JSON.parse(cached));

    const user = await db.user.findUnique({
        where: { id },
        omit: { passwordHash: true },
    });
    if (!user) {
        return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    const response = { success: true, data: user };
    await cache.set(cacheKey, JSON.stringify(response), 60);
    return NextResponse.json(response);
}

/* ── PUT /api/users/:id ───────────────────────────────────────────────────── */

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const auth = await verifyAuth(req, [UserRole.SUPERADMIN]);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const body = UpdateUserSchema.parse(await req.json());

    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
        return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    /* Protect the only SUPERADMIN — cannot deactivate or demote self */
    if (id === auth.user.id && (body.isActive === false || (body.role && body.role !== UserRole.SUPERADMIN))) {
        return NextResponse.json(
            { success: false, error: "Cannot demote or deactivate your own superadmin account." },
            { status: 403 },
        );
    }

    const updated = await db.user.update({
        where: { id },
        data: {
            ...(body.role !== undefined && { role: body.role }),
            ...(body.isActive !== undefined && { isActive: body.isActive }),
            ...(body.campusId !== undefined && { campusId: body.campusId }),
            ...(body.groupId !== undefined && { orgGroupId: body.groupId }),
            ...(body.phone !== undefined && { phone: body.phone }),
        },
        omit: { passwordHash: true },
    });

    await cache.invalidatePattern(`users:detail:${id}`);
    await cache.invalidatePattern("users:list:*");

    return NextResponse.json({ success: true, data: updated });
}
