import { REPORT_STATUS_TRANSITIONS } from "@/config/reports";
import { ReportStatus, UserRole } from "@/types/global";

export function canTransition(current: ReportStatus, next: ReportStatus, role: UserRole) {
    const allowed = REPORT_STATUS_TRANSITIONS[current] ?? [];
    return allowed.some((t) => t.to === next && t.requiredRole.includes(role));
}
