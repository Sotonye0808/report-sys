/**
 * lib/email/templates/render.ts
 *
 * **Server-only.** Resolves an email template's `(subject, html)` for a given
 * templateId + vars by overlaying the `emailTemplates` admin-config namespace
 * on top of the registry definition.
 *
 * The synchronous preview-only path lives in `preview.ts` (client-safe).
 * Importing this file from a client component pulls Prisma into the bundle —
 * use `lib/email/templates/preview.ts` for any UI preview surface.
 */

import "server-only";

import { loadAdminConfig } from "@/lib/data/adminConfig";
import { renderEmailLayout } from "@/lib/email/templates/layout";
import { EMAIL_TEMPLATE_DEFINITIONS } from "@/lib/email/templates/definitions";
import {
    substitute,
    renderTemplatePreview,
    sanitiseEmailTemplatesPayload,
    escapeHtml,
    type RenderResult,
    type OverrideEntry,
    type OverridesPayload,
} from "@/lib/email/templates/preview";

// Re-export the pure helpers so existing server callers keep working
// without switching import paths.
export {
    substitute,
    renderTemplatePreview,
    sanitiseEmailTemplatesPayload,
    escapeHtml,
};
export type { RenderResult, OverrideEntry, OverridesPayload };

/**
 * Render a template by id. Pulls override from admin-config (DB-first,
 * config/* fallback) and substitutes vars. Body is wrapped in the shared
 * email layout.
 */
export async function renderTemplate(
    templateId: string,
    vars: Record<string, string | number | undefined>,
    options: { heading?: string; accent?: string } = {},
): Promise<RenderResult | null> {
    const def = EMAIL_TEMPLATE_DEFINITIONS[templateId];
    if (!def) return null;

    const allowed = new Set(def.variables);
    let subjectTemplate = def.defaultSubject;
    let bodyTemplate = def.defaultHtml;
    let fromOverride = false;

    try {
        const snap = await loadAdminConfig<OverridesPayload>("emailTemplates");
        const override = snap.payload?.overrides?.[templateId];
        if (override?.subject) {
            subjectTemplate = override.subject;
            fromOverride = true;
        }
        if (override?.html) {
            bodyTemplate = override.html;
            fromOverride = true;
        }
    } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("[email/render] admin-config read failed; using fallback", err);
    }

    const subjectRender = substitute(subjectTemplate, vars, allowed, true);
    const bodyRender = substitute(bodyTemplate, vars, allowed, true);

    const html = renderEmailLayout({
        heading: options.heading ?? def.label,
        accent: options.accent,
        bodyHtml: bodyRender.out,
    });

    const missing = Array.from(new Set([...subjectRender.missing, ...bodyRender.missing]));
    if (missing.length > 0) {
        // eslint-disable-next-line no-console
        console.warn(
            `[email/render] template ${templateId} missing variables: ${missing.join(", ")}`,
        );
    }

    return {
        subject: subjectRender.out,
        html,
        missingVars: missing,
        fromOverride,
    };
}
