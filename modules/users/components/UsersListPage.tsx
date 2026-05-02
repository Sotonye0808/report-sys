"use client";

/**
 * modules/users/components/UsersListPage.tsx
 * User management — SUPERADMIN only.
 */

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tooltip, Tag } from "antd";
import { EyeOutlined, UserSwitchOutlined } from "@ant-design/icons";
import { useAuth } from "@/providers/AuthProvider";
import { ImpersonationStartDialog } from "@/modules/admin-config/components/ImpersonationStartDialog";
import type { ColumnsType } from "antd/es/table";
import { useApiData } from "@/lib/hooks/useApiData";
import { API_ROUTES } from "@/config/routes";
import { CONTENT } from "@/config/content";
import { APP_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import { FilterToolbar } from "@/components/ui/FilterToolbar";
import { Table } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { PageLayout } from "@/components/ui/PageLayout";
import { RoleBadge } from "@/components/ui/StatusBadge";
import SearchInput from "@/components/ui/SearchInput";
import { UserRole } from "@/types/global";

const DEFAULT_PAGE_SIZE = 20;

type DirectoryStatus = "ACTIVE" | "INACTIVE" | "ACTIVATION_PENDING" | "PENDING_INVITE";

interface DirectoryRow {
  id: string;
  source: "user" | "invite";
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole | null;
  status: DirectoryStatus;
  campusId?: string | null;
  orgGroupId?: string | null;
  createdAt: string;
  inviteExpiresAt?: string;
  activationExpiresAt?: string;
}

interface Filters {
  search: string;
  role: UserRole | "";
  status: DirectoryStatus | "";
}

const DEFAULT_FILTERS: Filters = { search: "", role: "", status: "" };
const STATUS_LABELS = ((CONTENT.usersList as unknown) as Record<string, Record<string, string>>).statusLabels ?? {};
const STATUS_COLORS = ((CONTENT.usersList as unknown) as Record<string, Record<string, string>>).statusColors ?? {};

const ROLE_OPTIONS = Object.values(UserRole).map((r) => ({
  value: r,
  label: CONTENT.users.roles[r as keyof typeof CONTENT.users.roles] ?? r,
}));

const IMPERSONATION_COPY = ((CONTENT.impersonation ?? {}) as Record<string, unknown>);

export function UsersListPage() {
  const { user: currentUser } = useAuth();
  const [impersonationTarget, setImpersonationTarget] = useState<{ role: UserRole; userId: string } | null>(null);
  const canImpersonate = (currentUser?.actualRole ?? currentUser?.role) === UserRole.SUPERADMIN;
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [currentPage, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data: users } = useApiData<DirectoryRow[]>(`${API_ROUTES.users.list}?includeInvited=true`);
  const { data: campuses } = useApiData<Campus[]>(API_ROUTES.org.campuses);
  const campusNamesById = useMemo(
    () => new Map((campuses ?? []).map((campus) => [campus.id, campus.name])),
    [campuses],
  );

  const filtered = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      if (filters.role && u.role !== filters.role) return false;
      if (filters.status !== "" && u.status !== filters.status) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
        if (!fullName.includes(q) && !u.email.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [users, filters]);

  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize],
  );

  const updateFilter = useCallback((patch: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }, []);

  const columns: ColumnsType<DirectoryRow> = [
    {
      key: "name",
      title: CONTENT.users.nameLabel as string,
      dataIndex: "firstName",
      render: (_v, u) => {
        const name = `${u.firstName} ${u.lastName}`.trim();
        return (
          <div>
            <p className="text-sm font-medium text-ds-text-primary">
              {name || (u.source === "invite" ? "—" : u.email)}
            </p>
            <p className="text-xs text-ds-text-subtle">{u.email}</p>
          </div>
        );
      },
    },
    {
      key: "role",
      title: CONTENT.users.roleLabel as string,
      dataIndex: "role",
      width: 160,
      render: (v) => (v ? <RoleBadge role={v as UserRole} /> : <span className="text-ds-text-subtle text-xs">—</span>),
    },
    {
      key: "campus",
      title: CONTENT.users.campusLabel as string,
      dataIndex: "campusId",
      width: 130,
      render: (v) => {
        const campusName = campusNamesById.get(v as string);
        return (
          <span className="text-sm text-ds-text-secondary">{campusName ?? String(v ?? "—")}</span>
        );
      },
    },
    {
      key: "status",
      title: CONTENT.users.statusLabel as string,
      dataIndex: "status",
      width: 160,
      render: (v) => {
        const key = v as DirectoryStatus;
        return <Tag color={STATUS_COLORS[key] ?? "default"}>{STATUS_LABELS[key] ?? key}</Tag>;
      },
    },
    {
      key: "actions",
      title: "",
      width: 60,
      render: (_v, u) =>
        u.source === "user" ? (
          <div className="flex items-center gap-1">
            <Tooltip title={CONTENT.common.view as string}>
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => router.push(APP_ROUTES.userDetail(u.id))}
              />
            </Tooltip>
            {canImpersonate && u.role && u.role !== UserRole.SUPERADMIN && u.status === "ACTIVE" && (
              <Tooltip title={(IMPERSONATION_COPY.rowActionLabel as string) ?? "Preview as this user"}>
                <Button
                  type="text"
                  size="small"
                  icon={<UserSwitchOutlined />}
                  onClick={() => setImpersonationTarget({ role: u.role as UserRole, userId: u.id })}
                />
              </Tooltip>
            )}
          </div>
        ) : null,
    },
  ];

  const isFiltered = filters.role !== "" || filters.status !== "" || filters.search !== "";

  return (
    <PageLayout title={CONTENT.users.pageTitle as string}>
      <FilterToolbar
        label={CONTENT.common.filter as string}
        isFiltered={isFiltered}
        onReset={() => {
          setFilters(DEFAULT_FILTERS);
          setPage(1);
        }}
        extra={
          <SearchInput
            placeholder={CONTENT.users.searchPlaceholder as string}
            value={filters.search}
            onChange={(e) => updateFilter({ search: (e.target as HTMLInputElement).value })}
            onSearch={(v) => updateFilter({ search: v })}
          />
        }
      >
        <select
          value={filters.role}
          onChange={(e) => updateFilter({ role: e.target.value as UserRole | "" })}
          title={CONTENT.users.roleLabel as string}
          aria-label={CONTENT.users.roleLabel as string}
          className="h-9 px-3 rounded-ds-lg border border-ds-border-base bg-ds-surface-elevated text-sm text-ds-text-primary focus:outline-1 focus:outline-ds-brand-accent"
        >
          <option value="">{CONTENT.users.roleLabel as string}</option>
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => updateFilter({ status: e.target.value as DirectoryStatus | "" })}
          title={CONTENT.users.statusLabel as string}
          aria-label={CONTENT.users.statusLabel as string}
          className="h-9 px-3 rounded-ds-lg border border-ds-border-base bg-ds-surface-elevated text-sm text-ds-text-primary focus:outline-1 focus:outline-ds-brand-accent"
        >
          <option value="">
            {((CONTENT.usersList as unknown) as Record<string, string>).filterAll ?? "All"}
          </option>
          {(Object.keys(STATUS_LABELS) as DirectoryStatus[]).map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </FilterToolbar>
      <p className="text-xs text-ds-text-subtle mb-3 mt-1">
        {((CONTENT.usersList as unknown) as Record<string, string>).directoryHint ?? ""}
      </p>

      <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base overflow-hidden">
        <Table<DirectoryRow>
          dataSource={paginated}
          columns={columns}
          rowKey={(row) => `${row.source}:${row.id}`}
          loading={users === undefined}
          pagination={false}
          scroll={{ x: 600 }}
          emptyDescription={CONTENT.users.emptyState.description as string}
        />
        {filtered.length > pageSize && (
          <div className="border-t border-ds-border-base px-4 py-3">
            <Pagination
              page={currentPage}
              pageSize={pageSize}
              total={filtered.length}
              onPageChange={(nextPage, nextPageSize) => {
                if (nextPageSize !== pageSize) {
                  setPageSize(nextPageSize);
                  setPage(1);
                  return;
                }
                setPage(nextPage);
              }}
            />
          </div>
        )}
      </div>
      {canImpersonate && (
        <ImpersonationStartDialog
          open={Boolean(impersonationTarget)}
          onClose={() => setImpersonationTarget(null)}
          presetRole={impersonationTarget?.role}
          presetUserId={impersonationTarget?.userId}
        />
      )}
    </PageLayout>
  );
}
