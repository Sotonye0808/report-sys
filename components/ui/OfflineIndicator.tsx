"use client";

import { useState, useEffect } from "react";
import { WifiOutlined, CloseOutlined } from "@ant-design/icons";
import { CONTENT } from "@/config/content";

/**
 * OfflineIndicator — collapsible banner shown when the browser goes offline.
 * Automatically hides once connectivity is restored.
 */
export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const goOffline = () => {
      setIsOffline(true);
      setDismissed(false);
    };
    const goOnline = () => setIsOffline(false);

    // Check initial state
    if (!navigator.onLine) goOffline();

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!isOffline || dismissed) return null;

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
          onClick={() => setDismissed(true)}
          className="flex items-center justify-center w-6 h-6 rounded-ds-md hover:bg-ds-surface-sunken transition-colors text-ds-text-subtle hover:text-ds-text-primary bg-transparent border-none cursor-pointer"
          aria-label="Dismiss"
        >
          <CloseOutlined className="text-xs" />
        </button>
      </div>
    </div>
  );
}
