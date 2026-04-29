/**
 * POST /api/users/preregister
 *
 * Bulk pre-register users from email + role tuples. Each entry creates a User
 * row with a server-issued random password and a one-time UserActivationToken.
 *
 * Outcomes per entry:
 *   { status: "preregistered", userId, activationUrl }
 *   { status: "already_registered" }       — active user already exists
 *   { status: "activation_skipped" }       — existing pre-registered user already has live token
 *   { status: "failed", error }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "node:crypto";
import { prisma } from "@/lib/data/prisma";
import { db } from "@/lib/data/db";
import { hashPassword } from "@/lib/utils/auth";
import { verifyAuth } from "@/lib/utils/auth";
import {
    successResponse,
    forbiddenResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { sendEmail } from "@/lib/email/resend";
import { CONTENT } from "@/config/content";
import { ROLE_CONFIG } from "@/config/roles";
import { HIERARCHY_ORDER, UserRole } from "@/types/global";

const ACTIVATION_TTL_HOURS = Number(process.env.ACTIVATION_TOKEN_TTL_HOURS ?? 72);

const Schema = z.object({
    shared: z.object({
        targetRole: z.nativeEnum(UserRole).optional(),
        campusId: z.string().uuid().optional(),
        groupId: z.string().uuid().optional(),
    }),
    entries: z
        .array(
            z.object({
                email: z.string().email(),
                firstName: z.string().min(1).max(80).optional(),
                lastName: z.string().min(1).max(80).optional(),
                targetRole: z.nativeEnum(UserRole).optional(),
                campusId: z.string().uuid().optional(),
                groupId: z.string().uuid().optional(),
            }),
        )
        .min(1)
        .max(500),
});

function hashToken(raw: string): string {
    return crypto.createHash("sha256").update(raw).digest("hex");
}

function emailContent(activationUrl: string, expiresInHours: number): { subject: string; html: string } {
    const c = CONTENT.preregister as Record<string, string>;
    const subject = c.emailSubject ?? "Activate your account";
    const intro = c.emailIntro ?? "Click the link below to set your password.";
    const action = c.actionLabel ?? "Activate";
    const expiry = c.expiryNote ?? "This link expires in";
    const html = `
        <p>${intro}</p>
        <p><a href="${activationUrl}" style="background:#1f3a8a;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">${action}</a></p>
        <p style="font-size:12px;color:#666">${expiry} ${expiresInHours} hours.</p>
    `;
    return { subject, html };
}

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        if (!ROLE_CONFIG[auth.user.role]?.canBulkInvite) {
            return NextResponse.json(forbiddenResponse("Pre-register not permitted"), { status: 403 });
        }
        const body = await req.json();
        const parsed = Schema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid payload"), {
                status: 400,
            });
        }

        const creatorOrder = HIERARCHY_ORDER[auth.user.role];
        const seen = new Set<string>();
        const dedupedEntries = parsed.data.entries.filter((e) => {
            const k = e.email.trim().toLowerCase();
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
        });

        const batch = await prisma.bulkInviteBatch.create({
            data: {
                createdById: auth.user.id,
                kind: "PRE_REGISTER",
                sharedAttrs: parsed.data.shared as never,
                totalEntries: dedupedEntries.length,
            },
        });

        const expiresAt = new Date(Date.now() + ACTIVATION_TTL_HOURS * 3600 * 1000);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";

        const outcomes: Array<{
            email: string;
            status: "preregistered" | "already_registered" | "activation_skipped" | "failed";
            userId?: string;
            activationUrl?: string;
            error?: string;
        }> = [];

        let success = 0;
        let skipped = 0;
        let failed = 0;

        for (const entry of dedupedEntries) {
            const email = entry.email.trim().toLowerCase();
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

                const existing = await db.user.findUnique({ where: { email } });
                if (existing && existing.isActive) {
                    skipped++;
                    outcomes.push({ email, status: "already_registered" });
                    continue;
                }

                let userId: string;
                if (existing && !existing.isActive) {
                    // Existing inactive user — only create a fresh activation token.
                    userId = existing.id;
                } else {
                    const randomPassword = crypto.randomBytes(24).toString("hex");
                    const passwordHash = await hashPassword(randomPassword);
                    const created = await db.user.create({
                        data: {
                            email,
                            passwordHash,
                            firstName: entry.firstName ?? "",
                            lastName: entry.lastName ?? "",
                            role: targetRole,
                            campusId: entry.campusId ?? parsed.data.shared.campusId,
                            orgGroupId: entry.groupId ?? parsed.data.shared.groupId,
                            isActive: false,
                        },
                    });
                    userId = created.id;
                }

                // Skip if a live token already exists.
                const existingToken = await prisma.userActivationToken.findFirst({
                    where: {
                        userId,
                        usedAt: null,
                        expiresAt: { gt: new Date() },
                    },
                });
                if (existingToken) {
                    skipped++;
                    outcomes.push({ email, status: "activation_skipped", userId });
                    continue;
                }

                const rawToken = crypto.randomBytes(32).toString("hex");
                await prisma.userActivationToken.create({
                    data: {
                        userId,
                        tokenHash: hashToken(rawToken),
                        expiresAt,
                    },
                });

                const activationUrl = `${appUrl}/activate?token=${rawToken}`;
                if (process.env.RESEND_API_KEY) {
                    const { subject, html } = emailContent(activationUrl, ACTIVATION_TTL_HOURS);
                    void sendEmail({ to: email, subject, html });
                }

                success++;
                outcomes.push({ email, status: "preregistered", userId, activationUrl });
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
