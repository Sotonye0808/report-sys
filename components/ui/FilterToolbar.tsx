"use client";

import { type ReactNode } from "react";
import { Select, DatePicker, Button, Input as AntInput, Checkbox } from "antd";
import { FilterOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { CONTENT } from "@/config/content";

interface FilterItem {
  key: string;
  label: string;
  /** Use `node` to pass arbitrary JSX, or set `type` for built-in controls */
  node?: ReactNode;
  /** Built-in control type */
  type?: "checkbox" | "select" | "text";
  value?: unknown;
  onChange?: (value: unknown) => void;
  options?: { value: string; label: string }[];
}

interface FilterToolbarProps {
  /** Either pass an array of `filters` items OR render children directly */
  filters?: FilterItem[];
  onReset?: () => void;
  extra?: ReactNode;
  className?: string;
  /** Label shown next to the filter icon */
  label?: string;
  /** When true, tints the filter icon to indicate active filters */
  isFiltered?: boolean;
  /** Arbitrary filter controls rendered as children */
  children?: ReactNode;
  /** Built-in search input value */
  searchValue?: string;
  /** Built-in search input change handler */
  onSearchChange?: (value: string) => void;
  /** Built-in search input placeholder */
  searchPlaceholder?: string;
}

export function FilterToolbar({
  filters,
  onReset,
  extra,
  className = "",
  label,
  isFiltered,
  children,
  searchValue,
  onSearchChange,
  searchPlaceholder,
}: FilterToolbarProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 p-4 bg-ds-surface-elevated border border-ds-border-base rounded-ds-xl mb-4 ${className}`}
    >
      <span
        className={[
          "flex items-center gap-1.5 text-sm font-medium shrink-0",
          isFiltered ? "text-ds-brand-accent" : "text-ds-text-secondary",
        ].join(" ")}
      >
        <FilterOutlined />
        {label ?? CONTENT.common.filter}
      </span>

      {/* Built-in search input */}
      {onSearchChange && (
        <AntInput
          prefix={<SearchOutlined className="text-ds-text-subtle" />}
          placeholder={searchPlaceholder ?? "Search…"}
          value={searchValue ?? ""}
          onChange={(e) => onSearchChange(e.target.value)}
          allowClear
          className="w-56"
          size="small"
        />
      )}

      {/* Array-based filter items */}
      {filters?.map((f) => (
        <div key={f.key} className="flex flex-col gap-0.5">
          {f.type === "checkbox" ? (
            <Checkbox checked={!!f.value} onChange={(e) => f.onChange?.(e.target.checked)}>
              <span className="text-xs text-ds-text-secondary">{f.label}</span>
            </Checkbox>
          ) : f.node ? (
            <>
              <span className="text-xs text-ds-text-subtle">{f.label}</span>
              {f.node}
            </>
          ) : null}
        </div>
      ))}

      {/* Direct children */}
      {children}

      {(onReset || extra) && (
        <div className="ml-auto flex gap-2 items-center">
          {extra}
          {onReset && (
            <Button
              icon={<ReloadOutlined />}
              onClick={onReset}
              size="small"
              type="text"
              className="text-ds-text-secondary"
            >
              {CONTENT.common.reset}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export { Select, DatePicker };
export default FilterToolbar;
