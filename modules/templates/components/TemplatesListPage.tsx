"use client";

/**
 * modules/templates/components/TemplatesListPage.tsx
 * Template list management — SUPERADMIN only.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tag } from "antd";
import { PlusOutlined, EditOutlined, StarOutlined } from "@ant-design/icons";
import { useMockDbSubscription } from "@/lib/hooks/useMockDbSubscription";
import { mockDb } from "@/lib/data/mockDb";
import { CONTENT } from "@/config/content";
import { APP_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import { PageLayout } from "@/components/ui/PageLayout";
import Table from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { fmtDate } from "@/lib/utils/formatDate";
import { FilterToolbar } from "@/components/ui/FilterToolbar";

type TemplateRow = ReportTemplate & {
  isDefault?: boolean;
  isArchived?: boolean;
  fieldCount?: number;
};

interface ColumnConfig {
  key:     string;
  title:   string;
  render:  (row: TemplateRow) => React.ReactNode;
  width?:  number;
}

const TEMPLATE_COLUMNS: ColumnConfig[] = [
  {
    key:   "name",
    title: CONTENT.templates.nameLabel as string,
    render: (row) => (
      <div>
        <p className="text-sm font-medium text-ds-text-primary">{row.name}</p>
        {row.description && (
          <p className="text-xs text-ds-text-subtle truncate max-w-xs">{row.description}</p>
        )}
      </div>
    ),
  },
  {
    key:   "status",
    title: "Status",
    width: 140,
    render: (row) => (
      <div className="flex gap-1.5 flex-wrap">
        {row.isDefault && (
          <Tag color="gold" icon={<StarOutlined />}>
            {CONTENT.templates.defaultBadge as string}
          </Tag>
        )}
        {row.isArchived && <Tag color="default">Archived</Tag>}
        {!row.isArchived && !row.isDefault && <Tag color="green">Active</Tag>}
      </div>
    ),
  },
  {
    key:   "fields",
    title: "Fields",
    width: 80,
    render: (row) => (
      <span className="text-sm text-ds-text-secondary">
        {row.fieldCount ?? (row as TemplateRow & { fields?: unknown[] }).fields?.length ?? 0}
      </span>
    ),
  },
  {
    key:   "created",
    title: "Created",
    width: 130,
    render: (row) => (
      <span className="text-xs text-ds-text-subtle">
        {fmtDate(row.createdAt)}
      </span>
    ),
  },
];

export function TemplatesListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const templates = useMockDbSubscription<ReportTemplate[]>("reportTemplates", () =>
    mockDb.reportTemplates.findMany({}),
  );

  const filtered = templates
    ? templates
        .filter((t) => {
          const tRow = t as TemplateRow;
          if (!showArchived && tRow.isArchived) return false;
          if (search) {
            const q = search.toLowerCase();
            return (
              t.name.toLowerCase().includes(q) ||
              (t.description?.toLowerCase().includes(q) ?? false)
            );
          }
          return true;
        })
        .sort((a, b) => {
          const aDefault = (a as TemplateRow).isDefault ? -1 : 0;
          const bDefault = (b as TemplateRow).isDefault ? -1 : 0;
          return (
            aDefault - bDefault ||
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        })
    : [];

  const columns = [
    ...TEMPLATE_COLUMNS,
    {
      key:   "actions",
      title: "",
      width: 80,
      render: (row: TemplateRow) => (
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => router.push(APP_ROUTES.templateDetail(row.id))}
        >
          {CONTENT.common.edit as string}
        </Button>
      ),
    },
  ];

  if (templates === undefined) {
    return (
      <PageLayout title={CONTENT.templates.pageTitle as string}>
        <LoadingSkeleton rows={5} />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={CONTENT.templates.pageTitle as string}
      actions={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push(APP_ROUTES.templateNew)}
        >
          {CONTENT.templates.newTemplate as string}
        </Button>
      }
    >
      <div className="space-y-4">
        <FilterToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search templates…"
          filters={[
            {
              key:      "showArchived",
              label:    "Show archived",
              type:     "checkbox",
              value:    showArchived,
              onChange: (v) => setShowArchived(v as boolean),
            },
          ]}
        />

        {filtered.length === 0 ? (
          <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-8">
            <EmptyState
              icon={<EditOutlined />}
              title={CONTENT.templates.emptyState.title as string}
              description={CONTENT.templates.emptyState.description as string}
              action={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => router.push(APP_ROUTES.templateNew)}
                >
                  {CONTENT.templates.newTemplate as string}
                </Button>
              }
            />
          </div>
        ) : (
          <Table dataSource={filtered} columns={columns} rowKey="id" />
        )}
      </div>
    </PageLayout>
  );
}
