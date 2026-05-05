"use client";

/**
 * modules/admin-config/components/RolesEditorV2.tsx
 *
 * Runtime CRUD for the polymorphic Role substrate. Replaces the legacy
 * `RolesEditor` (which only supported overlay edits on built-in enum roles).
 *
 *   - Built-in (system) roles render with their `Built-in` tag and can be
 *     edited (label / capabilities / cadence) but NOT renamed or deleted.
 *     SUPERADMIN is fully read-only.
 *   - Custom roles can be CREATEd via the "+ New role" button. They get a
 *     unique uppercase code and a capability subset that excludes any
 *     SUPERADMIN-only bit.
 *   - Optional `scopeUnitIds[]` pins a role to specific OrgUnit ids so the
 *     same role label can be reused across cousin trees with distinct scope.
 */

import { useEffect, useMemo, useState } from "react";
import { Modal, Form, Input, InputNumber, Select, Switch, Tag, message, Empty } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

interface RoleRow {
    id: string;
    code: string;
    label: string;
    description?: string | null;
    hierarchyOrder: number;
    dashboardMode: string;
    reportVisibilityScope: string;
    capabilities: Record<string, boolean>;
    cadence?: Record<string, unknown> | null;
    isSystem: boolean;
    archivedAt?: string | null;
    scopeUnitIds: string[];
}

interface UnitRow {
    id: string;
    level: string;
    name: string;
    rootKey: string;
}

const CAPABILITY_KEYS = [
    "canCreateReports",
    "canFillReports",
    "canSubmitReports",
    "canRequestEdits",
    "canApproveReports",
    "canMarkReviewed",
    "canManageTemplates",
    "canDataEntry",
    "canSetGoals",
    "canApproveGoalUnlock",
    "canQuickFormFill",
    "canImportSpreadsheets",
    "canBulkInvite",
    "canViewScopeOverview",
] as const;

const SUPERADMIN_ONLY = new Set([
    "canManageAdminConfig",
    "canManageUsers",
    "canManageOrg",
    "canLockReports",
]);

const VISIBILITY_OPTIONS = [
    { value: "all", label: "All reports" },
    { value: "group", label: "Group scope" },
    { value: "campus", label: "Campus scope" },
    { value: "own", label: "Own scope" },
];

const DASHBOARD_MODE_OPTIONS = [
    { value: "system", label: "System" },
    { value: "scope-overview", label: "Scope overview" },
    { value: "report-review", label: "Report review" },
    { value: "report-reviewed", label: "Report reviewed" },
    { value: "report-fill", label: "Report fill" },
    { value: "analytics", label: "Analytics (legacy)" },
    { value: "quick-form", label: "Quick form (assignment-only)" },
];

export function RolesEditorV2() {
    const [rows, setRows] = useState<RoleRow[]>([]);
    const [units, setUnits] = useState<UnitRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<RoleRow | null>(null);
    const [creating, setCreating] = useState(false);
    const [form] = Form.useForm();

    const reload = async () => {
        setLoading(true);
        try {
            const [rolesRes, unitsRes] = await Promise.all([
                fetch(`${API_ROUTES.rolesV2.list}?includeArchived=true`, { cache: "no-store" }),
                fetch(`${API_ROUTES.orgUnits.list}`, { cache: "no-store" }),
            ]);
            const rolesJson = (await rolesRes.json()) as { success: boolean; data?: RoleRow[] };
            const unitsJson = (await unitsRes.json()) as { success: boolean; data?: UnitRow[] };
            if (rolesJson.success && rolesJson.data) setRows(rolesJson.data);
            if (unitsJson.success && unitsJson.data) setUnits(unitsJson.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void reload();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const unitOptions = useMemo(
        () =>
            (units ?? []).map((u) => ({
                value: u.id,
                label: `${u.name} (${u.level} · ${u.rootKey})`,
            })),
        [units],
    );

    const openEdit = (row: RoleRow) => {
        setEditing(row);
        form.setFieldsValue({
            code: row.code,
            label: row.label,
            description: row.description ?? "",
            hierarchyOrder: row.hierarchyOrder,
            dashboardMode: row.dashboardMode,
            reportVisibilityScope: row.reportVisibilityScope,
            capabilities: row.capabilities ?? {},
            scopeUnitIds: row.scopeUnitIds ?? [],
        });
    };

    const openCreate = () => {
        setCreating(true);
        form.setFieldsValue({
            code: "",
            label: "",
            description: "",
            hierarchyOrder: 50,
            dashboardMode: "scope-overview",
            reportVisibilityScope: "own",
            capabilities: {},
            scopeUnitIds: [],
        });
    };

    const closeAll = () => {
        setEditing(null);
        setCreating(false);
        form.resetFields();
    };

    const submit = async (values: Record<string, unknown>) => {
        const isCreate = creating;
        const isUpdate = Boolean(editing);
        const url = isCreate
            ? API_ROUTES.rolesV2.list
            : API_ROUTES.rolesV2.detail((editing as RoleRow).id);
        const method = isCreate ? "POST" : "PATCH";

        const capabilities = (values.capabilities ?? {}) as Record<string, boolean>;
        // Strip SUPERADMIN-only bits client-side (server enforces too).
        for (const k of Object.keys(capabilities)) {
            if (SUPERADMIN_ONLY.has(k)) delete capabilities[k];
        }

        const body = {
            code: values.code,
            label: values.label,
            description: (values.description as string) || null,
            hierarchyOrder: values.hierarchyOrder,
            dashboardMode: values.dashboardMode,
            reportVisibilityScope: values.reportVisibilityScope,
            capabilities,
            scopeUnitIds: values.scopeUnitIds ?? [],
        };

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const json = (await res.json()) as { success: boolean; error?: string };
        if (!res.ok || !json.success) {
            message.error(json.error ?? `Could not ${isCreate ? "create" : "update"} role`);
            return;
        }
        message.success(`Role ${isCreate ? "created" : "updated"}`);
        closeAll();
        void reload();
        // Close pre-empts useEffect ordering issues.
        void isUpdate;
    };

    const archive = (row: RoleRow) => {
        Modal.confirm({
            title: `Archive role "${row.label}"?`,
            content:
                "Users currently holding this role will keep their roleId reference, but new assignments will be blocked. You can restore via the API if needed.",
            okText: "Archive",
            okButtonProps: { danger: true },
            onOk: async () => {
                const res = await fetch(API_ROUTES.rolesV2.detail(row.id), { method: "DELETE" });
                const json = (await res.json()) as { success: boolean; error?: string };
                if (!res.ok || !json.success) {
                    message.error(json.error ?? "Could not archive role");
                    return;
                }
                message.success("Role archived");
                void reload();
            },
        });
    };

    if (loading) return <LoadingSkeleton rows={5} />;

    if (rows.length === 0) {
        return (
            <Empty description="No roles yet — run Reconcile to seed built-in roles">
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                    Create custom role
                </Button>
            </Empty>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-xs text-ds-text-subtle">
                    Built-in roles mirror the original UserRole enum. Custom roles you create here are
                    runtime-managed and can be archived without a deploy.
                </p>
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                    New role
                </Button>
            </div>

            <ul className="grid gap-2">
                {rows.map((r) => {
                    const isSuper = r.code === "SUPERADMIN";
                    return (
                        <li
                            key={r.id}
                            className="border border-ds-border-base rounded-ds-2xl bg-ds-surface-elevated p-4 flex items-start justify-between gap-3 flex-wrap"
                        >
                            <div className="flex flex-col gap-1 min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Tag>{r.code}</Tag>
                                    <span className="font-semibold text-ds-text-primary">{r.label}</span>
                                    {r.isSystem && <Tag color="blue">Built-in</Tag>}
                                    {isSuper && <Tag color="red">Read-only</Tag>}
                                    {r.archivedAt && <Tag color="default">Archived</Tag>}
                                </div>
                                <p className="text-xs text-ds-text-subtle">
                                    {r.dashboardMode} · scope: {r.reportVisibilityScope} · order #
                                    {r.hierarchyOrder}
                                </p>
                                {r.scopeUnitIds.length > 0 && (
                                    <p className="text-xs text-ds-text-subtle">
                                        Pinned to {r.scopeUnitIds.length} unit
                                        {r.scopeUnitIds.length === 1 ? "" : "s"}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="small"
                                    icon={<EditOutlined />}
                                    onClick={() => openEdit(r)}
                                    disabled={isSuper}
                                >
                                    Edit
                                </Button>
                                {!r.isSystem && !r.archivedAt && (
                                    <Button
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => archive(r)}
                                    >
                                        Archive
                                    </Button>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>

            <Modal
                open={creating || Boolean(editing)}
                onCancel={closeAll}
                onOk={() => form.submit()}
                title={creating ? "Create role" : `Edit ${editing?.label ?? "role"}`}
                okText={creating ? "Create" : "Save"}
                width={640}
            >
                <Form layout="vertical" form={form} onFinish={submit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Form.Item
                            label="Code"
                            name="code"
                            rules={[{ required: true }]}
                            extra="Uppercase slug. Built-in roles use the matching enum value."
                        >
                            <Input
                                placeholder="e.g. ZONE_LEAD"
                                disabled={editing?.isSystem ?? false}
                            />
                        </Form.Item>
                        <Form.Item label="Label" name="label" rules={[{ required: true }]}>
                            <Input placeholder="Display label" />
                        </Form.Item>
                    </div>
                    <Form.Item label="Description" name="description">
                        <Input.TextArea rows={2} placeholder="What is this role for?" />
                    </Form.Item>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Form.Item label="Hierarchy order" name="hierarchyOrder">
                            <InputNumber min={0} max={99} className="w-full" />
                        </Form.Item>
                        <Form.Item label="Dashboard mode" name="dashboardMode">
                            <Select options={DASHBOARD_MODE_OPTIONS} />
                        </Form.Item>
                        <Form.Item label="Visibility scope" name="reportVisibilityScope">
                            <Select options={VISIBILITY_OPTIONS} />
                        </Form.Item>
                    </div>
                    <Form.Item label="Pinned org units (optional)" name="scopeUnitIds">
                        <Select
                            mode="multiple"
                            options={unitOptions}
                            placeholder="Leave empty to apply across the whole organisation"
                            showSearch
                            optionFilterProp="label"
                            maxTagCount="responsive"
                        />
                    </Form.Item>
                    <p className="text-xs text-ds-text-subtle mb-2">Capabilities</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {CAPABILITY_KEYS.map((key) => (
                            <Form.Item
                                key={key}
                                name={["capabilities", key]}
                                valuePropName="checked"
                                noStyle
                            >
                                <label className="flex items-center gap-2 text-xs text-ds-text-secondary">
                                    <Switch size="small" />
                                    <span>{key}</span>
                                </label>
                            </Form.Item>
                        ))}
                    </div>
                </Form>
            </Modal>
        </div>
    );
}

export default RolesEditorV2;
