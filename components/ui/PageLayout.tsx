import { type ReactNode } from "react";
import { Spin } from "antd";
import { CONTENT } from "@/config/content";

/* ── PageHeader ─────────────────────────────────────────────────────────── */

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, icon, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-ds-text-primary flex items-center gap-2">
          {icon && <span className="text-ds-brand-accent">{icon}</span>}
          {title}
        </h1>
        {subtitle && <p className="text-ds-text-secondary mt-1 text-sm">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

/* ── PageLoading ────────────────────────────────────────────────────────── */

interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message }: PageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center h-96 gap-4">
      <Spin size="large" />
      <p className="text-ds-text-secondary text-sm">{message ?? CONTENT.common.loading}</p>
    </div>
  );
}

/* ── EmptyState (inline) ────────────────────────────────────────────────── */

interface InlineEmptyProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function InlineEmpty({ title, description, icon, action }: InlineEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      {icon && <div className="text-5xl text-ds-text-subtle">{icon}</div>}
      <p className="text-ds-text-primary font-semibold">{title ?? CONTENT.common.noResultsTitle}</p>
      {description && <p className="text-ds-text-secondary text-sm max-w-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* ── PageLayout wrapper ─────────────────────────────────────────────────── */

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  /** When provided, renders a PageHeader at the top of the layout */
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export function PageLayout({
  children,
  className = "",
  title,
  subtitle,
  icon,
  actions,
}: PageLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col p-6 max-w-screen-2xl mx-auto ${className}`}>
      {title && <PageHeader title={title} subtitle={subtitle} icon={icon} actions={actions} />}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
