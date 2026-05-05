"use client";

/**
 * modules/admin-config/components/OrgUnitTreeEditor.tsx
 *
 * Multi-tree, variable-depth editor for the polymorphic OrgUnit substrate.
 * The default seed tree (`rootKey="primary"`) holds the existing Group→Campus
 * structure; admins can promote a node to spawn a parallel tree, rename levels
 * inline, archive subtrees, and promote nodes to siblings or children of
 * other nodes.
 *
 * Reads/writes go through `/api/org/units/*`. Cross-tree role assignment is
 * handled in `RolesEditorV2` via the same OrgUnit ids — this editor only
 * concerns itself with the tree shape + metadata.
 */

import { useEffect, useMemo, useState } from "react";
import { Tree, Modal, Form, Input, Select, message, Empty, Tag, Tabs } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, BranchesOutlined } from "@ant-design/icons";
import { API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

interface UnitNode {
    id: string;
    code?: string | null;
    level: string;
    name: string;
    description?: string | null;
    parentId: string | null;
    rootKey: string;
    country?: string | null;
    location?: string | null;
    address?: string | null;
    phone?: string | null;
    leaderId?: string | null;
    adminId?: string | null;
    isActive: boolean;
    archivedAt?: string | null;
    children?: UnitNode[];
}

interface TreeBucket {
    rootKey: string;
    roots: UnitNode[];
}

function toAntdTree(nodes: UnitNode[]): Array<{
    title: React.ReactNode;
    key: string;
    children?: ReturnType<typeof toAntdTree>;
}> {
    return nodes.map((n) => ({
        key: n.id,
        title: (
            <span className="inline-flex items-center gap-2">
                <span className="text-ds-text-primary">{n.name}</span>
                <Tag className="!m-0 !text-[10px]">{n.level}</Tag>
                {!n.isActive && <Tag color="orange" className="!m-0 !text-[10px]">archived</Tag>}
            </span>
        ),
        children: n.children?.length ? toAntdTree(n.children) : undefined,
    }));
}

function findNode(nodes: UnitNode[], id: string): UnitNode | null {
    for (const n of nodes) {
        if (n.id === id) return n;
        if (n.children?.length) {
            const child = findNode(n.children, id);
            if (child) return child;
        }
    }
    return null;
}

export function OrgUnitTreeEditor() {
    const [trees, setTrees] = useState<TreeBucket[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedRootKey, setSelectedRootKey] = useState<string>("primary");
    const [editing, setEditing] = useState<UnitNode | null>(null);
    const [creatingParent, setCreatingParent] = useState<UnitNode | null>(null);
    const [creatingRoot, setCreatingRoot] = useState<{ rootKey: string } | null>(null);
    const [form] = Form.useForm();

    const reload = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_ROUTES.orgUnits.list}?tree=true&includeArchived=true`, {
                cache: "no-store",
            });
            const json = (await res.json()) as { success: boolean; data?: { trees: TreeBucket[] } };
            if (json.success && json.data) {
                setTrees(json.data.trees);
                if (json.data.trees.length > 0 && !json.data.trees.some((t) => t.rootKey === selectedRootKey)) {
                    setSelectedRootKey(json.data.trees[0].rootKey);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void reload();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const activeTree = useMemo(
        () => trees?.find((t) => t.rootKey === selectedRootKey) ?? trees?.[0] ?? null,
        [trees, selectedRootKey],
    );

    /* ── Add / Edit / Archive operations ────────────────────────────────── */

    const submitCreate = async (values: Record<string, unknown>) => {
        const parent = creatingParent;
        const target = creatingRoot;
        const body = {
            name: String(values.name ?? "").trim(),
            level: String(values.level ?? "").trim(),
            description: (values.description as string) || null,
            country: (values.country as string) || null,
            location: (values.location as string) || null,
            parentId: parent?.id ?? null,
            rootKey: target?.rootKey ?? parent?.rootKey ?? "primary",
        };
        const res = await fetch(API_ROUTES.orgUnits.list, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const json = (await res.json()) as { success: boolean; error?: string };
        if (!res.ok || !json.success) {
            message.error(json.error ?? "Could not create unit");
            return;
        }
        message.success("Unit created");
        setCreatingParent(null);
        setCreatingRoot(null);
        form.resetFields();
        void reload();
    };

    const submitEdit = async (values: Record<string, unknown>) => {
        if (!editing) return;
        const body = {
            name: String(values.name ?? "").trim(),
            level: String(values.level ?? "").trim(),
            description: (values.description as string) || null,
            country: (values.country as string) || null,
            location: (values.location as string) || null,
        };
        const res = await fetch(API_ROUTES.orgUnits.detail(editing.id), {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const json = (await res.json()) as { success: boolean; error?: string };
        if (!res.ok || !json.success) {
            message.error(json.error ?? "Could not update unit");
            return;
        }
        message.success("Unit updated");
        setEditing(null);
        form.resetFields();
        void reload();
    };

    const archive = async (id: string) => {
        Modal.confirm({
            title: "Archive this unit?",
            content: "All descendants will be archived too. Existing reports remain readable.",
            okText: "Archive",
            okButtonProps: { danger: true },
            onOk: async () => {
                const res = await fetch(API_ROUTES.orgUnits.detail(id), { method: "DELETE" });
                const json = (await res.json()) as { success: boolean; error?: string };
                if (!res.ok || !json.success) {
                    message.error(json.error ?? "Could not archive");
                    return;
                }
                message.success("Archived");
                void reload();
            },
        });
    };

    const promote = async (id: string) => {
        Modal.confirm({
            title: "Promote to a new tree?",
            content: (
                <div>
                    <p>Enter a root key for the new parallel tree.</p>
                    <Input id="__promote_root_key" defaultValue="departments" placeholder="e.g. departments" />
                </div>
            ),
            okText: "Promote",
            onOk: async () => {
                const el = document.getElementById("__promote_root_key") as HTMLInputElement | null;
                const rootKey = (el?.value ?? "").trim() || "departments";
                const res = await fetch(API_ROUTES.orgUnits.promote(id), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rootKey }),
                });
                const json = (await res.json()) as { success: boolean; error?: string };
                if (!res.ok || !json.success) {
                    message.error(json.error ?? "Could not promote");
                    return;
                }
                message.success(`Promoted to "${rootKey}"`);
                void reload();
            },
        });
    };

    if (loading || !trees) return <LoadingSkeleton rows={5} />;

    if (trees.length === 0) {
        return (
            <Empty description="No org units yet">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setCreatingRoot({ rootKey: "primary" })}
                >
                    Create the first unit
                </Button>
                <CreateUnitModal
                    open={Boolean(creatingRoot)}
                    onCancel={() => setCreatingRoot(null)}
                    onSubmit={submitCreate}
                    parentName={null}
                    form={form}
                />
            </Empty>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-ds-text-primary">Organisation trees</p>
                    <p className="text-xs text-ds-text-subtle">
                        Multiple parallel trees coexist (e.g. <em>primary</em> Group→Campus alongside
                        <em> departments</em>). Click any node to add children, edit, archive, or promote
                        a subtree to a new tree.
                    </p>
                </div>
                <Button
                    icon={<PlusOutlined />}
                    onClick={() => setCreatingRoot({ rootKey: selectedRootKey ?? "primary" })}
                >
                    Add root in this tree
                </Button>
            </div>

            <Tabs
                activeKey={selectedRootKey}
                onChange={(k) => setSelectedRootKey(k)}
                items={trees.map((t) => ({
                    key: t.rootKey,
                    label: (
                        <span className="inline-flex items-center gap-1.5">
                            <BranchesOutlined />
                            {t.rootKey}
                        </span>
                    ),
                    children: (
                        <div className="border border-ds-border-base rounded-ds-2xl bg-ds-surface-elevated p-4">
                            {t.roots.length === 0 ? (
                                <Empty description="This tree is empty" />
                            ) : (
                                <Tree
                                    showLine
                                    defaultExpandAll
                                    selectable={false}
                                    treeData={toAntdTree(t.roots)}
                                    titleRender={(node) => {
                                        const id = node.key as string;
                                        const found = findNode(t.roots, id);
                                        if (!found) return node.title;
                                        return (
                                            <span className="inline-flex items-center gap-2">
                                                {node.title as React.ReactNode}
                                                <Button
                                                    size="small"
                                                    type="text"
                                                    icon={<PlusOutlined />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCreatingParent(found);
                                                    }}
                                                    aria-label={`Add child under ${found.name}`}
                                                />
                                                <Button
                                                    size="small"
                                                    type="text"
                                                    icon={<EditOutlined />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditing(found);
                                                        form.setFieldsValue({
                                                            name: found.name,
                                                            level: found.level,
                                                            description: found.description ?? "",
                                                            country: found.country ?? "",
                                                            location: found.location ?? "",
                                                        });
                                                    }}
                                                    aria-label={`Edit ${found.name}`}
                                                />
                                                <Button
                                                    size="small"
                                                    type="text"
                                                    icon={<BranchesOutlined />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        promote(found.id);
                                                    }}
                                                    aria-label={`Promote ${found.name}`}
                                                />
                                                <Button
                                                    size="small"
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        archive(found.id);
                                                    }}
                                                    aria-label={`Archive ${found.name}`}
                                                />
                                            </span>
                                        );
                                    }}
                                />
                            )}
                        </div>
                    ),
                }))}
            />

            <CreateUnitModal
                open={Boolean(creatingParent || creatingRoot)}
                onCancel={() => {
                    setCreatingParent(null);
                    setCreatingRoot(null);
                    form.resetFields();
                }}
                onSubmit={submitCreate}
                parentName={creatingParent?.name ?? null}
                form={form}
            />

            <Modal
                open={Boolean(editing)}
                onCancel={() => {
                    setEditing(null);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                title={editing ? `Edit ${editing.name}` : "Edit unit"}
                okText="Save"
            >
                <Form layout="vertical" form={form} onFinish={submitEdit}>
                    <Form.Item label="Name" name="name" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Lagos Campus" />
                    </Form.Item>
                    <Form.Item label="Level" name="level" rules={[{ required: true }]}>
                        <Input placeholder="GROUP / CAMPUS / DEPARTMENT / …" />
                    </Form.Item>
                    <Form.Item label="Description" name="description">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item label="Country" name="country">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Location" name="location">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

function CreateUnitModal({
    open,
    onCancel,
    onSubmit,
    parentName,
    form,
}: {
    open: boolean;
    onCancel: () => void;
    onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
    parentName: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any;
}) {
    return (
        <Modal
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()}
            title={parentName ? `Add child under ${parentName}` : "Add root unit"}
            okText="Create"
        >
            <Form layout="vertical" form={form} onFinish={onSubmit}>
                <Form.Item label="Name" name="name" rules={[{ required: true }]}>
                    <Input placeholder="e.g. Operations Department" />
                </Form.Item>
                <Form.Item
                    label="Level"
                    name="level"
                    rules={[{ required: true }]}
                    extra="Free-form. Common values: GROUP, CAMPUS, DEPARTMENT, ZONE."
                >
                    <Input placeholder="GROUP / CAMPUS / DEPARTMENT / …" />
                </Form.Item>
                <Form.Item label="Description" name="description">
                    <Input.TextArea rows={2} />
                </Form.Item>
                <Form.Item label="Country" name="country">
                    <Input />
                </Form.Item>
                <Form.Item label="Location" name="location">
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default OrgUnitTreeEditor;
