/**
 * lib/utils/auth.ts
 * Server-side auth helpers: password hashing, JWT generation/verification,
 * cookie management, and the verifyAuth() guard used in all API routes.
 */

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { db } from "@/lib/data/db";
import { UserRole } from "@/types/global";

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const ACCESS_SECRET = process.env.JWT_SECRET ?? "dev-access-secret-change-me";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-me";
const ACCESS_EXPIRY = process.env.JWT_EXPIRES_IN ?? "15m";
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN ?? "7d";
const COOKIE_NAME = process.env.COOKIE_NAME ?? "hrs_token";
const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME ?? "hrs_refresh";

interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
}

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Password
// ─────────────────────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
    const rounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
    return bcrypt.hash(password, rounds);
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
}

// ─────────────────────────────────────────────────────────────────────────────
// JWT
// ─────────────────────────────────────────────────────────────────────────────

export function generateAccessToken(user: AuthUser): string {
    return jwt.sign(
        { userId: user.id, email: user.email, role: user.role } satisfies JWTPayload,
        ACCESS_SECRET,
        { expiresIn: ACCESS_EXPIRY } as jwt.SignOptions,
    );
}

export function generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, REFRESH_SECRET, {
        expiresIn: REFRESH_EXPIRY,
    } as jwt.SignOptions);
}

export function generateTokens(user: AuthUser): AuthTokens {
    return {
        accessToken: generateAccessToken(user),
        refreshToken: generateRefreshToken(user.id),
    };
}

export function verifyAccessToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, ACCESS_SECRET) as JWTPayload;
    } catch {
        return null;
    }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
    try {
        return jwt.verify(token, REFRESH_SECRET) as { userId: string };
    } catch {
        return null;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Cookies
// ─────────────────────────────────────────────────────────────────────────────

export async function setAuthCookies(tokens: AuthTokens, rememberMe?: boolean): Promise<void> {
    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === "production";

    // Standard: 15min access, 7d refresh. Remember me: 30d access, 90d refresh.
    const accessMaxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 15;
    const refreshMaxAge = rememberMe ? 60 * 60 * 24 * 90 : 60 * 60 * 24 * 7;

    cookieStore.set(COOKIE_NAME, tokens.accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: accessMaxAge,
        path: "/",
    });

    cookieStore.set(REFRESH_COOKIE_NAME, tokens.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: refreshMaxAge,
        path: "/",
    });
}

export async function clearAuthCookies(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    cookieStore.delete(REFRESH_COOKIE_NAME);
}

export async function getAccessTokenFromCookies(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function getRefreshTokenFromCookies(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(REFRESH_COOKIE_NAME)?.value ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// verifyAuth — the standard API route guard
// ─────────────────────────────────────────────────────────────────────────────

type VerifyAuthResult =
    | { success: true; user: AuthUser }
    | { success: false; error: string; status: 401 | 403 };

/**
 * Call at the top of every API route or Server Component:
 *   const auth = await verifyAuth(req);           // API route (also checks Authorization header)
 *   const auth = await verifyAuth();               // Server Component (cookie-only)
 *
 * Optionally pass `allowedRoles` to enforce role-level access.
 */
export async function verifyAuth(
    req?: NextRequest | null,
    allowedRoles?: UserRole[],
): Promise<VerifyAuthResult> {
    // Try cookie first, then Authorization header (header only available in API routes)
    const cookieStore = await cookies();
    const token =
        cookieStore.get(COOKIE_NAME)?.value ??
        req?.headers?.get("Authorization")?.replace("Bearer ", "") ??
        null;

    if (!token) {
        return { success: false, error: "Unauthorised", status: 401 };
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
        return { success: false, error: "Invalid or expired token", status: 401 };
    }

    // Look up user in database
    const userProfile = await db.user.findUnique({ where: { id: payload.userId } });
    if (!userProfile || !userProfile.isActive) {
        return { success: false, error: "User not found or inactive", status: 401 };
    }

    const user: AuthUser = {
        id: userProfile.id,
        email: userProfile.email,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        role: userProfile.role as UserRole,
        campusId: userProfile.campusId ?? undefined,
        orgGroupId: userProfile.orgGroupId ?? undefined,
        avatar: userProfile.avatar ?? undefined,
    };

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return { success: false, error: "Insufficient permissions", status: 403 };
    }

    return { success: true, user };
}
