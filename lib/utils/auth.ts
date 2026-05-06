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
import { parseDurationToSecondsOrDefault } from "@/lib/utils/duration";
import { getAccessTokenExpiry, getRefreshTokenExpiry } from "@/lib/utils/authSession";
import { isEmailServiceReady } from "@/lib/utils/emailServiceReadiness";
import { UserRole } from "@/types/global";

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const ACCESS_SECRET = process.env.JWT_SECRET ?? "dev-access-secret-change-me";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-me";
const ACCESS_EXPIRY = getAccessTokenExpiry(false);
const REFRESH_EXPIRY = getRefreshTokenExpiry(false);
const COOKIE_NAME = process.env.COOKIE_NAME ?? "hrs_token";
const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME ?? "hrs_refresh";

// Cookie maxAge in seconds (matches JWT expiry by default)
const ACCESS_MAX_AGE_DEFAULT = parseDurationToSecondsOrDefault(ACCESS_EXPIRY, 60 * 15);
const REFRESH_MAX_AGE_DEFAULT = parseDurationToSecondsOrDefault(REFRESH_EXPIRY, 60 * 60 * 24 * 7);
const ACCESS_MAX_AGE_REMEMBER_ME = parseDurationToSecondsOrDefault(process.env.JWT_EXPIRES_IN_REMEMBER_ME ?? "30d", 60 * 60 * 24 * 30);
const REFRESH_MAX_AGE_REMEMBER_ME = parseDurationToSecondsOrDefault(process.env.JWT_REFRESH_EXPIRES_IN_REMEMBER_ME ?? "90d", 60 * 60 * 24 * 90);

interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
}

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

interface RefreshTokenPayload {
    userId: string;
    rememberMe?: boolean;
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
    return generateAccessTokenWithExpiry(user, false);
}

function generateAccessTokenWithExpiry(user: AuthUser, rememberMe?: boolean): string {
    const expiry = getAccessTokenExpiry(rememberMe);
    return jwt.sign(
        { userId: user.id, email: user.email, role: user.role } satisfies JWTPayload,
        ACCESS_SECRET,
        { expiresIn: expiry } as jwt.SignOptions,
    );
}

export function generateRefreshToken(userId: string, rememberMe?: boolean): string {
    const payload: RefreshTokenPayload = { userId, rememberMe };
    const expiry = getRefreshTokenExpiry(rememberMe);
    return jwt.sign(payload, REFRESH_SECRET, {
        expiresIn: expiry,
    } as jwt.SignOptions);
}

export function generateTokens(user: AuthUser, rememberMe?: boolean): AuthTokens {
    return {
        accessToken: generateAccessTokenWithExpiry(user, rememberMe),
        refreshToken: generateRefreshToken(user.id, rememberMe),
    };
}

export function verifyAccessToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, ACCESS_SECRET) as JWTPayload;
    } catch {
        return null;
    }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
        return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
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

    const accessMaxAge = rememberMe ? ACCESS_MAX_AGE_REMEMBER_ME : ACCESS_MAX_AGE_DEFAULT;
    const refreshMaxAge = rememberMe ? REFRESH_MAX_AGE_REMEMBER_ME : REFRESH_MAX_AGE_DEFAULT;

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

    const actualRole = userProfile.role as UserRole;

    // Resolve impersonation overlay (SUPERADMIN-only). Errors are swallowed
    // so a substrate hiccup never breaks the auth path.
    let impersonation: AuthUser["impersonation"] = undefined;
    let effectiveRole: UserRole = actualRole;
    let impersonatedScope: { campusId?: string; orgGroupId?: string } = {};
    if (actualRole === UserRole.SUPERADMIN) {
        try {
            const { getImpersonationContext } = await import("@/lib/auth/impersonationContext");
            const ctx = await getImpersonationContext();
            if (ctx) {
                impersonation = {
                    sessionId: ctx.sessionId,
                    impersonatedRole: ctx.impersonatedRole,
                    impersonatedUserId: ctx.impersonatedUserId,
                    mode: ctx.mode,
                    expiresAt: ctx.expiresAt,
                };
                effectiveRole = ctx.impersonatedRole;
                if (ctx.impersonatedUser) {
                    impersonatedScope = {
                        campusId: ctx.impersonatedUser.campusId ?? undefined,
                        orgGroupId: ctx.impersonatedUser.orgGroupId ?? undefined,
                    };
                }
            }
        } catch {
            // ignore — fall through to plain SUPERADMIN identity
        }
    }

    const user: AuthUser = {
        id: userProfile.id,
        email: userProfile.email,
        pendingEmail: (userProfile as any).pendingEmail ?? undefined,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        // `role` is the EFFECTIVE role for back-compat. Existing capability
        // checks downstream therefore see the impersonated role automatically.
        role: effectiveRole,
        actualRole,
        // Pass through the polymorphic substrate columns when populated. Both
        // are nullable; `hasCapabilityForUser` and the entity resolver fall
        // back gracefully to the legacy enum / campusId paths when null.
        roleId: (userProfile as { roleId?: string | null }).roleId ?? null,
        unitId: (userProfile as { unitId?: string | null }).unitId ?? null,
        campusId: impersonatedScope.campusId ?? userProfile.campusId ?? undefined,
        orgGroupId: impersonatedScope.orgGroupId ?? userProfile.orgGroupId ?? undefined,
        avatar: userProfile.avatar ?? undefined,
        isEmailVerified: Boolean((userProfile as any).emailVerifiedAt),
        emailVerifiedAt: (userProfile as any).emailVerifiedAt?.toISOString?.(),
        emailServiceReady: isEmailServiceReady(),
        impersonation,
    };

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return { success: false, error: "Insufficient permissions", status: 403 };
    }

    // Single-chokepoint impersonation read-only gate: every mutation endpoint
    // that already calls verifyAuth inherits this without per-route wrapping.
    if (req && user.impersonation?.mode === "READ_ONLY") {
        try {
            const { assertNotReadOnly } = await import("@/lib/auth/permissions");
            const check = await assertNotReadOnly({ user }, req);
            if (!check.ok) {
                return {
                    success: false,
                    error: check.message ?? "Read-only preview blocks this action",
                    status: 403,
                };
            }
        } catch {
            // Module load failure must not break auth.
        }
    }

    return { success: true, user };
}
