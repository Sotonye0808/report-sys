/**
 * components/ui/Card.tsx
 * Thin wrapper around Ant Design Card with ds-token styling.
 */

import { Card as AntCard } from "antd";
import type { CardProps } from "antd";
import { type ReactNode } from "react";

interface DsCardProps extends Omit<CardProps, "title" | "actions"> {
  title?: ReactNode;
  subtitle?: string;
  actions?: ReactNode[];
  children?: ReactNode;
  noPadding?: boolean;
  className?: string;
}

export function Card({
  title,
  subtitle,
  actions,
  children,
  noPadding = false,
  className = "",
  ...props
}: DsCardProps) {
  return (
    <AntCard
      title={
        title || subtitle ? (
          <div className="flex items-start justify-between gap-4">
            <div>
              {title && <span className="text-ds-text-primary font-semibold">{title}</span>}
              {subtitle && (
                <p className="text-xs text-ds-text-secondary font-normal mt-0.5">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex gap-2">{actions}</div>}
          </div>
        ) : undefined
      }
      className={`bg-ds-surface-elevated border-ds-border-base shadow-ds-sm ${className}`}
      styles={noPadding ? { body: { padding: 0 } } : undefined}
      {...props}
    >
      {children}
    </AntCard>
  );
}

export default Card;
