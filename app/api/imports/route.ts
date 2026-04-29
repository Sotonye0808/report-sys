/**
 * GET  /api/imports — list current user's import jobs
 * POST /api/imports — create a new draft import job
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/data/prisma";
import { verifyAuth } from "@/lib/utils/auth";
import {
    successResponse,
    forbiddenResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { ROLE_CONFIG } from "@/config/roles";

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        if (!ROLE_CONFIG[auth.user.role]?.canImportSpreadsheets) {
            return NextResponse.json(forbiddenResponse("Imports not permitted"), { status: 403 });
        }
        const rows = await prisma.importJob.findMany({
            where: { ownerId: auth.user.id },
            orderBy: [{ createdAt: "desc" }],
            take: 100,
        });
        return NextResponse.json(successResponse(rows));
    } catch (err) {
        return handleApiError(err);
    }
}

const CreateSchema = z.object({
    templateId: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        if (!ROLE_CONFIG[auth.user.role]?.canImportSpreadsheets) {
            return NextResponse.json(forbiddenResponse("Imports not permitted"), { status: 403 });
        }
        const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
        const parsed = CreateSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(badRequestResponse("Invalid payload"), { status: 400 });
        }
        const job = await prisma.importJob.create({
            data: {
                ownerId: auth.user.id,
                templateId: parsed.data.templateId,
                status: "DRAFT",
            },
        });
        return NextResponse.json(successResponse(job));
    } catch (err) {
        return handleApiError(err);
    }
}
