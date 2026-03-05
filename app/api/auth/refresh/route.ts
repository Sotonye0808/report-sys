import { type NextRequest } from "next/server";
import { z } from "zod";
import { mockDb, dbReady } from "@/lib/data/mockDb";
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

        await dbReady;
        const userProfile = await mockDb.users.findUnique({ where: { id: payload.userId } });
        if (!userProfile || !userProfile.isActive) {
            return unauthorizedResponse("User not found or inactive");
        }

        const authUser: AuthUser = {
            id: userProfile.id,
            email: userProfile.email,
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            role: userProfile.role,
            campusId: userProfile.campusId,
            orgGroupId: userProfile.orgGroupId,
            avatar: userProfile.avatar,
        };

        const tokens = generateTokens(authUser);
        await setAuthCookies(tokens);

        return successResponse({ user: authUser });
    } catch (err) {
        return handleApiError(err);
    }
}
