/**
 * lib/utils/reportTitle.ts
 *
 * Allowlisted `{placeholder}` substitution for auto-filled report titles.
 * Unknown placeholders are left literal so a malformed admin edit never
 * leaks values from the variable bag.
 */

const ALLOWED_KEYS = [
    "campus",
    "group",
    "period",
    "weekNumber",
    "monthName",
    "quarter",
    "year",
] as const;

export type ReportTitleVar = (typeof ALLOWED_KEYS)[number];

export type ReportTitleVars = Partial<Record<ReportTitleVar, string | number | undefined>>;

const PLACEHOLDER_PATTERN = /\{(\w+)\}/g;

export interface RenderTitleResult {
    title: string;
    /** Placeholders we found but had no value for. Logged but rendered literal. */
    missing: string[];
    /** Placeholders we found that aren't on the allowlist. Logged but rendered literal. */
    unknown: string[];
}

export function renderTitle(template: string, vars: ReportTitleVars): RenderTitleResult {
    const missing: string[] = [];
    const unknown: string[] = [];
    const allowed = new Set<string>(ALLOWED_KEYS);
    const title = template.replace(PLACEHOLDER_PATTERN, (raw, key: string) => {
        if (!allowed.has(key)) {
            unknown.push(key);
            return raw;
        }
        const value = vars[key as ReportTitleVar];
        if (value === undefined || value === null || value === "") {
            missing.push(key);
            return raw;
        }
        return String(value);
    });
    return { title, missing, unknown };
}

/**
 * Convenience helper to fully render with no error surface.
 * For routes that want a single string and accept "" as fallback.
 */
export function renderTitleSimple(template: string | null | undefined, vars: ReportTitleVars): string {
    if (!template) return "";
    return renderTitle(template, vars).title;
}
