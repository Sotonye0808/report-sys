"use client";

/**
 * modules/org/components/OrgPage.tsx
 * Organisation management — campuses and groups.
 * SUPERADMIN only.
 */

import { useState } from "react";
import { Tabs, Modal, Form, message } from "antd";
import { PlusOutlined, EditOutlined, BankOutlined, ClusterOutlined } from "@ant-design/icons";
import { useApiData } from "@/lib/hooks/useApiData";
import { CONTENT } from "@/config/content";
import { API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PageLayout } from "@/components/ui/PageLayout";
import Table from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { FilterToolbar } from "@/components/ui/FilterToolbar";

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? "harvesters";

/* ── Campus tab ─────────────────────────────────────────────────────────── */

function CampusesTab() {
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<Campus | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const { data: campuses, refetch } = useApiData<Campus[]>(API_ROUTES.org.campuses);

  const filtered = (campuses ?? []).filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    {
      key: "name",
      title: CONTENT.org.campusNameLabel as string,
      render: (row: Campus) => <span className="font-medium text-ds-text-primary">{row.name}</span>,
    },
    {
      key: "location",
      title: CONTENT.org.locationLabel as string,
      render: (row: Campus & { location?: string }) => (
        <span className="text-sm text-ds-text-secondary">{row.location ?? "—"}</span>
      ),
    },
    {
      key: "country",
      title: CONTENT.org.countryLabel as string,
      render: (row: Campus & { country?: string }) => (
        <span className="text-sm text-ds-text-secondary">{row.country ?? "—"}</span>
      ),
    },
    {
      key: "actions",
      title: "",
      width: 80,
      render: (row: Campus) => (
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => {
            setEditTarget(row);
            form.setFieldsValue({
              name: row.name,
              location: (row as Campus & { location?: string }).location ?? "",
              country: (row as Campus & { country?: string }).country ?? "",
            });
          }}
        >
          {CONTENT.common.edit as string}
        </Button>
      ),
    },
  ];

  const handleSave = async (values: { name: string; location: string; country: string }) => {
    setSaving(true);
    try {
      if (editTarget) {
        const res = await fetch(API_ROUTES.org.campus(editTarget.id), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) {
          const j = await res.json();
          message.error(j.error);
          return;
        }
        message.success(CONTENT.common.successSave as string);
        setEditTarget(null);
        refetch();
      } else {
        const res = await fetch(API_ROUTES.org.campuses, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, organisationId: ORG_ID }),
        });
        if (!res.ok) {
          const j = await res.json();
          message.error(j.error);
          return;
        }
        message.success(CONTENT.common.successSave as string);
        setShowCreate(false);
        refetch();
      }
      form.resetFields();
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setSaving(false);
    }
  };

  const openCreate = () => {
    form.resetFields();
    setShowCreate(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FilterToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search campuses…"
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {CONTENT.org.newCampus as string}
        </Button>
      </div>

      {campuses === undefined ? (
        <LoadingSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<BankOutlined />}
          title={CONTENT.org.emptyStateCampuses.title as string}
          description={CONTENT.org.emptyStateCampuses.description as string}
          action={
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {CONTENT.org.newCampus as string}
            </Button>
          }
        />
      ) : (
        <Table dataSource={filtered} columns={columns} rowKey="id" />
      )}

      <Modal
        open={!!(editTarget || showCreate)}
        title={editTarget ? (CONTENT.org.editCampus as string) : (CONTENT.org.newCampus as string)}
        onCancel={() => {
          setEditTarget(null);
          setShowCreate(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={CONTENT.common.save as string}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false}>
          <Form.Item
            name="name"
            label={CONTENT.org.campusNameLabel as string}
            rules={[{ required: true }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item name="location" label={CONTENT.org.locationLabel as string}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="country" label={CONTENT.org.countryLabel as string}>
            <Input size="large" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

/* ── Groups tab ─────────────────────────────────────────────────────────── */

function GroupsTab() {
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<OrgGroup | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const { data: groups, refetch: refetchGroups } = useApiData<OrgGroup[]>(API_ROUTES.org.groups);

  const filtered = (groups ?? []).filter(
    (g) => !search || g.name.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    {
      key: "name",
      title: CONTENT.org.groupNameLabel as string,
      render: (row: OrgGroup) => (
        <span className="font-medium text-ds-text-primary">{row.name}</span>
      ),
    },
    {
      key: "country",
      title: CONTENT.org.countryLabel as string,
      render: (row: OrgGroup & { country?: string }) => (
        <span className="text-sm text-ds-text-secondary">{row.country ?? "—"}</span>
      ),
    },
    {
      key: "actions",
      title: "",
      width: 80,
      render: (row: OrgGroup) => (
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => {
            setEditTarget(row);
            form.setFieldsValue({
              name: row.name,
              country: (row as OrgGroup & { country?: string }).country ?? "",
            });
          }}
        >
          {CONTENT.common.edit as string}
        </Button>
      ),
    },
  ];

  const handleSave = async (values: { name: string; country: string }) => {
    setSaving(true);
    try {
      if (editTarget) {
        const res = await fetch(API_ROUTES.org.group(editTarget.id), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) {
          const j = await res.json();
          message.error(j.error);
          return;
        }
        message.success(CONTENT.common.successSave as string);
        setEditTarget(null);
        refetchGroups();
      } else {
        const res = await fetch(API_ROUTES.org.groups, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, organisationId: ORG_ID }),
        });
        if (!res.ok) {
          const j = await res.json();
          message.error(j.error);
          return;
        }
        message.success(CONTENT.common.successSave as string);
        setShowCreate(false);
        refetchGroups();
      }
      form.resetFields();
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setSaving(false);
    }
  };

  const openCreate = () => {
    form.resetFields();
    setShowCreate(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FilterToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search groups…"
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {CONTENT.org.newGroup as string}
        </Button>
      </div>

      {groups === undefined ? (
        <LoadingSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ClusterOutlined />}
          title={CONTENT.org.emptyStateGroups.title as string}
          description={CONTENT.org.emptyStateGroups.description as string}
          action={
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {CONTENT.org.newGroup as string}
            </Button>
          }
        />
      ) : (
        <Table dataSource={filtered} columns={columns} rowKey="id" />
      )}

      <Modal
        open={!!(editTarget || showCreate)}
        title={editTarget ? (CONTENT.org.editGroup as string) : (CONTENT.org.newGroup as string)}
        onCancel={() => {
          setEditTarget(null);
          setShowCreate(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={CONTENT.common.save as string}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false}>
          <Form.Item
            name="name"
            label={CONTENT.org.groupNameLabel as string}
            rules={[{ required: true }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item name="country" label={CONTENT.org.countryLabel as string}>
            <Input size="large" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

/* ── Tab config ───────────────────────────────────────────────────────────── */

const TAB_ITEMS = [
  {
    key: "campuses",
    label: CONTENT.org.campusesLabel as string,
    children: <CampusesTab />,
  },
  {
    key: "groups",
    label: "Groups",
    children: <GroupsTab />,
  },
];

/* ── OrgPage ──────────────────────────────────────────────────────────────── */

export function OrgPage() {
  return (
    <PageLayout title={CONTENT.org.pageTitle as string}>
      <Tabs items={TAB_ITEMS} defaultActiveKey="campuses" />
    </PageLayout>
  );
}
