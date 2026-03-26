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
import Card from "@/components/ui/Card";
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

  const {
    data: campuses,
    loading: campusesLoading,
    error: campusesError,
    refetch,
  } = useApiData<Campus[]>(API_ROUTES.org.campuses);
  const {
    data: groups,
    loading: groupsLoading,
    error: groupsError,
    refetch: refetchGroups,
  } = useApiData<OrgGroup[]>(API_ROUTES.org.groups);

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
      key: "group",
      title: CONTENT.org.groupNameLabel as string,
      render: (row: Campus & { parentId?: string }) => {
        const group = groups?.find((g) => g.id === row.parentId);
        return <span className="text-sm text-ds-text-secondary">{group?.name ?? "—"}</span>;
      },
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
              groupId: (row as Campus & { parentId?: string }).parentId ?? null,
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

  const handleSave = async (values: {
    name: string;
    location: string;
    country: string;
    groupId?: string | null;
  }) => {
    setSaving(true);
    try {
      if (editTarget) {
        const res = await fetch(API_ROUTES.org.campus(editTarget.id), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            groupId: values.groupId || null,
          }),
        });
        if (!res.ok) {
          const j = await res.json();
          message.error(j.error);
          setSaving(false);
          return;
        }
        message.success(CONTENT.common.successSave as string);
        setEditTarget(null);
        refetch();
      } else {
        const res = await fetch(API_ROUTES.org.campuses, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            organisationId: ORG_ID,
            groupId: values.groupId || null,
          }),
        });
        if (!res.ok) {
          const j = await res.json();
          message.error(j.error);
          setSaving(false);
          return;
        }
        message.success(CONTENT.common.successSave as string);
        setShowCreate(false);
        refetch();
      }
      form.resetFields();
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
      setSaving(false);
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

      {campusesLoading ? (
        <LoadingSkeleton rows={4} />
      ) : campusesError ? (
        <EmptyState
          icon={<BankOutlined />}
          title="Unable to load campuses"
          description={campusesError}
          action={
            <Button type="primary" onClick={refetch}>
              Retry
            </Button>
          }
        />
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
          <Form.Item name="groupId" label={CONTENT.org.groupNameLabel as string}>
            <select
              className="w-full p-2 border border-ds-border-base rounded-ds-lg"
              value={form.getFieldValue("groupId") ?? ""}
              onChange={(e) => form.setFieldsValue({ groupId: e.target.value || null })}
            >
              <option value="">(No group)</option>
              {groups?.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
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

  const {
    data: groups,
    loading: groupsLoading,
    error: groupsError,
    refetch: refetchGroups,
  } = useApiData<OrgGroup[]>(API_ROUTES.org.groups);

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
          setSaving(false);
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
          setSaving(false);
          return;
        }
        message.success(CONTENT.common.successSave as string);
        setShowCreate(false);
        refetchGroups();
      }
      form.resetFields();
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
      setSaving(false);
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

      {groupsLoading ? (
        <LoadingSkeleton rows={4} />
      ) : groupsError ? (
        <EmptyState
          icon={<ClusterOutlined />}
          title="Unable to load groups"
          description={groupsError}
          action={
            <Button type="primary" onClick={refetchGroups}>
              Retry
            </Button>
          }
        />
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

/* ── Hierarchy tab ─────────────────────────────────────────────────────────── */

function HierarchyTab() {
  const {
    data: hierarchy,
    loading: hierarchyLoading,
    error: hierarchyError,
    refetch: refetchHierarchy,
  } = useApiData<OrgGroupWithDetails[]>(API_ROUTES.org.hierarchy);

  if (hierarchyLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  if (hierarchyError) {
    return (
      <EmptyState
        icon={<ClusterOutlined />}
        title="Unable to load hierarchy"
        description={hierarchyError}
        action={
          <Button type="primary" onClick={refetchHierarchy}>
            Retry
          </Button>
        }
      />
    );
  }

  if (!hierarchy || hierarchy.length === 0) {
    return (
      <EmptyState
        icon={<ClusterOutlined />}
        title="No hierarchy data"
        description="No groups and campuses found yet."
      />
    );
  }

  return (
    <div className="space-y-4">
      {hierarchy.map((group) => (
        <Card key={group.id} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold">{group.name}</h3>
              <p className="text-xs text-ds-text-subtle">
                {group.country || "Country not set"} • {group.isActive ? "Active" : "Inactive"}
              </p>
            </div>
            <span className="text-xs text-ds-text-secondary">{group.campuses.length} campuses</span>
          </div>

          {group.campuses.length ? (
            <ul className="space-y-2">
              {group.campuses.map((campus) => (
                <li key={campus.id} className="flex items-center gap-2">
                  <BankOutlined />
                  <span className="font-medium">{campus.name}</span>
                  <span className="text-xs text-ds-text-subtle">
                    {campus.location || "Location n/a"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ds-text-subtle">No campuses in this group.</p>
          )}
        </Card>
      ))}
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
  {
    key: "hierarchy",
    label: "Hierarchy",
    children: <HierarchyTab />,
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
