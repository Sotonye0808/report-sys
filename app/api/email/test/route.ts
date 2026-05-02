/**
 * POST /api/email/test
 *
 * Render a template with caller-supplied sample variables and either send it
 * via Resend (when configured) or return the rendered preview only. Limited
 * to admins and capped per-user-per-day by `RESEND_TEST_DAILY_LIMIT`.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import {
    successResponse,
    forbiddenResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { renderTemplate } from "@/lib/email/templates/render";
import { sendEmail } from "@/lib/email/resend";
import { cache } from "@/lib/data/redis";
import { ROLE_CONFIG } from "@/config/roles";
import { EMAIL_TEMPLATE_DEFINITIONS } from "@/lib/email/templates/definitions";
import { UserRole } from "@/types/global";

const Schema = z.object({
    templateId: z.string().min(1).max(100),
    toEmail: z.string().email(),
    sampleVars: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
});

const DAILY_LIMIT = Number(process.env.RESEND_TEST_DAILY_LIMIT ?? 50);

function todayKey(userId: string): string {
    const now = new Date();
    const day = now.toISOString().slice(0, 10);
    return `email:test:${userId}:${day}`;
}

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        if (
            auth.user.role !== UserRole.SUPERADMIN &&
            !ROLE_CONFIG[auth.user.role]?.canManageAdminConfig
        ) {
            return NextResponse.json(forbiddenResponse("Test send requires admin"), { status: 403 });
        }

        const body = await req.json();
        const parsed = Schema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid payload"), {
                status: 400,
            });
        }

        const def = EMAIL_TEMPLATE_DEFINITIONS[parsed.data.templateId];
        if (!def) {
            return NextResponse.json(badRequestResponse("Unknown templateId"), { status: 400 });
        }

        // Rate-limit per user per day
        const key = todayKey(auth.user.id);
        const currentRaw = (await cache.get(key)) as number | string | null;
        const current = typeof currentRaw === "number" ? currentRaw : Number(currentRaw ?? 0);
        if (Number.isFinite(current) && current >= DAILY_LIMIT) {
            return NextResponse.json(
                { success: false, error: `Daily test-send limit (${DAILY_LIMIT}) reached`, code: 429 },
                { status: 429 },
            );
        }

        const sampleVars = { ...def.sampleVars, ...(parsed.data.sampleVars ?? {}) };
        const rendered = await renderTemplate(parsed.data.templateId, sampleVars);
        if (!rendered) {
            return NextResponse.json(badRequestResponse("Render failed"), { status: 400 });
        }

        const hasResend = Boolean(process.env.RESEND_API_KEY);
        let messageId: string | undefined;
        let sent = false;
        if (hasResend) {
            const result = await sendEmail({
                to: parsed.data.toEmail,
                subject: rendered.subject,
                html: rendered.html,
            });
            sent = Boolean(result);
            messageId = (result as { id?: string } | null)?.id;
        }

        // Bump rate-limit counter (simple INCR-like — set to current+1 with 25h TTL)
        await cache.set(key, String(current + 1), 25 * 3600);

        return NextResponse.json(
            successResponse({
                mode: sent ? "sent" : "preview-only",
                messageId,
                preview: { subject: rendered.subject, html: rendered.html, missingVars: rendered.missingVars },
                fromOverride: rendered.fromOverride,
            }),
        );
    } catch (err) {
        return handleApiError(err);
    }
}
