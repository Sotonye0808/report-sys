/**
 * app/api/bug-reports/route.ts
 * GET  /api/bug-reports — list bug reports (own for regular users, all for SUPERADMIN)
 * POST /api/bug-reports — create a new bug report
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import { db } from "@/lib/data/db";
import {
    successResponse,
    unauthorizedResponse,
    handleApiError,
} from "@/lib/utils/api";
import { UserRole, BugReportCategory } from "@/types/global";

/* ── Schemas ───────────────────────────────────────────────────────────────── */

const CreateBugReportSchema = z.object({
    category: z.nativeEnum(BugReportCategory),
    description: z.string().min(10).max(2000),
    screenshotUrl: z.string().optional(),
    contactEmail: z.string().email(),
});

const ListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    status: z.string().optional(),
    category: z.nativeEnum(BugReportCategory).optional(),
});

/* ── GET ───────────────────────────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const params = Object.fromEntries(new URL(req.url).searchParams);
        const query = ListQuerySchema.parse(params);
        const { page, pageSize, status, category } = query;

        const where: Record<string, unknown> = {};

        // Non-superadmins only see their own bug reports
        if (auth.user.role !== UserRole.SUPERADMIN) {
            where.createdById = auth.user.id;
        }

        if (status) where.status = status;
        if (category) where.category = category;

        const [bugReports, total] = await Promise.all([
            db.bugReport.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: {
                    createdBy: {
                        select: { id: true, firstName: true, lastName: true, email: true },
                    },
                },
            }),
            db.bugReport.count({ where }),
        ]);

        return NextResponse.json(
            successResponse({ bugReports, total, page, pageSize }),
        );
    } catch (err) {
        return handleApiError(err);
    }
}

/* ── POST ──────────────────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const body = CreateBugReportSchema.parse(await req.json());

        const bugReport = await db.bugReport.create({
            data: {
                category: body.category,
                description: body.description,
                screenshotUrl: body.screenshotUrl ?? null,
                contactEmail: body.contactEmail,
                createdById: auth.user.id,
            },
        });

        return NextResponse.json(successResponse(bugReport), { status: 201 });
    } catch (err) {
        return handleApiError(err);
    }
}
