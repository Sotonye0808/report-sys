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
import { parseCsv } from "@/lib/data/importPipeline";

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
});

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
        const sampleRows = job.storageRef ? parseCsv(job.storageRef).slice(0, 6) : [];
        return NextResponse.json(successResponse({
            mapping: job.mapping ?? null,
            sample: sampleRows,
        }));
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
