"use client";

/**
 * modules/users/components/InvitesPage.tsx
 * Invite link management — generate, list, copy, and revoke invite links.
 * Visible to roles that can invite others (see allowedRoles in nav.ts).
 */

import { useState, useMemo } from "react";
import { Form, Select, message, Tooltip, Tag, Space, Popconfirm, Empty } from "antd";
import { PlusOutlined, CopyOutlined, StopOutlined, LinkOutlined } from "@ant-design/icons";
import { useAuth } from "@/providers/AuthProvider";
import { useApiData } from "@/lib/hooks/useApiData";
import { CONTENT } from "@/config/content";
import { API_ROUTES } from "@/config/routes";
import { UserRole, HIERARCHY_ORDER } from "@/types/global";
import { fmtDateTime } from "@/lib/utils/formatDate";
import Button from "@/components/ui/Button";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ROLE_CONFIG } from "@/config/roles";
import { CAMPUS_SCOPED_ROLES, GROUP_SCOPED_ROLES } from "@/config/hierarchy";
import Table from "@/components/ui/Table";
import { apiMutation } from "@/lib/utils/apiMutation";

/* ── Invitable roles: hierarchy-based ───────────────────────────────────────── */

/**
 * Returns the roles that a given user role can invite.
 * SUPERADMIN can invite any role (except SUPERADMIN itself).
 * All other roles can only invite roles BELOW them in the hierarchy
 * (higher HIERARCHY_ORDER number = lower in hierarchy).
 */
function getInvitableRoles(currentRole: UserRole): UserRole[] {
  const currentOrder = HIERARCHY_ORDER[currentRole];
  const allRoles = Object.keys(HIERARCHY_ORDER) as UserRole[];

  if (currentRole === UserRole.SUPERADMIN) {
    return allRoles.filter((r) => r !== UserRole.SUPERADMIN);
  }

  return allRoles.filter((r) => HIERARCHY_ORDER[r] > currentOrder);
}

/* ── Expiry options (matches content.ts) ───────────────────────────────────── */

const EXPIRY_OPTIONS = Object.entries(CONTENT.invites.expiryOptions as Record<string, string>).map(
  ([value, label]) => ({ value: Number(value), label }),
);

/* ── Status helpers ──────────────────────────────────────────────────────────── */

type InviteStatus = "active" | "used" | "expired" | "revoked";

function getInviteStatus(link: InviteLink): InviteStatus {
  if (!link.isActive) return "revoked";
  if (link.usedAt) return "used";
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) return "expired";
  return "active";
}

const STATUS_TAG_MAP: Record<InviteStatus, { color: string; label: string }> = {
  active: { color: "green", label: CONTENT.invites.statusActive as string },
  used: { color: "blue", label: CONTENT.invites.statusUsed as string },
  expired: { color: "orange", label: CONTENT.invites.statusExpired as string },
  revoked: { color: "red", label: CONTENT.invites.statusRevoked as string },
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
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const selectedRole = Form.useWatch("targetRole", form) as UserRole | undefined;

  const { data: campuses } = useApiData<Campus[]>(API_ROUTES.org.campuses);
  const { data: orgGroups } = useApiData<OrgGroup[]>(API_ROUTES.org.groups);

  const invitableRoles = getInvitableRoles(currentRole);
  if (invitableRoles.length === 0) return null;

  const roleOptions = invitableRoles.map((r) => ({
    value: r,
    label: ROLE_CONFIG[r]?.label ?? r,
  }));

  const showCampusField = selectedRole ? CAMPUS_SCOPED_ROLES.includes(selectedRole) : false;
  const showGroupField = selectedRole ? GROUP_SCOPED_ROLES.includes(selectedRole) : false;

  const campusOptions = (campuses ?? []).map((c) => ({ value: c.id, label: c.name }));
  const groupOptions = (orgGroups ?? []).map((g) => ({ value: g.id, label: g.name }));

  const handleSubmit = async (values: {
    targetRole: UserRole;
    recipientEmail?: string;
    expiresInHours: number;
    note?: string;
    campusId?: string;
    groupId?: string;
  }) => {
    setSaving(true);
    try {
      const result = await apiMutation<InviteLink, typeof values>(API_ROUTES.inviteLinks.list, {
        method: "POST",
        body: values,
      });
      if (!result.ok) {
        message.error(result.error ?? (CONTENT.errors as Record<string, string>).generic);
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
      <Form
        form={form}
        layout="inline"
        onFinish={handleSubmit}
        requiredMark={false}
        className="flex flex-wrap gap-3 items-end"
      >
        <Form.Item
          name="targetRole"
          label={CONTENT.invites.targetRoleLabel as string}
          rules={[{ required: true }]}
          className="min-w-[180px]"
        >
          <Select
            options={roleOptions}
            placeholder="Select role"
            onChange={() => {
              form.setFieldsValue({ campusId: undefined, groupId: undefined });
            }}
          />
        </Form.Item>
        <Form.Item
          name="recipientEmail"
          label={((CONTENT.invites as any).recipientEmailLabel as string) ?? "Recipient Email"}
          className="min-w-[220px]"
          rules={[{ type: "email", message: "Please enter a valid email." }]}
        >
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            className="border border-ds-border-base rounded-ds-md px-3 py-1.5 text-sm bg-ds-surface-base text-ds-text-primary focus:outline-none focus:ring-2 focus:ring-ds-brand-accent w-full"
            placeholder={
              ((CONTENT.invites as any).recipientEmailPlaceholder as string) ??
              "you@harvestersng.org"
            }
          />
        </Form.Item>
        {showCampusField && (
          <Form.Item
            name="campusId"
            label={(CONTENT.invites.campusLabel as string) ?? "Campus"}
            rules={[{ required: true, message: "Campus is required for this role" }]}
            className="min-w-[180px]"
          >
            <Select options={campusOptions} placeholder="Select campus" allowClear />
          </Form.Item>
        )}
        {showGroupField && (
          <Form.Item
            name="groupId"
            label={(CONTENT.invites.groupLabel as string) ?? "Group"}
            rules={[{ required: true, message: "Group is required for this role" }]}
            className="min-w-[180px]"
          >
            <Select options={groupOptions} placeholder="Select group" allowClear />
          </Form.Item>
        )}
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
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={saving}>
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

  const { data: links, refetch } = useApiData<InviteLink[]>(API_ROUTES.inviteLinks.list);

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
      const result = await apiMutation<InviteLink>(API_ROUTES.inviteLinks.revoke(id), {
        method: "DELETE",
      });
      if (!result.ok) {
        message.error(result.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      message.success("Invite link revoked.");
      refetch();
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
              <Button size="small" icon={<CopyOutlined />} onClick={() => handleCopy(row.token)} />
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
      <PageHeader title={CONTENT.invites.pageTitle as string} icon={<LinkOutlined />} />

      <CreateInviteForm currentRole={user.role} onCreated={() => refetch()} />

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
