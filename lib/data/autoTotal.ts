/**
 * lib/data/autoTotal.ts
 *
 * Pure functions used by report write paths and `ensureReportShell` to
 * keep auto-total metrics in lock-step with their source metrics.
 *
 * Auto-total semantics:
 *  - One auto-total metric carries `isAutoTotal: true` + `autoTotalSourceMetricIds: string[]`.
 *  - Server (NOT client) is the source of truth for the value.
 *  - Auto-totals cannot be sources for other auto-totals (chain guard).
 *  - Sources must come from the same section unless `autoTotalScope === "TEMPLATE"`.
 *
 * No DB access here — caller passes plain snapshots in.
 */

export interface SectionLike {
    id: string;
    templateSectionId?: string;
    metrics?: MetricCellLike[];
}

export interface MetricCellLike {
    id?: string;
    templateMetricId: string;
    monthlyAchieved?: number | null;
    monthlyGoal?: number | null;
    comment?: string | null;
    isLocked?: boolean;
}

export interface TemplateMetricLike {
    id: string;
    name?: string;
    sectionId?: string;
    isAutoTotal?: boolean;
    autoTotalSourceMetricIds?: string[];
    autoTotalScope?: "SECTION" | "TEMPLATE" | string | null;
}

export interface RecomputeResult {
    /** Updated section snapshots, with auto-total cell values + comments stamped. */
    sections: SectionLike[];
    /** Auto-total metric ids whose value was recomputed this pass (changed or unchanged). */
    recomputedMetricIds: string[];
    /** Source ids that were declared but not present in the report (warning, not error). */
    unresolvedSourceIds: string[];
}

/**
 * Detects forbidden patterns in the template:
 *   - self-reference (auto-total source list contains its own id)
 *   - chaining (auto-total source list contains another auto-total)
 *   - scope drift (a SECTION-scoped auto-total references a metric in another section)
 *
 * Returns the list of validation errors as plain strings. Empty array == ok.
 */
export function validateAutoTotalConfig(templateMetrics: TemplateMetricLike[]): string[] {
    const errors: string[] = [];
    const byId = new Map(templateMetrics.map((m) => [m.id, m]));
    for (const m of templateMetrics) {
        if (!m.isAutoTotal) continue;
        const sources = m.autoTotalSourceMetricIds ?? [];
        if (sources.length === 0) {
            errors.push(`auto-total ${m.name ?? m.id}: source list is empty`);
            continue;
        }
        for (const sourceId of sources) {
            if (sourceId === m.id) {
                errors.push(`auto-total ${m.name ?? m.id}: cannot reference itself`);
                continue;
            }
            const source = byId.get(sourceId);
            if (!source) continue; // unresolved sources are warnings, not errors
            if (source.isAutoTotal) {
                errors.push(
                    `auto-total ${m.name ?? m.id}: source ${source.name ?? source.id} is itself an auto-total (chaining is not allowed)`,
                );
            }
            if ((m.autoTotalScope ?? "SECTION") === "SECTION") {
                if (m.sectionId && source.sectionId && m.sectionId !== source.sectionId) {
                    errors.push(
                        `auto-total ${m.name ?? m.id}: source ${source.name ?? source.id} is in another section (set scope to TEMPLATE to allow this)`,
                    );
                }
            }
        }
    }
    return errors;
}

/**
 * Build the comment stamp listing the source metric names that summed up to the total.
 * Sources are deduped + sorted by name for stable diffs.
 */
export function buildAutoTotalComment(sourceNames: string[]): string {
    if (sourceNames.length === 0) return "Auto-total: no source metrics";
    const unique = Array.from(new Set(sourceNames)).sort((a, b) => a.localeCompare(b));
    return `Auto-total of ${unique.join(" + ")}`;
}

/**
 * Recompute auto-total metric cell values across the supplied sections.
 *
 * For each metric `m` in `templateMetrics` where `isAutoTotal`, scan the
 * sections for a `MetricCellLike` with `templateMetricId === m.id` and write
 * `monthlyAchieved = sum of source achieved values` + a fresh comment.
 *
 * Existing source values that are nullish contribute zero to the sum (the
 * total is "what we know so far"). Auto-total cells are also marked
 * `isLocked: true` so the form layer renders them read-only.
 */
export function recomputeAutoTotals(
    sections: SectionLike[],
    templateMetrics: TemplateMetricLike[],
): RecomputeResult {
    const cellsByTemplateMetricId = new Map<string, MetricCellLike>();
    for (const sec of sections) {
        for (const cell of sec.metrics ?? []) {
            cellsByTemplateMetricId.set(cell.templateMetricId, cell);
        }
    }
    const tplById = new Map(templateMetrics.map((m) => [m.id, m]));

    const recomputed: string[] = [];
    const unresolved: string[] = [];

    for (const m of templateMetrics) {
        if (!m.isAutoTotal) continue;
        const cell = cellsByTemplateMetricId.get(m.id);
        if (!cell) continue; // template metric exists but report has no row yet
        const sourceIds = m.autoTotalSourceMetricIds ?? [];
        let sum = 0;
        const sourceNames: string[] = [];
        for (const sourceId of sourceIds) {
            const sourceCell = cellsByTemplateMetricId.get(sourceId);
            const sourceTpl = tplById.get(sourceId);
            if (!sourceCell || !sourceTpl) {
                unresolved.push(sourceId);
                continue;
            }
            // Skip chained auto-totals defensively (validateAutoTotalConfig should have caught this).
            if (sourceTpl.isAutoTotal) continue;
            // Scope guard: SECTION-scoped totals only sum same-section sources.
            if ((m.autoTotalScope ?? "SECTION") === "SECTION") {
                if (m.sectionId && sourceTpl.sectionId && m.sectionId !== sourceTpl.sectionId) {
                    continue;
                }
            }
            const value = typeof sourceCell.monthlyAchieved === "number" ? sourceCell.monthlyAchieved : 0;
            sum += value;
            if (sourceTpl.name) sourceNames.push(sourceTpl.name);
        }
        cell.monthlyAchieved = sum;
        cell.comment = buildAutoTotalComment(sourceNames);
        cell.isLocked = true;
        recomputed.push(m.id);
    }

    return { sections, recomputedMetricIds: recomputed, unresolvedSourceIds: Array.from(new Set(unresolved)) };
}
