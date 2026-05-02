/**
 * lib/data/formAssignment.ts
 *
 * Assignment-aware narrowing for quick-form workflows. Resolves a
 * FormAssignment for a given (user, assignmentId) tuple, and verifies that
 * any metric IDs being written are inside the assigned subset. Server side
 * MUST verify on every write — the client cannot be trusted.
 */

import { prisma } from "@/lib/data/prisma";

export class FormAssignmentNotFoundError extends Error {
    constructor() {
        super("Form assignment not found");
        this.name = "FormAssignmentNotFoundError";
    }
}

export class FormAssignmentForbiddenError extends Error {
    constructor() {
        super("Not your assignment");
        this.name = "FormAssignmentForbiddenError";
    }
}

export class FormAssignmentMetricMismatchError extends Error {
    constructor(public unauthorizedMetricIds: string[]) {
        super(`Unauthorized metric ids: ${unauthorizedMetricIds.join(",")}`);
        this.name = "FormAssignmentMetricMismatchError";
    }
}

export interface AssignmentForFill {
    id: string;
    reportId: string;
    metricIds: string[];
    dueAt: Date | null;
    completedAt: Date | null;
    cancelledAt: Date | null;
    notes: string | null;
}

export async function loadAssignmentForUser(
    assignmentId: string,
    userId: string,
): Promise<AssignmentForFill> {
    const row = await prisma.formAssignment.findUnique({ where: { id: assignmentId } });
    if (!row) throw new FormAssignmentNotFoundError();
    if (row.assigneeId !== userId) throw new FormAssignmentForbiddenError();
    return {
        id: row.id,
        reportId: row.reportId,
        metricIds: row.metricIds,
        dueAt: row.dueAt,
        completedAt: row.completedAt,
        cancelledAt: row.cancelledAt,
        notes: row.notes,
    };
}

export function verifyMetricSubset(
    submittedMetricIds: string[],
    assignedMetricIds: string[],
): void {
    const allowed = new Set(assignedMetricIds);
    const violators = submittedMetricIds.filter((id) => !allowed.has(id));
    if (violators.length > 0) {
        throw new FormAssignmentMetricMismatchError(violators);
    }
}

export async function markAssignmentComplete(assignmentId: string) {
    return prisma.formAssignment.update({
        where: { id: assignmentId },
        data: { completedAt: new Date() },
    });
}
