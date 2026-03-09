"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { WifiOutlined, CloseOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { CONTENT } from "@/config/content";

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
