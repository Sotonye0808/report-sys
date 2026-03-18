/**
 * app/api/report-templates/[id]/route.ts
 * GET /api/report-templates/:id  — get single template with sections + metrics
 * PUT /api/report-templates/:id  — update template, replacing sections + metrics
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
    templateId: z.string().optional(),
    name: z.string().min(1),
    description: z.string().optional(),
    order: z.number().int().min(1),
    isRequired: z.boolean().default(true),
    metrics: z.array(MetricSchema).min(1),
});

const UpdateTemplateSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    isDefault: z.boolean().optional(),
    isArchived: z.boolean().optional(),
    sections: z.array(SectionSchema).optional(),
});

const TEMPLATE_MANAGE_ROLES: UserRole[] = [
    UserRole.SUPERADMIN,
    UserRole.CEO,
    UserRole.SPO,
    UserRole.CHURCH_MINISTRY,
    UserRole.GROUP_PASTOR,
    UserRole.GROUP_ADMIN,
];

/* ── GET /api/report-templates/:id ───────────────────────────────────────── */

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
        }

        const cacheKey = `templates:detail:${id}`;
        const cached = await cache.get(cacheKey);
        if (cached) {
            try {
                const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
                return NextResponse.json(parsed);
            } catch {
                // Cached payload is invalid JSON; ignore and refetch from the database.
            }
        }

        const template = await db.reportTemplate.findUnique({
            where: { id },
            include: { sections: { include: { metrics: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } } },
        });
        if (!template) {
            return NextResponse.json({ success: false, error: "Template not found." }, { status: 404 });
        }

        const response = { success: true, data: template };
        await cache.set(cacheKey, JSON.stringify(response), 120);
        return NextResponse.json(response);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[api] Error in GET /api/report-templates/:id", err);
        return NextResponse.json(
            { success: false, error: "An error occurred while loading the template." },
            { status: 500 },
        );
    }
}

/* ── PUT /api/report-templates/:id ───────────────────────────────────────── */

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    try {
        const auth = await verifyAuth(req, TEMPLATE_MANAGE_ROLES);
        if (!auth.success) {
            return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
        }

        const body = UpdateTemplateSchema.parse(await req.json());

        const existing = await db.reportTemplate.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ success: false, error: "Template not found." }, { status: 404 });
        }

        const updated = await db.$transaction(async (tx) => {
            // If the template lacks orgGroupId (seeded gap), try to infer and persist one
            if (!existing.orgGroupId) {
                const defaultGroup = await tx.orgGroup.findFirst();
                if (defaultGroup) {
                    await tx.reportTemplate.update({ where: { id }, data: { orgGroupId: defaultGroup.id } });
                }
            }

            if (body.isDefault) {
                await tx.reportTemplate.updateMany({
                    where: { id: { not: id }, isDefault: true },
                    data: { isDefault: false },
                });
            }

            await tx.reportTemplate.update({
                where: { id },
                data: {
                    ...(body.name !== undefined && { name: body.name }),
                    ...(body.description !== undefined && { description: body.description }),
                    ...(body.isDefault !== undefined && { isDefault: body.isDefault }),
                    ...(body.isArchived !== undefined && { isActive: !body.isArchived }),
                    version: { increment: 1 },
                },
            });

            /* Replace sections + metrics if provided */
            if (body.sections) {
                await tx.reportTemplateSection.deleteMany({ where: { templateId: id } });

                for (const section of body.sections) {
                    const sec = await tx.reportTemplateSection.create({
                        data: {
                            templateId: id,
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
            }

            const full = await tx.reportTemplate.findUnique({
                where: { id },
                include: { sections: { include: { metrics: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } } },
            });
            if (!full) throw new Error("Failed to load updated template for snapshot");
            await tx.reportTemplateVersion.create({
                data: {
                    templateId: id,
                    versionNumber: full.version,
                    snapshot: JSON.parse(JSON.stringify(full)),
                    createdById: auth.user.id,
                },
            });

            return full;
        });

        // Fire-and-forget cache invalidation to avoid blocking the response.
        cache.invalidatePatternAsync(`templates:detail:${id}`);
        cache.invalidatePatternAsync("templates:*");

        return NextResponse.json({ success: true, data: updated });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[api] Error in PUT /api/report-templates/:id", err);
        return NextResponse.json({ success: false, error: "An error occurred while saving the template." }, { status: 500 });
    }
}
