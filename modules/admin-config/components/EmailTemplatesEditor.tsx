"use client";

/**
 * modules/admin-config/components/EmailTemplatesEditor.tsx
 *
 * Per-template editor for the `emailTemplates` admin-config namespace.
 * Left pane: subject input + HTML textarea + variable allowlist chips.
 * Right pane: rendered preview using sample variables (resamplable).
 * Bottom action: send-test email through `/api/email/test` (rate-limited).
 *
 * Override is keyed by templateId; missing entries fall through to the
 * registry default. Save writes the full namespace as `{ overrides: {...} }`.
 */

import { useEffect, useMemo, useState } from "react";
import { Input, Tag, Tabs, Modal, message, Empty } from "antd";
import {
    EMAIL_TEMPLATE_DEFINITIONS,
    type EmailTemplateDefinition,
} from "@/lib/email/templates/definitions";
import { renderTemplatePreview } from "@/lib/email/templates/preview";
import { API_ROUTES } from "@/config/routes";
import { CONTENT } from "@/config/content";
import Button from "@/components/ui/Button";

interface OverrideEntry {
    subject?: string;
    html?: string;
}

interface NamespacePayload {
    overrides?: Record<string, OverrideEntry>;
}

interface Snapshot {
    namespace: string;
    version: number;
    payload: NamespacePayload;
    source: "db" | "fallback";
}

const TEMPLATE_LIST: EmailTemplateDefinition[] = Object.values(EMAIL_TEMPLATE_DEFINITIONS);

export function EmailTemplatesEditor({
    snap,
    onSaved,
}: {
    snap: Snapshot;
    onSaved: () => void;
}) {
    const initialOverrides = useMemo<Record<string, OverrideEntry>>(
        () => ({ ...(snap.payload?.overrides ?? {}) }),
        [snap],
    );
    const [drafts, setDrafts] = useState<Record<string, OverrideEntry>>(initialOverrides);
    const [activeId, setActiveId] = useState<string>(TEMPLATE_LIST[0]?.id ?? "");
    const [saving, setSaving] = useState(false);
    const [testRecipient, setTestRecipient] = useState("");
    const [testModalOpen, setTestModalOpen] = useState(false);
    const [testing, setTesting] = useState(false);

    useEffect(() => setDrafts(initialOverrides), [initialOverrides]);

    const activeDef = EMAIL_TEMPLATE_DEFINITIONS[activeId];
    const draft = drafts[activeId] ?? {};
    const subject = draft.subject ?? activeDef?.defaultSubject ?? "";
    const html = draft.html ?? activeDef?.defaultHtml ?? "";

    const isOverride = Boolean(drafts[activeId]?.subject || drafts[activeId]?.html);

    const updateActive = (patch: OverrideEntry) => {
        setDrafts((prev) => {
            const current = prev[activeId] ?? {};
            const next = { ...current, ...patch };
            // Auto-clear when reverting to defaults
            if (
                (next.subject === undefined || next.subject === activeDef?.defaultSubject) &&
                (next.html === undefined || next.html === activeDef?.defaultHtml)
            ) {
                const out = { ...prev };
                delete out[activeId];
                return out;
            }
            return { ...prev, [activeId]: next };
        });
    };

    const resetActive = () => {
        setDrafts((prev) => {
            const out = { ...prev };
            delete out[activeId];
            return out;
        });
    };

    const insertVar = (name: string) => {
        const placeholder = `{{${name}}}`;
        updateActive({ html: (html ?? "") + placeholder });
    };

    const preview = activeDef
        ? renderTemplatePreview(
              activeDef.id,
              activeDef.sampleVars,
              { subject, html },
          )
        : null;

    const save = async () => {
        setSaving(true);
        try {
            const res = await fetch(API_ROUTES.adminConfig.namespace("emailTemplates"), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    payload: { overrides: drafts },
                    baseVersion: snap.version,
                }),
            });
            const json = (await res.json()) as { success: boolean; error?: string };
            if (!res.ok || !json.success) {
                message.error(json.error ?? "Save failed");
                return;
            }
            message.success((((CONTENT.adminConfig as unknown) as Record<string, Record<string, string>>).toasts?.saved) ?? "Saved");
            onSaved();
        } finally {
            setSaving(false);
        }
    };

    const sendTest = async () => {
        if (!activeDef) return;
        if (!testRecipient.includes("@")) {
            message.warning("Enter a valid recipient email");
            return;
        }
        setTesting(true);
        try {
            const res = await fetch(API_ROUTES.emailTest, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    templateId: activeDef.id,
                    toEmail: testRecipient,
                    sampleVars: activeDef.sampleVars,
                }),
            });
            const json = (await res.json()) as {
                success: boolean;
                data?: { mode: "sent" | "preview-only"; messageId?: string };
                error?: string;
            };
            if (!res.ok || !json.success) {
                message.error(json.error ?? "Test send failed");
                return;
            }
            if (json.data?.mode === "sent") {
                message.success(`Sent · ${json.data.messageId ?? "no id"}`);
            } else {
                message.info("Preview only — email service not configured");
            }
            setTestModalOpen(false);
        } finally {
            setTesting(false);
        }
    };

    if (TEMPLATE_LIST.length === 0) {
        return <Empty description="No email templates registered" />;
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xs text-ds-text-subtle">
                <Tag>{snap.version}</Tag>
                <Tag color={snap.source === "db" ? "blue" : "default"}>
                    {snap.source === "db" ? "Override active" : "Defaults"}
                </Tag>
            </div>

            <Tabs
                activeKey={activeId}
                onChange={setActiveId}
                items={TEMPLATE_LIST.map((def) => ({
                    key: def.id,
                    label: (
                        <span className="flex items-center gap-2">
                            {def.label}
                            {drafts[def.id] ? <span className="w-1.5 h-1.5 rounded-full bg-ds-brand-accent" /> : null}
                        </span>
                    ),
                }))}
            />

            {activeDef && (
                <div className="grid gap-4 lg:grid-cols-2">
                    <div className="flex flex-col gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-ds-text-subtle mb-1">
                                {activeDef.label}
                            </p>
                            <p className="text-xs text-ds-text-subtle">{activeDef.description}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-ds-text-subtle">Subject</span>
                            <Input
                                value={subject}
                                onChange={(e) => updateActive({ subject: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-ds-text-subtle">Body HTML</span>
                            <Input.TextArea
                                rows={14}
                                value={html}
                                onChange={(e) => updateActive({ html: e.target.value })}
                                style={{ fontFamily: "monospace", fontSize: 12 }}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-ds-text-subtle">Variables (click to insert)</span>
                            <div className="flex flex-wrap gap-1">
                                {activeDef.variables.map((v) => (
                                    <Tag
                                        key={v}
                                        color="blue"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => insertVar(v)}
                                    >
                                        {`{{${v}}}`}
                                    </Tag>
                                ))}
                            </div>
                            {preview && preview.missingVars.length > 0 && (
                                <p className="text-xs text-amber-500 mt-1">
                                    Unmatched in preview: {preview.missingVars.join(", ")}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button type="primary" onClick={save} loading={saving}>
                                Save namespace
                            </Button>
                            <Button onClick={resetActive} disabled={!isOverride}>
                                Revert this template
                            </Button>
                            <Button onClick={() => setTestModalOpen(true)}>Send test email</Button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-xs text-ds-text-subtle">Preview</span>
                        <div className="border border-ds-border-base rounded-ds-2xl overflow-hidden bg-ds-surface-base">
                            {preview ? (
                                <>
                                    <div className="px-4 py-2 border-b border-ds-border-base bg-ds-surface-elevated">
                                        <p className="text-xs text-ds-text-subtle">Subject</p>
                                        <p className="text-sm text-ds-text-primary">{preview.subject}</p>
                                    </div>
                                    <iframe
                                        title="Email preview"
                                        sandbox=""
                                        srcDoc={preview.html}
                                        style={{ width: "100%", height: 480, border: "none", background: "#fff" }}
                                    />
                                </>
                            ) : (
                                <Empty />
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Modal
                open={testModalOpen}
                title={`Send test: ${activeDef?.label}`}
                onCancel={() => setTestModalOpen(false)}
                onOk={sendTest}
                confirmLoading={testing}
                okText="Send"
            >
                <p className="text-xs text-ds-text-subtle mb-2">
                    The renderer uses sample data from the registry. If RESEND is not configured,
                    the response is preview-only.
                </p>
                <Input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="recipient@example.com"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                />
            </Modal>
        </div>
    );
}

export default EmailTemplatesEditor;
