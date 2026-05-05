/**
 * PUT /api/imports/[id]/file
 *
 * Accepts CSV (text/csv) or XLSX (application/vnd.openxmlformats-officedocument...)
 * payloads. Format is sniffed from the `Content-Type` header and the filename.
 *
 *   - CSV  → stored as raw text in `storageRef`, `fileFormat = "CSV"`.
 *   - XLSX → stored as base64 in `storageRef`, `fileFormat = "XLSX"`. Server
 *     validates the workbook can be parsed and returns the sheet names so the
 *     wizard can render a sheet-picker.
 *
 * Failure modes return human-readable `400`s instead of the prior 500 chains
 * the user saw when uploading xlsx through the legacy CSV-only code path.
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
import { parseXlsx, SpreadsheetParseError } from "@/lib/data/importPipeline";

const MAX_BYTES = Number(process.env.IMPORT_MAX_FILE_BYTES ?? 10 * 1024 * 1024);

const XLSX_MIMES = new Set<string>([
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/octet-stream", // some browsers send this for .xlsx
]);

function sniffXlsx(mime: string | null, filename: string | null): boolean {
    if (mime && XLSX_MIMES.has(mime.toLowerCase())) return true;
    if (filename) {
        const lower = filename.toLowerCase();
        if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) return true;
    }
    return false;
}

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

        const filename = req.headers.get("x-import-filename");
        const mime = req.headers.get("content-type");
        const isXlsx = sniffXlsx(mime, filename);

        if (isXlsx) {
            // Read as binary; SheetJS parses the buffer directly.
            const ab = await req.arrayBuffer();
            const buffer = Buffer.from(ab);
            if (buffer.byteLength > MAX_BYTES) {
                return NextResponse.json(
                    badRequestResponse(`File exceeds ${MAX_BYTES} bytes`),
                    { status: 400 },
                );
            }
            // Validate the workbook NOW so the user gets a clear 400 instead
            // of a Prisma error later when validate/commit dies on garbage rows.
            let sheetNames: string[] = [];
            try {
                const parsed = await parseXlsx(buffer);
                sheetNames = parsed.sheets.map((s) => s.name);
            } catch (err) {
                if (err instanceof SpreadsheetParseError) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: err.reason,
                            code: "import_parse_failed",
                        },
                        { status: 400 },
                    );
                }
                throw err;
            }
            const updated = await prisma.importJob.update({
                where: { id },
                data: {
                    status: "FILE_UPLOADED",
                    fileName: filename ?? "upload.xlsx",
                    fileMime: mime ?? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    fileBytes: buffer.byteLength,
                    fileFormat: "XLSX",
                    storageRef: buffer.toString("base64"),
                    selectedSheet: sheetNames[0] ?? null,
                },
            });
            return NextResponse.json(
                successResponse({
                    id: updated.id,
                    fileBytes: updated.fileBytes,
                    fileFormat: "XLSX",
                    sheetNames,
                    selectedSheet: updated.selectedSheet,
                }),
            );
        }

        // CSV path (default). Read as text and store verbatim.
        const body = await req.text();
        const bytes = Buffer.byteLength(body, "utf8");
        if (bytes > MAX_BYTES) {
            return NextResponse.json(badRequestResponse(`File exceeds ${MAX_BYTES} bytes`), { status: 400 });
        }
        if (bytes === 0) {
            return NextResponse.json(badRequestResponse("Uploaded file is empty"), { status: 400 });
        }
        const updated = await prisma.importJob.update({
            where: { id },
            data: {
                status: "FILE_UPLOADED",
                fileName: filename ?? "upload.csv",
                fileMime: mime ?? "text/csv",
                fileBytes: bytes,
                fileFormat: "CSV",
                storageRef: body,
                selectedSheet: null,
            },
        });
        return NextResponse.json(
            successResponse({
                id: updated.id,
                fileBytes: updated.fileBytes,
                fileFormat: "CSV",
                sheetNames: [] as string[],
                selectedSheet: null,
            }),
        );
    } catch (err) {
        return handleApiError(err);
    }
}
