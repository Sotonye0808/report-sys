/**
 * app/api/auth/reset-password/route.ts
 * POST /api/auth/reset-password
 * Validates reset token and sets new password.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";
import { hashPassword } from "@/lib/utils/auth";

const Schema = z.object({
    token: z.string().min(1),
    password: z.string().min(8),
});

export async function POST(req: NextRequest) {
    const body = Schema.parse(await req.json());

    /* Retrieve cached token */
    const raw = await mockCache.get(`pwd-reset:${body.token}`);
    if (!raw) {
        return NextResponse.json(
            { success: false, error: "This reset link is invalid or has expired." },
            { status: 400 },
        );
    }

    const { userId, expiresAt } = JSON.parse(raw) as { userId: string; expiresAt: string };

    if (new Date(expiresAt) < new Date()) {
        await mockCache.del(`pwd-reset:${body.token}`);
        return NextResponse.json(
            { success: false, error: "This reset link has expired." },
            { status: 400 },
        );
    }

    const user = await mockDb.users.findFirst({ where: { id: userId } });
    if (!user) {
        return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    const hashed = await hashPassword(body.password);

    await mockDb.users.update({
        where: { id: userId },
        data: { passwordHash: hashed, updatedAt: new Date().toISOString() } as Partial<UserProfile>,
    });

    /* Invalidate the token so it cannot be reused */
    await mockCache.del(`pwd-reset:${body.token}`);

    return NextResponse.json({ success: true, message: "Password reset successfully. You can now log in." });
}
