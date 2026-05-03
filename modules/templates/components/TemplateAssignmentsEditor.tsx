"use client";

/**
 * modules/templates/components/TemplateAssignmentsEditor.tsx
 *
 * Per-template CRUD surface for FormAssignmentRule. Closes the missing
 * entry point — admins pick which metrics from a template a USHER (or any
 * other role) is expected to fill, plus optional scope (campus/group)
 * and cadence override.
 */

import { useEffect, useMemo, useState } from "react";
import { Select, Switch, Empty, message, Tag, Input } from "antd";
import { CONTENT } from "@/config/content";
import { API_ROUTES } from "@/config/routes";
import { ROLE_CONFIG } from "@/config/roles";
import { CAMPUS_SCOPED_ROLES, GROUP_SCOPED_ROLES } from "@/config/hierarchy";
import { UserRole } from "@/types/global";
import Button from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { MetricSelect } from "./MetricSelect";
import { useApiData } from "@/lib/hooks/useApiData";

interface Props {
    templateId: string;
    template: ReportTemplate | null;
}

interface RuleRow {
    id: string;
    templateId: string;
    role?: UserRole | null;
    assigneeId?: string | null;
    campusId?: string | null;
    orgGroupId?: string | null;
    metricIds: string[];
    notes?: string | null;
    isActive: boolean;
    cadenceOverride?: Record<string, unknown> | null;
}

const ROLE_OPTIONS = (Object.keys(ROLE_CONFIG) as UserRole[])
    .filter((r) => ROLE_CONFIG[r].canQuickFormFill || r === UserRole.DATA_ENTRY)
    .map((r) => ({ value: r, label: ROLE_CONFIG[r].label }));

export function TemplateAssignmentsEditor({ templateId, template }: Props) {
    const [rules, setRules] = useState<RuleRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    const { data: campuses } = useApiData<Campus[]>(API_ROUTES.org.campuses);
    const { data: orgGroups } = useApiData<OrgGroup[]>(API_ROUTES.org.groups);
    const campusOptions = (campuses ?? []).map((c) => ({ value: c.id, label: c.name }));
    const groupOptions = (orgGroups ?? []).map((g) => ({ value: g.id, label: g.name }));

    const reload = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_ROUTES.formAssignmentRules.list}?templateId=${templateId}`, {
                cache: "no-store",
            });
            const json = (await res.json()) as { success: boolean; data?: RuleRow[] };
            if (json.success && json.data) setRules(json.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void reload();
    }, [templateId]);

    const addRule = async () => {
        // Server requires role + non-empty metricIds; seed with sensible defaults
        // and let the user complete before save.
        const firstSection = template?.sections?.[0];
        const seedMetricIds = firstSection?.metrics?.[0]?.id ? [firstSection.metrics[0].id] : [];
        if (seedMetricIds.length === 0) {
            message.error("Add at least one metric to the template before creating an assignment rule.");
            return;
        }
        try {
            const res = await fetch(API_ROUTES.formAssignmentRules.list, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    templateId,
                    role: UserRole.USHER,
                    metricIds: seedMetricIds,
                }),
            });
            const json = (await res.json()) as { success: boolean; data?: RuleRow; error?: string };
            if (!res.ok || !json.success) {
                message.error(json.error ?? "Could not create rule");
                return;
            }
            await reload();
            message.success("Rule created");
        } catch {
            message.error("Could not create rule");
        }
    };

    const patch = async (id: string, body: Partial<RuleRow>) => {
        setSaving(id);
        try {
            const res = await fetch(API_ROUTES.formAssignmentRules.detail(id), {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const json = (await res.json()) as { success: boolean; data?: RuleRow; error?: string };
            if (!res.ok || !json.success) {
                message.error(json.error ?? "Could not save");
                return;
            }
            setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...(json.data ?? {}) } : r)));
        } finally {
            setSaving(null);
        }
    };

    const remove = async (id: string) => {
        try {
            const res = await fetch(API_ROUTES.formAssignmentRules.detail(id), { method: "DELETE" });
            const json = (await res.json()) as { success: boolean; error?: string };
            if (!res.ok || !json.success) {
                message.error(json.error ?? "Could not archive");
                return;
            }
            await reload();
        } catch {
            message.error("Could not archive");
        }
    };

    if (loading) return <LoadingSkeleton rows={3} />;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <p className="text-sm text-ds-text-secondary">
                    {((CONTENT.templates as unknown as Record<string, string>)?.assignmentsHint) ??
                        "Assign metric subsets to roles or specific users. Recurring assignments materialise per-period when those users open Quick Form."}
                </p>
                <Button onClick={addRule} type="primary">
                    Add assignment rule
                </Button>
            </div>
            {rules.length === 0 ? (
                <Empty description="No assignment rules yet." />
            ) : (
                <ul className="grid gap-3">
                    {rules.map((r) => {
                        const role = r.role ?? UserRole.USHER;
                        const showCampus = CAMPUS_SCOPED_ROLES.includes(role);
                        const showGroup = GROUP_SCOPED_ROLES.includes(role);
                        return (
                            <li
                                key={r.id}
                                className="border border-ds-border-base rounded-ds-2xl bg-ds-surface-elevated p-4 grid gap-3 md:grid-cols-2"
                            >
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-ds-text-subtle">Role</span>
                                    <Select
                                        value={r.role ?? undefined}
                                        options={ROLE_OPTIONS}
                                        onChange={(v) => patch(r.id, { role: v as UserRole })}
                                        disabled={Boolean(saving)}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-ds-text-subtle">Active</span>
                                    <Switch
                                        checked={r.isActive}
                                        onChange={(v) => patch(r.id, { isActive: v })}
                                        disabled={Boolean(saving)}
                                    />
                                </div>
                                {showCampus && (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-ds-text-subtle">Campus</span>
                                        <Select
                                            value={r.campusId ?? undefined}
                                            options={campusOptions}
                                            onChange={(v) => patch(r.id, { campusId: v as string })}
                                            allowClear
                                            showSearch
                                            optionFilterProp="label"
                                            disabled={Boolean(saving)}
                                        />
                                    </div>
                                )}
                                {showGroup && (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-ds-text-subtle">Group</span>
                                        <Select
                                            value={r.orgGroupId ?? undefined}
                                            options={groupOptions}
                                            onChange={(v) => patch(r.id, { orgGroupId: v as string })}
                                            allowClear
                                            showSearch
                                            optionFilterProp="label"
                                            disabled={Boolean(saving)}
                                        />
                                    </div>
                                )}
                                <div className="md:col-span-2 flex flex-col gap-1">
                                    <span className="text-xs text-ds-text-subtle">
                                        Metric subset ({r.metricIds.length})
                                    </span>
                                    <MetricSelect
                                        template={template}
                                        value={r.metricIds}
                                        onChange={(v) => patch(r.id, { metricIds: v as string[] })}
                                        multiple
                                        placeholder="Pick metrics from this template"
                                        disabled={Boolean(saving)}
                                    />
                                </div>
                                <div className="md:col-span-2 flex flex-col gap-1">
                                    <span className="text-xs text-ds-text-subtle">Notes (optional)</span>
                                    <Input
                                        value={r.notes ?? ""}
                                        onChange={(e) => patch(r.id, { notes: e.target.value })}
                                        maxLength={500}
                                        disabled={Boolean(saving)}
                                    />
                                </div>
                                <div className="md:col-span-2 flex items-center justify-between">
                                    <Tag color={r.isActive ? "green" : "default"}>
                                        {r.isActive ? "Active" : "Archived"}
                                    </Tag>
                                    <Button danger size="small" onClick={() => remove(r.id)}>
                                        Archive
                                    </Button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default TemplateAssignmentsEditor;
