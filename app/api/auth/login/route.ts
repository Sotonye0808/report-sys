import { type NextRequest } from "next/server";
import { z } from "zod";
import { mockDb, dbReady } from "@/lib/data/mockDb";
import {
    verifyPassword,
    generateTokens,
    setAuthCookies,
    getHashedPassword,
} from "@/lib/utils/auth";
import {
    successResponse,
    unauthorizedResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
    rememberMe: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
    try {
        const body = LoginSchema.safeParse(await req.json());
        if (!body.success) return badRequestResponse("Invalid input");

        const { email, password, rememberMe } = body.data;

        await dbReady;
        const userProfile = await mockDb.users.findFirst({ where: { email: email as unknown as string } });
        if (!userProfile) return unauthorizedResponse("Invalid email or password");

        if (!userProfile.isActive) return unauthorizedResponse("Account is deactivated");

        const hashed = getHashedPassword(userProfile.id);
        if (!hashed) return unauthorizedResponse("Invalid email or password");

        const valid = await verifyPassword(password, hashed);
        if (!valid) return unauthorizedResponse("Invalid email or password");

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
        await setAuthCookies(tokens, rememberMe);

        return successResponse({ user: authUser }, 200);
    } catch (err) {
        return handleApiError(err);
    }
}
