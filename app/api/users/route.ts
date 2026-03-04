/**
 * app/api/users/route.ts
 * GET  /api/users   — list all users (SUPERADMIN only)
 * POST /api/users   — create a user (SUPERADMIN only, direct creation without invite)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";
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
    const cached = await mockCache.get(cacheKey);
    if (cached) {
        return NextResponse.json(JSON.parse(cached));
    }

    const query = ListUsersSchema.parse(
        Object.fromEntries(new URL(req.url).searchParams),
    );

    let users: UserProfile[] = await mockDb.users.findMany({});

    /* Apply filters */
    if (query.search) {
        const q = query.search.toLowerCase();
        users = users.filter(
            (u) =>
                u.firstName.toLowerCase().includes(q) ||
                u.lastName.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q),
        );
    }
    if (query.role) {
        users = users.filter((u) => u.role === query.role);
    }
    if (query.campusId) {
        users = users.filter((u) => u.campusId === query.campusId);
    }
    if (query.active !== undefined) {
        const isActive = query.active === "true";
        users = users.filter((u) => u.isActive === isActive);
    }

    /* Sort: newest first by createdAt */
    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    /* Paginate */
    const total = users.length;
    const start = (query.page - 1) * query.pageSize;
    const data = users.slice(start, start + query.pageSize).map(({ passwordHash: _ph, ...rest }) => rest);

    const response = { success: true, data, meta: { total, page: query.page, pageSize: query.pageSize } };
    await mockCache.set(cacheKey, JSON.stringify(response), 30);
    return NextResponse.json(response);
}
