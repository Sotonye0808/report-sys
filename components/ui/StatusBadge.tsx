import { Tag } from "antd";
import type {
  ReportStatus,
  ReportEditStatus,
  ReportUpdateRequestStatus,
  GoalEditRequestStatus,
  UserRole,
} from "@/types/global";
import { CONTENT } from "@/config/content";

/* ── Report Status ──────────────────────────────────────────────────────── */

const REPORT_STATUS_COLOR: Record<ReportStatus, string> = {
  DRAFT: "default",
  SUBMITTED: "processing",
  REQUIRES_EDITS: "warning",
  APPROVED: "success",
  REVIEWED: "cyan",
  LOCKED: "error",
};

interface ReportStatusBadgeProps {
  status: ReportStatus;
}

export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  return (
    <Tag
      color={REPORT_STATUS_COLOR[status]}
      className="font-medium text-xs uppercase tracking-wide"
    >
      {CONTENT.reports.status[status]}
    </Tag>
  );
}

/* ── Generic Edit/Update Request Status ────────────────────────────────── */

const REQUEST_STATUS_COLOR: Record<string, string> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
  DRAFT: "default",
  SUBMITTED: "processing",
};

interface RequestStatusBadgeProps {
  status: ReportEditStatus | ReportUpdateRequestStatus | GoalEditRequestStatus;
}

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  return (
    <Tag
      color={REQUEST_STATUS_COLOR[status] ?? "default"}
      className="font-medium text-xs uppercase tracking-wide"
    >
      {status}
    </Tag>
  );
}

/* ── Role Badge ─────────────────────────────────────────────────────────── */

const ROLE_COLOR: Record<UserRole, string> = {
  SUPERADMIN: "red",
  SPO: "volcano",
  CEO: "orange",
  CHURCH_MINISTRY: "gold",
  GROUP_PASTOR: "purple",
  GROUP_ADMIN: "geekblue",
  CAMPUS_PASTOR: "blue",
  CAMPUS_ADMIN: "cyan",
  DATA_ENTRY: "magenta",
  MEMBER: "green",
};

interface RoleBadgeProps {
  role: UserRole;
  label?: string;
}

export function RoleBadge({ role, label }: RoleBadgeProps) {
  return (
    <Tag color={ROLE_COLOR[role]} className="font-medium text-xs">
      {label ?? CONTENT.users.roles[role]}
    </Tag>
  );
}

/* ── Active/Inactive Badge ──────────────────────────────────────────────── */

interface ActiveBadgeProps {
  isActive: boolean;
}

export function ActiveBadge({ isActive }: ActiveBadgeProps) {
  return (
    <Tag color={isActive ? "success" : "default"} className="font-medium text-xs">
      {isActive ? CONTENT.users.activeStatus : CONTENT.users.inactiveStatus}
    </Tag>
  );
}
