import { type ReactNode } from "react";
import { FileTextOutlined } from "@ant-design/icons";
import { CONTENT } from "@/config/content";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className = "" }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-20 gap-4 text-center ${className}`}
    >
      <div className="w-16 h-16 rounded-ds-2xl bg-ds-surface-sunken border border-ds-border-subtle flex items-center justify-center text-3xl text-ds-text-subtle">
        {icon ?? <FileTextOutlined />}
      </div>
      <div className="space-y-1 max-w-sm">
        <p className="text-base font-semibold text-ds-text-primary">
          {title ?? CONTENT.common.noResultsTitle}
        </p>
        {description && <p className="text-sm text-ds-text-secondary">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
