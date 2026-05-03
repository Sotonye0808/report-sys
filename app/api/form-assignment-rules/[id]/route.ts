/**
 * PATCH  /api/form-assignment-rules/[id]   — partial update (owner or SUPERADMIN)
 * DELETE /api/form-assignment-rules/[id]   — archive (owner or SUPERADMIN)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/data/prisma";
import { verifyAuth } from "@/lib/utils/auth";
import {
    successResponse,
    badRequestResponse,
    forbiddenResponse,
    notFoundResponse,
    handleApiError,
} from "@/lib/utils/api";
import {
    archiveRule,
    updateRule,
    FormAssignmentRuleValidationError,
} from "@/lib/data/formAssignmentRule";
import { UserRole } from "@/types/global";

const PatchSchema = z.object({
    role: z.nativeEnum(UserRole).optional(),
    assigneeId: z.string().uuid().nullable().optional(),
    campusId: z.string().uuid().nullable().optional(),
    orgGroupId: z.string().uuid().nullable().optional(),
    metricIds: z.array(z.string().uuid()).min(1).max(200).optional(),
    cadenceOverride: z.record(z.string(), z.unknown()).nullable().optional(),
    notes: z.string().max(500).nullable().optional(),
    isActive: z.boolean().optional(),
});

async function authoriseEdit(actorId: string, actorRole: UserRole, ruleId: string) {
    if (actorRole === UserRole.SUPERADMIN) return true;
    const row = await prisma.formAssignmentRule.findUnique({
        where: { id: ruleId },
        select: { ownerId: true },
    });
    return row?.ownerId === actorId;
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        const { id } = await ctx.params;
        const actualRole = (auth.user.actualRole ?? auth.user.role) as UserRole;
        if (!(await authoriseEdit(auth.user.id, actualRole, id))) {
            return NextResponse.json(forbiddenResponse("Not the rule owner"), { status: 403 });
        }
        const body = await req.json().catch(() => ({}));
        const parsed = PatchSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid payload"), {
                status: 400,
            });
        }
        const cleaned: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(parsed.data)) {
            if (v !== undefined) cleaned[k] = v;
        }
        const updated = await updateRule(id, cleaned as never);
        return NextResponse.json(successResponse(updated));
    } catch (err) {
        if (err instanceof FormAssignmentRuleValidationError) {
            const status = err.message === "Rule not found" ? 404 : 400;
            const helper = status === 404 ? notFoundResponse : badRequestResponse;
            return NextResponse.json(helper(err.message), { status });
        }
        return handleApiError(err);
    }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        const { id } = await ctx.params;
        const actualRole = (auth.user.actualRole ?? auth.user.role) as UserRole;
        if (!(await authoriseEdit(auth.user.id, actualRole, id))) {
            return NextResponse.json(forbiddenResponse("Not the rule owner"), { status: 403 });
        }
        const updated = await archiveRule(id);
        return NextResponse.json(successResponse(updated));
    } catch (err) {
        return handleApiError(err);
    }
}
