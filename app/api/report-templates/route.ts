/**
 * app/api/report-templates/route.ts
 * GET  /api/report-templates  — list templates
 * POST /api/report-templates  — create template with sections + metrics
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { UserRole, MetricFieldType, MetricCalculationType } from "@/types/global";

/* ── Schemas ──────────────────────────────────────────────────────────────── */

const MetricSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    description: z.string().optional(),
    fieldType: z.nativeEnum(MetricFieldType).default(MetricFieldType.NUMBER),
    calculationType: z.nativeEnum(MetricCalculationType).default(MetricCalculationType.SUM),
    isRequired: z.boolean().default(true),
    capturesGoal: z.boolean().default(false),
    capturesAchieved: z.boolean().default(false),
    capturesYoY: z.boolean().default(false),
    order: z.number().int().min(1),
});

const SectionSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    description: z.string().optional(),
    order: z.number().int().min(1),
    isRequired: z.boolean().default(true),
    metrics: z.array(MetricSchema).min(1),
});

const CreateTemplateSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    organisationId: z.string().min(1),
    sections: z.array(SectionSchema).min(1),
    isDefault: z.boolean().optional().default(false),
});

const TEMPLATE_MANAGE_ROLES: UserRole[] = [
    UserRole.SUPERADMIN,
    UserRole.CEO,
    UserRole.SPO,
    UserRole.CHURCH_MINISTRY,
    UserRole.GROUP_PASTOR,
    UserRole.GROUP_ADMIN,
];

/* ── GET /api/report-templates ────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const cacheKey = "templates:list";
    const cached = await cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    const templates = await db.reportTemplate.findMany({
        orderBy: { createdAt: "desc" },
        include: { sections: { include: { metrics: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } } },
    });

    const response = { success: true, data: templates };
    await cache.set(cacheKey, JSON.stringify(response), 60);
    return NextResponse.json(response);
}

/* ── POST /api/report-templates ──────────────────────────────────────────── */

export async function POST(req: NextRequest) {
    const auth = await verifyAuth(req, TEMPLATE_MANAGE_ROLES);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const body = CreateTemplateSchema.parse(await req.json());

    const template = await db.$transaction(async (tx) => {
        if (body.isDefault) {
            await tx.reportTemplate.updateMany({
                where: { isDefault: true },
                data: { isDefault: false },
            });
        }

        const tpl = await tx.reportTemplate.create({
            data: {
                name: body.name,
                description: body.description,
                organisationId: body.organisationId,
                createdById: auth.user.id,
                isActive: true,
                isDefault: body.isDefault ?? false,
            },
        });

        for (const section of body.sections) {
            const sec = await tx.reportTemplateSection.create({
                data: {
                    templateId: tpl.id,
                    name: section.name,
                    description: section.description,
                    order: section.order,
                    isRequired: section.isRequired,
                },
            });
            for (const metric of section.metrics) {
                await tx.reportTemplateMetric.create({
                    data: {
                        sectionId: sec.id,
                        name: metric.name,
                        description: metric.description,
                        fieldType: metric.fieldType,
                        calculationType: metric.calculationType,
                        isRequired: metric.isRequired,
                        capturesGoal: metric.capturesGoal,
                        capturesAchieved: metric.capturesAchieved,
                        capturesYoY: metric.capturesYoY,
                        order: metric.order,
                    },
                });
            }
        }

        return tx.reportTemplate.findUnique({
            where: { id: tpl.id },
            include: { sections: { include: { metrics: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } } },
        });
    });

    await cache.invalidatePattern("templates:*");
    return NextResponse.json({ success: true, data: template }, { status: 201 });
}
