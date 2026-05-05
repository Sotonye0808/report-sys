// @public-mutation -- intentionally unauthenticated (auth lifecycle endpoint).
/**
 * app/api/auth/register/route.ts
 * POST /api/auth/register — public registration (creates MEMBER by default)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { db } from "@/lib/data/db";
import {
    hashPassword,
    generateTokens,
    setAuthCookies,
} from "@/lib/utils/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api";
import { UserRole } from "@/types/global";
import { isEmailServiceReady } from "@/lib/utils/emailServiceReadiness";
import { requestEmailVerification, syncVerificationPromptForUser } from "@/modules/auth/services/emailVerificationService";

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
        const existing = await db.user.findFirst({
            where: { email: { equals: body.email, mode: "insensitive" } },
        });
        if (existing) {
            return errorResponse("An account with this email already exists.", 409);
        }

        let role: UserRole = UserRole.MEMBER;
        let campusId: string | null = null;
        let orgGroupId: string | null = null;

        /* Process invite token if provided */
        if (body.inviteToken) {
            const invite = await db.inviteLink.findFirst({
                where: {
                    token: body.inviteToken,
                    usedAt: null,
                    expiresAt: { gt: new Date() },
                },
            });
            if (!invite) {
                return errorResponse("This invite link is invalid or has expired.", 400);
            }
            role = invite.targetRole as UserRole ?? UserRole.MEMBER;
            campusId = invite.campusId ?? null;
            orgGroupId = invite.groupId ?? null;

            /* Mark invite as used */
            await db.inviteLink.update({
                where: { id: invite.id },
                data: { usedAt: new Date() },
            });
        }

        const now = new Date();
        const userId = crypto.randomUUID();
        const hashed = await hashPassword(body.password);

        const user = await db.user.create({
            data: {
                id: userId,
                organisationId: process.env.NEXT_PUBLIC_ORG_ID ?? "harvesters",
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email.toLowerCase(),
                phone: body.phone ?? null,
                role,
                campusId,
                orgGroupId,
                isActive: true,
                emailVerifiedAt: null,
                passwordHash: hashed,
                createdAt: now,
                updatedAt: now,
            },
        });

        if (!user) return errorResponse("Registration failed. Please try again.", 500);

        const tokens = generateTokens({
            id: user.id,
            role: user.role as UserRole,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            campusId: user.campusId ?? undefined,
            orgGroupId: user.orgGroupId ?? undefined,
        });

        const response = NextResponse.json(
            successResponse({
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role as UserRole,
                    campusId: user.campusId ?? undefined,
                    orgGroupId: user.orgGroupId ?? undefined,
                    isEmailVerified: false,
                    emailServiceReady: isEmailServiceReady(),
                } satisfies AuthUser,
            }),
            { status: 201 },
        );

        if (isEmailServiceReady()) {
            void requestEmailVerification(user.id).catch(() => undefined);
            void syncVerificationPromptForUser(user.id).catch(() => undefined);
        }

        await setAuthCookies(tokens);
        return response;
    } catch (err) {
        return handleApiError(err);
    }
}
