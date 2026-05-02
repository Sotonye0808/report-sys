/**
 * lib/auth/impersonation.ts
 *
 * Server-only. Owns the impersonation cookie + session lifecycle.
 *
 * The impersonation cookie is intentionally separate from the access-token
 * cookie so stopping impersonation doesn't sign the SUPERADMIN out, and a
 * leaked impersonation token can be invalidated independently of the user's
 * regular session.
 *
 * The token's `superadminId` is verified against the live user row on every
 * request — a deactivated SUPERADMIN account can't keep an active session.
 */

import "server-only";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/data/prisma";
import { db } from "@/lib/data/db";
import { UserRole } from "@/types/global";

const COOKIE_NAME = process.env.IMPERSONATION_COOKIE_NAME ?? "hrs_impersonation";
const SECRET = process.env.JWT_SECRET ?? "dev-access-secret-change-me";
const TTL_MINUTES = Math.max(1, Number(process.env.IMPERSONATION_TTL_MINUTES ?? 30));
const TTL_SECONDS = TTL_MINUTES * 60;
const ENABLED = (process.env.IMPERSONATION_ENABLED ?? "true").toLowerCase() !== "false";

/* ── Types ──────────────────────────────────────────────────────────────── */

export type ImpersonationMode = "READ_ONLY" | "MUTATE";

interface TokenPayload {
    sessionId: string;
    superadminId: string;
    impersonatedRole: UserRole;
    impersonatedUserId?: string;
    mode: ImpersonationMode;
    /** unix epoch seconds */
    exp?: number;
}

export interface ActiveImpersonation {
    sessionId: string;
    superadminId: string;
    impersonatedRole: UserRole;
    impersonatedUserId?: string;
    mode: ImpersonationMode;
    expiresAt: string;
    /** Profile snapshot for the impersonated user (when targeted). */
    impersonatedUser?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        campusId?: string | null;
        orgGroupId?: string | null;
    };
}

export class ImpersonationDisabledError extends Error {
    constructor() {
        super("Impersonation disabled by configuration");
        this.name = "ImpersonationDisabledError";
    }
}

export class ImpersonationForbiddenError extends Error {
    constructor(message = "Cannot impersonate this target") {
        super(message);
        this.name = "ImpersonationForbiddenError";
    }
}

/* ── Token plumbing ─────────────────────────────────────────────────────── */

function signToken(payload: Omit<TokenPayload, "exp">): string {
    return jwt.sign(payload, SECRET, { expiresIn: TTL_SECONDS, audience: "impersonation" });
}

function verifyToken(token: string): TokenPayload | null {
    try {
        return jwt.verify(token, SECRET, { audience: "impersonation" }) as TokenPayload;
    } catch {
        return null;
    }
}

async function setCookie(token: string) {
    const store = await cookies();
    store.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: TTL_SECONDS,
    });
}

async function clearCookie() {
    const store = await cookies();
    store.set(COOKIE_NAME, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
}

async function readCookieToken(): Promise<string | null> {
    const store = await cookies();
    return store.get(COOKIE_NAME)?.value ?? null;
}

/* ── Lifecycle ──────────────────────────────────────────────────────────── */

export interface StartSessionInput {
    superadminId: string;
    impersonatedRole: UserRole;
    impersonatedUserId?: string;
    mode?: ImpersonationMode;
}

export async function startSession(input: StartSessionInput): Promise<ActiveImpersonation> {
    if (!ENABLED) throw new ImpersonationDisabledError();
    if (input.impersonatedRole === UserRole.SUPERADMIN) {
        throw new ImpersonationForbiddenError("Cannot impersonate SUPERADMIN");
    }

    let impersonatedUser: ActiveImpersonation["impersonatedUser"];
    if (input.impersonatedUserId) {
        const target = await db.user.findUnique({ where: { id: input.impersonatedUserId } });
        if (!target) throw new ImpersonationForbiddenError("Target user not found");
        if (target.role === UserRole.SUPERADMIN) {
            throw new ImpersonationForbiddenError("Cannot impersonate SUPERADMIN account");
        }
        impersonatedUser = {
            id: target.id,
            firstName: target.firstName,
            lastName: target.lastName,
            email: target.email,
            campusId: target.campusId,
            orgGroupId: target.orgGroupId,
        };
    }

    // Auto-stop any prior session for this superadmin.
    await prisma.impersonationSession.updateMany({
        where: { superadminId: input.superadminId, endedAt: null },
        data: { endedAt: new Date(), endedReason: "TOKEN_INVALIDATED" },
    });

    const expiresAt = new Date(Date.now() + TTL_SECONDS * 1000);
    const session = await prisma.impersonationSession.create({
        data: {
            superadminId: input.superadminId,
            impersonatedRole: input.impersonatedRole,
            impersonatedUserId: input.impersonatedUserId,
            mode: input.mode ?? "READ_ONLY",
            expiresAt,
        },
    });

    await prisma.impersonationEvent.create({
        data: {
            sessionId: session.id,
            type: "STARTED",
        },
    });
    await prisma.impersonationSession.update({
        where: { id: session.id },
        data: { eventCount: { increment: 1 } },
    });

    const token = signToken({
        sessionId: session.id,
        superadminId: input.superadminId,
        impersonatedRole: input.impersonatedRole,
        impersonatedUserId: input.impersonatedUserId,
        mode: session.mode,
    });
    await setCookie(token);

    return {
        sessionId: session.id,
        superadminId: input.superadminId,
        impersonatedRole: input.impersonatedRole,
        impersonatedUserId: input.impersonatedUserId,
        mode: session.mode,
        expiresAt: session.expiresAt.toISOString(),
        impersonatedUser,
    };
}

export async function stopSession(reason: "USER" | "EXPIRED" | "TOKEN_INVALIDATED" = "USER"): Promise<void> {
    const token = await readCookieToken();
    if (token) {
        const payload = verifyToken(token);
        if (payload?.sessionId) {
            await prisma.impersonationSession.updateMany({
                where: { id: payload.sessionId, endedAt: null },
                data: { endedAt: new Date(), endedReason: reason },
            });
            await prisma.impersonationEvent.create({
                data: { sessionId: payload.sessionId, type: "STOPPED" },
            });
            await prisma.impersonationSession.update({
                where: { id: payload.sessionId },
                data: { eventCount: { increment: 1 } },
            });
        }
    }
    await clearCookie();
}

/* ── Read for handlers ──────────────────────────────────────────────────── */

/**
 * Returns the currently active impersonation context, or null. Verifies:
 *  - the cookie token is signed + unexpired,
 *  - the session row exists, is unended, and not past `expiresAt`,
 *  - the SUPERADMIN account is still active.
 *
 * If the row is past `expiresAt`, marks it ended and returns null.
 */
export async function loadActiveSession(): Promise<ActiveImpersonation | null> {
    if (!ENABLED) return null;
    const token = await readCookieToken();
    if (!token) return null;
    const payload = verifyToken(token);
    if (!payload?.sessionId) return null;

    const session = await prisma.impersonationSession.findUnique({
        where: { id: payload.sessionId },
        include: { superadmin: true, impersonatedUser: true },
    });
    if (!session || session.endedAt) {
        await clearCookie();
        return null;
    }
    if (session.expiresAt.getTime() <= Date.now()) {
        await prisma.impersonationSession.update({
            where: { id: session.id },
            data: { endedAt: new Date(), endedReason: "EXPIRED" },
        });
        await prisma.impersonationEvent.create({
            data: { sessionId: session.id, type: "STOPPED" },
        });
        await clearCookie();
        return null;
    }
    if (!session.superadmin || session.superadmin.role !== UserRole.SUPERADMIN || !session.superadmin.isActive) {
        // Token tied to a SUPERADMIN that is no longer active — invalidate.
        await prisma.impersonationSession.update({
            where: { id: session.id },
            data: { endedAt: new Date(), endedReason: "TOKEN_INVALIDATED" },
        });
        await clearCookie();
        return null;
    }

    return {
        sessionId: session.id,
        superadminId: session.superadminId,
        impersonatedRole: session.impersonatedRole as UserRole,
        impersonatedUserId: session.impersonatedUserId ?? undefined,
        mode: session.mode as ImpersonationMode,
        expiresAt: session.expiresAt.toISOString(),
        impersonatedUser: session.impersonatedUser
            ? {
                  id: session.impersonatedUser.id,
                  firstName: session.impersonatedUser.firstName,
                  lastName: session.impersonatedUser.lastName,
                  email: session.impersonatedUser.email,
                  campusId: session.impersonatedUser.campusId,
                  orgGroupId: session.impersonatedUser.orgGroupId,
              }
            : undefined,
    };
}

/* ── Mode change ────────────────────────────────────────────────────────── */

export async function changeMode(sessionId: string, mode: ImpersonationMode): Promise<ActiveImpersonation | null> {
    const updated = await prisma.impersonationSession.update({
        where: { id: sessionId },
        data: { mode },
    });
    await prisma.impersonationEvent.create({
        data: { sessionId, type: "MODE_CHANGED", path: mode },
    });
    await prisma.impersonationSession.update({
        where: { id: sessionId },
        data: { eventCount: { increment: 1 } },
    });
    // Re-issue cookie carrying the new mode so client requests don't need a refresh.
    const session = await prisma.impersonationSession.findUnique({
        where: { id: sessionId },
        include: { impersonatedUser: true },
    });
    if (!session) return null;
    const token = signToken({
        sessionId: session.id,
        superadminId: session.superadminId,
        impersonatedRole: session.impersonatedRole as UserRole,
        impersonatedUserId: session.impersonatedUserId ?? undefined,
        mode: updated.mode as ImpersonationMode,
    });
    await setCookie(token);
    return {
        sessionId: session.id,
        superadminId: session.superadminId,
        impersonatedRole: session.impersonatedRole as UserRole,
        impersonatedUserId: session.impersonatedUserId ?? undefined,
        mode: updated.mode as ImpersonationMode,
        expiresAt: session.expiresAt.toISOString(),
    };
}

/* ── Event emission helpers ─────────────────────────────────────────────── */

const EVENT_LIMIT = 500;

export async function recordEvent(
    sessionId: string,
    type:
        | "MUTATION_BLOCKED"
        | "MUTATION_APPLIED"
        | "PAGE_VISITED"
        | "AUTH_REJECTED",
    extra: { path?: string; method?: string; status?: number; requestId?: string; payloadDigest?: string } = {},
): Promise<void> {
    try {
        const session = await prisma.impersonationSession.findUnique({
            where: { id: sessionId },
            select: { eventCount: true },
        });
        if (!session) return;
        if (session.eventCount >= EVENT_LIMIT) {
            // Idempotent overflow marker — only one row per session.
            const overflowExists = await prisma.impersonationEvent.findFirst({
                where: { sessionId, type: "EVENT_LIMIT_REACHED" },
                select: { id: true },
            });
            if (!overflowExists) {
                await prisma.impersonationEvent.create({
                    data: { sessionId, type: "EVENT_LIMIT_REACHED" },
                });
            }
            return;
        }
        await prisma.impersonationEvent.create({
            data: { sessionId, type, ...extra },
        });
        await prisma.impersonationSession.update({
            where: { id: sessionId },
            data: { eventCount: { increment: 1 } },
        });
    } catch {
        // Audit must never break the request flow.
    }
}

export const IMPERSONATION_TTL_MINUTES = TTL_MINUTES;
export const IMPERSONATION_ENABLED = ENABLED;
