/**
 * lib/data/formAssignmentRule.ts
 *
 * CRUD service for FormAssignmentRule. Validates that:
 *  - every metricId referenced belongs to the rule's templateId,
 *  - either `assigneeId` or `role` is provided (not neither, not both),
 *  - scope (campus/group) is coherent with the role when provided.
 *
 * Returns plain rows (no Prisma client objects); API routes serialise to JSON.
 */

import { prisma } from "@/lib/data/prisma";
import { UserRole } from "@/types/global";
import { CAMPUS_SCOPED_ROLES, GROUP_SCOPED_ROLES } from "@/config/hierarchy";

export class FormAssignmentRuleValidationError extends Error {
    constructor(public reason: string) {
        super(reason);
        this.name = "FormAssignmentRuleValidationError";
    }
}

export interface RuleInput {
    templateId: string;
    role?: UserRole;
    assigneeId?: string;
    campusId?: string;
    orgGroupId?: string;
    metricIds: string[];
    cadenceOverride?: Record<string, unknown> | null;
    notes?: string | null;
    isActive?: boolean;
}

async function validate(input: RuleInput): Promise<void> {
    if (!input.role && !input.assigneeId) {
        throw new FormAssignmentRuleValidationError("Either role or assigneeId must be provided");
    }
    if (input.role && input.assigneeId) {
        throw new FormAssignmentRuleValidationError("Provide role OR assigneeId, not both");
    }
    if (!input.metricIds || input.metricIds.length === 0) {
        throw new FormAssignmentRuleValidationError("metricIds cannot be empty");
    }
    // Metric subset must belong to the template.
    const templateMetrics = await prisma.reportTemplateMetric.findMany({
        where: { section: { templateId: input.templateId } },
        select: { id: true },
    });
    const known = new Set(templateMetrics.map((m) => m.id));
    const missing = input.metricIds.filter((id) => !known.has(id));
    if (missing.length > 0) {
        throw new FormAssignmentRuleValidationError(
            `Metric ids do not belong to template: ${missing.join(", ")}`,
        );
    }
    // Scope coherence: campus-scoped roles need a campusId; group-scoped roles need an orgGroupId.
    if (input.role) {
        if (CAMPUS_SCOPED_ROLES.includes(input.role) && !input.campusId) {
            throw new FormAssignmentRuleValidationError(
                `Role ${input.role} is campus-scoped — campusId is required`,
            );
        }
        if (GROUP_SCOPED_ROLES.includes(input.role) && !input.orgGroupId && !input.campusId) {
            throw new FormAssignmentRuleValidationError(
                `Role ${input.role} is group-scoped — orgGroupId or campusId is required`,
            );
        }
    }
}

export async function listForTemplate(templateId: string) {
    return prisma.formAssignmentRule.findMany({
        where: { templateId },
        orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    });
}

export async function listForRole(role: UserRole) {
    return prisma.formAssignmentRule.findMany({
        where: { role },
        orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    });
}

export async function listForUser(userId: string) {
    return prisma.formAssignmentRule.findMany({
        where: { ownerId: userId },
        orderBy: [{ createdAt: "desc" }],
    });
}

export async function createRule(input: RuleInput, ownerId: string) {
    await validate(input);
    return prisma.formAssignmentRule.create({
        data: {
            ownerId,
            templateId: input.templateId,
            role: input.role,
            assigneeId: input.assigneeId,
            campusId: input.campusId,
            orgGroupId: input.orgGroupId,
            metricIds: input.metricIds,
            cadenceOverride: (input.cadenceOverride as never) ?? undefined,
            notes: input.notes,
            isActive: input.isActive ?? true,
        },
    });
}

export async function updateRule(id: string, patch: Partial<RuleInput>) {
    const existing = await prisma.formAssignmentRule.findUnique({ where: { id } });
    if (!existing) throw new FormAssignmentRuleValidationError("Rule not found");
    const merged: RuleInput = {
        templateId: existing.templateId,
        role: (patch.role ?? existing.role ?? undefined) as UserRole | undefined,
        assigneeId: patch.assigneeId ?? existing.assigneeId ?? undefined,
        campusId: patch.campusId ?? existing.campusId ?? undefined,
        orgGroupId: patch.orgGroupId ?? existing.orgGroupId ?? undefined,
        metricIds: patch.metricIds ?? existing.metricIds,
        cadenceOverride: patch.cadenceOverride ?? (existing.cadenceOverride as Record<string, unknown> | null),
        notes: patch.notes ?? existing.notes,
        isActive: patch.isActive ?? existing.isActive,
    };
    await validate(merged);
    return prisma.formAssignmentRule.update({
        where: { id },
        data: {
            role: merged.role,
            assigneeId: merged.assigneeId,
            campusId: merged.campusId,
            orgGroupId: merged.orgGroupId,
            metricIds: merged.metricIds,
            cadenceOverride: (merged.cadenceOverride as never) ?? undefined,
            notes: merged.notes,
            isActive: merged.isActive,
        },
    });
}

export async function archiveRule(id: string) {
    return prisma.formAssignmentRule.update({
        where: { id },
        data: { isActive: false },
    });
}
