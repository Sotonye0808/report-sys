"use client";

/**
 * components/ui/ImpersonationBanner.tsx
 *
 * Sticky top banner mounted in the dashboard layout. Visible whenever the
 * user has an active impersonation session. Shows the impersonated role +
 * (optionally) target user, current mode, countdown to expiry, and CTAs:
 *   - Switch mode (READ_ONLY ↔ MUTATE)
 *   - Exit preview
 *
 * Listens for Ctrl+Shift+E as an emergency exit shortcut.
 */

import { useEffect, useMemo, useState } from "react";
import { Tag, message } from "antd";
import { CONTENT } from "@/config/content";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole } from "@/types/global";
import { useImpersonation } from "@/lib/hooks/useImpersonation";
import Button from "@/components/ui/Button";

const COPY = (CONTENT.impersonation ?? {}) as Record<string, unknown>;

function formatCountdown(ms: number): string {
    if (ms <= 0) return "0s";
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m === 0) return `${s}s`;
    if (s === 0) return `${m}m`;
    return `${m}m ${s}s`;
}

export function ImpersonationBanner() {
    const { active, mode, expiresAt, impersonatedRole, impersonatedUserId, exit, switchMode } = useImpersonation();
    const [now, setNow] = useState<number>(() => Date.now());
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!active) return;
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, [active]);

    useEffect(() => {
        if (!active) return;
        const handler = async (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && (e.key === "E" || e.key === "e")) {
                e.preventDefault();
                try {
                    setBusy(true);
                    await exit();
                    message.success(((COPY.toasts as Record<string, string>)?.stopped) ?? "Preview ended.");
                } catch {
                    // ignore
                } finally {
                    setBusy(false);
                }
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [active, exit]);

    const remainingMs = useMemo(() => (expiresAt ? new Date(expiresAt).getTime() - now : 0), [expiresAt, now]);

    if (!active) return null;

    const isMutate = mode === "MUTATE";
    const expiringSoon = remainingMs > 0 && remainingMs < 2 * 60 * 1000;
    const roleLabel = ROLE_CONFIG[impersonatedRole as UserRole]?.label ?? impersonatedRole;

    const containerClass = [
        "sticky top-0 z-40 mx-4 my-3 px-4 py-2.5 rounded-ds-2xl border flex flex-wrap items-center justify-between gap-3 text-sm shadow-ds-sm",
        isMutate
            ? "bg-amber-50 dark:bg-amber-900/30 border-amber-400/60 text-amber-900 dark:text-amber-100"
            : "bg-blue-50 dark:bg-blue-900/30 border-ds-brand-accent/40 text-blue-900 dark:text-blue-100",
        expiringSoon ? "animate-pulse" : "",
    ].join(" ");

    const switchLabel = isMutate
        ? ((COPY.switchToReadOnly as string) ?? "Switch to read-only")
        : ((COPY.switchToMutate as string) ?? "Switch to mutate");
    const titleLabel = isMutate
        ? ((COPY.bannerMutateTitle as string) ?? "Previewing & MUTATING as")
        : ((COPY.bannerReadOnlyTitle as string) ?? "Previewing as");
    const hintLabel = isMutate
        ? ((COPY.bannerMutateHint as string) ?? "Mutate mode — changes take real effect.")
        : ((COPY.bannerReadOnlyHint as string) ?? "Read-only — actions will not apply.");

    return (
        <div role="region" aria-label="Impersonation preview banner" className={containerClass}>
            <div className="flex flex-wrap items-center gap-2 min-w-0">
                <Tag color={isMutate ? "orange" : "blue"}>{titleLabel}</Tag>
                <span className="font-semibold truncate">{roleLabel}</span>
                {impersonatedUserId && (
                    <span className="text-xs text-ds-text-subtle truncate">
                        {(COPY.bannerForUser as string) ?? "for"} <code className="font-mono">{impersonatedUserId.slice(0, 8)}</code>
                    </span>
                )}
                <span className="text-xs text-ds-text-subtle">·</span>
                <span className="text-xs text-ds-text-subtle">{hintLabel}</span>
                <span className="text-xs text-ds-text-subtle">·</span>
                <span className="text-xs tabular-nums">
                    {(COPY.bannerExpiresIn as string) ?? "Expires in"} {formatCountdown(remainingMs)}
                </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                    size="small"
                    type="default"
                    loading={busy}
                    onClick={async () => {
                        try {
                            setBusy(true);
                            await switchMode(isMutate ? "READ_ONLY" : "MUTATE");
                            message.success(((COPY.toasts as Record<string, string>)?.modeSwitched) ?? "Mode switched.");
                        } catch (err) {
                            message.error(err instanceof Error ? err.message : "Could not switch mode");
                        } finally {
                            setBusy(false);
                        }
                    }}
                >
                    {switchLabel}
                </Button>
                <Button
                    size="small"
                    danger
                    type="primary"
                    loading={busy}
                    onClick={async () => {
                        try {
                            setBusy(true);
                            await exit();
                            message.success(((COPY.toasts as Record<string, string>)?.stopped) ?? "Preview ended.");
                        } catch (err) {
                            message.error(err instanceof Error ? err.message : "Could not exit preview");
                        } finally {
                            setBusy(false);
                        }
                    }}
                >
                    {(COPY.exit as string) ?? "Exit preview"}
                </Button>
            </div>
        </div>
    );
}

export default ImpersonationBanner;
