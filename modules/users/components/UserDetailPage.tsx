"use client";

/**
 * modules/users/components/UserDetailPage.tsx
 * View and manage a user — change role, activate/deactivate.
 * SUPERADMIN only.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select, Switch, message, Descriptions, Tag } from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  SaveOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useApiData } from "@/lib/hooks/useApiData";
import { CONTENT } from "@/config/content";
import { formatReportPeriod } from "@/lib/utils/reportUtils";
import { fmtDate } from "@/lib/utils/formatDate";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import { PageLayout } from "@/components/ui/PageLayout";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserRole } from "@/types/global";

const ROLE_OPTIONS = Object.values(UserRole)
  .filter((r) => r !== UserRole.SUPERADMIN)
  .map((r) => ({
    value: r,
    label: CONTENT.users.roles[r as keyof typeof CONTENT.users.roles] ?? r,
  }));

interface PageProps {
  params: Promise<{ id: string }>;
}

export function UserDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editRole, setEditRole] = useState<UserRole | null>(null);
  const [editActive, setEditActive] = useState<boolean | null>(null);

  if (!resolvedId) {
    params.then((p) => setResolvedId(p.id));
  }

  const { data: user, refetch: refetchUser } = useApiData<UserProfile>(
    resolvedId ? API_ROUTES.users.detail(resolvedId) : null,
  );

  const { data: campus } = useApiData<Campus>(
    user?.campusId ? API_ROUTES.org.campus(user.campusId) : null,
    [user?.campusId],
  );

  const displayRole = editRole ?? user?.role ?? UserRole.MEMBER;
  const displayActive = editActive ?? user?.isActive ?? true;

  const handleSave = async () => {
    if (!resolvedId || !user) return;
    const hasChanges = editRole !== null || editActive !== null;
    if (!hasChanges) {
      message.info("No changes to save.");
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {};
      if (editRole !== null) body.role = editRole;
      if (editActive !== null) body.isActive = editActive;

      const res = await fetch(API_ROUTES.users.detail(resolvedId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      message.success(CONTENT.common.successSave as string);
      setEditRole(null);
      setEditActive(null);
      refetchUser();
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setSaving(false);
    }
  };

  if (!resolvedId || user === undefined) {
    return (
      <PageLayout title={CONTENT.users.pageTitle as string}>
        <LoadingSkeleton rows={6} />
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout title={CONTENT.users.pageTitle as string}>
        <EmptyState
          icon={<UserOutlined />}
          title="User Not Found"
          description="This user does not exist or has been removed."
          action={
            <Button onClick={() => router.push(APP_ROUTES.users)}>
              {CONTENT.common.back as string}
            </Button>
          }
        />
      </PageLayout>
    );
  }

  const isSuperadmin = user.role === UserRole.SUPERADMIN;
  const hasUnsavedChanges = editRole !== null || editActive !== null;

  return (
    <PageLayout
      title={`${user.firstName} ${user.lastName}`}
      subtitle={user.email}
      actions={
        <div className="flex items-center gap-2">
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(APP_ROUTES.users)}>
            {CONTENT.common.back as string}
          </Button>
          {hasUnsavedChanges && (
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
              {CONTENT.common.save as string}
            </Button>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-ds-brand-accent/10 flex items-center justify-center">
                <UserOutlined className="text-2xl text-ds-brand-accent" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-ds-text-primary">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-sm text-ds-text-secondary">{user.email}</p>
              </div>
              <div className="ml-auto">
                {displayActive ? (
                  <Tag color="success" icon={<CheckCircleOutlined />}>
                    {CONTENT.users.activeStatus as string}
                  </Tag>
                ) : (
                  <Tag color="error" icon={<StopOutlined />}>
                    {CONTENT.users.inactiveStatus as string}
                  </Tag>
                )}
              </div>
            </div>

            <Descriptions
              column={2}
              size="small"
              labelStyle={{ color: "var(--ds-text-secondary)", fontSize: 12 }}
            >
              <Descriptions.Item label={CONTENT.users.campusLabel as string}>
                {campus?.name ?? user.campusId ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label={CONTENT.profile.phoneLabel as string}>
                {user.phone ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label={CONTENT.profile.memberSince as string}>
                {fmtDate(user.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label={CONTENT.profile.lastUpdated as string}>
                {fmtDate(user.updatedAt)}
              </Descriptions.Item>
            </Descriptions>
          </div>

          <RecentUserReports userId={user.id} />
        </div>

        {/* Right panel — management actions */}
        <div className="space-y-6">
          {!isSuperadmin && (
            <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-5">
              <h3 className="text-sm font-semibold text-ds-text-primary mb-3">
                {CONTENT.users.roleLabel as string}
              </h3>
              <Select
                value={displayRole}
                options={ROLE_OPTIONS}
                onChange={(val) => setEditRole(val as UserRole)}
                size="large"
                className="w-full"
              />
              {editRole && (
                <p className="text-xs text-ds-text-subtle mt-2">Unsaved · will change on save.</p>
              )}
            </div>
          )}

          {!isSuperadmin && (
            <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-5">
              <h3 className="text-sm font-semibold text-ds-text-primary mb-3">
                {CONTENT.users.statusLabel as string}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ds-text-secondary">
                  {displayActive
                    ? (CONTENT.users.activeStatus as string)
                    : (CONTENT.users.inactiveStatus as string)}
                </span>
                <Switch
                  checked={displayActive}
                  onChange={(v) => setEditActive(v)}
                  checkedChildren={<CheckCircleOutlined />}
                  unCheckedChildren={<StopOutlined />}
                />
              </div>
              <p className="text-xs text-ds-text-subtle mt-2">
                {displayActive
                  ? "User can log in and submit reports."
                  : "User cannot log in or take any action."}
              </p>
            </div>
          )}

          {isSuperadmin && (
            <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-subtle p-5">
              <p className="text-xs text-ds-text-subtle">
                Superadmin accounts cannot be modified from the user management panel.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

/* ── Recent reports sub-component ────────────────────────────────────────── */

function RecentUserReports({ userId }: { userId: string }) {
  const router = useRouter();

  const { data: reportsPage } = useApiData<{ reports: Report[]; total: number }>(
    API_ROUTES.reports.list,
  );
  const reports = reportsPage?.reports;

  const recent = reports
    ? [...reports]
        .filter(
          (r) =>
            r.submittedById === userId || r.createdById === userId || r.dataEntryById === userId,
        )
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5)
    : [];

  return (
    <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
      <h3 className="text-sm font-semibold text-ds-text-primary mb-4">
        {CONTENT.users.recentReports as string}
      </h3>
      {recent.length === 0 ? (
        <p className="text-sm text-ds-text-subtle">{CONTENT.users.noReports as string}</p>
      ) : (
        <ul className="space-y-2">
          {recent.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between py-2 border-b border-ds-border-subtle last:border-b-0"
            >
              <span className="text-sm text-ds-text-primary truncate max-w-xs">
                {formatReportPeriod(r)}
              </span>
              <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                <Tag>{r.status}</Tag>
                <Button size="small" onClick={() => router.push(APP_ROUTES.reportDetail(r.id))}>
                  {CONTENT.common.view as string}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
