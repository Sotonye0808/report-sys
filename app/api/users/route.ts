/**
 * app/api/users/route.ts
 * GET  /api/users   — list all users (SUPERADMIN only)
 * POST /api/users   — create a user (SUPERADMIN only, direct creation without invite)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { UserRole } from "@/types/global";

/* ── Query schema ─────────────────────────────────────────────────────────── */

const ListUsersSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).max(100).default(25),
    search: z.string().optional(),
    role: z.nativeEnum(UserRole).optional(),
    campusId: z.string().uuid().optional(),
    active: z.enum(["true", "false"]).optional(),
});

/* ── GET /api/users ───────────────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req, [UserRole.SUPERADMIN]);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const cacheKey = `users:list:${req.url}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
        return NextResponse.json(cached);
    }

    const query = ListUsersSchema.parse(
        Object.fromEntries(new URL(req.url).searchParams),
    );

    /* Build Prisma where clause */
    const where: Record<string, unknown> = {};
    if (query.search) {
        where.OR = [
            { firstName: { contains: query.search, mode: "insensitive" } },
            { lastName: { contains: query.search, mode: "insensitive" } },
            { email: { contains: query.search, mode: "insensitive" } },
        ];
    }
    if (query.role) where.role = query.role;
    if (query.campusId) where.campusId = query.campusId;
    if (query.active !== undefined) where.isActive = query.active === "true";

    const [users, total] = await Promise.all([
        db.user.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (query.page - 1) * query.pageSize,
            take: query.pageSize,
            omit: { passwordHash: true },
        }),
        db.user.count({ where }),
    ]);

    const response = { success: true, data: users, meta: { total, page: query.page, pageSize: query.pageSize } };
    await cache.set(cacheKey, JSON.stringify(response), 30);
    return NextResponse.json(response);
}
