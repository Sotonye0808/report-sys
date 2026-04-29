/**
 * POST /api/form-assignments/[id]/quick-fill
 *
 * Writes metric values for a quick-form assignment. The server verifies that:
 *   - the requesting user is the assignee,
 *   - the assignment is active (not cancelled or completed),
 *   - every submitted templateMetricId is within the assigned metric subset,
 *   - the report and its sections exist.
 *
 * If `submit` is true, the assignment is marked complete after the write.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/data/prisma";
import { verifyAuth } from "@/lib/utils/auth";
import {
    successResponse,
    forbiddenResponse,
    badRequestResponse,
    notFoundResponse,
    handleApiError,
} from "@/lib/utils/api";
import {
    loadAssignmentForUser,
    verifyMetricSubset,
    markAssignmentComplete,
    FormAssignmentForbiddenError,
    FormAssignmentMetricMismatchError,
    FormAssignmentNotFoundError,
} from "@/lib/data/formAssignment";

const Schema = z.object({
    metrics: z
        .array(
            z.object({
                templateMetricId: z.string().uuid(),
                monthlyAchieved: z.number().finite().optional(),
                comment: z.string().max(500).optional(),
            }),
        )
        .min(1)
        .max(100),
    submit: z.boolean().default(false),
});

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        const { id } = await ctx.params;
        const body = await req.json();
        const parsed = Schema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid payload"), {
                status: 400,
            });
        }

        const assignment = await loadAssignmentForUser(id, auth.user.id);
        if (assignment.cancelledAt) {
            return NextResponse.json(badRequestResponse("Assignment cancelled"), { status: 400 });
        }
        if (assignment.completedAt) {
            return NextResponse.json(badRequestResponse("Assignment already completed"), { status: 400 });
        }

        verifyMetricSubset(
            parsed.data.metrics.map((m) => m.templateMetricId),
            assignment.metricIds,
        );

        // Find the report metric rows by (reportId, templateMetricId) and update.
        const sections = await prisma.reportSection.findMany({
            where: { reportId: assignment.reportId },
            include: { metrics: true },
        });
        const metricRowByTemplate = new Map<string, { id: string; isLocked: boolean }>();
        for (const sec of sections) {
            for (const rm of sec.metrics) {
                metricRowByTemplate.set(rm.templateMetricId, { id: rm.id, isLocked: rm.isLocked });
            }
        }

        const updates: Array<Promise<unknown>> = [];
        const missing: string[] = [];
        const locked: string[] = [];

        for (const m of parsed.data.metrics) {
            const row = metricRowByTemplate.get(m.templateMetricId);
            if (!row) {
                missing.push(m.templateMetricId);
                continue;
            }
            if (row.isLocked) {
                locked.push(m.templateMetricId);
                continue;
            }
            updates.push(
                prisma.reportMetric.update({
                    where: { id: row.id },
                    data: {
                        monthlyAchieved: m.monthlyAchieved ?? null,
                        comment: m.comment ?? null,
                    },
                }),
            );
        }

        if (missing.length > 0) {
            return NextResponse.json(
                badRequestResponse(`Report has no row for templateMetricId(s): ${missing.join(", ")}`),
                { status: 400 },
            );
        }

        await Promise.all(updates);

        if (parsed.data.submit) {
            await markAssignmentComplete(assignment.id);
        }

        return NextResponse.json(
            successResponse({
                assignmentId: assignment.id,
                updated: updates.length,
                locked,
                completed: parsed.data.submit,
            }),
        );
    } catch (err) {
        if (err instanceof FormAssignmentNotFoundError) {
            return NextResponse.json(notFoundResponse(err.message), { status: 404 });
        }
        if (err instanceof FormAssignmentForbiddenError) {
            return NextResponse.json(forbiddenResponse(err.message), { status: 403 });
        }
        if (err instanceof FormAssignmentMetricMismatchError) {
            return NextResponse.json(
                badRequestResponse(`Unauthorized metric ids: ${err.unauthorizedMetricIds.join(", ")}`),
                { status: 403 },
            );
        }
        return handleApiError(err);
    }
}
