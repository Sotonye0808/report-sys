"use client";

/**
 * modules/users/components/InvitesPage.tsx
 * Invite link management — generate, list, copy, and revoke invite links.
 * Visible to roles that can invite others (see allowedRoles in nav.ts).
 */

import { useState } from "react";
import {
    Form,
    Select,
    message,
    Tooltip,
    Tag,
    Space,
    Popconfirm,
    Empty,
} from "antd";
import {
    PlusOutlined,
    CopyOutlined,
    StopOutlined,
    LinkOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/providers/AuthProvider";
import { useMockDbSubscription } from "@/lib/hooks/useMockDbSubscription";
import { CONTENT } from "@/config/content";
import { API_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";
import { fmtDateTime } from "@/lib/utils/formatDate";
import Button from "@/components/ui/Button";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ROLE_CONFIG } from "@/config/roles";
import Table from "@/components/ui/Table";

/* ── Invitable roles per requesting role ────────────────────────────────────── */

const INVITABLE_ROLES: Record<UserRole, UserRole[]> = {
    [UserRole.SUPERADMIN]: [
        UserRole.CAMPUS_ADMIN,
        UserRole.CAMPUS_PASTOR,
        UserRole.GROUP_ADMIN,
        UserRole.GROUP_PASTOR,
        UserRole.SPO,
        UserRole.CEO,
        UserRole.CHURCH_MINISTRY,
        UserRole.DATA_ENTRY,
        UserRole.MEMBER,
    ],
    [UserRole.CAMPUS_ADMIN]: [
        UserRole.GROUP_ADMIN,
        UserRole.GROUP_PASTOR,
        UserRole.DATA_ENTRY,
        UserRole.MEMBER,
    ],
    [UserRole.CAMPUS_PASTOR]: [UserRole.GROUP_PASTOR, UserRole.MEMBER],
    [UserRole.GROUP_ADMIN]:   [UserRole.DATA_ENTRY, UserRole.MEMBER],
    [UserRole.GROUP_PASTOR]:  [UserRole.MEMBER],
    [UserRole.SPO]:            [],
    [UserRole.CEO]:            [],
    [UserRole.CHURCH_MINISTRY]: [],
    [UserRole.DATA_ENTRY]:     [],
    [UserRole.MEMBER]:         [],
};

/* ── Expiry options (matches content.ts) ───────────────────────────────────── */

const EXPIRY_OPTIONS = Object.entries(CONTENT.invites.expiryOptions as Record<string, string>).map(
    ([value, label]) => ({ value: Number(value), label }),
);

/* ── Status helpers ──────────────────────────────────────────────────────────── */

type InviteStatus = "active" | "used" | "expired" | "revoked";

function getInviteStatus(link: InviteLink): InviteStatus {
    if (!link.isActive) return "revoked";
    if (link.usedAt)    return "used";
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) return "expired";
    return "active";
}

const STATUS_TAG_MAP: Record<InviteStatus, { color: string; label: string }> = {
    active:  { color: "green",  label: CONTENT.invites.statusActive as string },
    used:    { color: "blue",   label: CONTENT.invites.statusUsed as string },
    expired: { color: "orange", label: CONTENT.invites.statusExpired as string },
    revoked: { color: "red",    label: CONTENT.invites.statusRevoked as string },
};

/* ── InviteLink interface ─────────────────────────────────────────────────────  */

interface InviteLink {
    id: string;
    token: string;
    targetRole: UserRole;
    campusId?: string;
    orgGroupId?: string;
    note?: string;
    expiresAt?: string;
    usedAt?: string;
    isActive: boolean;
    createdAt: string;
    createdById: string;
}

/* ── Create-invite form ────────────────────────────────────────────────────── */

interface CreateFormProps {
    currentRole: UserRole;
    onCreated: () => void;
}

function CreateInviteForm({ currentRole, onCreated }: CreateFormProps) {
    const [form]    = Form.useForm();
    const [saving, setSaving] = useState(false);

    const invitableRoles = INVITABLE_ROLES[currentRole] ?? [];
    if (invitableRoles.length === 0) return null;

    const roleOptions = invitableRoles.map((r) => ({
        value: r,
        label: ROLE_CONFIG[r]?.label ?? r,
    }));

    const handleSubmit = async (values: {
        targetRole: UserRole;
        expiresInHours: number;
        note?: string;
    }) => {
        setSaving(true);
        try {
            const res  = await fetch(API_ROUTES.inviteLinks.list, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            const json = await res.json();
            if (!res.ok) {
                message.error(json.error ?? (CONTENT.errors as Record<string, string>).generic);
                return;
            }
            message.success("Invite link generated!");
            form.resetFields();
            onCreated();
        } catch {
            message.error((CONTENT.errors as Record<string, string>).generic);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-5 mb-6">
            <h2 className="text-base font-semibold text-ds-text-primary mb-4">
                {CONTENT.invites.newInvite as string}
            </h2>
            <Form form={form} layout="inline" onFinish={handleSubmit} requiredMark={false}
                className="flex flex-wrap gap-3 items-end">
                <Form.Item
                    name="targetRole"
                    label={CONTENT.invites.targetRoleLabel as string}
                    rules={[{ required: true }]}
                    className="min-w-[180px]"
                >
                    <Select options={roleOptions} placeholder="Select role" />
                </Form.Item>
                <Form.Item
                    name="expiresInHours"
                    label={CONTENT.invites.expiresInLabel as string}
                    initialValue={72}
                    className="min-w-[160px]"
                >
                    <Select options={EXPIRY_OPTIONS} />
                </Form.Item>
                <Form.Item
                    name="note"
                    label={CONTENT.invites.noteLabel as string}
                    className="min-w-[220px]"
                >
                    <input
                        className="border border-ds-border-base rounded-ds-md px-3 py-1.5 text-sm bg-ds-surface-base text-ds-text-primary focus:outline-none focus:ring-2 focus:ring-ds-brand-accent w-full"
                        placeholder={CONTENT.invites.notePlaceholder as string}
                    />
                </Form.Item>
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        icon={<PlusOutlined />}
                        loading={saving}
                    >
                        {CONTENT.invites.generateButton as string}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

/* ── InvitesPage ──────────────────────────────────────────────────────────── */

export function InvitesPage() {
    const { user } = useAuth();
    const [refreshKey, setRefreshKey] = useState(0);

    const links = useMockDbSubscription<InviteLink[]>(
        "inviteLinks",
        async () => {
            const res  = await fetch(API_ROUTES.inviteLinks.list);
            const json = await res.json();
            return json.success ? (json.data as InviteLink[]) : [];
        },
        [refreshKey],
    );

    if (!user) return <LoadingSkeleton rows={5} />;

    const handleCopy = async (token: string) => {
        const url = `${window.location.origin}/join?token=${token}`;
        try {
            await navigator.clipboard.writeText(url);
            message.success(CONTENT.invites.copiedLink as string);
        } catch {
            message.error("Could not copy to clipboard.");
        }
    };

    const handleRevoke = async (id: string) => {
        try {
            const res  = await fetch(API_ROUTES.inviteLinks.revoke(id), { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) {
                message.error(json.error ?? (CONTENT.errors as Record<string, string>).generic);
                return;
            }
            message.success("Invite link revoked.");
            setRefreshKey((k) => k + 1);
        } catch {
            message.error((CONTENT.errors as Record<string, string>).generic);
        }
    };

    const TABLE_COLUMNS = [
        {
            title: CONTENT.invites.targetRoleLabel as string,
            dataIndex: "targetRole" as keyof InviteLink,
            key: "targetRole",
            render: (role: UserRole) => ROLE_CONFIG[role]?.label ?? role,
        },
        {
            title: "Status",
            key: "status",
            render: (_: unknown, row: InviteLink) => {
                const status = getInviteStatus(row);
                const { color, label } = STATUS_TAG_MAP[status];
                return <Tag color={color}>{label}</Tag>;
            },
        },
        {
            title: CONTENT.invites.expiresAtLabel as string,
            dataIndex: "expiresAt" as keyof InviteLink,
            key: "expiresAt",
            render: (v?: string) => fmtDateTime(v),
        },
        {
            title: CONTENT.invites.usedAtLabel as string,
            dataIndex: "usedAt" as keyof InviteLink,
            key: "usedAt",
            render: (v?: string) => fmtDateTime(v),
        },
        {
            title: CONTENT.invites.noteLabel as string,
            dataIndex: "note" as keyof InviteLink,
            key: "note",
            render: (v?: string) => v ?? "—",
        },
        {
            title: CONTENT.invites.createdAtLabel as string,
            dataIndex: "createdAt" as keyof InviteLink,
            key: "createdAt",
            render: (v: string) => fmtDateTime(v),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: unknown, row: InviteLink) => {
                const status = getInviteStatus(row);
                return (
                    <Space>
                        <Tooltip title={CONTENT.invites.copyLink as string}>
                            <Button
                                size="small"
                                icon={<CopyOutlined />}
                                onClick={() => handleCopy(row.token)}
                            />
                        </Tooltip>
                        {status === "active" && (
                            <Popconfirm
                                title={CONTENT.invites.deleteConfirm as string}
                                onConfirm={() => handleRevoke(row.id)}
                                okText={CONTENT.common.confirm as string}
                                cancelText={CONTENT.common.cancel as string}
                            >
                                <Tooltip title={CONTENT.invites.revokeLink as string}>
                                    <Button size="small" danger icon={<StopOutlined />} />
                                </Tooltip>
                            </Popconfirm>
                        )}
                    </Space>
                );
            },
        },
    ];

    const isEmpty = !links || links.length === 0;

    return (
        <PageLayout>
            <PageHeader
                title={CONTENT.invites.pageTitle as string}
                icon={<LinkOutlined />}
            />

            <CreateInviteForm
                currentRole={user.role}
                onCreated={() => setRefreshKey((k) => k + 1)}
            />

            {!links ? (
                <LoadingSkeleton rows={4} />
            ) : isEmpty ? (
                <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-12 flex flex-col items-center gap-3">
                    <Empty
                        description={
                            <span className="text-ds-text-secondary">
                                {(CONTENT.invites.emptyState as { title: string; description: string }).description}
                            </span>
                        }
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </div>
            ) : (
                <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base overflow-hidden">
                    <Table<InviteLink>
                        columns={TABLE_COLUMNS}
                        dataSource={links}
                        rowKey="id"
                        scroll={{ x: true }}
                    />
                </div>
            )}
        </PageLayout>
    );
}
