/**
 * modules/reports/services/templateHistory.ts
 * Report template version history helpers.
 */

import { db } from "@/lib/data/db";

export async function getTemplateVersionHistory(templateId: string) {
    const template = await db.reportTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw new Error("Template not found.");

    const versions = await db.reportTemplateVersion.findMany({
        where: { templateId },
        orderBy: { versionNumber: "desc" },
    });

    return versions;
}
