import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/data/db";
import { PrismaClient } from "@/prisma/generated";
import { PrismaPg } from "@prisma/adapter-pg";
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

function isPrismaTimeoutError(err: unknown): boolean {
    if (!err || typeof err !== "object") return false;
    const code = (err as any).code;
    return code === "ETIMEDOUT" || code === "P1001" || code === "P1010";
}

async function findUserWithFallback(email: string) {
    try {
        return await db.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
    } catch (err) {
        if (isPrismaTimeoutError(err) && process.env.DATABASE_URL) {
            const fallbackClient = new PrismaClient({
                adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
                log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
            });
            try {
                return await fallbackClient.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
            } finally {
                await fallbackClient.$disconnect();
            }
        }

        throw err;
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = LoginSchema.safeParse(await req.json());
        if (!body.success) return badRequestResponse("Invalid input");

        const { email, password, rememberMe } = body.data;

        const userProfile = await findUserWithFallback(email);
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

        const tokens = generateTokens(authUser, rememberMe);
        await setAuthCookies(tokens, rememberMe);

        return NextResponse.json(successResponse({ user: authUser }), { status: 200 });
    } catch (err) {
        return handleApiError(err);
    }
}
