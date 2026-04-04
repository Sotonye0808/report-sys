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
    errorResponse,
    successResponse,
    unauthorizedResponse,
    handleApiError,
} from "@/lib/utils/api";
import { UserRole, BugReportCategory, AssetUploadMode } from "@/types/global";
import { getRequestContext } from "@/lib/server/requestContext";
import { resolveReadyAssetForBugReport } from "@/lib/assets/lifecycleService";
import { logServerInfo } from "@/lib/utils/serverLogger";

/* ── Schemas ───────────────────────────────────────────────────────────────── */

const CreateBugReportSchema = z.object({
    category: z.nativeEnum(BugReportCategory),
    description: z.string().min(10).max(2000),
    screenshotAssetId: z.string().uuid().optional(),
    screenshotDataUrl: z.string().optional(),
    screenshotFileName: z.string().max(255).optional(),
    screenshotMimeType: z.string().max(128).optional(),
    uploadMode: z.nativeEnum(AssetUploadMode).optional(),
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
    const ctx = getRequestContext(req);
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error, ctx.requestId);

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
                    screenshotAsset: {
                        select: { id: true, secureUrl: true, state: true },
                    },
                },
            }),
            db.bugReport.count({ where }),
        ]);

        const normalized = bugReports.map((report) => ({
            ...report,
            screenshotUrl:
                report.screenshotAsset?.secureUrl ??
                report.screenshotUrl ??
                undefined,
        }));

        return NextResponse.json(
            successResponse({ bugReports: normalized, total, page, pageSize }, ctx.requestId),
            { headers: { "x-request-id": ctx.requestId } },
        );
    } catch (err) {
        return handleApiError(err, { requestId: ctx.requestId, route: ctx.route });
    }
}

/* ── POST ──────────────────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
    const ctx = getRequestContext(req);
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error, ctx.requestId);

        const body = CreateBugReportSchema.parse(await req.json());

        if (body.screenshotAssetId && body.screenshotDataUrl) {
            return errorResponse("Provide screenshotAssetId or screenshotDataUrl, not both.", 400, ctx.requestId);
        }

        const resolved = await resolveReadyAssetForBugReport({
            ownerId: auth.user.id,
            screenshotAssetId: body.screenshotAssetId,
            screenshotDataUrl: body.screenshotDataUrl,
            screenshotFileName: body.screenshotFileName,
            screenshotMimeType: body.screenshotMimeType,
            requestId: ctx.requestId,
        });

        const bugReport = await db.bugReport.create({
            data: {
                category: body.category,
                description: body.description,
                screenshotAssetId: resolved.asset?.id ?? null,
                screenshotUrl:
                    resolved.createdNow
                        ? null
                        : (body.screenshotUrl ?? resolved.asset?.secureUrl ?? null),
                contactEmail: body.contactEmail,
                createdById: auth.user.id,
            },
            include: {
                screenshotAsset: {
                    select: { id: true, secureUrl: true, state: true },
                },
            },
        });

        logServerInfo("[bug-report] created", {
            requestId: ctx.requestId,
            route: ctx.route,
            bugReportId: bugReport.id,
            screenshotAssetId: bugReport.screenshotAssetId,
            uploadMode: body.uploadMode ?? AssetUploadMode.DEFERRED_SUBMIT,
        });

        return NextResponse.json(
            successResponse(
                {
                    ...bugReport,
                    screenshotUrl:
                        bugReport.screenshotAsset?.secureUrl ??
                        bugReport.screenshotUrl ??
                        undefined,
                },
                ctx.requestId,
            ),
            { status: 201, headers: { "x-request-id": ctx.requestId } },
        );
    } catch (err) {
        return handleApiError(err, { requestId: ctx.requestId, route: ctx.route });
    }
}
