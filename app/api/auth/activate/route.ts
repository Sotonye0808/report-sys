// @public-mutation -- intentionally unauthenticated (auth lifecycle endpoint).
/**
 * POST /api/auth/activate
 * Consume a UserActivationToken and force a new password.
 * Returns a sign-in cookie set as the activated user's session.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "node:crypto";
import { prisma } from "@/lib/data/prisma";
import { db } from "@/lib/data/db";
import {
    hashPassword,
    generateTokens,
    setAuthCookies,
} from "@/lib/utils/auth";
import {
    successResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { UserRole } from "@/types/global";

const Schema = z.object({
    token: z.string().min(20).max(200),
    newPassword: z.string().min(8).max(200),
});

function hashTokenSha256(raw: string): string {
    return crypto.createHash("sha256").update(raw).digest("hex");
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = Schema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid payload"), {
                status: 400,
            });
        }
        const tokenRow = await prisma.userActivationToken.findUnique({
            where: { tokenHash: hashTokenSha256(parsed.data.token) },
        });
        if (!tokenRow) {
            return NextResponse.json(badRequestResponse("Activation link invalid or expired"), { status: 400 });
        }
        if (tokenRow.usedAt) {
            return NextResponse.json(badRequestResponse("Activation link already used"), { status: 400 });
        }
        if (tokenRow.expiresAt.getTime() <= Date.now()) {
            return NextResponse.json(badRequestResponse("Activation link expired"), { status: 400 });
        }

        const passwordHash = await hashPassword(parsed.data.newPassword);

        await prisma.$transaction([
            prisma.userActivationToken.update({
                where: { id: tokenRow.id },
                data: { usedAt: new Date() },
            }),
            prisma.user.update({
                where: { id: tokenRow.userId },
                data: { passwordHash, isActive: true },
            }),
        ]);

        const profile = await db.user.findUnique({ where: { id: tokenRow.userId } });
        if (!profile) {
            return NextResponse.json(badRequestResponse("User not found"), { status: 400 });
        }

        const tokens = generateTokens(
            {
                id: profile.id,
                email: profile.email,
                firstName: profile.firstName,
                lastName: profile.lastName,
                role: profile.role as UserRole,
                campusId: profile.campusId ?? undefined,
                orgGroupId: profile.orgGroupId ?? undefined,
            },
            false,
        );
        await setAuthCookies(tokens, false);

        return NextResponse.json(
            successResponse({
                userId: profile.id,
                role: profile.role,
            }),
        );
    } catch (err) {
        return handleApiError(err);
    }
}
