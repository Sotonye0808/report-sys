/**
 * app/api/report-templates/[id]/route.ts
 * GET /api/report-templates/:id  — get single template with sections + metrics
 * PUT /api/report-templates/:id  — update template, replacing sections + metrics
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { createTemplateVersionSnapshot } from "@/lib/utils/audit";
import { parseCachedJsonSafe } from "@/lib/utils/cacheJson";
import { UserRole, MetricFieldType, MetricCalculationType, ReportDeadlinePolicy, ReportPeriodType } from "@/types/global";

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
    capturesWoW: z.boolean().default(false),
    correlationGroup: z.string().nullable().optional(),
    isAutoTotal: z.boolean().default(false),
    autoTotalSourceMetricIds: z.array(z.string()).default([]),
    autoTotalScope: z.enum(["SECTION", "TEMPLATE"]).nullable().optional(),
    order: z.number().int().min(1),
});

const SectionSchema = z.object({
    id: z.string().optional(),
    templateId: z.string().optional(),
    name: z.string().min(1),
    description: z.string().optional(),
    order: z.number().int().min(1),
    isRequired: z.boolean().default(true),
    correlationGroup: z.string().nullable().optional(),
    metrics: z.array(MetricSchema).min(1),
});

const UpdateTemplateSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    isDefault: z.boolean().optional(),
    isArchived: z.boolean().optional(),
    deadlinePolicy: z.nativeEnum(ReportDeadlinePolicy).optional(),
    deadlineOffsetHours: z.number().int().min(1).max(168).optional(),
    recurrenceFrequency: z.nativeEnum(ReportPeriodType).nullable().optional(),
    recurrenceDays: z.array(z.number().int().min(0).max(6)).optional(),
    autoFillTitleTemplate: z.string().max(500).nullable().optional(),
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
        const parsedCached = parseCachedJsonSafe(cached);
        if (parsedCached) return NextResponse.json(parsedCached);

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

    let jsonBody: unknown;
    try {
        jsonBody = await req.json();
    } catch (err) {
        console.error("[api] Error parsing JSON body in PUT /api/report-templates/:id", {
            err,
            url: req.url,
            method: req.method,
            templateId: id,
        });
        return NextResponse.json(
            {
                success: false,
                error: "Invalid JSON payload.",
                code: 400,
                debug: err instanceof Error ? err.message : String(err),
            },
            { status: 400 },
        );
    }

    try {
        const auth = await verifyAuth(req, TEMPLATE_MANAGE_ROLES);
        if (!auth.success) {
            return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
        }

        const parseResult = UpdateTemplateSchema.safeParse(jsonBody);
        if (!parseResult.success) {
            console.error("[api] Zod validation failed in PUT /api/report-templates/:id", {
                templateId: id,
                errors: parseResult.error.format(),
            });
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid template data.",
                    code: 400,
                    validation: parseResult.error.format(),
                },
                { status: 400 },
            );
        }

        const body = parseResult.data;

        // Validate auto-total configuration (no chains, no self-reference,
        // SECTION-scoped totals can't reference cross-section sources).
        if (body.sections) {
            const { validateAutoTotalConfig } = await import("@/lib/data/autoTotal");
            const flatMetrics = body.sections.flatMap((s) =>
                s.metrics.map((m) => ({
                    id: m.id ?? "",
                    name: m.name,
                    sectionId: s.id ?? "",
                    isAutoTotal: m.isAutoTotal,
                    autoTotalSourceMetricIds: m.autoTotalSourceMetricIds,
                    autoTotalScope: m.autoTotalScope ?? "SECTION",
                })),
            );
            const errors = validateAutoTotalConfig(flatMetrics);
            if (errors.length > 0) {
                return NextResponse.json(
                    { success: false, error: errors.join("; "), code: 400 },
                    { status: 400 },
                );
            }
        }

        const existing = await db.reportTemplate.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ success: false, error: "Template not found." }, { status: 404 });
        }

        const updated = await db.$transaction(
            async (tx) => {
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
                        ...(body.deadlinePolicy !== undefined && { deadlinePolicy: body.deadlinePolicy }),
                        ...(body.deadlineOffsetHours !== undefined && { deadlineOffsetHours: body.deadlineOffsetHours }),
                        ...(body.recurrenceFrequency !== undefined && { recurrenceFrequency: body.recurrenceFrequency }),
                        ...(body.recurrenceDays !== undefined && { recurrenceDays: body.recurrenceDays }),
                        ...(body.autoFillTitleTemplate !== undefined && {
                            autoFillTitleTemplate: body.autoFillTitleTemplate,
                        }),
                        version: { increment: 1 },
                    },
                });

                /* Replace sections + metrics if provided */
                if (body.sections) {
                    const reportsUsingTemplate = await tx.report.count({ where: { templateId: id } });
                    const goalsUsingTemplate = await tx.goal.count({
                        where: { templateMetric: { section: { templateId: id } } },
                    });
                    const metricEntriesUsingTemplate = await tx.metricEntry.count({
                        where: { templateMetric: { section: { templateId: id } } },
                    });

                    const hasExternalDependencies =
                        reportsUsingTemplate > 0 || goalsUsingTemplate > 0 || metricEntriesUsingTemplate > 0;

                    if (!hasExternalDependencies) {
                        // Safe full replacement when no existing reports/goals/metric entries reference this template.
                        await tx.reportTemplateSection.deleteMany({ where: { templateId: id } });

                        for (const section of body.sections) {
                            const sec = await tx.reportTemplateSection.create({
                                data: {
                                    templateId: id,
                                    name: section.name,
                                    description: section.description,
                                    order: section.order,
                                    isRequired: section.isRequired,
                                    correlationGroup: section.correlationGroup ?? null,
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
                                        capturesWoW: metric.capturesWoW,
                                        correlationGroup: metric.correlationGroup ?? null,
                                        isAutoTotal: metric.isAutoTotal,
                                        autoTotalSourceMetricIds: metric.autoTotalSourceMetricIds,
                                        autoTotalScope: metric.autoTotalScope ?? "SECTION",
                                        order: metric.order,
                                    },
                                });
                            }
                        }
                    } else {
                        // Protect existing report history by avoiding destructive deletion of metrics tied to reports.
                        for (const section of body.sections) {
                            let sectionId = section.id;

                            if (sectionId) {
                                await tx.reportTemplateSection.update({
                                    where: { id: sectionId },
                                    data: {
                                        name: section.name,
                                        description: section.description,
                                        order: section.order,
                                        isRequired: section.isRequired,
                                        correlationGroup: section.correlationGroup ?? null,
                                    },
                                });
                            } else {
                                const createdSection = await tx.reportTemplateSection.create({
                                    data: {
                                        templateId: id,
                                        name: section.name,
                                        description: section.description,
                                        order: section.order,
                                        isRequired: section.isRequired,
                                        correlationGroup: section.correlationGroup ?? null,
                                    },
                                });
                                sectionId = createdSection.id;
                            }

                            for (const metric of section.metrics) {
                                if (metric.id) {
                                    await tx.reportTemplateMetric.update({
                                        where: { id: metric.id },
                                        data: {
                                            name: metric.name,
                                            description: metric.description,
                                            fieldType: metric.fieldType,
                                            calculationType: metric.calculationType,
                                            isRequired: metric.isRequired,
                                            capturesGoal: metric.capturesGoal,
                                            capturesAchieved: metric.capturesAchieved,
                                            capturesYoY: metric.capturesYoY,
                                            correlationGroup: metric.correlationGroup ?? null,
                                            order: metric.order,
                                        },
                                    });
                                } else {
                                    await tx.reportTemplateMetric.create({
                                        data: {
                                            sectionId: sectionId!,
                                            name: metric.name,
                                            description: metric.description,
                                            fieldType: metric.fieldType,
                                            calculationType: metric.calculationType,
                                            isRequired: metric.isRequired,
                                            capturesGoal: metric.capturesGoal,
                                            capturesAchieved: metric.capturesAchieved,
                                            capturesYoY: metric.capturesYoY,
                                            correlationGroup: metric.correlationGroup ?? null,
                                            order: metric.order,
                                        },
                                    });
                                }
                            }
                        }
                    }
                }

                const full = await tx.reportTemplate.findUnique({
                    where: { id },
                    include: { sections: { include: { metrics: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } } },
                });
                if (!full) throw new Error("Failed to load updated template for snapshot");
                await createTemplateVersionSnapshot(
                    {
                        templateId: id,
                        versionNumber: full.version,
                        snapshot: JSON.parse(JSON.stringify(full)),
                        actorId: auth.user.id,
                    },
                    tx,
                );

                return full;
            },
            { timeout: 15000 }
        );

        // Fire-and-forget cache invalidation to avoid blocking the response.
        cache.invalidatePatternAsync(`templates:detail:${id}`);
        cache.invalidatePatternAsync("templates:*");

        return NextResponse.json({ success: true, data: updated });
    } catch (err) {
        const payload = {
            route: "/api/report-templates/:id",
            method: "PUT",
            templateId: id,
            requestBody: jsonBody,
        };
        console.error("[api] Error in PUT /api/report-templates/:id", { ...payload, error: err });

        if (err instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid template data.",
                    code: 400,
                    validation: err.format(),
                },
                { status: 400 },
            );
        }

        // Include debug info for root-cause triage in logs/responses.
        const message = err instanceof Error ? err.message : "An unknown error occurred.";

        if (err instanceof Error && err.message.includes("active reports")) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Template update is blocked because existing reports reference this template. Clone or create a new template instead.",
                    code: 409,
                    debug: message,
                },
                { status: 409 },
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: "An error occurred while saving the template.",
                code: 500,
                debug: message,
            },
            { status: 500 },
        );
    }
}
