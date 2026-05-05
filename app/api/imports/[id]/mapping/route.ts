/**
 * GET  /api/imports/[id]/mapping — return mapping + inferred headers
 * PUT  /api/imports/[id]/mapping — save mapping; transitions to MAPPED
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/data/prisma";
import { verifyAuth } from "@/lib/utils/auth";
import {
    successResponse,
    forbiddenResponse,
    badRequestResponse,
    notFoundResponse,
    handleApiError,
} from "@/lib/utils/api";
import { parseSpreadsheet, SpreadsheetParseError, type SpreadsheetFormat } from "@/lib/data/importPipeline";

const Schema = z.object({
    columns: z
        .array(
            z.object({
                index: z.number().int().nonnegative(),
                header: z.string(),
                target: z.string(),
            }),
        )
        .min(1)
        .max(200),
    profileName: z.string().min(1).max(200).optional(),
    saveProfile: z.boolean().optional(),
    selectedSheet: z.string().min(1).max(200).optional(),
});

async function loadJobRows(job: {
    storageRef: string | null;
    fileFormat: string | null;
    selectedSheet: string | null;
}): Promise<{ rows: string[][]; sheetNames: string[]; sheetName?: string }> {
    if (!job.storageRef) return { rows: [], sheetNames: [] };
    const format: SpreadsheetFormat = (job.fileFormat as SpreadsheetFormat | null) ?? "CSV";
    const parsed = await parseSpreadsheet({
        format,
        payload: job.storageRef,
        selectedSheet: job.selectedSheet,
    });
    return {
        rows: parsed.rows,
        sheetNames: parsed.sheetNames ?? [],
        sheetName: parsed.sheetName,
    };
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
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
        try {
            const parsed = await loadJobRows(job);
            return NextResponse.json(
                successResponse({
                    mapping: job.mapping ?? null,
                    sample: parsed.rows.slice(0, 6),
                    fileFormat: job.fileFormat ?? "CSV",
                    sheetNames: parsed.sheetNames,
                    selectedSheet: parsed.sheetName ?? job.selectedSheet ?? null,
                }),
            );
        } catch (err) {
            if (err instanceof SpreadsheetParseError) {
                return NextResponse.json(
                    { success: false, error: err.reason, code: "import_parse_failed" },
                    { status: 400 },
                );
            }
            throw err;
        }
    } catch (err) {
        return handleApiError(err);
    }
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
        const body = await req.json();
        const parsed = Schema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid payload"), {
                status: 400,
            });
        }
        const data = await prisma.importJob.update({
            where: { id },
            data: {
                status: "MAPPED",
                mapping: { columns: parsed.data.columns, templateId: job.templateId } as never,
                ...(parsed.data.selectedSheet !== undefined && {
                    selectedSheet: parsed.data.selectedSheet,
                }),
            },
        });
        if (parsed.data.saveProfile && parsed.data.profileName) {
            await prisma.importMappingProfile.create({
                data: {
                    ownerId: auth.user.id,
                    templateId: job.templateId,
                    name: parsed.data.profileName,
                    mapping: { columns: parsed.data.columns } as never,
                },
            });
        }
        return NextResponse.json(successResponse(data));
    } catch (err) {
        return handleApiError(err);
    }
}
