"use client";

/**
 * modules/admin-config/components/AdminConfigPage.tsx
 *
 * Superadmin-only surface for editing every namespace of the admin-config
 * substrate. Roles + Hierarchy + Dashboard layout get bespoke CRUD editors;
 * remaining namespaces use a guarded JSON editor with diff/reset.
 *
 * SUPERADMIN role is shown read-only — its label, dashboardMode, and
 * core capabilities are frozen server-side regardless of payload contents.
 */

import { useEffect, useMemo, useState } from "react";
import { Tabs, Form, Input, Switch, InputNumber, message, Select, Tag, Modal, Empty } from "antd";
import { CONTENT } from "@/config/content";
import { API_ROUTES } from "@/config/routes";
import { ROLE_CONFIG } from "@/config/roles";
import { ORG_HIERARCHY_CONFIG } from "@/config/hierarchy";
import { UserRole } from "@/types/global";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import Button from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

const COPY = (CONTENT.adminConfig ?? {}) as Record<string, unknown>;
const COPY_NS_LABELS = (COPY.namespaceLabels ?? {}) as Record<string, string>;
const COPY_ACTIONS = (COPY.actions ?? {}) as Record<string, string>;
const COPY_TOASTS = (COPY.toasts ?? {}) as Record<string, string>;
const COPY_LABELS = (COPY.labels ?? {}) as Record<string, string>;
const COPY_EMPTY = (COPY.emptyState ?? {}) as Record<string, string>;

const NAMESPACES = [
    "roles",
    "hierarchy",
    "dashboardLayout",
    "templatesMapping",
    "imports",
    "pwaInstall",
    "bulkInvites",
    "analytics",
] as const;

type Namespace = (typeof NAMESPACES)[number];

interface Snapshot {
    namespace: Namespace;
    version: number;
    payload: Record<string, unknown>;
    source: "db" | "fallback";
    updatedAt?: string;
    actorId?: string | null;
}

const CAPABILITY_KEYS: Array<keyof RoleConfig> = [
    "canCreateReports",
    "canFillReports",
    "canSubmitReports",
    "canRequestEdits",
    "canApproveReports",
    "canMarkReviewed",
    "canLockReports",
    "canManageTemplates",
    "canDataEntry",
    "canManageUsers",
    "canManageOrg",
    "canSetGoals",
    "canApproveGoalUnlock",
    "canQuickFormFill",
    "canManageAdminConfig",
    "canImportSpreadsheets",
    "canBulkInvite",
    "canViewScopeOverview",
];

const VISIBILITY_OPTIONS = [
    { value: "own", label: "Own" },
    { value: "campus", label: "Campus" },
    { value: "group", label: "Group" },
    { value: "all", label: "All" },
];

const DASHBOARD_MODE_OPTIONS = [
    { value: "system", label: "System (admin-wide)" },
    { value: "scope-overview", label: "Scope overview (analytics-first)" },
    { value: "report-review", label: "Report review" },
    { value: "report-reviewed", label: "Report reviewed" },
    { value: "report-fill", label: "Report fill" },
    { value: "analytics", label: "Analytics (legacy)" },
    { value: "quick-form", label: "Quick form (assignment-only)" },
];

/* ── Roles editor ────────────────────────────────────────────────────────── */

function RolesEditor({ snap, onSaved }: { snap: Snapshot; onSaved: () => void }) {
    const initial = useMemo(() => {
        const overrides = (snap.payload?.roleConfig ?? {}) as Partial<Record<UserRole, Partial<RoleConfig>>>;
        const merged = {} as Record<UserRole, RoleConfig>;
        for (const role of Object.keys(ROLE_CONFIG) as UserRole[]) {
            merged[role] = { ...ROLE_CONFIG[role], ...(overrides[role] ?? {}), role };
        }
        return merged;
    }, [snap]);

    const [draft, setDraft] = useState<Record<UserRole, RoleConfig>>(initial);
    const [saving, setSaving] = useState(false);

    useEffect(() => setDraft(initial), [initial]);

    const updateRole = (role: UserRole, patch: Partial<RoleConfig>) => {
        if (role === UserRole.SUPERADMIN) {
            message.warning("SUPERADMIN is immutable.");
            return;
        }
        setDraft((prev) => ({ ...prev, [role]: { ...prev[role], ...patch } }));
    };

    const save = async () => {
        setSaving(true);
        try {
            // Serialise only fields that differ from fallback so we don't bloat the row.
            const overrides: Partial<Record<UserRole, Partial<RoleConfig>>> = {};
            for (const role of Object.keys(draft) as UserRole[]) {
                if (role === UserRole.SUPERADMIN) continue;
                const fallback = ROLE_CONFIG[role];
                const current = draft[role];
                const diff: Partial<RoleConfig> = {};
                for (const key of Object.keys(current) as Array<keyof RoleConfig>) {
                    if (current[key] !== fallback[key]) {
                        // @ts-expect-error key indexing
                        diff[key] = current[key];
                    }
                }
                if (Object.keys(diff).length > 0) overrides[role] = diff;
            }
            const res = await fetch(API_ROUTES.adminConfig.namespace("roles"), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    payload: { roleConfig: overrides },
                    baseVersion: snap.version,
                }),
            });
            const json = (await res.json()) as { success: boolean; error?: string };
            if (!res.ok || !json.success) {
                message.error(json.error ?? COPY_TOASTS.saveFailed ?? "Save failed");
                return;
            }
            message.success(COPY_TOASTS.saved ?? "Saved");
            onSaved();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xs text-ds-text-subtle">
                <span>{COPY_LABELS.currentVersion ?? "Version"}:</span>
                <Tag>{snap.version}</Tag>
                <Tag color={snap.source === "db" ? "blue" : "default"}>
                    {snap.source === "db" ? COPY_LABELS.usingDbOverride ?? "Override" : COPY_LABELS.usingFallback ?? "Defaults"}
                </Tag>
            </div>
            <div className="grid gap-3">
                {(Object.keys(draft) as UserRole[]).map((role) => {
                    const cfg = draft[role];
                    const isSuper = role === UserRole.SUPERADMIN;
                    return (
                        <div
                            key={role}
                            className="border border-ds-border-base rounded-ds-2xl bg-ds-surface-elevated p-4 flex flex-col gap-3"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex flex-col gap-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <Tag>{role}</Tag>
                                        {isSuper && <Tag color="red">SUPERADMIN — immutable</Tag>}
                                    </div>
                                    <Input
                                        value={cfg.label}
                                        disabled={isSuper}
                                        onChange={(e) => updateRole(role, { label: e.target.value })}
                                        placeholder="Display label"
                                    />
                                </div>
                                <div className="flex flex-col gap-1 items-end">
                                    <span className="text-xs text-ds-text-subtle">Hierarchy order</span>
                                    <InputNumber
                                        value={cfg.hierarchyOrder}
                                        disabled={isSuper}
                                        min={0}
                                        max={99}
                                        onChange={(v) =>
                                            updateRole(role, { hierarchyOrder: typeof v === "number" ? v : cfg.hierarchyOrder })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-ds-text-subtle">Visibility scope</span>
                                    <Select
                                        value={cfg.reportVisibilityScope}
                                        disabled={isSuper}
                                        options={VISIBILITY_OPTIONS}
                                        onChange={(v) =>
                                            updateRole(role, {
                                                reportVisibilityScope: v as RoleConfig["reportVisibilityScope"],
                                            })
                                        }
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-ds-text-subtle">Dashboard mode</span>
                                    <Select
                                        value={cfg.dashboardMode}
                                        disabled={isSuper}
                                        options={DASHBOARD_MODE_OPTIONS}
                                        onChange={(v) =>
                                            updateRole(role, { dashboardMode: v as RoleConfig["dashboardMode"] })
                                        }
                                    />
                                </div>
                            </div>
                            <details>
                                <summary className="text-xs text-ds-text-subtle cursor-pointer">
                                    Capabilities
                                </summary>
                                <div className="grid gap-2 grid-cols-2 md:grid-cols-3 mt-2">
                                    {CAPABILITY_KEYS.map((key) => (
                                        <label key={key} className="flex items-center gap-2 text-sm">
                                            <Switch
                                                size="small"
                                                checked={Boolean(cfg[key])}
                                                disabled={isSuper}
                                                onChange={(checked) =>
                                                    updateRole(role, { [key]: checked } as Partial<RoleConfig>)
                                                }
                                            />
                                            <span>{key}</span>
                                        </label>
                                    ))}
                                </div>
                            </details>
                        </div>
                    );
                })}
            </div>
            <div className="flex gap-2">
                <Button type="primary" loading={saving} onClick={save}>
                    {COPY_ACTIONS.save ?? "Save namespace"}
                </Button>
            </div>
        </div>
    );
}

/* ── Hierarchy editor ───────────────────────────────────────────────────── */

interface HierarchyLevelDraft {
    level: string;
    label: string;
    parentLevel?: string | null;
    childLevel?: string | null;
    leaderRole?: UserRole;
    adminRole?: UserRole;
}

function HierarchyEditor({ snap, onSaved }: { snap: Snapshot; onSaved: () => void }) {
    const initial = useMemo<HierarchyLevelDraft[]>(() => {
        const fromSnap = snap.payload?.levels as HierarchyLevelDraft[] | undefined;
        if (Array.isArray(fromSnap) && fromSnap.length > 0) return fromSnap.slice();
        return ORG_HIERARCHY_CONFIG.map((l) => ({
            level: l.level,
            label: l.label,
            parentLevel: l.parentLevel ?? null,
            childLevel: l.childLevel ?? null,
            leaderRole: l.leaderRole,
            adminRole: l.adminRole,
        }));
    }, [snap]);

    const [levels, setLevels] = useState<HierarchyLevelDraft[]>(initial);
    const [saving, setSaving] = useState(false);

    useEffect(() => setLevels(initial), [initial]);

    const update = (idx: number, patch: Partial<HierarchyLevelDraft>) => {
        setLevels((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
    };

    const move = (idx: number, dir: -1 | 1) => {
        setLevels((prev) => {
            const next = prev.slice();
            const target = idx + dir;
            if (target < 0 || target >= next.length) return prev;
            [next[idx], next[target]] = [next[target], next[idx]];
            return next;
        });
    };

    const remove = (idx: number) => setLevels((prev) => prev.filter((_, i) => i !== idx));

    const addLevel = () =>
        setLevels((prev) => [
            ...prev,
            { level: `LEVEL_${prev.length + 1}`, label: `Level ${prev.length + 1}` },
        ]);

    const save = async () => {
        // Auto-link parent/child for sequential levels
        const linked = levels.map((l, i) => ({
            ...l,
            parentLevel: i === 0 ? null : levels[i - 1]?.level ?? null,
            childLevel: i === levels.length - 1 ? null : levels[i + 1]?.level ?? null,
        }));
        setSaving(true);
        try {
            const res = await fetch(API_ROUTES.adminConfig.namespace("hierarchy"), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    payload: { levels: linked },
                    baseVersion: snap.version,
                }),
            });
            const json = (await res.json()) as { success: boolean; error?: string };
            if (!res.ok || !json.success) {
                message.error(json.error ?? COPY_TOASTS.saveFailed ?? "Save failed");
                return;
            }
            message.success(COPY_TOASTS.saved ?? "Saved");
            onSaved();
        } finally {
            setSaving(false);
        }
    };

    const ROLE_OPTIONS = (Object.keys(ROLE_CONFIG) as UserRole[]).map((r) => ({
        value: r,
        label: ROLE_CONFIG[r].label,
    }));

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xs text-ds-text-subtle">
                <Tag>{snap.version}</Tag>
                <Tag color={snap.source === "db" ? "blue" : "default"}>
                    {snap.source === "db" ? COPY_LABELS.usingDbOverride ?? "Override" : COPY_LABELS.usingFallback ?? "Defaults"}
                </Tag>
            </div>
            <div className="grid gap-3">
                {levels.map((l, idx) => (
                    <div
                        key={`${l.level}-${idx}`}
                        className="border border-ds-border-base rounded-ds-2xl bg-ds-surface-elevated p-4 grid gap-3 md:grid-cols-2"
                    >
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-ds-text-subtle">Slug (uppercase, no spaces)</span>
                            <Input
                                value={l.level}
                                onChange={(e) =>
                                    update(idx, { level: e.target.value.toUpperCase().replace(/\s+/g, "_") })
                                }
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-ds-text-subtle">Display label</span>
                            <Input
                                value={l.label}
                                onChange={(e) => update(idx, { label: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-ds-text-subtle">Leader role</span>
                            <Select
                                value={l.leaderRole}
                                allowClear
                                options={ROLE_OPTIONS}
                                onChange={(v) => update(idx, { leaderRole: v as UserRole | undefined })}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-ds-text-subtle">Admin role</span>
                            <Select
                                value={l.adminRole}
                                allowClear
                                options={ROLE_OPTIONS}
                                onChange={(v) => update(idx, { adminRole: v as UserRole | undefined })}
                            />
                        </div>
                        <div className="flex gap-2 md:col-span-2">
                            <Button size="small" onClick={() => move(idx, -1)} disabled={idx === 0}>
                                ↑
                            </Button>
                            <Button
                                size="small"
                                onClick={() => move(idx, 1)}
                                disabled={idx === levels.length - 1}
                            >
                                ↓
                            </Button>
                            <Button size="small" danger onClick={() => remove(idx)}>
                                Remove
                            </Button>
                        </div>
                    </div>
                ))}
                {levels.length === 0 && (
                    <Empty description={COPY_EMPTY.description ?? "No levels"} />
                )}
            </div>
            <div className="flex gap-2">
                <Button onClick={addLevel}>Add level</Button>
                <Button type="primary" loading={saving} onClick={save}>
                    {COPY_ACTIONS.save ?? "Save namespace"}
                </Button>
            </div>
        </div>
    );
}

/* ── JSON editor (fallback for arbitrary namespaces) ────────────────────── */

function JsonEditor({
    snap,
    namespace,
    onSaved,
}: {
    snap: Snapshot;
    namespace: Namespace;
    onSaved: () => void;
}) {
    const [text, setText] = useState(() => JSON.stringify(snap.payload ?? {}, null, 2));
    const [saving, setSaving] = useState(false);

    useEffect(() => setText(JSON.stringify(snap.payload ?? {}, null, 2)), [snap]);

    const save = async () => {
        let payload: Record<string, unknown>;
        try {
            payload = JSON.parse(text);
        } catch {
            message.error("Invalid JSON");
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(API_ROUTES.adminConfig.namespace(namespace), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ payload, baseVersion: snap.version }),
            });
            const json = (await res.json()) as { success: boolean; error?: string };
            if (!res.ok || !json.success) {
                message.error(json.error ?? COPY_TOASTS.saveFailed ?? "Save failed");
                return;
            }
            message.success(COPY_TOASTS.saved ?? "Saved");
            onSaved();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs text-ds-text-subtle">
                <Tag>{snap.version}</Tag>
                <Tag color={snap.source === "db" ? "blue" : "default"}>
                    {snap.source === "db" ? COPY_LABELS.usingDbOverride ?? "Override" : COPY_LABELS.usingFallback ?? "Defaults"}
                </Tag>
            </div>
            <Input.TextArea
                rows={20}
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ fontFamily: "monospace" }}
            />
            <div className="flex gap-2">
                <Button type="primary" loading={saving} onClick={save}>
                    {COPY_ACTIONS.save ?? "Save namespace"}
                </Button>
            </div>
        </div>
    );
}

/* ── Page wrapper ───────────────────────────────────────────────────────── */

export function AdminConfigPage() {
    const [snapshots, setSnapshots] = useState<Record<Namespace, Snapshot> | null>(null);
    const [active, setActive] = useState<Namespace>("roles");

    const reload = async () => {
        try {
            const res = await fetch(API_ROUTES.adminConfig.list, { cache: "no-store" });
            const json = (await res.json()) as { success: boolean; data?: { namespaces: Snapshot[] } };
            if (!res.ok || !json.success || !json.data) return;
            const map = {} as Record<Namespace, Snapshot>;
            for (const ns of json.data.namespaces) map[ns.namespace] = ns;
            setSnapshots(map);
        } catch {
            // ignore
        }
    };

    useEffect(() => {
        void reload();
    }, []);

    const handleReset = async (ns: Namespace) => {
        Modal.confirm({
            title: `Reset ${ns}?`,
            content: "This reverts the namespace to its built-in defaults. Existing reports/users are unaffected.",
            okText: COPY_ACTIONS.reset ?? "Reset",
            okButtonProps: { danger: true },
            onOk: async () => {
                const res = await fetch(API_ROUTES.adminConfig.reset(ns), { method: "POST" });
                const json = (await res.json()) as { success: boolean; error?: string };
                if (!res.ok || !json.success) {
                    message.error(json.error ?? COPY_TOASTS.saveFailed ?? "Reset failed");
                    return;
                }
                message.success(COPY_TOASTS.reset ?? "Reset");
                await reload();
            },
        });
    };

    if (!snapshots) {
        return (
            <PageLayout>
                <PageHeader title={String(COPY.pageTitle ?? "Admin Config")} subtitle={String(COPY.subtitle ?? "")} />
                <LoadingSkeleton rows={6} />
            </PageLayout>
        );
    }

    const tabItems = NAMESPACES.map((ns) => ({
        key: ns,
        label: COPY_NS_LABELS[ns] ?? ns,
        children: (
            <div className="flex flex-col gap-4 mt-3">
                <div className="flex items-center justify-end">
                    <Button size="small" danger onClick={() => handleReset(ns)}>
                        {COPY_ACTIONS.reset ?? "Reset to defaults"}
                    </Button>
                </div>
                {ns === "roles" ? (
                    <RolesEditor snap={snapshots[ns]} onSaved={reload} />
                ) : ns === "hierarchy" ? (
                    <HierarchyEditor snap={snapshots[ns]} onSaved={reload} />
                ) : (
                    <JsonEditor namespace={ns} snap={snapshots[ns]} onSaved={reload} />
                )}
            </div>
        ),
    }));

    return (
        <PageLayout>
            <PageHeader title={String(COPY.pageTitle ?? "Admin Config")} subtitle={String(COPY.subtitle ?? "")} />
            <Tabs activeKey={active} onChange={(k) => setActive(k as Namespace)} items={tabItems} />
        </PageLayout>
    );
}

export default AdminConfigPage;
