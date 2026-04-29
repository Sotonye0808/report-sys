/**
 * PUT /api/imports/[id]/file
 *
 * Accepts CSV/text payload, persists raw content into the job's storageRef
 * (database BLOB-equivalent: stored as a JSON-stringified preview limited to
 * IMPORT_MAX_FILE_BYTES). Marks the job as FILE_UPLOADED.
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

const MAX_BYTES = Number(process.env.IMPORT_MAX_FILE_BYTES ?? 10 * 1024 * 1024);

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
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

        const body = await req.text();
        const bytes = Buffer.byteLength(body, "utf8");
        if (bytes > MAX_BYTES) {
            return NextResponse.json(badRequestResponse(`File exceeds ${MAX_BYTES} bytes`), { status: 400 });
        }

        const updated = await prisma.importJob.update({
            where: { id },
            data: {
                status: "FILE_UPLOADED",
                fileName: req.headers.get("x-import-filename") ?? "upload.csv",
                fileMime: req.headers.get("content-type") ?? "text/csv",
                fileBytes: bytes,
                storageRef: body, // stored verbatim (CSV-only for now)
            },
        });
        return NextResponse.json(successResponse({ id: updated.id, fileBytes: updated.fileBytes }));
    } catch (err) {
        return handleApiError(err);
    }
}
