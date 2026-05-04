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
    /** Legacy single-value scope; treated as a one-element array on read. */
    campusId?: string | null;
    /** Legacy single-value scope; treated as a one-element array on read. */
    orgGroupId?: string | null;
    /** Empty array = applies to all campuses. */
    campusIds?: string[];
    /** Empty array = applies to all groups. */
    orgGroupIds?: string[];
    metricIds: string[];
    notes?: string | null;
    isActive: boolean;
    cadenceOverride?: Record<string, unknown> | null;
}

function effectiveCampusIds(r: RuleRow): string[] {
    if (r.campusIds && r.campusIds.length > 0) return r.campusIds;
    if (r.campusId) return [r.campusId];
    return [];
}

function effectiveGroupIds(r: RuleRow): string[] {
    if (r.orgGroupIds && r.orgGroupIds.length > 0) return r.orgGroupIds;
    if (r.orgGroupId) return [r.orgGroupId];
    return [];
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

    /**
     * Deferred-create flow: "Add assignment rule" creates a CLIENT-side draft
     * row only. The POST fires only once the operator has set role + metrics
     * (+ scope when role is campus/group-scoped) so server-side coherence
     * checks can never reject the initial create.
     */
    const addRule = () => {
        const draftId = `draft-${crypto.randomUUID()}`;
        setRules((prev) => [
            { id: draftId, templateId, metricIds: [], isActive: true, role: null, notes: null } as RuleRow,
            ...prev,
        ]);
    };

    const isDraft = (id: string) => id.startsWith("draft-");

    /** Local edit — drafts get patched in state only; persisted rows hit PATCH. */
    const patch = async (id: string, body: Partial<RuleRow>) => {
        if (isDraft(id)) {
            setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...body } : r)));
            return;
        }
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

    /**
     * Validate a draft before POST. Templates are platform-scoped so a rule
     * with NO campus/group restriction is fine — it will simply apply to
     * every user matching the role. The materialiser keys reports off the
     * user's own campus.
     */
    const isDraftReady = (r: RuleRow): { ok: true } | { ok: false; reason: string } => {
        if (!r.role && !r.assigneeId) return { ok: false, reason: "Pick a role first." };
        if (r.metricIds.length === 0) return { ok: false, reason: "Pick at least one metric." };
        return { ok: true };
    };

    const commitDraft = async (draft: RuleRow) => {
        const ready = isDraftReady(draft);
        if (!ready.ok) {
            message.warning(ready.reason);
            return;
        }
        setSaving(draft.id);
        try {
            const res = await fetch(API_ROUTES.formAssignmentRules.list, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    templateId,
                    role: draft.role ?? undefined,
                    assigneeId: draft.assigneeId ?? undefined,
                    campusIds: effectiveCampusIds(draft),
                    orgGroupIds: effectiveGroupIds(draft),
                    metricIds: draft.metricIds,
                    notes: draft.notes ?? undefined,
                    isActive: draft.isActive,
                }),
            });
            const json = (await res.json()) as { success: boolean; data?: RuleRow; error?: string };
            if (!res.ok || !json.success || !json.data) {
                message.error(json.error ?? "Could not save rule");
                return;
            }
            const created = json.data;
            setRules((prev) => prev.map((r) => (r.id === draft.id ? created : r)));
            message.success("Rule saved");
        } finally {
            setSaving(null);
        }
    };

    const discardDraft = (id: string) => {
        setRules((prev) => prev.filter((r) => r.id !== id));
    };

    const remove = async (id: string) => {
        if (isDraft(id)) return discardDraft(id);
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
                        const campusValue = effectiveCampusIds(r);
                        const groupValue = effectiveGroupIds(r);
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
                                    <div className="flex items-center h-8">
                                        <Switch
                                            checked={r.isActive}
                                            onChange={(v) => patch(r.id, { isActive: v })}
                                            disabled={Boolean(saving)}
                                        />
                                    </div>
                                </div>
                                {(showCampus || campusValue.length > 0) && (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-ds-text-subtle">
                                            Campuses {showCampus ? "" : "(optional)"}
                                        </span>
                                        <Select
                                            mode="multiple"
                                            value={campusValue}
                                            options={campusOptions}
                                            onChange={(v) =>
                                                patch(r.id, {
                                                    campusIds: v as string[],
                                                    campusId: null,
                                                })
                                            }
                                            allowClear
                                            showSearch
                                            optionFilterProp="label"
                                            disabled={Boolean(saving)}
                                            placeholder="Leave empty to apply to all campuses"
                                            maxTagCount="responsive"
                                            style={{ width: "100%" }}
                                        />
                                    </div>
                                )}
                                {(showGroup || groupValue.length > 0) && (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-ds-text-subtle">
                                            Groups {showGroup ? "" : "(optional)"}
                                        </span>
                                        <Select
                                            mode="multiple"
                                            value={groupValue}
                                            options={groupOptions}
                                            onChange={(v) =>
                                                patch(r.id, {
                                                    orgGroupIds: v as string[],
                                                    orgGroupId: null,
                                                })
                                            }
                                            allowClear
                                            showSearch
                                            optionFilterProp="label"
                                            disabled={Boolean(saving)}
                                            placeholder="Leave empty to apply to all groups"
                                            maxTagCount="responsive"
                                            style={{ width: "100%" }}
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
                                <div className="md:col-span-2 flex items-center justify-between flex-wrap gap-2">
                                    {isDraft(r.id) ? (
                                        <Tag color="blue">Unsaved draft</Tag>
                                    ) : (
                                        <Tag color={r.isActive ? "green" : "default"}>
                                            {r.isActive ? "Active" : "Archived"}
                                        </Tag>
                                    )}
                                    <div className="flex items-center gap-2">
                                        {isDraft(r.id) && (
                                            <Button
                                                size="small"
                                                type="primary"
                                                loading={saving === r.id}
                                                onClick={() => commitDraft(r)}
                                            >
                                                Save rule
                                            </Button>
                                        )}
                                        <Button
                                            danger={!isDraft(r.id)}
                                            size="small"
                                            onClick={() => remove(r.id)}
                                        >
                                            {isDraft(r.id) ? "Discard" : "Archive"}
                                        </Button>
                                    </div>
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
