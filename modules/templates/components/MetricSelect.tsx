"use client";

/**
 * modules/templates/components/MetricSelect.tsx
 *
 * Reusable search-select that lists template metrics, grouped by section.
 * Supports single + multi-select modes. Renders out-of-list values as
 * "Custom: <id>" so legacy data shows up gracefully if a metric was deleted.
 */

import { useMemo } from "react";
import { Select } from "antd";

interface SelectableMetric {
    id: string;
    name: string;
    sectionName: string;
    sectionId: string;
}

interface MetricSelectProps {
    template: Pick<ReportTemplate, "sections"> | null;
    /** When provided, restrict the option list to metrics in this section. */
    restrictToSectionId?: string;
    /** When provided, exclude these metric IDs from the option list (e.g. self + chained auto-totals). */
    excludeMetricIds?: string[];
    value?: string | string[];
    onChange?: (value: string | string[]) => void;
    multiple?: boolean;
    placeholder?: string;
    allowClear?: boolean;
    disabled?: boolean;
    style?: React.CSSProperties;
}

function flatten(template: Pick<ReportTemplate, "sections"> | null): SelectableMetric[] {
    if (!template?.sections) return [];
    const out: SelectableMetric[] = [];
    for (const sec of template.sections) {
        for (const m of sec.metrics ?? []) {
            out.push({
                id: m.id,
                name: m.name,
                sectionName: sec.name,
                sectionId: sec.id,
            });
        }
    }
    return out;
}

export function MetricSelect({
    template,
    restrictToSectionId,
    excludeMetricIds,
    value,
    onChange,
    multiple,
    placeholder,
    allowClear,
    disabled,
    style,
}: MetricSelectProps) {
    const allMetrics = useMemo(() => flatten(template), [template]);
    const exclude = useMemo(() => new Set(excludeMetricIds ?? []), [excludeMetricIds]);

    // Build grouped options keyed by section.
    const groupedOptions = useMemo(() => {
        const filtered = allMetrics.filter((m) => {
            if (exclude.has(m.id)) return false;
            if (restrictToSectionId && m.sectionId !== restrictToSectionId) return false;
            return true;
        });
        const bySection = new Map<string, SelectableMetric[]>();
        for (const m of filtered) {
            if (!bySection.has(m.sectionId)) bySection.set(m.sectionId, []);
            bySection.get(m.sectionId)!.push(m);
        }
        const out: Array<{ label: string; options: Array<{ label: string; value: string }> }> = [];
        for (const [, list] of bySection) {
            out.push({
                label: list[0].sectionName,
                options: list.map((m) => ({ label: m.name, value: m.id })),
            });
        }
        return out;
    }, [allMetrics, exclude, restrictToSectionId]);

    // Surface out-of-list values as "Custom: <id>" so legacy refs still render.
    const known = useMemo(() => new Set(allMetrics.map((m) => m.id)), [allMetrics]);
    const customOption = useMemo(() => {
        const present = Array.isArray(value) ? value : value ? [value] : [];
        return present
            .filter((v) => !known.has(v))
            .map((v) => ({ label: `Custom: ${v.slice(0, 8)}`, value: v }));
    }, [value, known]);

    const optionsWithCustom = customOption.length
        ? [{ label: "Unknown / removed", options: customOption }, ...groupedOptions]
        : groupedOptions;

    return (
        <Select
            mode={multiple ? "multiple" : undefined}
            value={value as never}
            onChange={onChange as never}
            options={optionsWithCustom}
            placeholder={placeholder ?? "Pick a metric"}
            showSearch
            optionFilterProp="label"
            allowClear={allowClear}
            disabled={disabled}
            style={style}
        />
    );
}

export default MetricSelect;
