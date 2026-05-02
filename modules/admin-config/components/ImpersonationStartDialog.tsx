"use client";

/**
 * modules/admin-config/components/ImpersonationStartDialog.tsx
 *
 * SUPERADMIN-only modal that starts an impersonation session. Lets the
 * operator pick a non-SUPERADMIN role (and optionally a specific user) and
 * the safety mode (READ_ONLY default).
 *
 * Mounted by Admin Config + Users table row action; both flows reuse the
 * same dialog so the start contract stays in one place.
 */

import { useEffect, useMemo, useState } from "react";
import { Modal, Form, Select, Radio, message } from "antd";
import { CONTENT } from "@/config/content";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole } from "@/types/global";
import { useAuth } from "@/providers/AuthProvider";
import { useApiData } from "@/lib/hooks/useApiData";
import { API_ROUTES } from "@/config/routes";

interface DirectoryRow {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole | null;
    status: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    /** Pre-fill role + user when opened from a Users table row action. */
    presetRole?: UserRole;
    presetUserId?: string;
}

const COPY = (CONTENT.impersonation ?? {}) as Record<string, unknown>;
const TOASTS = (COPY.toasts ?? {}) as Record<string, string>;

export function ImpersonationStartDialog({ open, onClose, presetRole, presetUserId }: Props) {
    const { startImpersonation } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [role, setRole] = useState<UserRole | undefined>(presetRole);
    const [userId, setUserId] = useState<string | undefined>(presetUserId);
    const [mode, setMode] = useState<"READ_ONLY" | "MUTATE">("READ_ONLY");

    useEffect(() => {
        if (open) {
            setRole(presetRole);
            setUserId(presetUserId);
            setMode("READ_ONLY");
        }
    }, [open, presetRole, presetUserId]);

    const { data: directory } = useApiData<DirectoryRow[]>(
        open && role ? `${API_ROUTES.users.list}?includeInvited=true&role=${role}&pageSize=100` : null,
    );

    const roleOptions = useMemo(
        () =>
            (Object.keys(ROLE_CONFIG) as UserRole[])
                .filter((r) => r !== UserRole.SUPERADMIN)
                .map((r) => ({ value: r, label: ROLE_CONFIG[r].label })),
        [],
    );

    const userOptions = useMemo(
        () =>
            (directory ?? [])
                .filter((u) => u.status === "ACTIVE")
                .map((u) => ({
                    value: u.id,
                    label: `${u.firstName || u.email} ${u.lastName ?? ""}`.trim() + ` · ${u.email}`,
                })),
        [directory],
    );

    const submit = async () => {
        if (!role) {
            message.error("Pick a role");
            return;
        }
        setSubmitting(true);
        try {
            await startImpersonation({
                impersonatedRole: role,
                impersonatedUserId: userId,
                mode,
            });
            message.success(TOASTS.started ?? "Preview started.");
            onClose();
        } catch (err) {
            message.error(err instanceof Error ? err.message : TOASTS.startFailed ?? "Could not start preview.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            onOk={submit}
            okText={(COPY.startSubmit as string) ?? "Start preview"}
            cancelText={(COPY.startCancel as string) ?? "Cancel"}
            confirmLoading={submitting}
            title={(COPY.startTitle as string) ?? "Preview the app as another role"}
        >
            <p className="text-xs text-ds-text-subtle mb-4">{(COPY.startSubtitle as string) ?? ""}</p>
            <Form layout="vertical">
                <Form.Item label={(COPY.roleLabel as string) ?? "Role"} required>
                    <Select
                        value={role}
                        options={roleOptions}
                        onChange={(v) => {
                            setRole(v as UserRole);
                            setUserId(undefined);
                        }}
                        placeholder="Pick a role"
                    />
                </Form.Item>
                <Form.Item label={(COPY.userLabel as string) ?? "Specific user (optional)"}>
                    <Select
                        value={userId}
                        options={userOptions}
                        onChange={(v) => setUserId(v as string)}
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        placeholder={role ? "Search by name or email" : "Pick a role first"}
                        disabled={!role}
                    />
                </Form.Item>
                <Form.Item label={(COPY.modeLabel as string) ?? "Mode"}>
                    <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)}>
                        <Radio.Button value="READ_ONLY">{(COPY.modeReadOnlyLabel as string) ?? "Read only"}</Radio.Button>
                        <Radio.Button value="MUTATE">{(COPY.modeMutateLabel as string) ?? "Mutate"}</Radio.Button>
                    </Radio.Group>
                    <p className="text-xs text-ds-text-subtle mt-1">
                        {mode === "READ_ONLY"
                            ? (COPY.readOnlyDescription as string) ?? ""
                            : (COPY.mutateDescription as string) ?? ""}
                    </p>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default ImpersonationStartDialog;
