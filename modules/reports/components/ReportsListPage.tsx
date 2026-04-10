"use client";

/**
 * modules/reports/components/ReportsListPage.tsx
 *
 * Unified role-aware reports list.
 */

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Select, message } from "antd";
import {
  PlusOutlined,
  LockOutlined,
  EyeOutlined,
  EditOutlined,
  DownloadOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
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
import { ExportDialog } from "./ExportDialog";
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

const DEFAULT_PAGE_SIZE = 20;
const BULK_ACTION_CHUNK_SIZE = 10;
const BULK_ACTION_TIMEOUT_MS = 12_000;

type BulkActionType = "submit" | "request-edits" | "approve" | "review" | "lock";

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
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [exportOpen, setExportOpen] = useState(false);
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<BulkActionType | undefined>(undefined);
  const [bulkLoading, setBulkLoading] = useState(false);

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

  const reportsUrl = useMemo(() => {
    if (!user) return null;
    const params = new URLSearchParams({ all: "true" });
    if (visibilityScope === "campus" && user.campusId) {
      params.set("campusId", user.campusId);
    }
    return `${API_ROUTES.reports.list}?${params.toString()}`;
  }, [user, visibilityScope]);
  const { data: reportsPage, refetch: refetchReports } = useApiData<{ reports: Report[]; total: number }>(
    reportsUrl,
  );
  const allReports = reportsPage?.reports;

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
    const start = (page - 1) * pageSize;
    return filteredReports.slice(start, start + pageSize);
  }, [filteredReports, page, pageSize]);

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
            {/* Only show period if not already included in the label (i.e., if title is used, skip period) */}
            {!(r.title && r.title.trim().length > 0) && (
              <p className="text-xs text-ds-text-subtle mt-0.5">{formatReportPeriod(r)}</p>
            )}
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

  useEffect(() => {
    if (!filteredReports) return;
    const filteredIds = new Set(filteredReports.map((r) => r.id));
    setSelectedReportIds((prev) => prev.filter((id) => filteredIds.has(id)));
  }, [filteredReports]);

  const selectedReports = useMemo(() => {
    if (!filteredReports || selectedReportIds.length === 0) return [];
    const selectedSet = new Set(selectedReportIds);
    return filteredReports.filter((report) => selectedSet.has(report.id));
  }, [filteredReports, selectedReportIds]);

  const bulkActionOptions = [
    ...(can.submitReports || isSuperadmin
      ? [{ value: "submit" as const, label: CONTENT.reports.actions?.submit ?? "Submit" }]
      : []),
    ...(can.requestEdits || isSuperadmin
      ? [{ value: "request-edits" as const, label: "Mark Requires Edits" }]
      : []),
    ...(can.approveReports || isSuperadmin
      ? [{ value: "approve" as const, label: CONTENT.reports.actions?.approve ?? "Approve" }]
      : []),
    ...(can.markReviewed || isSuperadmin
      ? [{ value: "review" as const, label: CONTENT.reports.actions?.review ?? "Mark Reviewed" }]
      : []),
    ...(can.lockReports || isSuperadmin
      ? [{ value: "lock" as const, label: CONTENT.reports.actions?.lock ?? "Lock" }]
      : []),
  ];

  const applyBulkAction = async () => {
    if (!bulkAction) {
      message.warning("Select a bulk action first.");
      return;
    }
    if (selectedReports.length === 0) {
      message.warning("Select at least one report.");
      return;
    }

    const getEndpoint = (reportId: string) => {
      switch (bulkAction) {
        case "submit":
          return API_ROUTES.reports.submit(reportId);
        case "request-edits":
          return API_ROUTES.reports.requestEdit(reportId);
        case "approve":
          return API_ROUTES.reports.approve(reportId);
        case "review":
          return API_ROUTES.reports.review(reportId);
        case "lock":
          return API_ROUTES.reports.lock(reportId);
        default: {
          const unreachableAction: never = bulkAction;
          throw new Error(`Unsupported bulk action: ${String(unreachableAction)}`);
        }
      }
    };

    const isEligible = (report: Report) => {
      if (bulkAction === "submit") {
        return (
          report.status === ReportStatus.DRAFT || report.status === ReportStatus.REQUIRES_EDITS
        );
      }
      if (bulkAction === "request-edits") return report.status === ReportStatus.SUBMITTED;
      if (bulkAction === "approve") return report.status === ReportStatus.SUBMITTED;
      if (bulkAction === "review") return report.status === ReportStatus.APPROVED;
      return report.status === ReportStatus.REVIEWED;
    };

    const targetReports = selectedReports.filter(isEligible);
    const skipped = selectedReports.length - targetReports.length;
    if (targetReports.length === 0) {
      message.warning(
        skipped > 0
          ? "No selected reports are eligible for that action. Deselect ineligible items and try again."
          : "No selected reports are eligible for that action.",
      );
      return;
    }

    const runAction = async (report: Report) => {
      const endpoint = getEndpoint(report.id);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), BULK_ACTION_TIMEOUT_MS);
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body:
            bulkAction === "request-edits"
              ? JSON.stringify({
                  reason: "Bulk action: report requires edits.",
                })
              : undefined,
          signal: controller.signal,
        });
        if (!response.ok) {
          const json = await response.json().catch(() => ({}));
          throw new Error(json.error ?? `Request failed (${response.status})`);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          throw new Error(`Bulk action timed out for report ${report.id}.`);
        }
        throw error;
      } finally {
        clearTimeout(timeout);
      }
    };

    setBulkLoading(true);
    let succeeded = 0;
    const successfulIds = new Set<string>();
    let failed = 0;
    for (let index = 0; index < targetReports.length; index += BULK_ACTION_CHUNK_SIZE) {
      const chunk = targetReports.slice(index, index + BULK_ACTION_CHUNK_SIZE);
      const chunkResults = await Promise.allSettled(chunk.map((report) => runAction(report)));
      chunkResults.forEach((result, chunkIndex) => {
        if (result.status === "fulfilled") {
          succeeded += 1;
          successfulIds.add(chunk[chunkIndex].id);
        } else {
          failed += 1;
        }
      });
    }
    setBulkLoading(false);

    if (succeeded > 0) {
      await refetchReports();
      setSelectedReportIds((prev) => prev.filter((id) => !successfulIds.has(id)));
    }

    if (failed > 0) {
      message.warning(
        `Bulk action completed: ${succeeded} succeeded, ${failed} failed${
          skipped > 0 ? `, ${skipped} skipped (not eligible)` : ""
        }.`,
      );
    } else {
      message.success(
        `Bulk action completed for ${succeeded} report(s)${
          skipped > 0 ? `, ${skipped} skipped (not eligible)` : ""
        }.`,
      );
    }
  };

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
            {can.createReports && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => router.push(APP_ROUTES.reportNew)}
              >
                {CONTENT.reports.newReport}
              </Button>
            )}
            <Button
              icon={<DatabaseOutlined />}
              onClick={() => router.push(APP_ROUTES.reportAggregate)}
            >
              Aggregate
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => setExportOpen(true)}
              disabled={!filteredReports || filteredReports.length === 0}
            >
              {(CONTENT.reports as unknown as Record<string, Record<string, string>>).export
                ?.button ?? "Export"}
            </Button>
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

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button
          size="small"
          onClick={() => setSelectedReportIds((filteredReports ?? []).map((report) => report.id))}
          disabled={!filteredReports || filteredReports.length === 0}
        >
          Select all
        </Button>
        <Button
          size="small"
          onClick={() => {
            const allIds = (filteredReports ?? []).map((report) => report.id);
            const selectedSet = new Set(selectedReportIds);
            setSelectedReportIds(allIds.filter((id) => !selectedSet.has(id)));
          }}
          disabled={!filteredReports || filteredReports.length === 0}
        >
          Invert selection
        </Button>
        <Button
          size="small"
          onClick={() => setSelectedReportIds([])}
          disabled={selectedReportIds.length === 0}
        >
          Clear selection
        </Button>
        <Select
          size="small"
          placeholder="Bulk action"
          style={{ minWidth: 200 }}
          options={bulkActionOptions}
          value={bulkAction}
          onChange={(value) => setBulkAction(value)}
        />
        <Button
          size="small"
          type="primary"
          onClick={applyBulkAction}
          loading={bulkLoading}
          disabled={selectedReportIds.length === 0 || !bulkAction}
        >
          Apply
        </Button>
        <span className="text-xs text-ds-text-subtle">{selectedReportIds.length} selected</span>
      </div>

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
            rowSelection={{
              selectedRowKeys: selectedReportIds,
              preserveSelectedRowKeys: true,
              onChange: (keys) => setSelectedReportIds(keys as string[]),
            }}
            emptyTitle={CONTENT.reports.emptyState.title}
            emptyDescription={CONTENT.reports.emptyState.description}
            onRow={(record) => ({
              onClick: (event) => {
                const target = event.target as HTMLElement;
                if (
                  target.closest(
                    "button, a, input, label, .ant-checkbox-wrapper, .ant-checkbox, .ant-select",
                  )
                ) {
                  return;
                }
                router.push(APP_ROUTES.reportDetail(record.id));
              },
              style: { cursor: "pointer" },
            })}
          />
          {total > pageSize && (
            <Pagination
              total={total}
              page={page}
              pageSize={pageSize}
              onPageChange={(nextPage, nextPageSize) => {
                if (nextPageSize !== pageSize) {
                  setPageSize(nextPageSize);
                  setPage(1);
                  return;
                }
                setPage(nextPage);
              }}
            />
          )}
        </>
      )}

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        reports={filteredReports ?? []}
        selectedReports={selectedReports}
        templates={templates ?? []}
        campuses={campuses ?? []}
      />
    </PageLayout>
  );
}
