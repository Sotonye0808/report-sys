/**
 * lib/email/templates/preview.ts
 *
 * Pure, dependency-light helpers used by both the server renderer and the
 * admin UI's live-preview pane. **Must not import any server-only module**
 * (no Prisma, no Redis, no `lib/data/*`); this file is bundled into the
 * client.
 *
 * The synchronous renderer + the sanitiser live here so the admin
 * `EmailTemplatesEditor` can preview drafts without dragging the database
 * adapter into the browser bundle.
 */

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

export interface OverrideEntry {
    subject?: string;
    html?: string;
}

export interface OverridesPayload {
    overrides?: Record<string, OverrideEntry>;
}

const PLACEHOLDER_RE = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export function escapeHtml(str: string): string {
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
 * are HTML-escaped unless `rawHtml` is true.
 */
export function substitute(
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
 * for admin-config writes; safe to call on the client too.
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
