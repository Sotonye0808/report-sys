"use client";

/**
 * components/ui/PwaInstallBanner.tsx
 *
 * Non-blocking banner that detects platform (iOS / Android / Desktop), shows
 * OS-tailored install steps from `config/content.ts`, and once the app is
 * running standalone (PWA mode), chains a push permission sub-prompt.
 *
 * Dismissal state is persisted in two places:
 *   - localStorage cookie (per-device, instant)
 *   - /api/notifications/pwa-dismissal (per-user, cross-device)
 *
 * Banner re-shows after PWA_BANNER_REENGAGE_DAYS unless mode === "never".
 */

import { useEffect, useMemo, useState, useCallback } from "react";
import { CONTENT } from "@/config/content";
import { API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";

type Platform = "IOS" | "ANDROID" | "DESKTOP";
type Kind = "INSTALL" | "PUSH";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STORAGE_KEY = "hrs:pwa:dismissal";

interface LocalDismissalEntry {
    kind: Kind;
    platform: Platform;
    mode: "snooze" | "never";
    nextEligibleAt: number | null;
}

function detectPlatform(): Platform {
    if (typeof navigator === "undefined") return "DESKTOP";
    const ua = navigator.userAgent || "";
    if (/iPad|iPhone|iPod/.test(ua) && !("MSStream" in window)) return "IOS";
    if (/Android/.test(ua)) return "ANDROID";
    return "DESKTOP";
}

function isStandalone(): boolean {
    if (typeof window === "undefined") return false;
    return (
        window.matchMedia?.("(display-mode: standalone)").matches ||
        // iOS Safari
        (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
}

function readLocalDismissals(): LocalDismissalEntry[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as LocalDismissalEntry[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeLocalDismissals(entries: LocalDismissalEntry[]) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
        // ignore
    }
}

function isSuppressed(kind: Kind, platform: Platform, entries: LocalDismissalEntry[]): boolean {
    return entries.some((e) => {
        if (e.kind !== kind || e.platform !== platform) return false;
        if (e.mode === "never") return true;
        if (e.nextEligibleAt && Date.now() < e.nextEligibleAt) return true;
        return false;
    });
}

interface Props {
    /** When true, hides the banner unconditionally (e.g., user not authenticated yet). */
    disabled?: boolean;
}

export function PwaInstallBanner({ disabled }: Props) {
    const platform = useMemo<Platform>(() => detectPlatform(), []);
    const copy = (CONTENT.pwaInstall ?? {}) as Record<string, unknown>;
    const platformInstructions = (copy.platformInstructions ?? {}) as Record<Platform, string>;
    const pushCopy = (copy.push ?? {}) as Record<string, string>;

    const [installVisible, setInstallVisible] = useState(false);
    const [pushVisible, setPushVisible] = useState(false);
    const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
    const [standalone, setStandalone] = useState(false);

    useEffect(() => {
        if (disabled) return;
        if (typeof window === "undefined") return;

        const running = isStandalone();
        setStandalone(running);
        const local = readLocalDismissals();

        if (!running && !isSuppressed("INSTALL", platform, local)) {
            setInstallVisible(true);
        }
        if (
            running &&
            "Notification" in window &&
            Notification.permission === "default" &&
            !isSuppressed("PUSH", platform, local)
        ) {
            setPushVisible(true);
        }

        const onBeforeInstall = (event: Event) => {
            event.preventDefault();
            setInstallEvent(event as BeforeInstallPromptEvent);
        };
        window.addEventListener("beforeinstallprompt", onBeforeInstall);

        const onAppInstalled = () => {
            setInstallVisible(false);
            setStandalone(true);
        };
        window.addEventListener("appinstalled", onAppInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", onBeforeInstall);
            window.removeEventListener("appinstalled", onAppInstalled);
        };
    }, [disabled, platform]);

    const persistDismissal = useCallback(
        async (kind: Kind, mode: "snooze" | "never") => {
            const reengageMs = 14 * 24 * 3600 * 1000;
            const entry: LocalDismissalEntry = {
                kind,
                platform,
                mode,
                nextEligibleAt: mode === "snooze" ? Date.now() + reengageMs : null,
            };
            const filtered = readLocalDismissals().filter(
                (e) => !(e.kind === kind && e.platform === platform),
            );
            writeLocalDismissals([...filtered, entry]);
            try {
                await fetch(API_ROUTES.pwaDismissal, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ kind, platform, mode }),
                });
            } catch {
                // best-effort; local state still applies
            }
        },
        [platform],
    );

    const handleInstall = useCallback(async () => {
        if (installEvent) {
            await installEvent.prompt();
            const result = await installEvent.userChoice;
            if (result.outcome === "accepted") {
                setInstallVisible(false);
            }
            return;
        }
        // iOS / browsers without prompt event — leave banner visible with instructions.
    }, [installEvent]);

    const handleEnablePush = useCallback(async () => {
        if (typeof window === "undefined") return;
        if (!("Notification" in window)) return;
        try {
            const result = await Notification.requestPermission();
            if (result === "granted") {
                setPushVisible(false);
            }
        } catch {
            // ignore
        }
    }, []);

    if (disabled) return null;

    return (
        <>
            {installVisible && !standalone && (
                <div
                    role="region"
                    aria-label={String(copy.bannerTitle ?? "Install app")}
                    className="bg-ds-surface-elevated border border-ds-border-base rounded-ds-2xl p-4 mx-4 my-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between shadow-ds-sm"
                >
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold text-ds-text-primary">{String(copy.bannerTitle ?? "")}</p>
                        <p className="text-xs text-ds-text-secondary">{String(copy.bannerSubtitle ?? "")}</p>
                        <p className="text-xs text-ds-text-subtle">{platformInstructions[platform] ?? ""}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {installEvent && (
                            <Button onClick={handleInstall}>{String(copy.installCta ?? "Install")}</Button>
                        )}
                        <Button
                            type="default"
                            onClick={() => {
                                setInstallVisible(false);
                                void persistDismissal("INSTALL", "snooze");
                            }}
                        >
                            {String(copy.snoozeCta ?? "Maybe later")}
                        </Button>
                        <Button
                            type="default"
                            onClick={() => {
                                setInstallVisible(false);
                                void persistDismissal("INSTALL", "never");
                            }}
                        >
                            {String(copy.neverCta ?? "Don't show again")}
                        </Button>
                    </div>
                </div>
            )}
            {pushVisible && (
                <div
                    role="region"
                    aria-label={pushCopy.title ?? "Enable notifications"}
                    className="bg-ds-surface-elevated border border-ds-border-base rounded-ds-2xl p-4 mx-4 my-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between shadow-ds-sm"
                >
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold text-ds-text-primary">{pushCopy.title ?? ""}</p>
                        <p className="text-xs text-ds-text-secondary">{pushCopy.subtitle ?? ""}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button onClick={handleEnablePush}>{pushCopy.enableCta ?? "Enable"}</Button>
                        <Button
                            type="default"
                            onClick={() => {
                                setPushVisible(false);
                                void persistDismissal("PUSH", "snooze");
                            }}
                        >
                            {pushCopy.laterCta ?? "Maybe later"}
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}

export default PwaInstallBanner;
