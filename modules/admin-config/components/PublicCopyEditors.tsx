"use client";

/**
 * modules/admin-config/components/PublicCopyEditors.tsx
 *
 * Bespoke GUI editors for the public-page namespaces:
 *   - LandingCopyEditor    → landing
 *   - HowItWorksEditor     → howItWorks
 *   - SimplePageEditor     → aboutPage / privacyPage / termsPage / footer
 *
 * Each editor reads/writes through the existing admin-config substrate
 * (`/api/admin-config/[ns]`) using the optimistic-lock contract. Sanitisation
 * is applied server-side via `lib/data/publicCopy.ts → sanitisePublicCopyPayload`.
 */

import { useEffect, useMemo, useState } from "react";
import { Form, Input, Select, message, Tabs, Tag } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

interface Snapshot<T = Record<string, unknown>> {
    namespace: string;
    version: number;
    payload: T;
    source: "db" | "fallback";
}

interface Props {
    snap: Snapshot;
    onSaved: () => void;
}

async function saveSnapshot(namespace: string, baseVersion: number, payload: unknown) {
    const res = await fetch(API_ROUTES.adminConfig.namespace(namespace), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload, baseVersion }),
    });
    const json = (await res.json()) as { success: boolean; error?: string };
    if (!res.ok || !json.success) {
        message.error(json.error ?? "Save failed");
        return false;
    }
    return true;
}

/* ── Landing ─────────────────────────────────────────────────────────────── */

interface LandingPayload {
    hero?: {
        eyebrow?: string;
        headline?: string;
        subheadline?: string;
        primaryCtaGuestLabel?: string;
        primaryCtaGuestHref?: string;
        primaryCtaAuthLabel?: string;
        secondaryCtaLabel?: string;
        secondaryCtaHref?: string;
    };
    features?: Array<{ title: string; body: string }>;
    quickLinksHeading?: string;
    welcomeBack?: string;
    signedOutBadge?: string;
    learnMore?: string;
}

export function LandingCopyEditor({ snap, onSaved }: Props) {
    const [draft, setDraft] = useState<LandingPayload>(() => snap.payload as LandingPayload);
    const [saving, setSaving] = useState(false);

    useEffect(() => setDraft(snap.payload as LandingPayload), [snap]);

    const updateHero = (patch: Partial<NonNullable<LandingPayload["hero"]>>) => {
        setDraft((prev) => ({ ...prev, hero: { ...(prev.hero ?? {}), ...patch } }));
    };

    const updateFeature = (idx: number, patch: { title?: string; body?: string }) => {
        setDraft((prev) => {
            const features = [...(prev.features ?? [])];
            features[idx] = { ...features[idx], ...patch };
            return { ...prev, features };
        });
    };

    const addFeature = () =>
        setDraft((prev) => ({
            ...prev,
            features: [...(prev.features ?? []), { title: "New feature", body: "" }],
        }));

    const removeFeature = (idx: number) =>
        setDraft((prev) => ({
            ...prev,
            features: (prev.features ?? []).filter((_, i) => i !== idx),
        }));

    const save = async () => {
        setSaving(true);
        try {
            const ok = await saveSnapshot("landing", snap.version, draft);
            if (ok) {
                message.success("Landing copy saved");
                onSaved();
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div>
                <p className="text-xs uppercase tracking-wide text-ds-text-subtle mb-2">Hero</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Form.Item label="Eyebrow" className="!mb-0">
                        <Input
                            value={draft.hero?.eyebrow ?? ""}
                            onChange={(e) => updateHero({ eyebrow: e.target.value })}
                        />
                    </Form.Item>
                    <Form.Item label="Headline" className="!mb-0">
                        <Input
                            value={draft.hero?.headline ?? ""}
                            onChange={(e) => updateHero({ headline: e.target.value })}
                        />
                    </Form.Item>
                </div>
                <Form.Item label="Subheadline" className="!mt-3 !mb-0">
                    <Input.TextArea
                        rows={2}
                        value={draft.hero?.subheadline ?? ""}
                        onChange={(e) => updateHero({ subheadline: e.target.value })}
                    />
                </Form.Item>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <Form.Item label="Guest CTA label" className="!mb-0">
                        <Input
                            value={draft.hero?.primaryCtaGuestLabel ?? ""}
                            onChange={(e) => updateHero({ primaryCtaGuestLabel: e.target.value })}
                        />
                    </Form.Item>
                    <Form.Item label="Guest CTA href" className="!mb-0">
                        <Input
                            value={draft.hero?.primaryCtaGuestHref ?? ""}
                            onChange={(e) => updateHero({ primaryCtaGuestHref: e.target.value })}
                        />
                    </Form.Item>
                    <Form.Item label="Authenticated CTA label" className="!mb-0">
                        <Input
                            value={draft.hero?.primaryCtaAuthLabel ?? ""}
                            onChange={(e) => updateHero({ primaryCtaAuthLabel: e.target.value })}
                        />
                    </Form.Item>
                    <Form.Item label="Secondary CTA label" className="!mb-0">
                        <Input
                            value={draft.hero?.secondaryCtaLabel ?? ""}
                            onChange={(e) => updateHero({ secondaryCtaLabel: e.target.value })}
                        />
                    </Form.Item>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs uppercase tracking-wide text-ds-text-subtle">
                        Features ({draft.features?.length ?? 0})
                    </p>
                    <Button size="small" icon={<PlusOutlined />} onClick={addFeature}>
                        Add feature
                    </Button>
                </div>
                <ul className="grid gap-2">
                    {(draft.features ?? []).map((f, i) => (
                        <li
                            key={i}
                            className="border border-ds-border-base rounded-ds-md bg-ds-surface-base/50 p-3 grid gap-2"
                        >
                            <div className="flex items-center gap-2">
                                <Input
                                    value={f.title}
                                    placeholder="Feature title"
                                    onChange={(e) => updateFeature(i, { title: e.target.value })}
                                />
                                <Button
                                    size="small"
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeFeature(i)}
                                />
                            </div>
                            <Input.TextArea
                                rows={2}
                                value={f.body}
                                placeholder="Feature body"
                                onChange={(e) => updateFeature(i, { body: e.target.value })}
                            />
                        </li>
                    ))}
                </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Form.Item label="Quick links heading" className="!mb-0">
                    <Input
                        value={draft.quickLinksHeading ?? ""}
                        onChange={(e) => setDraft((p) => ({ ...p, quickLinksHeading: e.target.value }))}
                    />
                </Form.Item>
                <Form.Item label="Welcome-back greeting" className="!mb-0">
                    <Input
                        value={draft.welcomeBack ?? ""}
                        onChange={(e) => setDraft((p) => ({ ...p, welcomeBack: e.target.value }))}
                    />
                </Form.Item>
                <Form.Item label="Signed-out badge" className="!mb-0">
                    <Input
                        value={draft.signedOutBadge ?? ""}
                        onChange={(e) => setDraft((p) => ({ ...p, signedOutBadge: e.target.value }))}
                    />
                </Form.Item>
            </div>

            <div className="flex justify-end">
                <Button type="primary" loading={saving} onClick={save}>
                    Save landing copy
                </Button>
            </div>
        </div>
    );
}

/* ── How It Works ────────────────────────────────────────────────────────── */

interface HowItWorksTab {
    slug: string;
    title: string;
    sections?: Array<{ heading: string; body: string }>;
    faqs?: Array<{ q: string; a: string }>;
    playgroundIds?: string[];
}
interface HowItWorksPayload {
    pageTitle?: string;
    pageSubtitle?: string;
    intro?: string;
    tabs?: HowItWorksTab[];
}

const KNOWN_PLAYGROUNDS = [
    "quick-form-demo",
    "correlation-demo",
    "auto-sum-chain",
    "analytics-chart-toggle",
    "template-builder-effect",
    "correlation-matrix-builder",
    "insight-summary-preview",
    "aggregation-rollup",
    "import-wizard-demo",
];

export function HowItWorksEditor({ snap, onSaved }: Props) {
    const [draft, setDraft] = useState<HowItWorksPayload>(() => snap.payload as HowItWorksPayload);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<string>(() => {
        const first = (snap.payload as HowItWorksPayload).tabs?.[0]?.slug ?? "";
        return first;
    });

    useEffect(() => {
        const next = snap.payload as HowItWorksPayload;
        setDraft(next);
        if (!next.tabs?.find((t) => t.slug === activeTab) && next.tabs?.[0]) {
            setActiveTab(next.tabs[0].slug);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [snap]);

    const updateTab = (slug: string, patch: Partial<HowItWorksTab>) => {
        setDraft((prev) => ({
            ...prev,
            tabs: (prev.tabs ?? []).map((t) => (t.slug === slug ? { ...t, ...patch } : t)),
        }));
    };

    const addSection = (slug: string) =>
        updateTab(slug, {
            sections: [
                ...(draft.tabs?.find((t) => t.slug === slug)?.sections ?? []),
                { heading: "New section", body: "" },
            ],
        });

    const removeSection = (slug: string, idx: number) => {
        const tab = draft.tabs?.find((t) => t.slug === slug);
        if (!tab) return;
        updateTab(slug, {
            sections: (tab.sections ?? []).filter((_, i) => i !== idx),
        });
    };

    const updateSection = (slug: string, idx: number, patch: { heading?: string; body?: string }) => {
        const tab = draft.tabs?.find((t) => t.slug === slug);
        if (!tab) return;
        const sections = [...(tab.sections ?? [])];
        sections[idx] = { ...sections[idx], ...patch };
        updateTab(slug, { sections });
    };

    const addFaq = (slug: string) => {
        const tab = draft.tabs?.find((t) => t.slug === slug);
        if (!tab) return;
        updateTab(slug, { faqs: [...(tab.faqs ?? []), { q: "New question", a: "" }] });
    };

    const removeFaq = (slug: string, idx: number) => {
        const tab = draft.tabs?.find((t) => t.slug === slug);
        if (!tab) return;
        updateTab(slug, { faqs: (tab.faqs ?? []).filter((_, i) => i !== idx) });
    };

    const updateFaq = (slug: string, idx: number, patch: { q?: string; a?: string }) => {
        const tab = draft.tabs?.find((t) => t.slug === slug);
        if (!tab) return;
        const faqs = [...(tab.faqs ?? [])];
        faqs[idx] = { ...faqs[idx], ...patch };
        updateTab(slug, { faqs });
    };

    const save = async () => {
        setSaving(true);
        try {
            const ok = await saveSnapshot("howItWorks", snap.version, draft);
            if (ok) {
                message.success("How it works saved");
                onSaved();
            }
        } finally {
            setSaving(false);
        }
    };

    const tabs = draft.tabs ?? [];

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Form.Item label="Page title" className="!mb-0">
                    <Input
                        value={draft.pageTitle ?? ""}
                        onChange={(e) => setDraft((p) => ({ ...p, pageTitle: e.target.value }))}
                    />
                </Form.Item>
                <Form.Item label="Page subtitle" className="!mb-0">
                    <Input
                        value={draft.pageSubtitle ?? ""}
                        onChange={(e) => setDraft((p) => ({ ...p, pageSubtitle: e.target.value }))}
                    />
                </Form.Item>
            </div>
            <Form.Item label="Intro paragraph" className="!mb-0">
                <Input.TextArea
                    rows={2}
                    value={draft.intro ?? ""}
                    onChange={(e) => setDraft((p) => ({ ...p, intro: e.target.value }))}
                />
            </Form.Item>

            {tabs.length === 0 ? (
                <p className="text-xs text-ds-text-subtle">
                    No tabs configured — Reset to defaults to seed the built-in walkthroughs.
                </p>
            ) : (
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabs.map((tab) => ({
                        key: tab.slug,
                        label: tab.title,
                        children: (
                            <div className="grid gap-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Form.Item label="Slug (URL ?tab=)" className="!mb-0">
                                        <Input
                                            value={tab.slug}
                                            onChange={(e) => updateTab(tab.slug, { slug: e.target.value })}
                                        />
                                    </Form.Item>
                                    <Form.Item label="Tab title" className="!mb-0">
                                        <Input
                                            value={tab.title}
                                            onChange={(e) => updateTab(tab.slug, { title: e.target.value })}
                                        />
                                    </Form.Item>
                                </div>

                                <Form.Item label="Playgrounds" className="!mb-0">
                                    <Select
                                        mode="multiple"
                                        value={tab.playgroundIds ?? []}
                                        onChange={(v) =>
                                            updateTab(tab.slug, { playgroundIds: v as string[] })
                                        }
                                        options={KNOWN_PLAYGROUNDS.map((id) => ({
                                            value: id,
                                            label: id,
                                        }))}
                                        placeholder="Pick interactive demos to mount on this tab"
                                    />
                                </Form.Item>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs uppercase tracking-wide text-ds-text-subtle">
                                            Sections ({tab.sections?.length ?? 0})
                                        </p>
                                        <Button
                                            size="small"
                                            icon={<PlusOutlined />}
                                            onClick={() => addSection(tab.slug)}
                                        >
                                            Add section
                                        </Button>
                                    </div>
                                    <ul className="grid gap-2">
                                        {(tab.sections ?? []).map((s, i) => (
                                            <li
                                                key={i}
                                                className="border border-ds-border-base rounded-ds-md bg-ds-surface-base/50 p-3 grid gap-2"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        value={s.heading}
                                                        onChange={(e) =>
                                                            updateSection(tab.slug, i, {
                                                                heading: e.target.value,
                                                            })
                                                        }
                                                    />
                                                    <Button
                                                        size="small"
                                                        type="text"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        onClick={() => removeSection(tab.slug, i)}
                                                    />
                                                </div>
                                                <Input.TextArea
                                                    rows={3}
                                                    value={s.body}
                                                    onChange={(e) =>
                                                        updateSection(tab.slug, i, {
                                                            body: e.target.value,
                                                        })
                                                    }
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs uppercase tracking-wide text-ds-text-subtle">
                                            FAQs ({tab.faqs?.length ?? 0})
                                        </p>
                                        <Button
                                            size="small"
                                            icon={<PlusOutlined />}
                                            onClick={() => addFaq(tab.slug)}
                                        >
                                            Add FAQ
                                        </Button>
                                    </div>
                                    <ul className="grid gap-2">
                                        {(tab.faqs ?? []).map((f, i) => (
                                            <li
                                                key={i}
                                                className="border border-ds-border-base rounded-ds-md bg-ds-surface-base/50 p-3 grid gap-2"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        value={f.q}
                                                        onChange={(e) =>
                                                            updateFaq(tab.slug, i, { q: e.target.value })
                                                        }
                                                        placeholder="Question"
                                                    />
                                                    <Button
                                                        size="small"
                                                        type="text"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        onClick={() => removeFaq(tab.slug, i)}
                                                    />
                                                </div>
                                                <Input.TextArea
                                                    rows={2}
                                                    value={f.a}
                                                    onChange={(e) =>
                                                        updateFaq(tab.slug, i, { a: e.target.value })
                                                    }
                                                    placeholder="Answer"
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ),
                    }))}
                />
            )}

            <div className="flex justify-end">
                <Button type="primary" loading={saving} onClick={save}>
                    Save how it works
                </Button>
            </div>
        </div>
    );
}

/* ── Generic single-page editor (about / privacy / terms) ────────────────── */

interface SimplePagePayload {
    title?: string;
    subtitle?: string;
    sections?: Array<{ heading: string; body: string }>;
}

export function SimplePageEditor({
    namespace,
    snap,
    onSaved,
}: { namespace: "aboutPage" | "privacyPage" | "termsPage" } & Props) {
    const [draft, setDraft] = useState<SimplePagePayload>(() => snap.payload as SimplePagePayload);
    const [saving, setSaving] = useState(false);

    useEffect(() => setDraft(snap.payload as SimplePagePayload), [snap]);

    const update = (idx: number, patch: { heading?: string; body?: string }) => {
        setDraft((prev) => {
            const sections = [...(prev.sections ?? [])];
            sections[idx] = { ...sections[idx], ...patch };
            return { ...prev, sections };
        });
    };
    const add = () =>
        setDraft((prev) => ({
            ...prev,
            sections: [...(prev.sections ?? []), { heading: "New section", body: "" }],
        }));
    const remove = (idx: number) =>
        setDraft((prev) => ({
            ...prev,
            sections: (prev.sections ?? []).filter((_, i) => i !== idx),
        }));

    const save = async () => {
        setSaving(true);
        try {
            const ok = await saveSnapshot(namespace, snap.version, draft);
            if (ok) {
                message.success("Page saved");
                onSaved();
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Form.Item label="Title" className="!mb-0">
                    <Input
                        value={draft.title ?? ""}
                        onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
                    />
                </Form.Item>
                <Form.Item label="Subtitle" className="!mb-0">
                    <Input
                        value={draft.subtitle ?? ""}
                        onChange={(e) => setDraft((p) => ({ ...p, subtitle: e.target.value }))}
                    />
                </Form.Item>
            </div>
            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs uppercase tracking-wide text-ds-text-subtle">
                        Sections ({draft.sections?.length ?? 0})
                    </p>
                    <Button size="small" icon={<PlusOutlined />} onClick={add}>
                        Add section
                    </Button>
                </div>
                <ul className="grid gap-2">
                    {(draft.sections ?? []).map((s, i) => (
                        <li
                            key={i}
                            className="border border-ds-border-base rounded-ds-md bg-ds-surface-base/50 p-3 grid gap-2"
                        >
                            <div className="flex items-center gap-2">
                                <Input
                                    value={s.heading}
                                    onChange={(e) => update(i, { heading: e.target.value })}
                                    placeholder="Section heading"
                                />
                                <Button
                                    size="small"
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => remove(i)}
                                />
                            </div>
                            <Input.TextArea
                                rows={3}
                                value={s.body}
                                onChange={(e) => update(i, { body: e.target.value })}
                                placeholder="Section body"
                            />
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex justify-end">
                <Button type="primary" loading={saving} onClick={save}>
                    Save page
                </Button>
            </div>
        </div>
    );
}

/* ── Reconcile panel ─────────────────────────────────────────────────────── */

export function ReconcilePanel() {
    const [busy, setBusy] = useState<"" | "dry" | "live">("");
    const [report, setReport] = useState<unknown>(null);

    const run = async (dry: boolean) => {
        setBusy(dry ? "dry" : "live");
        try {
            const res = await fetch(
                `${API_ROUTES.adminConfig.reconcile}${dry ? "?dry=true" : ""}`,
                { method: "POST" },
            );
            const json = (await res.json()) as { success: boolean; data?: unknown; error?: string };
            if (!res.ok || !json.success) {
                message.error(json.error ?? "Reconcile failed");
                return;
            }
            setReport(json.data ?? null);
            message.success(dry ? "Dry run complete" : "Reconcile complete");
        } finally {
            setBusy("");
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <p className="text-xs text-ds-text-secondary">
                Reconcile mirrors every existing campus + group into the polymorphic OrgUnit
                substrate, seeds built-in roles, and back-fills the new <code>roleId</code> /{" "}
                <code>unitId</code> columns wherever they&apos;re still null. Existing rows are never
                overwritten — only nullable columns are populated. Safe to re-run any time.
            </p>
            <div className="flex gap-2 flex-wrap">
                <Button
                    onClick={() => void run(true)}
                    loading={busy === "dry"}
                    icon={<Tag>DRY</Tag>}
                >
                    Preview (no writes)
                </Button>
                <Button type="primary" onClick={() => void run(false)} loading={busy === "live"}>
                    Run reconcile
                </Button>
            </div>
            {report ? (
                <pre className="text-xs bg-ds-surface-sunken border border-ds-border-subtle rounded-ds-md p-3 overflow-auto">
                    {JSON.stringify(report, null, 2)}
                </pre>
            ) : null}
        </div>
    );
}

export default LandingCopyEditor;
