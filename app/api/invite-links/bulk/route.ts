/**
 * POST /api/invite-links/bulk
 * Bulk-create invite links from one shared template + per-row entries.
 *
 * Each entry returns one of:
 *   { status: "created", id, token }
 *   { status: "already_invited" }    — open active link already exists for that email
 *   { status: "already_registered" } — user already has an active account
 *   { status: "failed", error }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/data/prisma";
import { db } from "@/lib/data/db";
import { verifyAuth } from "@/lib/utils/auth";
import {
    successResponse,
    forbiddenResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { sendInviteEmail } from "@/lib/email/resend";
import { HIERARCHY_ORDER, InviteLinkType, UserRole } from "@/types/global";
import { ROLE_CONFIG } from "@/config/roles";

const BulkSchema = z.object({
    shared: z.object({
        targetRole: z.nativeEnum(UserRole).optional(),
        campusId: z.string().uuid().optional(),
        groupId: z.string().uuid().optional(),
        expiresInHours: z.number().int().positive().max(24 * 365).default(168),
        note: z.string().max(500).optional(),
        sendEmail: z.boolean().default(true),
    }),
    entries: z
        .array(
            z.object({
                email: z.string().email(),
                targetRole: z.nativeEnum(UserRole).optional(),
                campusId: z.string().uuid().optional(),
                groupId: z.string().uuid().optional(),
                note: z.string().max(500).optional(),
            }),
        )
        .min(1)
        .max(500),
});

function normaliseEmail(s: string): string {
    return s.trim().toLowerCase();
}

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        if (!ROLE_CONFIG[auth.user.role]?.canBulkInvite) {
            return NextResponse.json(forbiddenResponse("Bulk invite not permitted"), { status: 403 });
        }

        const body = await req.json();
        const parsed = BulkSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid payload"), {
                status: 400,
            });
        }

        const creatorOrder = HIERARCHY_ORDER[auth.user.role];
        const seen = new Set<string>();
        const dedupedEntries = parsed.data.entries.filter((e) => {
            const k = normaliseEmail(e.email);
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
        });

        const batch = await prisma.bulkInviteBatch.create({
            data: {
                createdById: auth.user.id,
                kind: "INVITE_LINK",
                sharedAttrs: parsed.data.shared as never,
                totalEntries: dedupedEntries.length,
            },
        });

        const expiryMs = parsed.data.shared.expiresInHours * 3600 * 1000;
        let success = 0;
        let skipped = 0;
        let failed = 0;
        const outcomes: Array<{
            email: string;
            status: "created" | "already_invited" | "already_registered" | "failed";
            id?: string;
            token?: string;
            error?: string;
        }> = [];

        for (const entry of dedupedEntries) {
            const email = normaliseEmail(entry.email);
            try {
                const targetRole = entry.targetRole ?? parsed.data.shared.targetRole;
                if (!targetRole) {
                    failed++;
                    outcomes.push({ email, status: "failed", error: "targetRole required" });
                    continue;
                }
                const targetOrder = HIERARCHY_ORDER[targetRole];
                if (auth.user.role !== UserRole.SUPERADMIN && targetOrder <= creatorOrder) {
                    failed++;
                    outcomes.push({ email, status: "failed", error: "role above your level" });
                    continue;
                }

                const existingUser = await db.user.findUnique({ where: { email } });
                if (existingUser?.isActive) {
                    skipped++;
                    outcomes.push({ email, status: "already_registered" });
                    continue;
                }

                const existingInvite = await prisma.inviteLink.findFirst({
                    where: {
                        recipientEmail: email,
                        isActive: true,
                        usedAt: null,
                        expiresAt: { gt: new Date() },
                    },
                });
                if (existingInvite) {
                    skipped++;
                    outcomes.push({ email, status: "already_invited" });
                    continue;
                }

                const token = crypto.randomUUID().replace(/-/g, "");
                const created = await prisma.inviteLink.create({
                    data: {
                        token,
                        type: InviteLinkType.DIRECT,
                        targetRole,
                        campusId: entry.campusId ?? parsed.data.shared.campusId,
                        groupId: entry.groupId ?? parsed.data.shared.groupId,
                        createdById: auth.user.id,
                        expiresAt: new Date(Date.now() + expiryMs),
                        note: entry.note ?? parsed.data.shared.note,
                        recipientEmail: email,
                        batchId: batch.id,
                        isActive: true,
                    },
                });

                if (parsed.data.shared.sendEmail && process.env.RESEND_API_KEY) {
                    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
                    void sendInviteEmail({
                        to: email,
                        inviterName: `${auth.user.firstName} ${auth.user.lastName}`.trim() || "Harvesters Admin",
                        role: targetRole,
                        joinUrl: `${appUrl}/join?token=${token}`,
                    });
                }

                success++;
                outcomes.push({ email, status: "created", id: created.id, token });
            } catch (err) {
                failed++;
                outcomes.push({
                    email,
                    status: "failed",
                    error: err instanceof Error ? err.message : "unknown",
                });
            }
        }

        await prisma.bulkInviteBatch.update({
            where: { id: batch.id },
            data: { successCount: success, skippedCount: skipped, failedCount: failed },
        });

        return NextResponse.json(
            successResponse({
                batchId: batch.id,
                outcomes,
                counts: { success, skipped, failed, total: dedupedEntries.length },
            }),
        );
    } catch (err) {
        return handleApiError(err);
    }
}
