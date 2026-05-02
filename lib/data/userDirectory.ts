/**
 * lib/data/userDirectory.ts
 *
 * Unified user directory: merges active users + inactive-with-activation-token
 * + open invite links into one paginated stream with derived status.
 *
 * Status priority: ACTIVE > ACTIVATION_PENDING > PENDING_INVITE > INACTIVE.
 * Dedupe key: lower-cased email. If a user row matches an open invite link
 * for the same email, the user wins (the invite is shadowed).
 */

import { prisma } from "@/lib/data/prisma";
import { UserRole } from "@/types/global";

export type DirectoryStatus =
    | "ACTIVE"
    | "INACTIVE"
    | "ACTIVATION_PENDING"
    | "PENDING_INVITE";

export interface DirectoryRow {
    id: string;
    source: "user" | "invite";
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole | null;
    status: DirectoryStatus;
    campusId?: string | null;
    orgGroupId?: string | null;
    createdAt: string;
    invitedAt?: string;
    activationExpiresAt?: string;
    inviteExpiresAt?: string;
}

export interface DirectoryFilters {
    /** Limit by `users.role`/invite `targetRole`. */
    roles?: UserRole[];
    /** Restrict to a single status set. */
    statuses?: DirectoryStatus[];
    /** Free-text search across email, firstName, lastName. */
    search?: string;
    /** Scope to a campus. */
    campusId?: string;
    /** Scope to an org group. */
    orgGroupId?: string;
    /** Page (0-based). */
    page?: number;
    /** Page size (default 50, max 200). */
    pageSize?: number;
}

const STATUS_PRIORITY: Record<DirectoryStatus, number> = {
    ACTIVE: 0,
    ACTIVATION_PENDING: 1,
    PENDING_INVITE: 2,
    INACTIVE: 3,
};

function normEmail(s: string): string {
    return s.trim().toLowerCase();
}

function matchesSearch(row: DirectoryRow, q: string | undefined): boolean {
    if (!q) return true;
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    return (
        row.email.toLowerCase().includes(needle) ||
        row.firstName.toLowerCase().includes(needle) ||
        row.lastName.toLowerCase().includes(needle)
    );
}

export async function listDirectory(filters: DirectoryFilters = {}): Promise<{
    rows: DirectoryRow[];
    total: number;
    page: number;
    pageSize: number;
}> {
    const pageSize = Math.min(Math.max(filters.pageSize ?? 50, 1), 200);
    const page = Math.max(filters.page ?? 0, 0);

    /* ── 1) active + inactive users ─────────────────────────────────────── */
    const userWhere: Record<string, unknown> = {};
    if (filters.roles?.length) userWhere.role = { in: filters.roles };
    if (filters.campusId) userWhere.campusId = filters.campusId;
    if (filters.orgGroupId) userWhere.orgGroupId = filters.orgGroupId;
    const users = await prisma.user.findMany({
        where: userWhere as never,
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            campusId: true,
            orgGroupId: true,
            isActive: true,
            createdAt: true,
        },
    });

    /* ── 2) live activation tokens for inactive users ───────────────────── */
    const inactiveIds = users.filter((u) => !u.isActive).map((u) => u.id);
    const liveTokens = inactiveIds.length
        ? await prisma.userActivationToken.findMany({
              where: {
                  userId: { in: inactiveIds },
                  usedAt: null,
                  expiresAt: { gt: new Date() },
              },
              select: { userId: true, expiresAt: true },
          })
        : [];
    const tokenByUser = new Map(liveTokens.map((t) => [t.userId, t.expiresAt]));

    /* ── 3) open invite links not consumed and not expired ───────────────── */
    const inviteWhere: Record<string, unknown> = {
        isActive: true,
        usedAt: null,
        expiresAt: { gt: new Date() },
        recipientEmail: { not: null },
    };
    if (filters.roles?.length) inviteWhere.targetRole = { in: filters.roles };
    if (filters.campusId) inviteWhere.campusId = filters.campusId;
    if (filters.orgGroupId) inviteWhere.groupId = filters.orgGroupId;
    const invites = await prisma.inviteLink.findMany({
        where: inviteWhere as never,
        select: {
            id: true,
            recipientEmail: true,
            targetRole: true,
            campusId: true,
            groupId: true,
            createdAt: true,
            expiresAt: true,
        },
    });

    /* ── 4) merge with status derivation ───────────────────────────────── */
    const rowsByEmail = new Map<string, DirectoryRow>();

    for (const u of users) {
        const email = normEmail(u.email);
        const tokenExpires = tokenByUser.get(u.id);
        const status: DirectoryStatus = u.isActive
            ? "ACTIVE"
            : tokenExpires
            ? "ACTIVATION_PENDING"
            : "INACTIVE";
        const row: DirectoryRow = {
            id: u.id,
            source: "user",
            email,
            firstName: u.firstName,
            lastName: u.lastName,
            role: u.role as UserRole,
            status,
            campusId: u.campusId,
            orgGroupId: u.orgGroupId,
            createdAt: u.createdAt.toISOString(),
            activationExpiresAt: tokenExpires?.toISOString(),
        };
        const existing = rowsByEmail.get(email);
        if (!existing || STATUS_PRIORITY[row.status] < STATUS_PRIORITY[existing.status]) {
            rowsByEmail.set(email, row);
        }
    }

    for (const inv of invites) {
        if (!inv.recipientEmail) continue;
        const email = normEmail(inv.recipientEmail);
        if (rowsByEmail.has(email)) continue;
        const row: DirectoryRow = {
            id: inv.id,
            source: "invite",
            email,
            firstName: "",
            lastName: "",
            role: (inv.targetRole as UserRole) ?? null,
            status: "PENDING_INVITE",
            campusId: inv.campusId,
            orgGroupId: inv.groupId,
            createdAt: inv.createdAt.toISOString(),
            invitedAt: inv.createdAt.toISOString(),
            inviteExpiresAt: inv.expiresAt?.toISOString(),
        };
        rowsByEmail.set(email, row);
    }

    let merged = Array.from(rowsByEmail.values());

    /* ── 5) status filter (post-merge so rows have derived status) ──────── */
    if (filters.statuses?.length) {
        const allowed = new Set(filters.statuses);
        merged = merged.filter((r) => allowed.has(r.status));
    }

    /* ── 6) free-text search ─────────────────────────────────────────────── */
    if (filters.search) {
        merged = merged.filter((r) => matchesSearch(r, filters.search));
    }

    /* ── 7) sort: priority, then createdAt desc ────────────────────────── */
    merged.sort((a, b) => {
        const priDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
        if (priDiff !== 0) return priDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = merged.length;
    const start = page * pageSize;
    return {
        rows: merged.slice(start, start + pageSize),
        total,
        page,
        pageSize,
    };
}
