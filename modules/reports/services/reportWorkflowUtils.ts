import { REPORT_STATUS_TRANSITIONS } from "@/config/reports";
import { ReportStatus, UserRole } from "@/types/global";

export function canTransition(current: ReportStatus, next: ReportStatus, role: UserRole) {
    const allowed = REPORT_STATUS_TRANSITIONS[current] ?? [];
    return allowed.some((t) => t.to === next && t.requiredRole.includes(role));
}

export function appendWorkflowNote(
    existingNotes: string | null | undefined,
    note: string,
    context?: string,
): string {
    const trimmedNote = note.trim();
    const trimmedExisting = (existingNotes ?? "").trim();
    if (!trimmedNote) return trimmedExisting;

    const entry = context ? `(${context}) ${trimmedNote}` : trimmedNote;
    if (!trimmedExisting) return entry;
    return `${trimmedExisting}\n\n${entry}`;
}
