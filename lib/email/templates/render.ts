/**
 * lib/email/templates/render.ts
 *
 * Resolves an email template's `(subject, html)` for a given templateId + vars.
 * Reads the `emailTemplates` admin-config namespace first, falls back to the
 * registry definition. Variable substitution uses `{{var}}` syntax, restricted
 * to the per-template variable allowlist; unknown placeholders are left literal
 * and reported in `missingVars` so callers can structured-log a warning.
 */

import { loadAdminConfig } from "@/lib/data/adminConfig";
import { renderEmailLayout } from "@/lib/email/templates/layout";
import { EMAIL_TEMPLATE_DEFINITIONS } from "@/lib/email/templates/definitions";

export interface RenderResult {
    subject: string;
    html: string;
    /** Placeholders found in the body that were NOT supplied by `vars`. */
    missingVars: string[];
    /** True when the rendered output came from a DB override; false = fallback. */
    fromOverride: boolean;
}

interface OverrideEntry {
    subject?: string;
    html?: string;
}

interface OverridesPayload {
    overrides?: Record<string, OverrideEntry>;
}

const PLACEHOLDER_RE = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Substitute `{{var}}` placeholders. Only variables in `allowed` are
 * replaced; unknown placeholders are preserved literally. Provided values
 * are HTML-escaped unless `rawHtml` is true (used internally for sub-blocks
 * that are themselves rendered HTML).
 */
function substitute(
    template: string,
    vars: Record<string, string | number | undefined>,
    allowed: Set<string>,
    rawHtml = false,
): { out: string; missing: string[] } {
    const missing = new Set<string>();
    const out = template.replace(PLACEHOLDER_RE, (match, name) => {
        if (!allowed.has(name)) return match;
        const value = vars[name];
        if (value == null || value === "") {
            missing.add(name);
            return "";
        }
        const stringified = String(value);
        return rawHtml ? stringified : escapeHtml(stringified);
    });
    return { out, missing: Array.from(missing) };
}

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

/**
 * Synchronous preview-only renderer. Used by the admin UI when previewing the
 * fallback definition or a draft override before save. Does NOT touch
 * admin-config; pass the override directly when previewing edits.
 */
export function renderTemplatePreview(
    templateId: string,
    vars: Record<string, string | number | undefined>,
    override?: OverrideEntry,
    options: { heading?: string; accent?: string } = {},
): RenderResult | null {
    const def = EMAIL_TEMPLATE_DEFINITIONS[templateId];
    if (!def) return null;

    const allowed = new Set(def.variables);
    const subjectTemplate = override?.subject ?? def.defaultSubject;
    const bodyTemplate = override?.html ?? def.defaultHtml;

    const subjectRender = substitute(subjectTemplate, vars, allowed, true);
    const bodyRender = substitute(bodyTemplate, vars, allowed, true);

    const html = renderEmailLayout({
        heading: options.heading ?? def.label,
        accent: options.accent,
        bodyHtml: bodyRender.out,
    });

    const missing = Array.from(new Set([...subjectRender.missing, ...bodyRender.missing]));

    return {
        subject: subjectRender.out,
        html,
        missingVars: missing,
        fromOverride: Boolean(override),
    };
}

/**
 * Drop unknown template ids from an emailTemplates payload. Defence in depth
 * for admin-config writes.
 */
export function sanitiseEmailTemplatesPayload(
    payload: OverridesPayload,
): OverridesPayload {
    const out: OverridesPayload = { overrides: {} };
    if (!payload?.overrides) return out;
    for (const [id, entry] of Object.entries(payload.overrides)) {
        if (!EMAIL_TEMPLATE_DEFINITIONS[id]) continue;
        const cleaned: OverrideEntry = {};
        if (entry?.subject != null) cleaned.subject = String(entry.subject);
        if (entry?.html != null) cleaned.html = String(entry.html);
        if (cleaned.subject || cleaned.html) {
            out.overrides![id] = cleaned;
        }
    }
    return out;
}

export { escapeHtml };
