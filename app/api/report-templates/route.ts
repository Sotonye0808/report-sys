/**
 * app/api/report-templates/route.ts
 * GET  /api/report-templates  — list templates
 * POST /api/report-templates  — create template (SUPERADMIN)
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

const CreateTemplateSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    organisationId: z.string().min(1),
    fields: z.array(FieldSchema).min(1),
    isDefault: z.boolean().optional().default(false),
});

/* ── GET /api/report-templates ────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const cacheKey = "templates:list";
    const cached = await mockCache.get(cacheKey);
    if (cached) return NextResponse.json(JSON.parse(cached));

    const templates = await mockDb.reportTemplates.findMany({});
    const sorted = [...templates].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const response = { success: true, data: sorted };
    await mockCache.set(cacheKey, JSON.stringify(response), 60);
    return NextResponse.json(response);
}

/* ── POST /api/report-templates ──────────────────────────────────────────── */

export async function POST(req: NextRequest) {
    const auth = await verifyAuth(req, [UserRole.SUPERADMIN]);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const body = CreateTemplateSchema.parse(await req.json());

    const template = await mockDb.transaction(async (tx) => {
        /* If isDefault, remove default from all others first */
        if (body.isDefault) {
            const existing = await tx.reportTemplates.findMany({});
            for (const t of existing) {
                if ((t as ReportTemplate & { isDefault?: boolean }).isDefault) {
                    await tx.reportTemplates.update({
                        where: { id: t.id },
                        data: { isDefault: false },
                    });
                }
            }
        }

        return tx.reportTemplates.create({
            data: {
                id: crypto.randomUUID(),
                ...body,
                version: 1,
                sections: [] as ReportTemplateSection[],
                createdById: auth.user.id,
                isActive: true,
                isDefault: body.isDefault ?? false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            } as ReportTemplate,
        });
    });

    await mockCache.invalidatePattern("templates:*");
    return NextResponse.json({ success: true, data: template }, { status: 201 });
}
