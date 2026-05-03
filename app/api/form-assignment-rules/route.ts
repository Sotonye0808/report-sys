/**
 * GET  /api/form-assignment-rules?templateId=...&role=...
 * POST /api/form-assignment-rules
 *
 * Lists / creates FormAssignmentRule rows. SUPERADMIN + roles with
 * canManageTemplates can author rules; lookups are unauthenticated reads
 * for any signed-in user (the materialise path filters by user identity).
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import {
    successResponse,
    badRequestResponse,
    forbiddenResponse,
    handleApiError,
} from "@/lib/utils/api";
import {
    createRule,
    listForRole,
    listForTemplate,
    FormAssignmentRuleValidationError,
} from "@/lib/data/formAssignmentRule";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole } from "@/types/global";

function canAuthor(role: UserRole): boolean {
    if (role === UserRole.SUPERADMIN) return true;
    return Boolean(ROLE_CONFIG[role]?.canManageTemplates);
}

const CreateSchema = z.object({
    templateId: z.string().uuid(),
    role: z.nativeEnum(UserRole).optional(),
    assigneeId: z.string().uuid().optional(),
    campusId: z.string().uuid().optional(),
    orgGroupId: z.string().uuid().optional(),
    metricIds: z.array(z.string().uuid()).min(1).max(200),
    cadenceOverride: z.record(z.string(), z.unknown()).nullable().optional(),
    notes: z.string().max(500).nullable().optional(),
    isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        const url = new URL(req.url);
        const templateId = url.searchParams.get("templateId");
        const role = url.searchParams.get("role") as UserRole | null;
        if (!templateId && !role) {
            return NextResponse.json(badRequestResponse("templateId or role is required"), { status: 400 });
        }
        const rows = templateId ? await listForTemplate(templateId) : await listForRole(role!);
        return NextResponse.json(successResponse(rows));
    } catch (err) {
        return handleApiError(err);
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        const actualRole = (auth.user.actualRole ?? auth.user.role) as UserRole;
        if (!canAuthor(actualRole)) {
            return NextResponse.json(forbiddenResponse("Cannot author assignment rules"), { status: 403 });
        }
        const body = await req.json().catch(() => ({}));
        const parsed = CreateSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid payload"), {
                status: 400,
            });
        }
        const created = await createRule(parsed.data, auth.user.id);
        return NextResponse.json(successResponse(created));
    } catch (err) {
        if (err instanceof FormAssignmentRuleValidationError) {
            return NextResponse.json(badRequestResponse(err.reason), { status: 400 });
        }
        return handleApiError(err);
    }
}
