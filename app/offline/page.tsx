"use client";

/**
 * app/offline/page.tsx
 * Shown by the service worker when the user is offline and no cached page exists.
 */

import { WifiOutlined, ReloadOutlined } from "@ant-design/icons";
import { CONTENT } from "@/config/content";
import Button from "@/components/ui/Button";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-ds-surface-base flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-ds-surface-elevated border border-ds-border-base mb-6">
          <WifiOutlined className="text-4xl text-ds-text-subtle" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-ds-text-primary tracking-tight mb-2">
          {(CONTENT.offline?.title as string) ?? "You're Offline"}
        </h1>
        <p className="text-sm text-ds-text-secondary mb-8 leading-relaxed">
          {(CONTENT.offline?.description as string) ??
            "It looks like you've lost your internet connection. Check your connection and try again."}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 items-center">
          <Button
            type="primary"
            size="large"
            icon={<ReloadOutlined />}
            onClick={() => window.location.reload()}
          >
            {(CONTENT.offline?.retryButton as string) ?? "Try Again"}
          </Button>
          <p className="text-xs text-ds-text-subtle">
            {(CONTENT.offline?.hint as string) ??
              "Previously viewed pages may still be accessible from cache."}
          </p>
        </div>

        {/* Brand mark */}
        <div className="mt-12">
          <div className="inline-flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-ds-brand-accent flex items-center justify-center">
              <span className="text-white font-bold text-xs">H</span>
            </div>
            <span className="text-xs text-ds-text-subtle font-medium">
              Harvesters Reporting System
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
