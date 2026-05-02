/**
 * GET  /api/notifications/pwa-dismissal — list current user's dismissals
 * PUT  /api/notifications/pwa-dismissal — upsert a dismissal entry
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/data/prisma";
import { verifyAuth } from "@/lib/utils/auth";
import {
    successResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";

const REENGAGE_DAYS = Number(process.env.PWA_BANNER_REENGAGE_DAYS ?? 14);

const PutSchema = z.object({
    kind: z.enum(["INSTALL", "PUSH"]),
    platform: z.enum(["IOS", "ANDROID", "DESKTOP"]),
    mode: z.enum(["snooze", "never"]).default("snooze"),
});

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        const rows = await prisma.pwaPromptDismissal.findMany({
            where: { userId: auth.user.id },
        });
        return NextResponse.json(successResponse(rows));
    } catch (err) {
        return handleApiError(err);
    }
}

export async function PUT(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        const body = await req.json();
        const parsed = PutSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid payload"), {
                status: 400,
            });
        }
        const nextEligibleAt =
            parsed.data.mode === "snooze"
                ? new Date(Date.now() + REENGAGE_DAYS * 24 * 3600 * 1000)
                : null;

        const row = await prisma.pwaPromptDismissal.upsert({
            where: {
                userId_kind_platform: {
                    userId: auth.user.id,
                    kind: parsed.data.kind,
                    platform: parsed.data.platform,
                },
            },
            create: {
                userId: auth.user.id,
                kind: parsed.data.kind,
                platform: parsed.data.platform,
                mode: parsed.data.mode,
                nextEligibleAt: nextEligibleAt ?? undefined,
            },
            update: {
                mode: parsed.data.mode,
                nextEligibleAt: nextEligibleAt ?? null,
            },
        });
        return NextResponse.json(successResponse(row));
    } catch (err) {
        return handleApiError(err);
    }
}
