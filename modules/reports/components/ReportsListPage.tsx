"use client";

/**
 * modules/reports/components/ReportsListPage.tsx
 *
 * Unified role-aware reports list.
 */

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Select } from "antd";
import { PlusOutlined, LockOutlined, EyeOutlined, EditOutlined } from "@ant-design/icons";
import { useAuth } from "@/providers/AuthProvider";
import { useRole } from "@/lib/hooks/useRole";
import { useApiData } from "@/lib/hooks/useApiData";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import { ROLE_CONFIG } from "@/config/roles";
import { getReportLabel, formatReportPeriod } from "@/lib/utils/reportUtils";
import { fmtDate } from "@/lib/utils/formatDate";
import Button from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import { ReportStatusBadge } from "@/components/ui/StatusBadge";
import { FilterToolbar } from "@/components/ui/FilterToolbar";
import { SearchInput } from "@/components/ui/SearchInput";
import { Table } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { UserRole, ReportStatus } from "@/types/global";
import type { ColumnsType } from "antd/es/table";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface ColumnConfig {
  key: string;
  /** allowedRoles: roles that can see this column */
  allowedRoles: UserRole[];
  antColumn: NonNullable<ColumnsType<Report>[number]>;
}

interface Filters {
  search: string;
  status: ReportStatus | "";
  campusId: string;
  periodYear: string;
}

const PAGE_SIZE = 20;

/* ── Status options ───────────────────────────────────────────────────────── */

const STATUS_OPTIONS = Object.values(ReportStatus).map((s) => ({
  value: s,
  label: CONTENT.reports.status[s] ?? s,
}));

const ALL_ROLES = Object.values(UserRole);
const MULTI_CAMPUS_ROLES: UserRole[] = [
  UserRole.SUPERADMIN,
  UserRole.CEO,
  UserRole.SPO,
  UserRole.CHURCH_MINISTRY,
  UserRole.CAMPUS_PASTOR,
  UserRole.CAMPUS_ADMIN,
];

/* ── ReportsListPage ──────────────────────────────────────────────────────── */

export function ReportsListPage() {
  const { user } = useAuth();
  const { role, can } = useRole();
  const router = useRouter();

  const isSuperadmin = role === UserRole.SUPERADMIN;
  const visibilityScope = role ? (ROLE_CONFIG[role].reportVisibilityScope ?? "own") : "own";
  const showCampusColumn = role ? MULTI_CAMPUS_ROLES.includes(role) : false;

  /* ── Filter state ───────────────────────────────────────────────────────── */

  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    campusId: "",
    periodYear: "",
  });
  const [page, setPage] = useState(1);

  function updateFilter(patch: Partial<Filters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }

  function resetFilters() {
    setFilters({ search: "", status: "", campusId: "", periodYear: "" });
    setPage(1);
  }

  const isFiltered = Object.values(filters).some(Boolean);

  /* ── Data subscriptions ─────────────────────────────────────────────────── */

  const reportsUrl = user
    ? visibilityScope === "campus" && user.campusId
      ? `${API_ROUTES.reports.list}?campusId=${user.campusId}`
      : API_ROUTES.reports.list
    : null;
  const { data: allReports } = useApiData<Report[]>(reportsUrl);

  const { data: templates } = useApiData<ReportTemplate[]>(API_ROUTES.reportTemplates.list);

  const { data: campuses } = useApiData<Campus[]>(API_ROUTES.org.campuses);

  /* ── Scope + client-side filtering ─────────────────────────────────────── */

  const filteredReports = useMemo(() => {
    if (!allReports) return undefined;

    let result = allReports;

    // "own" scope — reports belonging to the user's org group
    if (visibilityScope === "own" && user) {
      result = result.filter((r) => r.orgGroupId === user.orgGroupId);
    }

    // Status filter
    if (filters.status) {
      result = result.filter((r) => r.status === filters.status);
    }

    // Campus filter
    if (filters.campusId) {
      result = result.filter((r) => r.campusId === filters.campusId);
    }

    // Period year filter
    if (filters.periodYear) {
      const year = parseInt(filters.periodYear, 10);
      result = result.filter((r) => r.periodYear === year);
    }

    // Search — across template name + period label
    const q = filters.search.trim().toLowerCase();
    if (q && templates) {
      result = result.filter((r) => {
        const label = getReportLabel(r, templates).toLowerCase();
        return label.includes(q);
      });
    }

    return result;
  }, [allReports, filters, visibilityScope, user, templates]);

  /* ── Pagination ─────────────────────────────────────────────────────────── */

  const total = filteredReports?.length ?? 0;
  const pagedReports = useMemo(() => {
    if (!filteredReports) return [];
    const start = (page - 1) * PAGE_SIZE;
    return filteredReports.slice(start, start + PAGE_SIZE);
  }, [filteredReports, page]);

  /* ── Column config ──────────────────────────────────────────────────────── */

  const COLUMN_CONFIGS: ColumnConfig[] = [
    {
      key: "report",
      allowedRoles: ALL_ROLES,
      antColumn: {
        title: CONTENT.reports.columnLabels?.report ?? "Report",
        key: "report",
        render: (_: unknown, r: Report) => (
          <div>
            <p className="text-sm font-medium text-ds-text-primary leading-snug">
              {getReportLabel(r, templates ?? [])}
            </p>
            <p className="text-xs text-ds-text-subtle mt-0.5">{formatReportPeriod(r)}</p>
          </div>
        ),
      },
    },
    {
      key: "campus",
      allowedRoles: MULTI_CAMPUS_ROLES,
      antColumn: {
        title: CONTENT.reports.columnLabels?.campus ?? "Campus",
        key: "campus",
        render: (_: unknown, r: Report) => {
          const campus = (campuses ?? []).find((c) => c.id === r.campusId);
          return (
            <span className="text-sm text-ds-text-secondary">{campus?.name ?? r.campusId}</span>
          );
        },
      },
    },
    {
      key: "status",
      allowedRoles: ALL_ROLES,
      antColumn: {
        title: CONTENT.reports.columnLabels?.status ?? "Status",
        key: "status",
        render: (_: unknown, r: Report) => <ReportStatusBadge status={r.status} />,
      },
    },
    {
      key: "deadline",
      allowedRoles: ALL_ROLES,
      antColumn: {
        title: CONTENT.reports.columnLabels?.deadline ?? "Deadline",
        dataIndex: "deadline",
        key: "deadline",
        render: (v: string) => <span className="text-sm text-ds-text-secondary">{fmtDate(v)}</span>,
      },
    },
    {
      key: "actions",
      allowedRoles: ALL_ROLES,
      antColumn: {
        title: CONTENT.reports.columnLabels?.actions ?? "Actions",
        key: "actions",
        align: "right" as const,
        render: (_: unknown, r: Report) => (
          <div className="flex items-center gap-2 justify-end">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => router.push(APP_ROUTES.reportDetail(r.id))}
            >
              {CONTENT.common.view}
            </Button>
            {can.fillReports &&
              (r.status === ReportStatus.DRAFT || r.status === ReportStatus.REQUIRES_EDITS) && (
                <Button
                  size="small"
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => router.push(APP_ROUTES.reportEdit(r.id))}
                >
                  {CONTENT.common.edit}
                </Button>
              )}
            {can.lockReports && r.status === ReportStatus.APPROVED && (
              <Button
                size="small"
                danger
                icon={<LockOutlined />}
                onClick={() => router.push(APP_ROUTES.reportDetail(r.id))}
              >
                {CONTENT.reports.actions?.lock ?? "Lock"}
              </Button>
            )}
          </div>
        ),
      },
    },
  ];

  const visibleColumns = COLUMN_CONFIGS.filter(
    (col) => !role || col.allowedRoles.includes(role),
  ).map((col) => col.antColumn);

  /* ── Loading guard ──────────────────────────────────────────────────────── */

  if (!user || !role) return <LoadingSkeleton rows={3} />;

  /* ── Filter toolbar items ───────────────────────────────────────────────── */

  const filterItems = [
    {
      key: "status",
      label: CONTENT.reports.filterLabels?.status ?? "Status",
      node: (
        <Select
          value={filters.status || undefined}
          onChange={(v) => updateFilter({ status: v ?? "" })}
          placeholder={CONTENT.common.all}
          allowClear
          style={{ minWidth: 160 }}
          options={STATUS_OPTIONS}
          size="small"
        />
      ),
    },
    ...(showCampusColumn
      ? [
          {
            key: "campus",
            label: CONTENT.reports.filterLabels?.campus ?? "Campus",
            node: (
              <Select
                value={filters.campusId || undefined}
                onChange={(v) => updateFilter({ campusId: v ?? "" })}
                placeholder={CONTENT.common.all}
                allowClear
                style={{ minWidth: 160 }}
                options={(campuses ?? []).map((c) => ({ value: c.id, label: c.name }))}
                size="small"
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <PageLayout>
      <PageHeader
        title={CONTENT.reports.pageTitle as string}
        actions={
          <div className="flex gap-2">
            {can.fillReports && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => router.push(APP_ROUTES.reportNew)}
              >
                {CONTENT.reports.newReport}
              </Button>
            )}
          </div>
        }
      />

      <FilterToolbar
        filters={filterItems}
        onReset={isFiltered ? resetFilters : undefined}
        extra={
          <SearchInput
            value={filters.search}
            onChange={(e) => updateFilter({ search: e.target.value })}
            placeholder={CONTENT.reports.searchPlaceholder}
            style={{ width: 220 }}
            size="small"
          />
        }
      />

      {filteredReports === undefined ? (
        <LoadingSkeleton rows={8} />
      ) : (
        <>
          <Table<Report>
            dataSource={pagedReports}
            columns={visibleColumns}
            rowKey="id"
            loading={false}
            pagination={false}
            scroll={{ x: 700 }}
            emptyTitle={CONTENT.reports.emptyState.title}
            emptyDescription={CONTENT.reports.emptyState.description}
          />
          {total > PAGE_SIZE && (
            <Pagination
              total={total}
              page={page}
              pageSize={PAGE_SIZE}
              onPageChange={(p) => setPage(p)}
            />
          )}
        </>
      )}
    </PageLayout>
  );
}
