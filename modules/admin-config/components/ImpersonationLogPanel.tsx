"use client";

/**
 * modules/admin-config/components/ImpersonationLogPanel.tsx
 *
 * SUPERADMIN-only history of impersonation sessions for the calling actor.
 * Lists session rows with summary counts; clicking a row reveals the per-event
 * timeline (STARTED / STOPPED / MUTATION_BLOCKED / MUTATION_APPLIED / etc.).
 */

import { useEffect, useMemo, useState } from "react";
import { Tag, Table, Empty, Modal } from "antd";
import { CONTENT } from "@/config/content";
import { ROLE_CONFIG } from "@/config/roles";
import { API_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";

interface SessionRow {
    id: string;
    superadminId: string;
    impersonatedRole: UserRole;
    impersonatedUserId?: string | null;
    mode: "READ_ONLY" | "MUTATE";
    startedAt: string;
    expiresAt: string;
    endedAt?: string | null;
    endedReason?: string | null;
    eventCount: number;
    events?: SessionEvent[];
}

interface SessionEvent {
    id: string;
    sessionId: string;
    type: string;
    path?: string | null;
    method?: string | null;
    status?: number | null;
    requestId?: string | null;
    createdAt: string;
}

const COPY = (CONTENT.impersonation ?? {}) as Record<string, unknown>;
const EVENT_LABELS = (COPY.eventTypeLabels ?? {}) as Record<string, string>;

function fmt(date: string): string {
    return new Date(date).toLocaleString();
}

function eventTagColor(type: string): string {
    switch (type) {
        case "STARTED":
            return "blue";
        case "STOPPED":
            return "default";
        case "MODE_CHANGED":
            return "purple";
        case "MUTATION_BLOCKED":
            return "red";
        case "MUTATION_APPLIED":
            return "orange";
        case "PAGE_VISITED":
            return "geekblue";
        case "AUTH_REJECTED":
            return "magenta";
        case "EVENT_LIMIT_REACHED":
            return "gold";
        default:
            return "default";
    }
}

export function ImpersonationLogPanel() {
    const [rows, setRows] = useState<SessionRow[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeSession, setActiveSession] = useState<SessionRow | null>(null);

    const reload = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_ROUTES.impersonation.sessions}?include=events`, {
                cache: "no-store",
            });
            const json = (await res.json()) as { success: boolean; data?: { rows: SessionRow[]; total: number } };
            if (json.success && json.data) setRows(json.data.rows);
            else setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void reload();
    }, []);

    const columns = useMemo(
        () => [
            {
                title: "Started",
                dataIndex: "startedAt",
                render: (v: string) => <span className="text-xs">{fmt(v)}</span>,
                width: 180,
            },
            {
                title: "Role",
                dataIndex: "impersonatedRole",
                render: (v: UserRole) => <Tag>{ROLE_CONFIG[v]?.label ?? v}</Tag>,
                width: 160,
            },
            {
                title: "Target user",
                dataIndex: "impersonatedUserId",
                render: (v: string | null) => v ? <code className="text-xs">{v.slice(0, 8)}</code> : <span className="text-ds-text-subtle">—</span>,
                width: 120,
            },
            {
                title: "Mode",
                dataIndex: "mode",
                render: (v: string) => (
                    <Tag color={v === "MUTATE" ? "orange" : "blue"}>{v === "MUTATE" ? "Mutate" : "Read only"}</Tag>
                ),
                width: 110,
            },
            {
                title: "Events",
                dataIndex: "eventCount",
                width: 90,
                render: (v: number) => <span className="tabular-nums">{v}</span>,
            },
            {
                title: "Ended",
                dataIndex: "endedAt",
                render: (v: string | null, r: SessionRow) =>
                    v ? (
                        <span className="text-xs">
                            {fmt(v)} <Tag color="default" style={{ marginLeft: 6 }}>{r.endedReason ?? "—"}</Tag>
                        </span>
                    ) : (
                        <Tag color="green">active</Tag>
                    ),
            },
        ],
        [],
    );

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-ds-text-primary">{(COPY.managePageTitle as string) ?? "Impersonation log"}</p>
                <p className="text-xs text-ds-text-subtle">{(COPY.managePageSubtitle as string) ?? ""}</p>
            </div>
            {loading ? (
                <p className="text-sm text-ds-text-subtle">Loading…</p>
            ) : !rows || rows.length === 0 ? (
                <Empty description="No impersonation sessions yet." />
            ) : (
                <Table
                    rowKey="id"
                    size="small"
                    dataSource={rows}
                    columns={columns}
                    pagination={false}
                    onRow={(record) => ({ onClick: () => setActiveSession(record) })}
                    rowClassName="cursor-pointer"
                />
            )}

            <Modal
                open={Boolean(activeSession)}
                onCancel={() => setActiveSession(null)}
                footer={null}
                title={`Session ${activeSession?.id?.slice(0, 8) ?? ""}`}
                width={720}
            >
                {activeSession?.events && activeSession.events.length > 0 ? (
                    <ul className="space-y-1.5 max-h-[420px] overflow-y-auto">
                        {activeSession.events.map((e) => (
                            <li key={e.id} className="flex items-center justify-between gap-3 text-xs">
                                <span className="text-ds-text-subtle tabular-nums w-40 flex-shrink-0">{fmt(e.createdAt)}</span>
                                <Tag color={eventTagColor(e.type)} style={{ minWidth: 140 }}>
                                    {EVENT_LABELS[e.type] ?? e.type}
                                </Tag>
                                <span className="truncate flex-1 font-mono">
                                    {e.method && (
                                        <Tag color="default" style={{ marginRight: 4 }}>{e.method}</Tag>
                                    )}
                                    {e.path ?? ""}
                                    {typeof e.status === "number" && (
                                        <span className="ml-2 text-ds-text-subtle">→ {e.status}</span>
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <Empty description="No events." />
                )}
            </Modal>
        </div>
    );
}

export default ImpersonationLogPanel;
