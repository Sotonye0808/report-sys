/**
 * app/api/users/[id]/route.ts
 * GET  /api/users/:id  — get user detail (SUPERADMIN)
 * PUT  /api/users/:id  — update user role / active status (SUPERADMIN)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";
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
    const cached = await mockCache.get(cacheKey);
    if (cached) return NextResponse.json(JSON.parse(cached));

    const user = await mockDb.users.findFirst({ where: { id } });
    if (!user) {
        return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    const { passwordHash: _ph, ...safeUser } = user as UserProfile & { passwordHash?: string };
    const response = { success: true, data: safeUser };
    await mockCache.set(cacheKey, JSON.stringify(response), 60);
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

    const user = await mockDb.users.findFirst({ where: { id } });
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

    const updated = await mockDb.users.update({
        where: { id },
        data: {
            updatedAt: new Date().toISOString(),
            ...(body.role !== undefined && { role: body.role }),
            ...(body.isActive !== undefined && { isActive: body.isActive }),
            ...(body.campusId !== undefined && { campusId: body.campusId ?? undefined }),
            ...(body.groupId !== undefined && { groupId: body.groupId ?? undefined }),
            ...(body.phone !== undefined && { phone: body.phone }),
        } as Partial<UserProfile>,
    });

    await mockCache.invalidatePattern(`users:detail:${id}`);
    await mockCache.invalidatePattern("users:list:*");

    const { passwordHash: _ph, ...safeUser } = updated as UserProfile & { passwordHash?: string };
    return NextResponse.json({ success: true, data: safeUser });
}
