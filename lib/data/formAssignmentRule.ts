/**
 * lib/data/formAssignmentRule.ts
 *
 * CRUD service for FormAssignmentRule. Validates that:
 *  - every metricId referenced belongs to the rule's templateId,
 *  - either `assigneeId` or `role` is provided (not neither, not both).
 *
 * Scope semantics:
 *   - `campusIds` / `orgGroupIds` are optional. Empty array = applies to ALL
 *     campuses (or all groups) — useful since templates are platform-scoped
 *     and a campus-bound role like USHER always wires their own campus from
 *     the user profile at materialise time.
 *   - Legacy single-value `campusId` / `orgGroupId` are still honoured for
 *     rows created before this contract; new rules should prefer the arrays.
 *
 * Returns plain rows (no Prisma client objects); API routes serialise to JSON.
 */

import { prisma } from "@/lib/data/prisma";
import { UserRole } from "@/types/global";

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
    /** @deprecated Prefer `campusIds`. Kept for legacy rows. */
    campusId?: string;
    /** @deprecated Prefer `orgGroupIds`. Kept for legacy rows. */
    orgGroupId?: string;
    /** Empty array = applies to all campuses. */
    campusIds?: string[];
    /** Empty array = applies to all groups. */
    orgGroupIds?: string[];
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
    // No campus/group requirement: empty scope = all campuses/groups.
    // Templates are platform-scoped and the materialiser pulls the user's
    // own campus at runtime when the rule has no scope set.
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
            campusIds: input.campusIds ?? [],
            orgGroupIds: input.orgGroupIds ?? [],
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
        campusIds: patch.campusIds ?? existing.campusIds ?? [],
        orgGroupIds: patch.orgGroupIds ?? existing.orgGroupIds ?? [],
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
            campusIds: merged.campusIds ?? [],
            orgGroupIds: merged.orgGroupIds ?? [],
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

/* ── Match helper used by materialiser ──────────────────────────────────── */

interface MatchUser {
    id: string;
    role: UserRole;
    campusId?: string | null;
    orgGroupId?: string | null;
    /** Polymorphic OrgUnit id when populated; falls through to legacy fields. */
    unitId?: string | null;
}

interface MatchableRule {
    role: UserRole | null;
    assigneeId: string | null;
    campusId: string | null;
    orgGroupId: string | null;
    campusIds: string[];
    orgGroupIds: string[];
    /** Polymorphic OrgUnit ids — empty array means "applies to every unit". */
    unitIds?: string[] | null;
}

/**
 * Returns true when the rule applies to the given user. Honours every scope
 * encoding: legacy single-value `campusId`/`orgGroupId`, the array columns
 * `campusIds`/`orgGroupIds`, AND the polymorphic `unitIds[]`. Empty scope
 * collections ⇒ rule applies to every unit / campus / group.
 */
export function ruleMatchesUser(rule: MatchableRule, user: MatchUser): boolean {
    // Direct user match always wins.
    if (rule.assigneeId && rule.assigneeId === user.id) return true;
    if (!rule.role) return false;
    if (rule.role !== user.role) return false;

    // Merge every scope encoding into a single deduped list so callers don't
    // need to know which one the rule was written under. Polymorphic
    // `unitIds[]` includes campuses and groups (their UUIDs are the same as
    // OrgUnit ids per the back-fill migration), so legacy + new substrate
    // rules match identically here.
    const merged = new Set<string>();
    for (const id of rule.unitIds ?? []) if (id) merged.add(id);
    for (const id of rule.campusIds ?? []) if (id) merged.add(id);
    for (const id of rule.orgGroupIds ?? []) if (id) merged.add(id);
    if (rule.campusId) merged.add(rule.campusId);
    if (rule.orgGroupId) merged.add(rule.orgGroupId);

    if (merged.size === 0) return true;
    if (user.unitId && merged.has(user.unitId)) return true;
    if (user.campusId && merged.has(user.campusId)) return true;
    if (user.orgGroupId && merged.has(user.orgGroupId)) return true;
    return false;
}
