"use client";

/**
 * modules/templates/components/CorrelationGroupSelect.tsx
 *
 * Smart-select for correlation group strings. Surfaces existing groups
 * already used in the current template draft as suggestions, plus a
 * "+ Create group: <typed>" option so admins don't have to remember
 * exact names. Out-of-list values render as Custom badges.
 */

import { useMemo, useState } from "react";
import { Select } from "antd";

interface SectionLike {
    correlationGroup?: string | null;
    metrics?: Array<{ correlationGroup?: string | null }>;
}

interface Props {
    /** Current template draft used to gather existing group names. */
    sections: SectionLike[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    style?: React.CSSProperties;
}

function gatherGroups(sections: SectionLike[]): string[] {
    const out = new Set<string>();
    for (const sec of sections) {
        if (sec.correlationGroup) out.add(sec.correlationGroup);
        for (const m of sec.metrics ?? []) {
            if (m.correlationGroup) out.add(m.correlationGroup);
        }
    }
    return Array.from(out).sort((a, b) => a.localeCompare(b));
}

export function CorrelationGroupSelect({
    sections,
    value,
    onChange,
    placeholder,
    disabled,
    style,
}: Props) {
    const groups = useMemo(() => gatherGroups(sections), [sections]);
    const [search, setSearch] = useState("");

    // Compose options: existing groups + the current value when it isn't
    // already in the list (so a saved out-of-list value still renders the
    // selected label rather than a bare id).
    const optionMap = new Map<string, string>();
    for (const g of groups) optionMap.set(g, g);
    if (value && !optionMap.has(value)) optionMap.set(value, `${value} (custom)`);

    const baseOptions = Array.from(optionMap.entries()).map(([v, label]) => ({ value: v, label }));
    const trimmed = search.trim();
    const showCreate = trimmed.length > 0 && !optionMap.has(trimmed);

    const options = showCreate
        ? [...baseOptions, { value: trimmed, label: `+ Create group "${trimmed}"` }]
        : baseOptions;

    const isEmptyState = baseOptions.length === 0 && !showCreate;

    return (
        <Select
            value={value || undefined}
            onChange={(v) => {
                onChange((v as string) ?? "");
                setSearch("");
            }}
            options={options}
            allowClear
            showSearch
            optionFilterProp="label"
            onSearch={setSearch}
            placeholder={placeholder ?? "Pick or type to create a correlation group"}
            disabled={disabled}
            // Default to full-width so a parent grid/flex doesn't squeeze it
            // into a 0-width cell. Caller can still override via `style`.
            style={{ width: "100%", ...style }}
            popupMatchSelectWidth={false}
            notFoundContent={
                isEmptyState ? (
                    <span className="text-xs text-ds-text-subtle">
                        Type a name to create a new correlation group
                    </span>
                ) : undefined
            }
        />
    );
}

export default CorrelationGroupSelect;
