"use client";

/**
 * modules/users/components/UsersListPage.tsx
 * User management — SUPERADMIN only.
 */

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tooltip } from "antd";
import { EyeOutlined } from "@ant-design/icons";
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
import { RoleBadge, ActiveBadge } from "@/components/ui/StatusBadge";
import SearchInput from "@/components/ui/SearchInput";
import { UserRole } from "@/types/global";

const DEFAULT_PAGE_SIZE = 20;

interface Filters {
  search: string;
  role: UserRole | "";
  active: "true" | "false" | "";
}

const DEFAULT_FILTERS: Filters = { search: "", role: "", active: "" };

const ROLE_OPTIONS = Object.values(UserRole).map((r) => ({
  value: r,
  label: CONTENT.users.roles[r as keyof typeof CONTENT.users.roles] ?? r,
}));

export function UsersListPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [currentPage, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data: users } = useApiData<UserProfile[]>(API_ROUTES.users.list);
  const { data: campuses } = useApiData<Campus[]>(API_ROUTES.org.campuses);

  const filtered = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      if (filters.role && u.role !== filters.role) return false;
      if (filters.active !== "") {
        const active = filters.active === "true";
        if (u.isActive !== active) return false;
      }
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

  const columns: ColumnsType<UserProfile> = [
    {
      key: "name",
      title: CONTENT.users.nameLabel as string,
      dataIndex: "firstName",
      render: (_v, u) => (
        <div>
          <p className="text-sm font-medium text-ds-text-primary">
            {u.firstName} {u.lastName}
          </p>
          <p className="text-xs text-ds-text-subtle">{u.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      title: CONTENT.users.roleLabel as string,
      dataIndex: "role",
      width: 160,
      render: (v) => <RoleBadge role={v as UserRole} />,
    },
    {
      key: "campus",
      title: CONTENT.users.campusLabel as string,
      dataIndex: "campusId",
      width: 130,
      render: (v) => {
        const campusName = (campuses ?? []).find((campus) => campus.id === v)?.name;
        return (
          <span className="text-sm text-ds-text-secondary">{campusName ?? String(v ?? "—")}</span>
        );
      },
    },
    {
      key: "status",
      title: CONTENT.users.statusLabel as string,
      dataIndex: "isActive",
      width: 100,
      render: (v) => <ActiveBadge isActive={v as boolean} />,
    },
    {
      key: "actions",
      title: "",
      width: 60,
      render: (_v, u) => (
        <Tooltip title={CONTENT.common.view as string}>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => router.push(APP_ROUTES.userDetail(u.id))}
          />
        </Tooltip>
      ),
    },
  ];

  const isFiltered = filters.role !== "" || filters.active !== "" || filters.search !== "";

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
          value={filters.active}
          onChange={(e) => updateFilter({ active: e.target.value as "true" | "false" | "" })}
          title={CONTENT.users.statusLabel as string}
          aria-label={CONTENT.users.statusLabel as string}
          className="h-9 px-3 rounded-ds-lg border border-ds-border-base bg-ds-surface-elevated text-sm text-ds-text-primary focus:outline-1 focus:outline-ds-brand-accent"
        >
          <option value="">{CONTENT.users.statusLabel as string}</option>
          <option value="true">{CONTENT.users.activeStatus as string}</option>
          <option value="false">{CONTENT.users.inactiveStatus as string}</option>
        </select>
      </FilterToolbar>

      <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base overflow-hidden">
        <Table<UserProfile>
          dataSource={paginated}
          columns={columns}
          rowKey="id"
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
    </PageLayout>
  );
}
