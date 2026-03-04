/**
 * app/api/report-templates/[id]/route.ts
 * GET /api/report-templates/:id  — get single template
 * PUT /api/report-templates/:id  — update template (SUPERADMIN)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";
import { UserRole } from "@/types/global";

/* ── Schemas ──────────────────────────────────────────────────────────────── */

const FieldSchema = z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    type: z.enum(["text", "number", "textarea", "select"]),
    required: z.boolean().optional().default(false),
    options: z.array(z.string()).optional(),
    placeholder: z.string().optional(),
});

const UpdateTemplateSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    fields: z.array(FieldSchema).min(1).optional(),
    isDefault: z.boolean().optional(),
    isArchived: z.boolean().optional(),
});

/* ── GET /api/report-templates/:id ───────────────────────────────────────── */

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const auth = await verifyAuth(req);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const cacheKey = `templates:detail:${id}`;
    const cached = await mockCache.get(cacheKey);
    if (cached) return NextResponse.json(JSON.parse(cached));

    const template = await mockDb.reportTemplates.findFirst({ where: { id } });
    if (!template) {
        return NextResponse.json({ success: false, error: "Template not found." }, { status: 404 });
    }

    const response = { success: true, data: template };
    await mockCache.set(cacheKey, JSON.stringify(response), 120);
    return NextResponse.json(response);
}

/* ── PUT /api/report-templates/:id ───────────────────────────────────────── */

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const auth = await verifyAuth(req, [UserRole.SUPERADMIN]);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const body = UpdateTemplateSchema.parse(await req.json());

    const existing = await mockDb.reportTemplates.findFirst({ where: { id } });
    if (!existing) {
        return NextResponse.json({ success: false, error: "Template not found." }, { status: 404 });
    }

    const updated = await mockDb.transaction(async (tx) => {
        /* If setting as default, clear all others */
        if (body.isDefault) {
            const all = await tx.reportTemplates.findMany({});
            for (const t of all) {
                if (t.id !== id && (t as ReportTemplate & { isDefault?: boolean }).isDefault) {
                    await tx.reportTemplates.update({
                        where: { id: t.id },
                        data: { isDefault: false },
                    });
                }
            }
        }
        return tx.reportTemplates.update({
            where: { id },
            data: { ...body, updatedAt: new Date().toISOString() },
        });
    });

    await mockCache.invalidatePattern(`templates:detail:${id}`);
    await mockCache.invalidatePattern("templates:list");
    return NextResponse.json({ success: true, data: updated });
}
