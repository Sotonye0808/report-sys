"use client";

/**
 * modules/admin-config/components/NamespaceEditors.tsx
 *
 * Bespoke GUI editors for the remaining admin-config namespaces. Each editor
 * replaces the legacy JSON textarea with a typed form whose shape mirrors the
 * fallback registry (so admins never face raw JSON unless they want to).
 *
 * Editors share the same save/save-conflict surface and emit the same payload
 * shape the loader expects.
 */

import { useEffect, useMemo, useState } from "react";
import { Input, InputNumber, Switch, Tag, Select, Empty, message } from "antd";
import { CONTENT } from "@/config/content";
import { API_ROUTES } from "@/config/routes";
import { ROLE_CONFIG } from "@/config/roles";
import {
    DEFAULT_LAYOUT as DASHBOARD_DEFAULT_LAYOUT,
} from "@/modules/dashboard/widgets/registry";
import { UserRole } from "@/types/global";
import Button from "@/components/ui/Button";

const COPY = (CONTENT.adminConfig ?? {}) as Record<string, unknown>;
const COPY_TOASTS = (COPY.toasts ?? {}) as Record<string, string>;
const COPY_ACTIONS = (COPY.actions ?? {}) as Record<string, string>;
const COPY_LABELS = (COPY.labels ?? {}) as Record<string, string>;

interface Snapshot<T = unknown> {
    namespace: string;
    version: number;
    payload: T;
    source: "db" | "fallback";
}

interface SaveProps {
    namespace: string;
    version: number;
    payload: Record<string, unknown>;
    onSaved: () => void;
}

async function savePayload({ namespace, version, payload, onSaved }: SaveProps): Promise<boolean> {
    try {
        const res = await fetch(API_ROUTES.adminConfig.namespace(namespace), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload, baseVersion: version }),
        });
        const json = (await res.json()) as { success: boolean; error?: string };
        if (!res.ok || !json.success) {
            message.error(json.error ?? COPY_TOASTS.saveFailed ?? "Save failed");
            return false;
        }
        message.success(COPY_TOASTS.saved ?? "Saved");
        onSaved();
        return true;
    } catch {
        message.error(COPY_TOASTS.saveFailed ?? "Save failed");
        return false;
    }
}

function VersionRow({ snap }: { snap: Snapshot }) {
    return (
        <div className="flex items-center gap-2 text-xs text-ds-text-subtle mb-3">
            <Tag>{snap.version}</Tag>
            <Tag color={snap.source === "db" ? "blue" : "default"}>
                {snap.source === "db" ? COPY_LABELS.usingDbOverride ?? "Override" : COPY_LABELS.usingFallback ?? "Defaults"}
            </Tag>
        </div>
    );
}

/* ── Dashboard layout editor ───────────────────────────────────────────── */

interface DashboardLayoutPayload {
    byRoleBand?: Record<string, string[]>;
    insights?: { templates?: string[] };
}

const KNOWN_BANDS = [
    "scope-overview-global",
    "scope-overview-group",
    "scope-overview-campus",
    "quick-form-self",
] as const;

const ALL_WIDGET_IDS = Array.from(
    new Set(
        Object.values(DASHBOARD_DEFAULT_LAYOUT)
            .flat()
            .concat([
                "group-performance",
                "top-campus",
                "org-compliance",
                "recent-submissions",
                "pending-review-queue",
                "admin-quick-links",
                "top-campus-chart",
                "metric-trend-spark",
                "insight-summary",
                "usher-quick-form",
            ]),
    ),
);

export function DashboardLayoutEditor({
    snap,
    onSaved,
}: {
    snap: Snapshot<DashboardLayoutPayload>;
    onSaved: () => void;
}) {
    const initial = useMemo(() => {
        const out: Record<string, string[]> = {};
        for (const band of KNOWN_BANDS) {
            out[band] = (snap.payload?.byRoleBand?.[band] ?? DASHBOARD_DEFAULT_LAYOUT[band] ?? []).slice();
        }
        return out;
    }, [snap]);
    const [bands, setBands] = useState<Record<string, string[]>>(initial);
    const [insights, setInsights] = useState<string[]>(snap.payload?.insights?.templates ?? []);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setBands(initial);
        setInsights(snap.payload?.insights?.templates ?? []);
    }, [initial, snap]);

    const move = (band: string, idx: number, dir: -1 | 1) => {
        setBands((prev) => {
            const ids = prev[band].slice();
            const target = idx + dir;
            if (target < 0 || target >= ids.length) return prev;
            [ids[idx], ids[target]] = [ids[target], ids[idx]];
            return { ...prev, [band]: ids };
        });
    };

    const remove = (band: string, idx: number) =>
        setBands((prev) => ({ ...prev, [band]: prev[band].filter((_, i) => i !== idx) }));

    const add = (band: string, id: string) =>
        setBands((prev) => ({ ...prev, [band]: [...prev[band], id] }));

    const save = async () => {
        setSaving(true);
        const ok = await savePayload({
            namespace: "dashboardLayout",
            version: snap.version,
            payload: { byRoleBand: bands, insights: { templates: insights } },
            onSaved,
        });
        if (!ok) setSaving(false);
    };

    return (
        <div className="flex flex-col gap-4">
            <VersionRow snap={snap} />
            {KNOWN_BANDS.map((band) => (
                <div key={band} className="border border-ds-border-base rounded-ds-2xl bg-ds-surface-elevated p-4">
                    <p className="text-sm font-semibold text-ds-text-primary mb-2">{band}</p>
                    <ul className="space-y-1.5 mb-3">
                        {bands[band].map((id, idx) => (
                            <li key={`${id}-${idx}`} className="flex items-center gap-2">
                                <Tag>{id}</Tag>
                                <Button size="small" onClick={() => move(band, idx, -1)} disabled={idx === 0}>↑</Button>
                                <Button size="small" onClick={() => move(band, idx, 1)} disabled={idx === bands[band].length - 1}>↓</Button>
                                <Button size="small" danger onClick={() => remove(band, idx)}>Remove</Button>
                            </li>
                        ))}
                        {bands[band].length === 0 && <li className="text-xs text-ds-text-subtle">No widgets</li>}
                    </ul>
                    <Select
                        placeholder="Add widget"
                        value={undefined}
                        options={ALL_WIDGET_IDS.filter((id) => !bands[band].includes(id)).map((id) => ({
                            value: id,
                            label: id,
                        }))}
                        onChange={(v) => v && add(band, v)}
                        style={{ minWidth: 280 }}
                    />
                </div>
            ))}
            <div className="border border-ds-border-base rounded-ds-2xl bg-ds-surface-elevated p-4">
                <p className="text-sm font-semibold text-ds-text-primary mb-2">Insight summary templates</p>
                <p className="text-xs text-ds-text-subtle mb-2">
                    Optional sentence templates surfaced by the InsightSummaryWidget. Leave blank to use built-in copy.
                </p>
                <Input.TextArea
                    rows={4}
                    value={insights.join("\n")}
                    onChange={(e) => setInsights(e.target.value.split("\n").filter(Boolean))}
                    placeholder="One template per line"
                />
            </div>
            <Button type="primary" onClick={save} loading={saving}>
                {COPY_ACTIONS.save ?? "Save namespace"}
            </Button>
        </div>
    );
}

/* ── Imports editor ────────────────────────────────────────────────────── */

interface ImportsPayload {
    maxFileBytes?: number;
    allowedMimes?: string[];
}

const COMMON_MIMES = [
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
];

export function ImportsEditor({ snap, onSaved }: { snap: Snapshot<ImportsPayload>; onSaved: () => void }) {
    const [maxBytes, setMaxBytes] = useState<number>(snap.payload?.maxFileBytes ?? 10 * 1024 * 1024);
    const [mimes, setMimes] = useState<string[]>(snap.payload?.allowedMimes ?? COMMON_MIMES);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setMaxBytes(snap.payload?.maxFileBytes ?? 10 * 1024 * 1024);
        setMimes(snap.payload?.allowedMimes ?? COMMON_MIMES);
    }, [snap]);

    const save = async () => {
        setSaving(true);
        const ok = await savePayload({
            namespace: "imports",
            version: snap.version,
            payload: { maxFileBytes: maxBytes, allowedMimes: mimes },
            onSaved,
        });
        if (!ok) setSaving(false);
    };

    return (
        <div className="flex flex-col gap-4">
            <VersionRow snap={snap} />
            <div className="border border-ds-border-base rounded-ds-2xl bg-ds-surface-elevated p-4 grid gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-ds-text-subtle">Max file size (bytes)</span>
                    <InputNumber
                        min={1024}
                        max={100 * 1024 * 1024}
                        value={maxBytes}
                        onChange={(v) => typeof v === "number" && setMaxBytes(v)}
                        style={{ width: "100%" }}
                    />
                    <span className="text-xs text-ds-text-subtle">{(maxBytes / (1024 * 1024)).toFixed(2)} MiB</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-ds-text-subtle">Allowed MIME types</span>
                    <Select
                        mode="tags"
                        value={mimes}
                        onChange={(v) => setMimes(v as string[])}
                        options={COMMON_MIMES.map((m) => ({ value: m, label: m }))}
                        style={{ width: "100%" }}
                    />
                </div>
            </div>
            <Button type="primary" onClick={save} loading={saving}>
                {COPY_ACTIONS.save ?? "Save namespace"}
            </Button>
        </div>
    );
}

/* ── PWA install editor ────────────────────────────────────────────────── */

interface PwaInstallPayload {
    bannerTitle?: string;
    bannerSubtitle?: string;
    installCta?: string;
    snoozeCta?: string;
    neverCta?: string;
    platformInstructions?: { IOS?: string; ANDROID?: string; DESKTOP?: string };
    push?: {
        title?: string;
        subtitle?: string;
        enableCta?: string;
        laterCta?: string;
        blockedHelp?: string;
    };
}

export function PwaInstallEditor({ snap, onSaved }: { snap: Snapshot<PwaInstallPayload>; onSaved: () => void }) {
    const [draft, setDraft] = useState<PwaInstallPayload>(snap.payload ?? {});
    const [saving, setSaving] = useState(false);

    useEffect(() => setDraft(snap.payload ?? {}), [snap]);

    const update = (patch: Partial<PwaInstallPayload>) => setDraft((prev) => ({ ...prev, ...patch }));
    const updatePlatform = (key: "IOS" | "ANDROID" | "DESKTOP", value: string) =>
        setDraft((prev) => ({
            ...prev,
            platformInstructions: { ...(prev.platformInstructions ?? {}), [key]: value },
        }));
    const updatePush = (patch: Partial<NonNullable<PwaInstallPayload["push"]>>) =>
        setDraft((prev) => ({ ...prev, push: { ...(prev.push ?? {}), ...patch } }));

    const save = async () => {
        setSaving(true);
        const ok = await savePayload({
            namespace: "pwaInstall",
            version: snap.version,
            payload: draft as Record<string, unknown>,
            onSaved,
        });
        if (!ok) setSaving(false);
    };

    return (
        <div className="flex flex-col gap-4">
            <VersionRow snap={snap} />
            <div className="border border-ds-border-base rounded-ds-2xl bg-ds-surface-elevated p-4 grid gap-3 md:grid-cols-2">
                <Field label="Banner title" value={draft.bannerTitle} onChange={(v) => update({ bannerTitle: v })} />
                <Field
                    label="Banner subtitle"
                    value={draft.bannerSubtitle}
                    onChange={(v) => update({ bannerSubtitle: v })}
                />
                <Field label="Install CTA" value={draft.installCta} onChange={(v) => update({ installCta: v })} />
                <Field label="Snooze CTA" value={draft.snoozeCta} onChange={(v) => update({ snoozeCta: v })} />
                <Field label="Never CTA" value={draft.neverCta} onChange={(v) => update({ neverCta: v })} />
            </div>
            <div className="border border-ds-border-base rounded-ds-2xl bg-ds-surface-elevated p-4 grid gap-3">
                <p className="text-sm font-semibold text-ds-text-primary">Platform instructions</p>
                <Field
                    label="iOS"
                    value={draft.platformInstructions?.IOS}
                    onChange={(v) => updatePlatform("IOS", v)}
                    multiline
                />
                <Field
                    label="Android"
                    value={draft.platformInstructions?.ANDROID}
                    onChange={(v) => updatePlatform("ANDROID", v)}
                    multiline
                />
                <Field
                    label="Desktop"
                    value={draft.platformInstructions?.DESKTOP}
                    onChange={(v) => updatePlatform("DESKTOP", v)}
                    multiline
                />
            </div>
            <div className="border border-ds-border-base rounded-ds-2xl bg-ds-surface-elevated p-4 grid gap-3 md:grid-cols-2">
                <p className="text-sm font-semibold text-ds-text-primary md:col-span-2">Push prompt</p>
                <Field label="Title" value={draft.push?.title} onChange={(v) => updatePush({ title: v })} />
                <Field label="Subtitle" value={draft.push?.subtitle} onChange={(v) => updatePush({ subtitle: v })} />
                <Field label="Enable CTA" value={draft.push?.enableCta} onChange={(v) => updatePush({ enableCta: v })} />
                <Field label="Later CTA" value={draft.push?.laterCta} onChange={(v) => updatePush({ laterCta: v })} />
                <Field
                    label="Blocked helper text"
                    value={draft.push?.blockedHelp}
                    onChange={(v) => updatePush({ blockedHelp: v })}
                    multiline
                />
            </div>
            <Button type="primary" onClick={save} loading={saving}>
                {COPY_ACTIONS.save ?? "Save namespace"}
            </Button>
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
    multiline,
}: {
    label: string;
    value: string | undefined;
    onChange: (v: string) => void;
    multiline?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs text-ds-text-subtle">{label}</span>
            {multiline ? (
                <Input.TextArea rows={2} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
            ) : (
                <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
            )}
        </div>
    );
}

/* ── Bulk invites editor ───────────────────────────────────────────────── */

interface BulkInvitesPayload {
    defaultExpiryHours?: number;
    defaultRole?: UserRole;
    emailGate?: boolean;
}

const ROLE_OPTIONS = (Object.keys(ROLE_CONFIG) as UserRole[]).map((r) => ({
    value: r,
    label: ROLE_CONFIG[r].label,
}));

export function BulkInvitesEditor({
    snap,
    onSaved,
}: {
    snap: Snapshot<BulkInvitesPayload>;
    onSaved: () => void;
}) {
    const [draft, setDraft] = useState<BulkInvitesPayload>(snap.payload ?? {});
    const [saving, setSaving] = useState(false);

    useEffect(() => setDraft(snap.payload ?? {}), [snap]);

    const save = async () => {
        setSaving(true);
        const ok = await savePayload({
            namespace: "bulkInvites",
            version: snap.version,
            payload: draft as Record<string, unknown>,
            onSaved,
        });
        if (!ok) setSaving(false);
    };

    return (
        <div className="flex flex-col gap-4">
            <VersionRow snap={snap} />
            <div className="border border-ds-border-base rounded-ds-2xl bg-ds-surface-elevated p-4 grid gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-ds-text-subtle">Default expiry (hours)</span>
                    <InputNumber
                        min={1}
                        max={24 * 365}
                        value={draft.defaultExpiryHours ?? 168}
                        onChange={(v) => typeof v === "number" && setDraft((p) => ({ ...p, defaultExpiryHours: v }))}
                        style={{ width: "100%" }}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-ds-text-subtle">Default target role</span>
                    <Select
                        allowClear
                        value={draft.defaultRole}
                        options={ROLE_OPTIONS}
                        onChange={(v) => setDraft((p) => ({ ...p, defaultRole: v as UserRole | undefined }))}
                    />
                </div>
                <label className="flex items-center gap-2 text-sm md:col-span-2">
                    <Switch
                        checked={Boolean(draft.emailGate ?? true)}
                        onChange={(checked) => setDraft((p) => ({ ...p, emailGate: checked }))}
                    />
                    <span>Email-gate bulk invite sends (skip when RESEND key missing)</span>
                </label>
            </div>
            <Button type="primary" onClick={save} loading={saving}>
                {COPY_ACTIONS.save ?? "Save namespace"}
            </Button>
        </div>
    );
}

/* ── Analytics editor ──────────────────────────────────────────────────── */

interface AnalyticsPayload {
    correlation?: { maxMetrics?: number; defaultEnabled?: boolean };
}

export function AnalyticsEditor({
    snap,
    onSaved,
}: {
    snap: Snapshot<AnalyticsPayload>;
    onSaved: () => void;
}) {
    const [draft, setDraft] = useState<AnalyticsPayload>(snap.payload ?? {});
    const [saving, setSaving] = useState(false);

    useEffect(() => setDraft(snap.payload ?? {}), [snap]);

    const save = async () => {
        setSaving(true);
        const ok = await savePayload({
            namespace: "analytics",
            version: snap.version,
            payload: draft as Record<string, unknown>,
            onSaved,
        });
        if (!ok) setSaving(false);
    };

    return (
        <div className="flex flex-col gap-4">
            <VersionRow snap={snap} />
            <div className="border border-ds-border-base rounded-ds-2xl bg-ds-surface-elevated p-4 grid gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-ds-text-subtle">Correlation max metrics</span>
                    <InputNumber
                        min={2}
                        max={100}
                        value={draft.correlation?.maxMetrics ?? 12}
                        onChange={(v) =>
                            typeof v === "number" &&
                            setDraft((p) => ({
                                ...p,
                                correlation: { ...(p.correlation ?? {}), maxMetrics: v },
                            }))
                        }
                        style={{ width: "100%" }}
                    />
                </div>
                <label className="flex items-center gap-2 text-sm">
                    <Switch
                        checked={Boolean(draft.correlation?.defaultEnabled ?? true)}
                        onChange={(checked) =>
                            setDraft((p) => ({
                                ...p,
                                correlation: { ...(p.correlation ?? {}), defaultEnabled: checked },
                            }))
                        }
                    />
                    <span>Correlation enabled by default</span>
                </label>
            </div>
            <Button type="primary" onClick={save} loading={saving}>
                {COPY_ACTIONS.save ?? "Save namespace"}
            </Button>
        </div>
    );
}

/* ── Templates mapping editor ──────────────────────────────────────────── */

interface MappingOverride {
    fromTemplateId: string;
    fromMetricId: string;
    toMetricId: string;
    label?: string;
}

interface TemplatesMappingPayload {
    overrides?: MappingOverride[];
}

export function TemplatesMappingEditor({
    snap,
    onSaved,
}: {
    snap: Snapshot<TemplatesMappingPayload>;
    onSaved: () => void;
}) {
    const [rows, setRows] = useState<MappingOverride[]>(snap.payload?.overrides ?? []);
    const [saving, setSaving] = useState(false);

    useEffect(() => setRows(snap.payload?.overrides ?? []), [snap]);

    const update = (idx: number, patch: Partial<MappingOverride>) =>
        setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
    const remove = (idx: number) => setRows((prev) => prev.filter((_, i) => i !== idx));
    const add = () =>
        setRows((prev) => [
            ...prev,
            { fromTemplateId: "", fromMetricId: "", toMetricId: "", label: "" },
        ]);

    const save = async () => {
        setSaving(true);
        const cleaned = rows.filter((r) => r.fromTemplateId && r.fromMetricId && r.toMetricId);
        const ok = await savePayload({
            namespace: "templatesMapping",
            version: snap.version,
            payload: { overrides: cleaned },
            onSaved,
        });
        if (!ok) setSaving(false);
    };

    return (
        <div className="flex flex-col gap-4">
            <VersionRow snap={snap} />
            <p className="text-xs text-ds-text-subtle">
                Optional metric remapping: rename/migrate a metric id when a template version changes. Leave empty if no overrides apply.
            </p>
            {rows.length === 0 ? <Empty description="No mappings" /> : null}
            <ul className="space-y-2">
                {rows.map((row, idx) => (
                    <li
                        key={idx}
                        className="grid gap-2 md:grid-cols-5 p-3 border border-ds-border-base rounded-ds-md bg-ds-surface-elevated"
                    >
                        <Input
                            placeholder="from templateId"
                            value={row.fromTemplateId}
                            onChange={(e) => update(idx, { fromTemplateId: e.target.value })}
                        />
                        <Input
                            placeholder="from metricId"
                            value={row.fromMetricId}
                            onChange={(e) => update(idx, { fromMetricId: e.target.value })}
                        />
                        <Input
                            placeholder="to metricId"
                            value={row.toMetricId}
                            onChange={(e) => update(idx, { toMetricId: e.target.value })}
                        />
                        <Input
                            placeholder="label (optional)"
                            value={row.label ?? ""}
                            onChange={(e) => update(idx, { label: e.target.value })}
                        />
                        <Button danger onClick={() => remove(idx)}>
                            Remove
                        </Button>
                    </li>
                ))}
            </ul>
            <div className="flex gap-2">
                <Button onClick={add}>Add mapping</Button>
                <Button type="primary" onClick={save} loading={saving}>
                    {COPY_ACTIONS.save ?? "Save namespace"}
                </Button>
            </div>
        </div>
    );
}

/* ── Role cadence editor ───────────────────────────────────────────────── */

interface CadenceEntry {
    frequency: "WEEKLY" | "MONTHLY" | "YEARLY" | "TWICE_WEEKLY" | "ANY";
    expectedDays: number[];
    deadlineHours: number;
    autoFillTitleTemplate?: string;
}

interface RoleCadencePayload {
    byRole?: Partial<Record<UserRole, CadenceEntry>>;
}

const FREQUENCY_OPTIONS = [
    { value: "WEEKLY", label: "Weekly" },
    { value: "TWICE_WEEKLY", label: "Twice weekly" },
    { value: "MONTHLY", label: "Monthly" },
    { value: "YEARLY", label: "Yearly" },
    { value: "ANY", label: "Any (back-fill)" },
];

const WEEKDAYS = [
    { value: 0, label: "Sun" },
    { value: 1, label: "Mon" },
    { value: 2, label: "Tue" },
    { value: 3, label: "Wed" },
    { value: 4, label: "Thu" },
    { value: 5, label: "Fri" },
    { value: 6, label: "Sat" },
];

const TITLE_PLACEHOLDERS = ["{campus}", "{group}", "{period}", "{weekNumber}", "{monthName}", "{quarter}", "{year}"];

export function RoleCadenceEditor({
    snap,
    onSaved,
}: {
    snap: Snapshot<RoleCadencePayload>;
    onSaved: () => void;
}) {
    const fallbackByRole = useMemo(() => {
        const out: Partial<Record<UserRole, CadenceEntry>> = {};
        for (const [role, cfg] of Object.entries(ROLE_CONFIG)) {
            if (cfg.cadence) out[role as UserRole] = cfg.cadence as CadenceEntry;
        }
        return out;
    }, []);

    const initial = useMemo(() => {
        const merged: Partial<Record<UserRole, CadenceEntry>> = { ...fallbackByRole };
        const overrides = snap.payload?.byRole ?? {};
        for (const [role, val] of Object.entries(overrides)) {
            merged[role as UserRole] = { ...(merged[role as UserRole] ?? {} as CadenceEntry), ...(val as CadenceEntry) };
        }
        return merged;
    }, [snap, fallbackByRole]);

    const [draft, setDraft] = useState<Partial<Record<UserRole, CadenceEntry>>>(initial);
    const [saving, setSaving] = useState(false);

    useEffect(() => setDraft(initial), [initial]);

    const updateRole = (role: UserRole, patch: Partial<CadenceEntry>) => {
        setDraft((prev) => ({
            ...prev,
            [role]: { ...(prev[role] ?? ({} as CadenceEntry)), ...patch } as CadenceEntry,
        }));
    };

    const toggleDay = (role: UserRole, day: number) => {
        const cur = draft[role]?.expectedDays ?? [];
        const next = cur.includes(day) ? cur.filter((d) => d !== day) : [...cur, day].sort();
        updateRole(role, { expectedDays: next });
    };

    const removeRole = (role: UserRole) => {
        setDraft((prev) => {
            const next = { ...prev };
            delete next[role];
            return next;
        });
    };

    const save = async () => {
        // Send only entries that differ from the fallback so we don't bloat the row.
        const overrides: Partial<Record<UserRole, CadenceEntry>> = {};
        for (const [role, entry] of Object.entries(draft)) {
            const fb = fallbackByRole[role as UserRole];
            if (!entry) continue;
            if (
                !fb ||
                JSON.stringify(fb) !== JSON.stringify(entry)
            ) {
                overrides[role as UserRole] = entry;
            }
        }
        setSaving(true);
        const ok = await savePayload({
            namespace: "roleCadence",
            version: snap.version,
            payload: { byRole: overrides } as Record<string, unknown>,
            onSaved,
        });
        if (!ok) setSaving(false);
    };

    const orderedRoles = (Object.keys(ROLE_CONFIG) as UserRole[]).filter(
        (r) => ROLE_CONFIG[r].cadence || draft[r],
    );

    return (
        <div className="flex flex-col gap-4">
            <VersionRow snap={snap} />
            <p className="text-xs text-ds-text-subtle">
                Cadence drives auto-fill of report period + title and recurring assignment expansion.
                SUPERADMIN doesn't fill reports and is excluded.
            </p>
            {orderedRoles.length === 0 ? (
                <Empty description="No cadence-bearing roles" />
            ) : (
                <div className="grid gap-3">
                    {orderedRoles.map((role) => {
                        const entry = draft[role] ?? ({} as CadenceEntry);
                        return (
                            <div
                                key={role}
                                className="border border-ds-border-base rounded-ds-2xl bg-ds-surface-elevated p-4 flex flex-col gap-3"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <Tag>{role}</Tag>
                                    <Button
                                        size="small"
                                        danger
                                        onClick={() => removeRole(role)}
                                    >
                                        Reset to fallback
                                    </Button>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-ds-text-subtle">Frequency</span>
                                        <Select
                                            value={entry.frequency ?? "WEEKLY"}
                                            options={FREQUENCY_OPTIONS}
                                            onChange={(v) => updateRole(role, { frequency: v as CadenceEntry["frequency"] })}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-ds-text-subtle">Deadline (hours)</span>
                                        <InputNumber
                                            min={0}
                                            max={24 * 30}
                                            value={entry.deadlineHours ?? 48}
                                            onChange={(v) =>
                                                typeof v === "number" && updateRole(role, { deadlineHours: v })
                                            }
                                            style={{ width: "100%" }}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1 md:col-span-2">
                                        <span className="text-xs text-ds-text-subtle">Expected weekdays</span>
                                        <div className="flex flex-wrap gap-2">
                                            {WEEKDAYS.map((d) => {
                                                const selected = (entry.expectedDays ?? []).includes(d.value);
                                                return (
                                                    <button
                                                        key={d.value}
                                                        type="button"
                                                        onClick={() => toggleDay(role, d.value)}
                                                        className={[
                                                            "px-3 py-1.5 rounded-ds-md text-xs font-medium border transition-colors cursor-pointer",
                                                            selected
                                                                ? "bg-ds-brand-accent/10 border-ds-brand-accent text-ds-brand-accent"
                                                                : "bg-ds-surface-base border-ds-border-base text-ds-text-secondary hover:bg-ds-surface-sunken",
                                                        ].join(" ")}
                                                    >
                                                        {d.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 md:col-span-2">
                                        <span className="text-xs text-ds-text-subtle">Auto-fill title template</span>
                                        <Input
                                            value={entry.autoFillTitleTemplate ?? ""}
                                            onChange={(e) =>
                                                updateRole(role, { autoFillTitleTemplate: e.target.value })
                                            }
                                            placeholder="e.g. Weekly Report — {campus} — {period}"
                                        />
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {TITLE_PLACEHOLDERS.map((p) => (
                                                <Tag key={p}>{p}</Tag>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            <Button type="primary" onClick={save} loading={saving}>
                {COPY_ACTIONS.save ?? "Save namespace"}
            </Button>
        </div>
    );
}

/* ── Correlation / insights editor ─────────────────────────────────────── */

interface CorrelationPayload {
    pearsonMinSamples?: number;
    topMoverWindow?: number;
    enableInsights?: boolean;
    summarySentences?: Record<string, string>;
}

const SENTENCE_KEYS: Array<{ key: string; label: string }> = [
    { key: "topMover", label: "Top mover" },
    { key: "biggestGap", label: "Biggest gap" },
    { key: "correlationStrong", label: "Strong correlation" },
    { key: "complianceDelta", label: "Compliance delta" },
];

export function CorrelationEditor({
    snap,
    onSaved,
}: {
    snap: Snapshot<CorrelationPayload>;
    onSaved: () => void;
}) {
    const [draft, setDraft] = useState<CorrelationPayload>(snap.payload ?? {});
    const [saving, setSaving] = useState(false);

    useEffect(() => setDraft(snap.payload ?? {}), [snap]);

    const updateSentence = (key: string, value: string) => {
        setDraft((prev) => ({
            ...prev,
            summarySentences: { ...(prev.summarySentences ?? {}), [key]: value },
        }));
    };

    const save = async () => {
        if ((draft.pearsonMinSamples ?? 5) < 2) {
            message.error("Pearson min samples must be at least 2");
            return;
        }
        setSaving(true);
        const ok = await savePayload({
            namespace: "correlation",
            version: snap.version,
            payload: draft as Record<string, unknown>,
            onSaved,
        });
        if (!ok) setSaving(false);
    };

    return (
        <div className="flex flex-col gap-4">
            <VersionRow snap={snap} />
            <p className="text-xs text-ds-text-subtle">
                Insight algorithms run on every dashboard + analytics surface. Disable globally with
                "Enable insights" or trim cost via the Pearson min-samples cap.
            </p>
            <div className="border border-ds-border-base rounded-ds-2xl bg-ds-surface-elevated p-4 grid gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-ds-text-subtle">Pearson minimum samples</span>
                    <InputNumber
                        min={2}
                        max={100}
                        value={draft.pearsonMinSamples ?? 5}
                        onChange={(v) =>
                            typeof v === "number" && setDraft((p) => ({ ...p, pearsonMinSamples: v }))
                        }
                        style={{ width: "100%" }}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-ds-text-subtle">Top-mover window (periods)</span>
                    <InputNumber
                        min={2}
                        max={24}
                        value={draft.topMoverWindow ?? 4}
                        onChange={(v) =>
                            typeof v === "number" && setDraft((p) => ({ ...p, topMoverWindow: v }))
                        }
                        style={{ width: "100%" }}
                    />
                </div>
                <label className="flex items-center gap-2 text-sm md:col-span-2">
                    <Switch
                        checked={Boolean(draft.enableInsights ?? true)}
                        onChange={(checked) => setDraft((p) => ({ ...p, enableInsights: checked }))}
                    />
                    <span>Enable insights</span>
                </label>
            </div>

            <div className="border border-ds-border-base rounded-ds-2xl bg-ds-surface-elevated p-4 flex flex-col gap-3">
                <p className="text-sm font-semibold">Summary sentence templates</p>
                <p className="text-xs text-ds-text-subtle">
                    Used by InsightSummaryWidget. Allowed placeholders: {"{campus}"}, {"{metric}"},{" "}
                    {"{direction}"}, {"{percent}"}, {"{gap}"}, {"{a}"}, {"{b}"}, {"{r}"}, {"{n}"}, {"{delta}"}
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                    {SENTENCE_KEYS.map(({ key, label }) => (
                        <div key={key} className="flex flex-col gap-1">
                            <span className="text-xs text-ds-text-subtle">{label}</span>
                            <Input.TextArea
                                rows={2}
                                value={draft.summarySentences?.[key] ?? ""}
                                onChange={(e) => updateSentence(key, e.target.value)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <Button type="primary" onClick={save} loading={saving}>
                {COPY_ACTIONS.save ?? "Save namespace"}
            </Button>
        </div>
    );
}
