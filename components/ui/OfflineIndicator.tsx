"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  WifiOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { CONTENT } from "@/config/content";
import { useOfflineSync } from "@/lib/hooks/useOfflineSync";

/**
 * OfflineIndicator — connectivity banner with three states:
 *  1. Offline banner (dismissible → collapses to badge)
 *  2. Minimised badge (click to re-expand banner)
 *  3. "Back online" confirmation (auto-dismisses after a few seconds)
 */
export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showOnlineConfirm, setShowOnlineConfirm] = useState(false);
  const wasOfflineRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    queueLength,
    queueItems,
    failedCount,
    lastError,
    lastSyncAt,
    isSyncing,
    retry,
    clearFailed,
  } = useOfflineSync();
  const [showDetails, setShowDetails] = useState(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const goOffline = () => {
      clearTimer();
      setIsOffline(true);
      setShowBanner(true);
      setShowOnlineConfirm(false);
      wasOfflineRef.current = true;
    };

    const goOnline = () => {
      setIsOffline(false);
      setShowBanner(false);
      // Only show "back online" if we were previously offline
      if (wasOfflineRef.current) {
        wasOfflineRef.current = false;
        setShowOnlineConfirm(true);
        clearTimer();
        timerRef.current = setTimeout(() => {
          setShowOnlineConfirm(false);
        }, 4000);
      }
    };

    if (!navigator.onLine) goOffline();

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
      clearTimer();
    };
  }, [clearTimer]);

  // "Back online" confirmation toast
  if (showOnlineConfirm) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-2rem)] animate-in slide-in-from-bottom">
        <div className="flex items-center gap-3 px-4 py-3 rounded-ds-xl bg-ds-status-success/15 border border-ds-status-success/30 shadow-ds-lg backdrop-blur-sm">
          <CheckCircleOutlined className="text-ds-status-success text-lg flex-shrink-0" />
          <span className="text-sm font-medium text-ds-text-primary flex-1">
            {CONTENT.errors.onlineTitle}
            <span className="text-ds-text-secondary font-normal ml-1">
              — {CONTENT.errors.onlineDescription}
            </span>
          </span>
        </div>
      </div>
    );
  }

  // Sync status badge
  if (!isOffline && (isSyncing || queueLength > 0 || failedCount > 0)) {
    const statusText = isSyncing
      ? "Syncing changes..."
      : failedCount > 0
      ? `Failed to sync ${failedCount} item${failedCount === 1 ? "" : "s"}`
      : `Waiting to sync (${queueLength} pending)`;

    const lastSyncText = lastSyncAt
      ? `Last sync: ${new Intl.DateTimeFormat(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        }).format(lastSyncAt)}`
      : null;

    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-2rem)] animate-in slide-in-from-bottom">
        <div className="flex flex-col gap-2 px-4 py-3 rounded-ds-xl bg-ds-surface-elevated border border-ds-border-base shadow-ds-lg backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <SyncOutlined className="text-ds-text-muted text-lg" />
            <div className="flex-1 text-sm">
              <div className="font-medium text-ds-text-primary">{statusText}</div>
              {lastSyncText && (
                <div className="text-xs text-ds-text-subtle">
                  {lastSyncText}
                  {lastError ? ` — ${lastError}` : ""}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              {failedCount > 0 && (
                <button
                  onClick={clearFailed}
                  className="rounded-ds-md px-2 py-1 text-xs font-medium text-ds-text-primary bg-ds-surface-sunken border border-ds-border-subtle hover:bg-ds-surface transition"
                >
                  Clear failed
                </button>
              )}
              <button
                onClick={() => setShowDetails((prev) => !prev)}
                className="rounded-ds-md px-2 py-1 text-xs font-medium text-ds-text-primary bg-ds-surface-sunken border border-ds-border-subtle hover:bg-ds-surface transition"
              >
                {showDetails ? "Hide details" : "Details"}
              </button>
              <button
                onClick={retry}
                className="flex items-center gap-1 rounded-ds-md px-2 py-1 text-xs font-medium text-ds-text-primary bg-ds-surface-sunken border border-ds-border-subtle hover:bg-ds-surface transition"
              >
                <ReloadOutlined className="text-sm" />
                Retry
              </button>
            </div>
          </div>
          {showDetails && (
            <div className="max-h-36 overflow-y-auto rounded-ds-md border border-ds-border-subtle bg-ds-surface p-2 text-xs text-ds-text-secondary">
              {queueItems.length === 0 ? (
                <div className="text-center text-ds-text-subtle">No queued actions.</div>
              ) : (
                <ul className="space-y-1">
                  {queueItems.slice(0, 10).map((item) => (
                    <li key={item.id} className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-ds-text-primary">
                          {item.init.method ?? "POST"}
                        </span>
                        {item.error && (
                          <span className="text-2xs text-ds-status-danger">{item.error}</span>
                        )}
                      </div>
                      <div className="truncate text-2xs text-ds-text-subtle">{item.url}</div>
                    </li>
                  ))}
                  {queueItems.length > 10 && (
                    <li className="text-center text-2xs text-ds-text-subtle">
                      Showing first 10 of {queueItems.length} queued actions.
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!isOffline) return null;

  // Minimised badge — click to re-expand
  if (!showBanner) {
    return (
      <button
        onClick={() => setShowBanner(true)}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-ds-status-warning/20 border border-ds-status-warning/40 shadow-ds-lg backdrop-blur-sm cursor-pointer transition-transform hover:scale-110"
        aria-label={CONTENT.errors.offlineTitle}
      >
        <WifiOutlined className="text-ds-status-warning text-base" />
      </button>
    );
  }

  // Full offline banner
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-2rem)] animate-in slide-in-from-bottom">
      <div className="flex items-center gap-3 px-4 py-3 rounded-ds-xl bg-ds-status-warning/15 border border-ds-status-warning/30 shadow-ds-lg backdrop-blur-sm">
        <WifiOutlined className="text-ds-status-warning text-lg flex-shrink-0" />
        <span className="text-sm font-medium text-ds-text-primary flex-1">
          {CONTENT.errors.offlineTitle}
          <span className="text-ds-text-secondary font-normal ml-1">
            — {CONTENT.errors.offlineDescription}
          </span>
        </span>
        <button
          onClick={() => setShowBanner(false)}
          className="flex items-center justify-center w-6 h-6 rounded-ds-md hover:bg-ds-surface-sunken transition-colors text-ds-text-subtle hover:text-ds-text-primary bg-transparent border-none cursor-pointer"
          aria-label="Dismiss"
        >
          <CloseOutlined className="text-xs" />
        </button>
      </div>
    </div>
  );
}
