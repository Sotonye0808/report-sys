"use client";

/**
 * modules/admin-config/components/ImpersonationLogPanel.tsx
 *
 * SUPERADMIN-only history of impersonation sessions for the calling actor.
 * Lists session rows with summary counts; clicking a row reveals the per-event
 * timeline (STARTED / STOPPED / MUTATION_BLOCKED / MUTATION_APPLIED / etc.).
 */

import { useEffect, useMemo, useState } from "react";
import { Tag, Table, Empty, Modal, Tabs, message } from "antd";
import { CONTENT } from "@/config/content";
import { ROLE_CONFIG } from "@/config/roles";
import { API_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";
import { useAuth } from "@/providers/AuthProvider";
import Button from "@/components/ui/Button";

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
    const { startImpersonation } = useAuth();
    const [rows, setRows] = useState<SessionRow[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeSession, setActiveSession] = useState<SessionRow | null>(null);
    const [restartBusy, setRestartBusy] = useState(false);

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
                {activeSession ? (
                    <Tabs
                        defaultActiveKey="timeline"
                        items={[
                            {
                                key: "timeline",
                                label: "Timeline",
                                children: <TimelineView session={activeSession} />,
                            },
                            {
                                key: "replay",
                                label: "Replay narrative",
                                children: <ReplayView session={activeSession} />,
                            },
                        ]}
                    />
                ) : null}
                {activeSession && (
                    <div className="mt-3 flex items-center justify-between border-t border-ds-border-subtle pt-3">
                        <p className="text-xs text-ds-text-subtle">
                            Re-walk this preview with the same role + target user — opens a fresh session.
                        </p>
                        <Button
                            type="primary"
                            size="small"
                            loading={restartBusy}
                            onClick={async () => {
                                setRestartBusy(true);
                                try {
                                    await startImpersonation({
                                        impersonatedRole: activeSession.impersonatedRole,
                                        impersonatedUserId: activeSession.impersonatedUserId ?? undefined,
                                        mode: activeSession.mode,
                                    });
                                    message.success("Replay session started.");
                                    setActiveSession(null);
                                } catch (err) {
                                    message.error(
                                        err instanceof Error ? err.message : "Could not start replay session.",
                                    );
                                } finally {
                                    setRestartBusy(false);
                                }
                            }}
                        >
                            Restart preview
                        </Button>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default ImpersonationLogPanel;

/* ── Timeline view (raw event log) ─────────────────────────────────────── */

function TimelineView({ session }: { session: SessionRow }) {
    if (!session.events || session.events.length === 0) {
        return <Empty description="No events." />;
    }
    return (
        <ul className="space-y-1.5 max-h-[420px] overflow-y-auto">
            {session.events.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-ds-text-subtle tabular-nums w-40 flex-shrink-0">
                        {fmt(e.createdAt)}
                    </span>
                    <Tag color={eventTagColor(e.type)} style={{ minWidth: 140 }}>
                        {EVENT_LABELS[e.type] ?? e.type}
                    </Tag>
                    <span className="truncate flex-1 font-mono">
                        {e.method && (
                            <Tag color="default" style={{ marginRight: 4 }}>
                                {e.method}
                            </Tag>
                        )}
                        {e.path ?? ""}
                        {typeof e.status === "number" && (
                            <span className="ml-2 text-ds-text-subtle">→ {e.status}</span>
                        )}
                    </span>
                </li>
            ))}
        </ul>
    );
}

/* ── Replay narrative (humanised reconstruction) ───────────────────────── */

function ReplayView({ session }: { session: SessionRow }) {
    const events = session.events ?? [];
    const roleLabel = ROLE_CONFIG[session.impersonatedRole]?.label ?? session.impersonatedRole;
    const targetSnippet = session.impersonatedUserId
        ? ` as user ${session.impersonatedUserId.slice(0, 8)}`
        : "";

    if (events.length === 0) {
        return (
            <Empty description="No events captured for this session — there's nothing to replay." />
        );
    }

    const sentences = events.map((e, idx) => describeEvent(e, idx, roleLabel, targetSnippet, session.mode));

    return (
        <div className="max-h-[420px] overflow-y-auto">
            <ol className="relative border-l-2 border-ds-border-base ml-2 space-y-2">
                {sentences.map((s, idx) => (
                    <li key={`${session.id}-replay-${idx}`} className="ml-4 relative">
                        <span className="absolute -left-[calc(0.5rem+5px)] top-1.5 w-2.5 h-2.5 rounded-full bg-ds-brand-accent" />
                        <p className="text-sm text-ds-text-primary leading-snug">{s.text}</p>
                        <p className="text-xs text-ds-text-subtle">{fmt(s.at)}</p>
                    </li>
                ))}
            </ol>
        </div>
    );
}

interface NarrativeLine {
    text: string;
    at: string;
}

function describeEvent(
    e: SessionEvent,
    idx: number,
    roleLabel: string,
    targetSnippet: string,
    mode: "READ_ONLY" | "MUTATE",
): NarrativeLine {
    const seq = `Step ${idx + 1}: `;
    switch (e.type) {
        case "STARTED":
            return {
                text: `${seq}Preview opened — impersonating ${roleLabel}${targetSnippet} in ${mode === "MUTATE" ? "MUTATE" : "READ-ONLY"} mode.`,
                at: e.createdAt,
            };
        case "STOPPED":
            return { text: `${seq}Preview ended.`, at: e.createdAt };
        case "MODE_CHANGED":
            return {
                text: `${seq}Switched mode to ${e.path ?? "(unknown)"}.`,
                at: e.createdAt,
            };
        case "MUTATION_APPLIED":
            return {
                text:
                    `${seq}Wrote real data via ${e.method ?? "?"} ${e.path ?? "(unknown path)"}` +
                    (typeof e.status === "number" ? ` (status ${e.status})` : "") +
                    `. This change is live.`,
                at: e.createdAt,
            };
        case "MUTATION_BLOCKED":
            return {
                text:
                    `${seq}Tried to write via ${e.method ?? "?"} ${e.path ?? "(unknown path)"} ` +
                    `but read-only mode blocked it.`,
                at: e.createdAt,
            };
        case "PAGE_VISITED":
            return { text: `${seq}Visited ${e.path ?? "(unknown page)"}.`, at: e.createdAt };
        case "AUTH_REJECTED":
            return {
                text: `${seq}Auth rejected — endpoint required higher privileges than the impersonated role.`,
                at: e.createdAt,
            };
        case "EVENT_LIMIT_REACHED":
            return {
                text: `${seq}Event log capped at the per-session limit; subsequent events not recorded.`,
                at: e.createdAt,
            };
        default:
            return { text: `${seq}${e.type}`, at: e.createdAt };
    }
}
