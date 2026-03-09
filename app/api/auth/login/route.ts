import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/data/db";
import {
    verifyPassword,
    generateTokens,
    setAuthCookies,
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

        const userProfile = await db.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
        if (!userProfile) return unauthorizedResponse("Invalid email or password");

        if (!userProfile.isActive) return unauthorizedResponse("Account is deactivated");

        if (!userProfile.passwordHash) return unauthorizedResponse("Invalid email or password");

        const valid = await verifyPassword(password, userProfile.passwordHash);
        if (!valid) return unauthorizedResponse("Invalid email or password");

        const authUser: AuthUser = {
            id: userProfile.id,
            email: userProfile.email,
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            role: userProfile.role as AuthUser["role"],
            campusId: userProfile.campusId ?? undefined,
            orgGroupId: userProfile.orgGroupId ?? undefined,
            avatar: userProfile.avatar ?? undefined,
        };

        const tokens = generateTokens(authUser);
        await setAuthCookies(tokens, rememberMe);

        return NextResponse.json(successResponse({ user: authUser }), { status: 200 });
    } catch (err) {
        return handleApiError(err);
    }
}
