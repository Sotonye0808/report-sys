"use client";

import { ClockCircleOutlined, CheckCircleOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Button } from "@/components/ui/Button";

interface FormDraftBannerProps {
  status: "idle" | "saved" | "restored" | "cleared" | "loading" | "error";
  lastSavedAt: Date | null;
  onClear: () => void;
}

export function FormDraftBanner({ status, lastSavedAt, onClear }: FormDraftBannerProps) {
  const messages: Record<string, string> = {
    idle: "Draft cache is ready.",
    saved: "Draft saved locally.",
    restored: "Draft restored from local cache.",
    cleared: "Local draft cleared.",
    loading: "Checking for drafts...",
    error: "Draft save failed. Please save your work manually.",
  };

  const icon =
    status === "saved" || status === "restored" ? (
      <CheckCircleOutlined className="text-ds-status-success" />
    ) : status === "error" ? (
      <ExclamationCircleOutlined className="text-ds-status-error" />
    ) : (
      <ClockCircleOutlined className="text-ds-status-info" />
    );

  return (
    <div className="flex items-center justify-between gap-3 rounded-ds-md border border-ds-border-strong bg-ds-surface-sunken p-2 text-xs text-ds-text-secondary">
      <div className="flex items-center gap-2">
        {icon}
        <span>{messages[status]}</span>
        {lastSavedAt && <span className="text-ds-text-subtle">{`Last saved: ${lastSavedAt.toLocaleTimeString()}`}</span>}
      </div>
      <Button size="small" icon={<DeleteOutlined />} onClick={onClear} type="text">
        Clear draft
      </Button>
    </div>
  );
}
