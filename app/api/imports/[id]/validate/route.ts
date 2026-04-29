/**
 * POST /api/imports/[id]/validate
 * Parse + validate the uploaded CSV against the saved mapping. Persists
 * per-row outcomes as ImportJobItem rows; transitions job to VALIDATED.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/data/prisma";
import { verifyAuth } from "@/lib/utils/auth";
import {
    successResponse,
    forbiddenResponse,
    badRequestResponse,
    notFoundResponse,
    handleApiError,
} from "@/lib/utils/api";
import { parseCsv, validateRows, type ImportMapping } from "@/lib/data/importPipeline";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        const { id } = await ctx.params;
        const job = await prisma.importJob.findUnique({ where: { id } });
        if (!job) return NextResponse.json(notFoundResponse("Import job not found"), { status: 404 });
        if (job.ownerId !== auth.user.id) {
            return NextResponse.json(forbiddenResponse("Not your import job"), { status: 403 });
        }
        if (!job.storageRef) {
            return NextResponse.json(badRequestResponse("No file uploaded"), { status: 400 });
        }
        if (!job.mapping) {
            return NextResponse.json(badRequestResponse("No mapping configured"), { status: 400 });
        }

        const rows = parseCsv(job.storageRef);
        const mapping = job.mapping as unknown as ImportMapping;

        // Resolve known templateMetricIds. If templateId is set, restrict to that template.
        const knownMetrics = await prisma.reportTemplateMetric.findMany({
            where: mapping.templateId
                ? { section: { templateId: mapping.templateId } }
                : undefined,
            select: { id: true },
        });
        const knownIds = new Set(knownMetrics.map((m) => m.id));

        const preview = validateRows(rows, mapping, knownIds);

        // Persist items (replace existing).
        await prisma.importJobItem.deleteMany({ where: { jobId: job.id } });
        if (preview.length > 0) {
            await prisma.importJobItem.createMany({
                data: preview.map((p) => ({
                    jobId: job.id,
                    rowIndex: p.rowIndex,
                    rawValues: p.raw as never,
                    normalizedValues: p.normalized as never,
                    outcome: p.outcome,
                    errors: p.errors,
                })),
            });
        }

        const summary = {
            total: preview.length,
            ok: preview.filter((p) => p.outcome === "OK").length,
            warning: preview.filter((p) => p.outcome === "WARNING").length,
            error: preview.filter((p) => p.outcome === "ERROR").length,
        };

        await prisma.importJob.update({
            where: { id: job.id },
            data: {
                status: "VALIDATED",
                validationSummary: summary as never,
            },
        });

        return NextResponse.json(successResponse({ summary, preview }));
    } catch (err) {
        return handleApiError(err);
    }
}
