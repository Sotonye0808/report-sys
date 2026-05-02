"use client";

/**
 * modules/bulk-invites/components/BulkInvitesPage.tsx
 *
 * Two-mode page for creating many invites in one go:
 *  - Invite Links: server creates InviteLink rows (and optionally emails).
 *  - Pre-register: server creates User rows with one-time activation tokens.
 *
 * The form lets the operator paste rows or add them manually with shared
 * defaults, then renders a per-row outcome table after submission so partial
 * failures are visible.
 */

import { useMemo, useState } from "react";
import { Form, Select, Input, Tabs, Table, Tag, message } from "antd";
import { CONTENT } from "@/config/content";
import { API_ROUTES } from "@/config/routes";
import { ROLE_CONFIG } from "@/config/roles";
import { CAMPUS_SCOPED_ROLES, GROUP_SCOPED_ROLES } from "@/config/hierarchy";
import { useAuth } from "@/providers/AuthProvider";
import { useApiData } from "@/lib/hooks/useApiData";
import { HIERARCHY_ORDER, UserRole } from "@/types/global";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import Button from "@/components/ui/Button";

interface RowEntry {
    email: string;
    targetRole?: UserRole;
    campusId?: string;
    groupId?: string;
    firstName?: string;
    lastName?: string;
    note?: string;
}

interface OutcomeRow {
    email: string;
    status: string;
    error?: string;
    activationUrl?: string;
}

function getInvitableRoles(currentRole: UserRole): UserRole[] {
    const order = HIERARCHY_ORDER[currentRole];
    const all = Object.keys(HIERARCHY_ORDER) as UserRole[];
    if (currentRole === UserRole.SUPERADMIN) return all.filter((r) => r !== UserRole.SUPERADMIN);
    return all.filter((r) => HIERARCHY_ORDER[r] > order);
}

function parseCsvBlock(input: string, defaultRole?: UserRole): RowEntry[] {
    return input
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const parts = line.split(",").map((p) => p.trim());
            const [email, role] = parts;
            return {
                email,
                targetRole: (role as UserRole) || defaultRole,
            };
        })
        .filter((r) => r.email.includes("@"));
}

const COPY = (CONTENT.bulkInvites ?? {}) as Record<string, unknown>;
const COPY_ACTIONS = (COPY.actions ?? {}) as Record<string, string>;
const COPY_HELP = (COPY.helpers ?? {}) as Record<string, string>;
const COPY_OUTCOMES = (COPY.outcomeLabels ?? {}) as Record<string, string>;

export function BulkInvitesPage() {
    const { user } = useAuth();
    const [mode, setMode] = useState<"link" | "preregister">("link");
    const [submitting, setSubmitting] = useState(false);
    const [rows, setRows] = useState<RowEntry[]>([{ email: "" }]);
    const [outcomes, setOutcomes] = useState<OutcomeRow[]>([]);
    const [form] = Form.useForm();

    const { data: campuses } = useApiData<Campus[]>(API_ROUTES.org.campuses);
    const { data: orgGroups } = useApiData<OrgGroup[]>(API_ROUTES.org.groups);

    const invitableRoles = useMemo(
        () => (user ? getInvitableRoles(user.role as UserRole) : []),
        [user],
    );

    const roleOptions = invitableRoles.map((r) => ({
        value: r,
        label: ROLE_CONFIG[r]?.label ?? r,
    }));
    const campusOptions = (campuses ?? []).map((c) => ({ value: c.id, label: c.name }));
    const groupOptions = (orgGroups ?? []).map((g) => ({ value: g.id, label: g.name }));

    const targetRole = Form.useWatch("targetRole", form) as UserRole | undefined;
    const showCampusField = targetRole ? CAMPUS_SCOPED_ROLES.includes(targetRole) : false;
    const showGroupField = targetRole ? GROUP_SCOPED_ROLES.includes(targetRole) : false;

    const updateRow = (index: number, patch: Partial<RowEntry>) => {
        setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    };
    const addRow = () => setRows((prev) => [...prev, { email: "" }]);
    const removeRow = (index: number) => setRows((prev) => prev.filter((_, i) => i !== index));

    const handlePaste = () => {
        const block = window.prompt(COPY_HELP.csvHint ?? "Paste rows: email, role per line");
        if (!block) return;
        const parsed = parseCsvBlock(block, targetRole);
        if (parsed.length === 0) {
            message.warning("No valid rows detected");
            return;
        }
        setRows(parsed.length > 0 ? parsed : [{ email: "" }]);
    };

    const submit = async (shared: {
        targetRole?: UserRole;
        campusId?: string;
        groupId?: string;
        expiresInHours: number;
        note?: string;
        sendEmail: boolean;
    }) => {
        const validEntries = rows
            .map((r) => ({ ...r, email: r.email.trim().toLowerCase() }))
            .filter((r) => r.email.includes("@"));
        if (validEntries.length === 0) {
            message.error("Add at least one valid email");
            return;
        }
        setSubmitting(true);
        setOutcomes([]);
        try {
            const url = mode === "link" ? API_ROUTES.inviteLinksBulk : API_ROUTES.preregister;
            const body =
                mode === "link"
                    ? { shared, entries: validEntries }
                    : {
                          shared: {
                              targetRole: shared.targetRole,
                              campusId: shared.campusId,
                              groupId: shared.groupId,
                          },
                          entries: validEntries,
                      };
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const json = (await res.json()) as {
                success: boolean;
                data?: { outcomes: OutcomeRow[]; counts: Record<string, number> };
                error?: string;
            };
            if (!res.ok || !json.success || !json.data) {
                message.error(json.error ?? "Bulk submit failed");
                return;
            }
            setOutcomes(json.data.outcomes);
            message.success(
                `${json.data.counts.success} created · ${json.data.counts.skipped} skipped · ${json.data.counts.failed} failed`,
            );
        } catch {
            message.error("Bulk submit failed");
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <PageLayout>
            <PageHeader
                title={String(COPY.pageTitle ?? "Bulk Invites")}
                subtitle={String(COPY.subtitle ?? "")}
            />
            <Tabs
                activeKey={mode}
                onChange={(k) => setMode(k as "link" | "preregister")}
                items={[
                    {
                        key: "link",
                        label: ((COPY.modes as Record<string, string>)?.link) ?? "Generate invite links",
                        children: null,
                    },
                    {
                        key: "preregister",
                        label: ((COPY.modes as Record<string, string>)?.preregister) ?? "Pre-register users",
                        children: null,
                    },
                ]}
            />
            <Form
                form={form}
                layout="vertical"
                onFinish={submit}
                initialValues={{ expiresInHours: 168, sendEmail: true }}
                disabled={submitting}
                className="mt-4 grid gap-3 md:grid-cols-2"
            >
                <Form.Item
                    name="targetRole"
                    label="Role"
                    rules={[{ required: true, message: "Required" }]}
                >
                    <Select options={roleOptions} />
                </Form.Item>
                {showCampusField && (
                    <Form.Item name="campusId" label="Campus" rules={[{ required: true }]}>
                        <Select options={campusOptions} allowClear />
                    </Form.Item>
                )}
                {showGroupField && (
                    <Form.Item name="groupId" label="Group" rules={[{ required: true }]}>
                        <Select options={groupOptions} allowClear />
                    </Form.Item>
                )}
                {mode === "link" && (
                    <>
                        <Form.Item name="expiresInHours" label="Expires in (hours)">
                            <Input type="number" min={1} max={24 * 365} />
                        </Form.Item>
                        <Form.Item name="note" label="Note (optional)">
                            <Input maxLength={500} />
                        </Form.Item>
                    </>
                )}

                <div className="md:col-span-2">
                    <p className="text-xs text-ds-text-subtle mb-2">{COPY_HELP.sharedDefaults ?? ""}</p>
                    <div className="flex items-center gap-2 mb-3">
                        <Button onClick={addRow} type="default" size="small">
                            {COPY_ACTIONS.addRow ?? "Add row"}
                        </Button>
                        <Button onClick={handlePaste} type="default" size="small">
                            {COPY_ACTIONS.paste ?? "Paste from clipboard"}
                        </Button>
                    </div>
                    <div className="grid gap-2">
                        {rows.map((row, i) => (
                            <div
                                key={i}
                                className="flex flex-wrap gap-2 p-2 border border-ds-border-base rounded-ds-md bg-ds-surface-base"
                            >
                                <Input
                                    type="email"
                                    inputMode="email"
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                    value={row.email}
                                    onChange={(e) => updateRow(i, { email: e.target.value })}
                                    style={{ minWidth: 240 }}
                                />
                                {mode === "preregister" && (
                                    <>
                                        <Input
                                            placeholder="First name"
                                            value={row.firstName ?? ""}
                                            onChange={(e) => updateRow(i, { firstName: e.target.value })}
                                            style={{ minWidth: 140 }}
                                        />
                                        <Input
                                            placeholder="Last name"
                                            value={row.lastName ?? ""}
                                            onChange={(e) => updateRow(i, { lastName: e.target.value })}
                                            style={{ minWidth: 140 }}
                                        />
                                    </>
                                )}
                                <Select
                                    placeholder="Role override"
                                    value={row.targetRole}
                                    onChange={(v) => updateRow(i, { targetRole: v as UserRole })}
                                    options={roleOptions}
                                    allowClear
                                    style={{ minWidth: 180 }}
                                />
                                <Button
                                    onClick={() => removeRow(i)}
                                    type="default"
                                    size="small"
                                    danger
                                >
                                    ×
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <Form.Item className="md:col-span-2">
                    <Button htmlType="submit" type="primary" loading={submitting}>
                        {mode === "link"
                            ? COPY_ACTIONS.send ?? "Send invites"
                            : COPY_ACTIONS.preregister ?? "Create activation links"}
                    </Button>
                </Form.Item>
            </Form>

            {outcomes.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-base font-semibold text-ds-text-primary mb-3">Outcomes</h2>
                    <Table
                        rowKey={(r) => `${r.email}-${r.status}`}
                        dataSource={outcomes}
                        pagination={false}
                        size="small"
                        columns={[
                            { title: "Email", dataIndex: "email" },
                            {
                                title: "Status",
                                dataIndex: "status",
                                render: (v: string) => (
                                    <Tag color={
                                        v === "created" || v === "preregistered" ? "green"
                                        : v === "already_registered" || v === "already_invited" || v === "activation_skipped" ? "orange"
                                        : "red"
                                    }>
                                        {COPY_OUTCOMES[v] ?? v}
                                    </Tag>
                                ),
                            },
                            { title: "Error", dataIndex: "error" },
                        ]}
                    />
                </div>
            )}
        </PageLayout>
    );
}

export default BulkInvitesPage;
