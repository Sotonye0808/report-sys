/**
 * app/api/auth/register/route.ts
 * POST /api/auth/register — public registration (creates MEMBER by default)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { mockDb } from "@/lib/data/mockDb";
import {
    hashPassword,
    generateTokens,
    setAuthCookies,
    setHashedPassword,
} from "@/lib/utils/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api";
import { UserRole } from "@/types/global";

const RegisterSchema = z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.email("Invalid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    phone: z.string().optional(),
    inviteToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = RegisterSchema.parse(await req.json());

        /* Check for existing email */
        const existing = await mockDb.users.findFirst({
            where: (u: UserProfile) => u.email.toLowerCase() === body.email.toLowerCase(),
        });
        if (existing) {
            return errorResponse("An account with this email already exists.", 409);
        }

        let role: UserRole = UserRole.MEMBER;
        let campusId: string | null = null;
        let groupId: string | null = null;

        /* Process invite token if provided */
        if (body.inviteToken) {
            const invite = await mockDb.inviteLinks.findFirst({
                where: (il: InviteLink) =>
                    il.token === body.inviteToken &&
                    !il.usedAt &&
                    il.expiresAt != null && new Date(il.expiresAt) > new Date(),
            });
            if (!invite) {
                return errorResponse("This invite link is invalid or has expired.", 400);
            }
            role = invite.targetRole as UserRole ?? UserRole.MEMBER;
            campusId = invite.campusId ?? null;
            groupId = invite.groupId ?? null;

            /* Mark invite as used */
            await mockDb.inviteLinks.update({
                where: { id: invite.id },
                data: { usedAt: new Date().toISOString() } as Partial<InviteLink>,
            });
        }

        const now = new Date().toISOString();
        const userId = crypto.randomUUID();

        const hashed = await hashPassword(body.password);
        setHashedPassword(userId, hashed);

        await mockDb.users.create({
            data: {
                id: userId,
                organisationId: process.env.NEXT_PUBLIC_ORG_ID ?? "harvesters",
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email.toLowerCase(),
                phone: body.phone ?? null,
                role,
                campusId,
                groupId,
                isActive: true,
                createdAt: now,
                updatedAt: now,
                avatarUrl: undefined,
                gender: undefined,
            } as unknown as UserProfile,
        });

        const user = await mockDb.users.findUnique({ where: { id: userId } }) as UserProfile;
        if (!user) return errorResponse("Registration failed. Please try again.", 500);

        const tokens = generateTokens({
            id: user.id,
            role: user.role,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            campusId: user.campusId ?? undefined,
            orgGroupId: user.groupId ?? undefined,
        });

        const response = NextResponse.json(
            successResponse({
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    campusId: user.campusId ?? undefined,
                    orgGroupId: user.groupId ?? undefined,
                } satisfies AuthUser,
            }),
            { status: 201 },
        );

        await setAuthCookies(tokens);
        return response;
    } catch (err) {
        return handleApiError(err);
    }
}
