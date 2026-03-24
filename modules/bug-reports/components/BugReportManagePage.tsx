"use client";

import { useState, useEffect, useCallback } from "react";
import { Select, Tag, message, Modal, Input as AntInput } from "antd";
import { BugOutlined } from "@ant-design/icons";
import { CONTENT } from "@/config/content";
import { API_ROUTES } from "@/config/routes";
import { BugReportStatus } from "@/types/global";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import Table from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

const STATUS_COLOR_MAP: Record<BugReportStatus, string> = {
  [BugReportStatus.OPEN]: "red",
  [BugReportStatus.IN_PROGRESS]: "orange",
  [BugReportStatus.RESOLVED]: "green",
  [BugReportStatus.CLOSED]: "default",
};

const STATUS_OPTIONS = Object.values(BugReportStatus).map((s) => ({
  value: s,
  label: (CONTENT.bugReports.statuses as Record<string, string>)[s],
}));

export function BugReportManagePage() {
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailReport, setDetailReport] = useState<BugReport | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBugReports = useCallback(async () => {
    try {
      const res = await fetch(API_ROUTES.bugReports.list);
      const json = await res.json();
      if (json.success) {
        setBugReports(Array.isArray(json.data?.bugReports) ? json.data.bugReports : []);
      }
    } catch {
      /* no-op */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBugReports();
  }, [fetchBugReports]);

  const handleStatusChange = async (id: string, status: BugReportStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch(API_ROUTES.bugReports.detail(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      message.success(CONTENT.bugReports.updateSuccess as string);
      fetchBugReports();
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!detailReport) return;
    setUpdatingId(detailReport.id);
    try {
      const res = await fetch(API_ROUTES.bugReports.detail(detailReport.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      message.success(CONTENT.bugReports.updateSuccess as string);
      setDetailReport(null);
      fetchBugReports();
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    {
      title: CONTENT.bugReports.categoryLabel as string,
      dataIndex: "category",
      key: "category",
      render: (cat: string) =>
        (CONTENT.bugReports.categories as Record<string, string>)[cat] ?? cat,
    },
    {
      title: CONTENT.bugReports.descriptionLabel as string,
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      width: 300,
    },
    {
      title: CONTENT.bugReports.emailLabel as string,
      dataIndex: "contactEmail",
      key: "contactEmail",
    },
    {
      title: CONTENT.bugReports.statusLabel as string,
      dataIndex: "status",
      key: "status",
      render: (status: BugReportStatus, record: BugReport) => (
        <Select
          value={status}
          onChange={(val) => handleStatusChange(record.id, val)}
          options={STATUS_OPTIONS}
          size="small"
          loading={updatingId === record.id}
          style={{ width: 140 }}
        />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 80,
      render: (_: unknown, record: BugReport) => (
        <Tag
          className="cursor-pointer"
          color="blue"
          onClick={() => {
            setDetailReport(record);
            setAdminNotes(record.adminNotes ?? "");
          }}
        >
          {CONTENT.common.view}
        </Tag>
      ),
    },
  ];

  if (loading) return <LoadingSkeleton rows={6} />;

  return (
    <PageLayout>
      <PageHeader title={CONTENT.bugReports.managePageTitle as string} icon={<BugOutlined />} />

      {bugReports.length === 0 ? (
        <EmptyState
          title={(CONTENT.bugReports.emptyState as Record<string, string>).title}
          description={(CONTENT.bugReports.emptyState as Record<string, string>).description}
        />
      ) : (
        <Table dataSource={bugReports} columns={columns} rowKey="id" />
      )}

      <Modal
        open={!!detailReport}
        onCancel={() => setDetailReport(null)}
        title={CONTENT.bugReports.categoryLabel as string}
        onOk={handleSaveNotes}
        okText={CONTENT.common.save}
        confirmLoading={!!updatingId}
      >
        {detailReport && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-ds-text-subtle uppercase mb-1">
                {CONTENT.bugReports.categoryLabel as string}
              </p>
              <Tag color={STATUS_COLOR_MAP[detailReport.status]}>
                {(CONTENT.bugReports.categories as Record<string, string>)[detailReport.category]}
              </Tag>
            </div>
            <div>
              <p className="text-xs font-medium text-ds-text-subtle uppercase mb-1">
                {CONTENT.bugReports.descriptionLabel as string}
              </p>
              <p className="text-sm text-ds-text-primary whitespace-pre-wrap">
                {detailReport.description}
              </p>
            </div>
            {detailReport.screenshotUrl && (
              <div>
                <p className="text-xs font-medium text-ds-text-subtle uppercase mb-1">
                  {CONTENT.bugReports.screenshotLabel as string}
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={detailReport.screenshotUrl}
                  alt="Bug screenshot"
                  className="rounded-ds-lg border border-ds-border-base max-w-full"
                />
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-ds-text-subtle uppercase mb-1">
                {CONTENT.bugReports.emailLabel as string}
              </p>
              <p className="text-sm text-ds-text-primary">{detailReport.contactEmail}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-ds-text-subtle uppercase mb-1">
                {CONTENT.bugReports.adminNotesLabel as string}
              </p>
              <AntInput.TextArea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={CONTENT.bugReports.adminNotesPlaceholder as string}
                rows={3}
              />
            </div>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}
