/**
 * POST /api/imports/[id]/commit
 * Commits the OK rows of a validated import job. Chunked transactional writes
 * with per-chunk compensation. Marks the job COMMITTED on success or FAILED
 * if every chunk failed.
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
import { commitImport, type ImportPreviewRow } from "@/lib/data/importPipeline";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        const { id } = await ctx.params;
        const job = await prisma.importJob.findUnique({
            where: { id },
            include: { items: { orderBy: { rowIndex: "asc" } } },
        });
        if (!job) return NextResponse.json(notFoundResponse("Import job not found"), { status: 404 });
        if (job.ownerId !== auth.user.id) {
            return NextResponse.json(forbiddenResponse("Not your import job"), { status: 403 });
        }
        if (job.status !== "VALIDATED") {
            return NextResponse.json(badRequestResponse("Job must be validated first"), { status: 400 });
        }

        const rows: ImportPreviewRow[] = job.items.map((it) => ({
            rowIndex: it.rowIndex,
            raw: (it.rawValues ?? {}) as Record<string, string>,
            normalized: (it.normalizedValues ?? {}) as Record<string, unknown>,
            outcome: it.outcome as ImportPreviewRow["outcome"],
            errors: it.errors,
        }));

        const result = await commitImport({ jobId: job.id, rows });

        const finalStatus = result.committed > 0 ? "COMMITTED" : "FAILED";
        await prisma.importJob.update({
            where: { id: job.id },
            data: {
                status: finalStatus,
                commitSummary: result as never,
            },
        });

        return NextResponse.json(successResponse(result));
    } catch (err) {
        return handleApiError(err);
    }
}
