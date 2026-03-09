import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/data/db";
import { UserRole } from "@/types/global";
import {
    verifyRefreshToken,
    generateTokens,
    setAuthCookies,
    getRefreshTokenFromCookies,
} from "@/lib/utils/auth";
import {
    successResponse,
    unauthorizedResponse,
    handleApiError,
} from "@/lib/utils/api";

const RefreshSchema = z.object({}).optional();

export async function POST(req: NextRequest) {
    try {
        void req;
        void RefreshSchema;

        const refreshToken = await getRefreshTokenFromCookies();
        if (!refreshToken) return unauthorizedResponse("No refresh token");

        const payload = verifyRefreshToken(refreshToken);
        if (!payload) return unauthorizedResponse("Invalid or expired refresh token");

        const userProfile = await db.user.findUnique({ where: { id: payload.userId } });
        if (!userProfile || !userProfile.isActive) {
            return unauthorizedResponse("User not found or inactive");
        }

        const authUser: AuthUser = {
            id: userProfile.id,
            email: userProfile.email,
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            role: userProfile.role as UserRole,
            campusId: userProfile.campusId ?? undefined,
            orgGroupId: userProfile.orgGroupId ?? undefined,
            avatar: userProfile.avatar ?? undefined,
        };

        const tokens = generateTokens(authUser);
        await setAuthCookies(tokens);

        return NextResponse.json(successResponse({ user: authUser }));
    } catch (err) {
        return handleApiError(err);
    }
}
