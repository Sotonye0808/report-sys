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

    const baseOptions = groups.map((g) => ({ value: g, label: g }));
    const showCreate =
        search.trim().length > 0 && !groups.includes(search.trim());

    const options = showCreate
        ? [...baseOptions, { value: search.trim(), label: `+ Create group "${search.trim()}"` }]
        : baseOptions;

    return (
        <Select
            value={value || undefined}
            onChange={(v) => onChange((v as string) ?? "")}
            options={options}
            allowClear
            showSearch
            optionFilterProp="label"
            onSearch={setSearch}
            placeholder={placeholder ?? "Pick or create a group"}
            disabled={disabled}
            style={style}
        />
    );
}

export default CorrelationGroupSelect;
