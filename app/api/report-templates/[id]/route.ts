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
        // Ensure the template has an orgGroupId. If it was seeded without one
        // attempt to infer a default group for the template's organisation so
        // subsequent report creation that expects a valid orgGroupId won't fail.
        if (!existing.orgGroupId) {
            const defaultGroup = await tx.orgGroup.findFirst({ where: { organisationId: existing.organisationId } });
            if (defaultGroup) {
                // Persist the inferred orgGroupId as part of the update.
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
            /* Delete old metrics then sections (cascade handles this via onDelete: Cascade) */
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

        /* Create a version snapshot */
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

    try {
        await cache.invalidatePattern(`templates:detail:${id}`);
        await cache.invalidatePattern("templates:*");
    } catch (err) {
        // Do not fail the request when cache invalidation fails.
        // eslint-disable-next-line no-console
        console.error("[cache] invalidatePattern error in PUT /api/report-templates/:id:", err);
    }

    return NextResponse.json({ success: true, data: updated });
} catch (err) {
    // eslint-disable-next-line no-console
    console.error("[api] Error in PUT /api/report-templates/:id", err);
    return NextResponse.json({ success: false, error: "An error occurred while saving the template." }, { status: 500 });
}
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
    /* Delete old metrics then sections (cascade handles this via onDelete: Cascade) */
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

/* Create a version snapshot */
const full = await tx.reportTemplate.findUnique({
    where: { id },
    include: { sections: { include: { metrics: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } } },
});
await tx.reportTemplateVersion.create({
    data: {
        templateId: id,
        versionNumber: full!.version,
        snapshot: JSON.parse(JSON.stringify(full)),
        createdById: auth.user.id,
    },
});

return full;
    });

try {
    await cache.invalidatePattern(`templates:detail:${id}`);
    await cache.invalidatePattern("templates:*");
} catch (err) {
    // Do not fail the request when cache invalidation fails.
    // eslint-disable-next-line no-console
    console.error("[cache] invalidatePattern error in PUT /api/report-templates/:id:", err);
}
return NextResponse.json({ success: true, data: updated });
}
