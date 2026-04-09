"use client";

/**
 * modules/org/components/OrgPage.tsx
 * Organisation management — campuses and groups.
 * SUPERADMIN only.
 */

import { useState } from "react";
import { Tabs, Modal, Form, message, Checkbox } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  BankOutlined,
  ClusterOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useApiData } from "@/lib/hooks/useApiData";
import { useFormPersistence } from "@/lib/hooks/useFormPersistence";
import { CONTENT } from "@/config/content";
import { API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { FormDraftBanner } from "@/components/ui/FormDraftBanner";
import { PageLayout } from "@/components/ui/PageLayout";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { FilterToolbar } from "@/components/ui/FilterToolbar";
import { apiMutation } from "@/lib/utils/apiMutation";

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? "harvesters";

type OrgBulkAction = "create" | "update" | "delete";
type InteractiveCampus = {
  id: string;
  statusId?: string;
  name: string;
  country: string;
  location: string;
  isActive: boolean;
  action: OrgBulkAction;
};
type InteractiveGroup = {
  id: string;
  name: string;
  country: string;
  isActive: boolean;
  leaderId?: string;
  action: OrgBulkAction;
  campuses: InteractiveCampus[];
};

type OrgBulkOp = {
  type: "group" | "campus";
  action: OrgBulkAction;
  data: Record<string, any>;
};

interface HierarchyBulkDraft {
  interactiveBulk: boolean;
  interactiveGroups: InteractiveGroup[];
  bulkText: string;
  bulkDryRun: boolean;
}

interface OrgBulkSendResult {
  dryRun: boolean;
  results: Array<{ index: number; success: boolean; message: string; id?: string }>;
}

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
        const result = await apiMutation<Campus, Record<string, unknown>>(
          API_ROUTES.org.campus(editTarget.id),
          {
            method: "PUT",
            body: {
              ...values,
              groupId: values.groupId || null,
            },
          },
        );
        if (!result.ok) {
          message.error(result.error ?? (CONTENT.errors as Record<string, string>).generic);
          return;
        }
        message.success(CONTENT.common.successSave as string);
        setEditTarget(null);
        refetch();
      } else {
        const result = await apiMutation<Campus, Record<string, unknown>>(API_ROUTES.org.campuses, {
          method: "POST",
          body: {
            ...values,
            organisationId: ORG_ID,
            groupId: values.groupId || null,
          },
        });
        if (!result.ok) {
          message.error(result.error ?? (CONTENT.errors as Record<string, string>).generic);
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
              aria-label="Campus group"
              title="Campus group"
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
        const result = await apiMutation<OrgGroup, typeof values>(
          API_ROUTES.org.group(editTarget.id),
          {
            method: "PUT",
            body: values,
          },
        );
        if (!result.ok) {
          message.error(result.error ?? (CONTENT.errors as Record<string, string>).generic);
          return;
        }
        message.success(CONTENT.common.successSave as string);
        setEditTarget(null);
        refetchGroups();
      } else {
        const result = await apiMutation<OrgGroup, Record<string, unknown>>(API_ROUTES.org.groups, {
          method: "POST",
          body: { ...values, organisationId: ORG_ID },
        });
        if (!result.ok) {
          message.error(result.error ?? (CONTENT.errors as Record<string, string>).generic);
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
  const [editEntity, setEditEntity] = useState<"group" | "campus" | null>(null);
  const [editTarget, setEditTarget] = useState<OrgGroup | Campus | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [interactiveBulk, setInteractiveBulk] = useState(true);
  const [interactiveGroups, setInteractiveGroups] = useState<InteractiveGroup[]>([]);

  const [bulkText, setBulkText] = useState<string>("[");
  const [bulkDryRun, setBulkDryRun] = useState(true);
  const [bulkResult, setBulkResult] = useState<any>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const {
    data: hierarchy,
    loading: hierarchyLoading,
    error: hierarchyError,
    refetch: refetchHierarchy,
  } = useApiData<OrgGroupWithDetails[]>(API_ROUTES.org.hierarchy);

  const {
    status: bulkDraftStatus,
    lastSavedAt: bulkDraftLastSaved,
    clearDraft: clearBulkDraft,
  } = useFormPersistence<HierarchyBulkDraft>({
    formKey: "draft:org:hierarchy:bulk",
    formState: {
      interactiveBulk,
      interactiveGroups,
      bulkText,
      bulkDryRun,
    },
    onRestore: (draft) => {
      setInteractiveBulk(draft.interactiveBulk ?? true);
      setInteractiveGroups(draft.interactiveGroups ?? []);
      setBulkText(draft.bulkText ?? "[");
      setBulkDryRun(draft.bulkDryRun ?? true);
    },
    enabled: true,
  });

  const seedBulkEditor = () => {
    setInteractiveBulk(true);
    setInteractiveGroups(
      (hierarchy ?? []).map((group) => ({
        id: group.id,
        name: group.name,
        country: group.country || "",
        isActive: group.isActive,
        leaderId: group.leaderId || "",
        action: "update" as OrgBulkAction,
        campuses: group.campuses.map((campus) => ({
          id: campus.id,
          statusId: campus.id,
          name: campus.name,
          country: campus.country || "",
          location: campus.location || "",
          isActive: campus.isActive,
          action: "update" as OrgBulkAction,
        })),
      })),
    );
    setBulkText(
      '[\n  {"type":"group","action":"create","data":{"name":"New Group","country":""}}\n]',
    );
  };

  const buildOpsFromInteractive = (): OrgBulkOp[] => {
    const ops: OrgBulkOp[] = [];

    interactiveGroups.forEach((group) => {
      if (group.action === "create" || group.action === "update" || group.action === "delete") {
        const groupData: Record<string, any> = {
          name: group.name,
          country: group.country,
          isActive: group.isActive,
          leaderId: group.leaderId || null,
        };
        if (group.action !== "create") groupData.id = group.id;

        ops.push({ type: "group", action: group.action, data: groupData });
      }

      group.campuses.forEach((campus) => {
        if (
          campus.action === "create" ||
          campus.action === "update" ||
          campus.action === "delete"
        ) {
          const campusData: Record<string, any> = {
            name: campus.name,
            country: campus.country,
            location: campus.location,
            isActive: campus.isActive,
            groupId: group.id,
          };
          if (campus.action !== "create") campusData.id = campus.id;
          if (campus.action === "create") delete campusData.id;

          ops.push({ type: "campus", action: campus.action, data: campusData });
        }
      });
    });

    return ops;
  };

  const handleBulkSend = async (isDryRun: boolean) => {
    try {
      setBulkLoading(true);
      setBulkError(null);
      setBulkResult(null);

      const ops = interactiveBulk ? buildOpsFromInteractive() : JSON.parse(bulkText);

      const result = await apiMutation<OrgBulkSendResult, { ops: OrgBulkOp[]; dryRun: boolean }>(
        API_ROUTES.org.hierarchyBulk,
        {
          method: "POST",
          body: { ops, dryRun: isDryRun },
        },
      );
      if (!result.ok) {
        setBulkError(result.error || "Bulk operation failed");
      } else {
        const data = { success: true, ...(result.data ?? { dryRun: isDryRun, results: [] }) };
        setBulkResult(data);
        if (!isDryRun && data.success) {
          await refetchHierarchy();
          setInteractiveGroups(
            (hierarchy ?? []).map((group) => ({
              id: group.id,
              name: group.name,
              country: group.country || "",
              isActive: group.isActive,
              leaderId: group.leaderId || "",
              action: "update",
              campuses: group.campuses.map((campus) => ({
                id: campus.id,
                statusId: campus.id,
                name: campus.name,
                country: campus.country || "",
                location: campus.location || "",
                isActive: campus.isActive,
                action: "update",
              })),
            })),
          );
        }
      }
    } catch (err: any) {
      setBulkError(err?.message ?? "Bulk parse/submit error");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleSave = async (values: { name: string; country?: string; location?: string }) => {
    if (!editEntity || !editTarget) return;
    setSaving(true);
    try {
      let url = "";
      let body: Record<string, any> = { name: values.name };

      if (editEntity === "group") {
        url = API_ROUTES.org.group((editTarget as OrgGroup).id);
        if (values.country !== undefined) body.country = values.country;
      } else {
        url = API_ROUTES.org.campus((editTarget as Campus).id);
        if (values.country !== undefined) body.country = values.country;
        if (values.location !== undefined) body.location = values.location;
      }

      const result = await apiMutation(url, {
        method: "PUT",
        body,
      });
      if (!result.ok) {
        message.error(result.error || "Save failed");
        return;
      }

      message.success(CONTENT.common.successSave as string);
      setIsModalOpen(false);
      setEditTarget(null);
      setEditEntity(null);
      form.resetFields();
      refetchHierarchy();
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setSaving(false);
    }
  };

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
      <div className="flex items-center justify-end gap-2">
        <Button
          icon={<UploadOutlined />}
          onClick={() => {
            setBulkModalOpen(true);
            if (interactiveGroups.length === 0 && bulkText.trim() === "[") {
              seedBulkEditor();
            }
            setBulkResult(null);
            setBulkError(null);
          }}
        >
          Bulk hierarchy ops
        </Button>
      </div>
      {hierarchy.map((group) => (
        <Card key={group.id} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold">{group.name}</h3>
              <p className="text-xs text-ds-text-subtle">
                {group.country || "Country not set"} • {group.isActive ? "Active" : "Inactive"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-ds-text-secondary">
                {group.campuses.length} campuses
              </span>
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  setEditEntity("group");
                  setEditTarget(group);
                  setIsModalOpen(true);
                  form.setFieldsValue({ name: group.name, country: group.country ?? "" });
                }}
              >
                Edit
              </Button>
            </div>
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
                  <Button
                    size="small"
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setEditEntity("campus");
                      setEditTarget(campus);
                      setIsModalOpen(true);
                      form.setFieldsValue({
                        name: campus.name,
                        location: campus.location ?? "",
                        country: campus.country ?? "",
                      });
                    }}
                  >
                    Edit
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ds-text-subtle">No campuses in this group.</p>
          )}
        </Card>
      ))}

      <Modal
        open={isModalOpen}
        title={editEntity === "group" ? CONTENT.org.editGroup : CONTENT.org.editCampus}
        onCancel={() => {
          setIsModalOpen(false);
          setEditTarget(null);
          setEditEntity(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={CONTENT.common.save as string}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false}>
          <Form.Item
            name="name"
            label={
              editEntity === "group"
                ? (CONTENT.org.groupNameLabel as string)
                : (CONTENT.org.campusNameLabel as string)
            }
            rules={[{ required: true }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item name="country" label={CONTENT.org.countryLabel as string}>
            <Input size="large" />
          </Form.Item>
          {editEntity === "campus" && (
            <Form.Item name="location" label={CONTENT.org.locationLabel as string}>
              <Input size="large" />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        open={bulkModalOpen}
        title="Bulk hierarchy operations"
        onCancel={() => setBulkModalOpen(false)}
        footer={null}
        width={900}
        destroyOnClose
      >
        <div className="space-y-3">
          <FormDraftBanner
            status={bulkDraftStatus}
            lastSavedAt={bulkDraftLastSaved}
            onClear={() => {
              clearBulkDraft();
              seedBulkEditor();
            }}
          />
          <Tabs
            activeKey={interactiveBulk ? "interactive" : "json"}
            onChange={(key) => setInteractiveBulk(key === "interactive")}
            items={[
              {
                key: "interactive",
                label: "Visual builder",
                children: (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Button
                        type="dashed"
                        onClick={() => {
                          setInteractiveGroups((groups) => [
                            ...groups,
                            {
                              id: crypto.randomUUID(),
                              name: "",
                              country: "",
                              isActive: true,
                              leaderId: "",
                              action: "create",
                              campuses: [],
                            },
                          ]);
                        }}
                      >
                        Add group
                      </Button>
                      <Button
                        onClick={() => {
                          setBulkText(JSON.stringify(buildOpsFromInteractive(), null, 2));
                          setInteractiveBulk(false);
                        }}
                      >
                        Switch to JSON
                      </Button>
                    </div>

                    {interactiveGroups.length === 0 ? (
                      <p className="text-sm text-ds-text-subtle">No operations defined yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {interactiveGroups.map((group, gi) => (
                          <div
                            key={group.id}
                            className="p-3 border border-ds-border-strong rounded-ds-md"
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex-1 space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <Input
                                    value={group.name}
                                    onChange={(e) => {
                                      const next = [...interactiveGroups];
                                      next[gi].name = e.target.value;
                                      setInteractiveGroups(next);
                                    }}
                                    placeholder="Group name"
                                  />
                                  <Input
                                    value={group.country}
                                    onChange={(e) => {
                                      const next = [...interactiveGroups];
                                      next[gi].country = e.target.value;
                                      setInteractiveGroups(next);
                                    }}
                                    placeholder="Country"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={group.isActive}
                                    onChange={(e) => {
                                      const next = [...interactiveGroups];
                                      next[gi].isActive = e.target.checked;
                                      setInteractiveGroups(next);
                                    }}
                                  >
                                    Active
                                  </Checkbox>
                                  <Button
                                    size="small"
                                    onClick={() => {
                                      const next = [...interactiveGroups];
                                      next[gi].action =
                                        next[gi].action === "create" ? "update" : "create";
                                      setInteractiveGroups(next);
                                    }}
                                  >
                                    {group.action === "create" ? "Create" : "Update"}
                                  </Button>
                                  <Button
                                    type="link"
                                    danger
                                    onClick={() =>
                                      setInteractiveGroups((g) => g.filter((_, i) => i !== gi))
                                    }
                                  >
                                    Remove group
                                  </Button>
                                </div>
                              </div>
                              <Button
                                size="small"
                                onClick={() => {
                                  const next = [...interactiveGroups];
                                  next[gi].campuses.push({
                                    id: crypto.randomUUID(),
                                    name: "",
                                    country: "",
                                    location: "",
                                    isActive: true,
                                    action: "create",
                                  });
                                  setInteractiveGroups(next);
                                }}
                              >
                                Add campus
                              </Button>
                            </div>

                            {group.campuses.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {group.campuses.map((campus, ci) => (
                                  <div
                                    key={campus.id}
                                    className="p-2 border border-ds-border-weak rounded-ds-sm"
                                  >
                                    <div className="grid grid-cols-2 gap-2">
                                      <Input
                                        value={campus.name}
                                        onChange={(e) => {
                                          const next = [...interactiveGroups];
                                          next[gi].campuses[ci].name = e.target.value;
                                          setInteractiveGroups(next);
                                        }}
                                        placeholder="Campus name"
                                      />
                                      <Input
                                        value={campus.location}
                                        onChange={(e) => {
                                          const next = [...interactiveGroups];
                                          next[gi].campuses[ci].location = e.target.value;
                                          setInteractiveGroups(next);
                                        }}
                                        placeholder="Location"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                      <Input
                                        value={campus.country}
                                        onChange={(e) => {
                                          const next = [...interactiveGroups];
                                          next[gi].campuses[ci].country = e.target.value;
                                          setInteractiveGroups(next);
                                        }}
                                        placeholder="Country"
                                      />
                                      <div className="flex items-center gap-2">
                                        <Checkbox
                                          checked={campus.isActive}
                                          onChange={(e) => {
                                            const next = [...interactiveGroups];
                                            next[gi].campuses[ci].isActive = e.target.checked;
                                            setInteractiveGroups(next);
                                          }}
                                        >
                                          Active
                                        </Checkbox>
                                        <Button
                                          type="link"
                                          danger
                                          onClick={() => {
                                            const next = [...interactiveGroups];
                                            next[gi].campuses = next[gi].campuses.filter(
                                              (_, i) => i !== ci,
                                            );
                                            setInteractiveGroups(next);
                                          }}
                                        >
                                          Remove
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: "json",
                label: "JSON payload",
                children: (
                  <div className="space-y-3">
                    <p className="text-sm text-ds-text-subtle">
                      Provide a JSON array of operations manually.
                    </p>
                    <textarea
                      rows={10}
                      className="w-full p-2 border border-ds-border-strong rounded-ds-md font-mono text-xs"
                      aria-label="Hierarchy bulk JSON payload"
                      title="Hierarchy bulk JSON payload"
                      placeholder="Paste JSON bulk operations"
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                    />
                  </div>
                ),
              },
            ]}
          />

          <div className="text-xs text-ds-text-secondary">
            Dry run validates operations and simulates results without saving. Apply changes commits
            them to database and refreshes hierarchy.
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => handleBulkSend(true)} disabled={bulkLoading}>
              Dry run
            </Button>
            <Button type="primary" onClick={() => handleBulkSend(false)} disabled={bulkLoading}>
              Apply changes
            </Button>
            <Checkbox checked={bulkDryRun} onChange={(e) => setBulkDryRun(e.target.checked)}>
              Dry run
            </Checkbox>
          </div>
          {bulkLoading && <p>Processing...</p>}
          {bulkError && <p className="text-danger">{bulkError}</p>}
          {bulkResult && (
            <pre className="p-2 bg-ds-surface-sunken border border-ds-border-strong rounded-ds-md overflow-auto text-xs">
              {JSON.stringify(bulkResult, null, 2)}
            </pre>
          )}
        </div>
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
