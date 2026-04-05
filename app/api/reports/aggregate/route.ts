/**
 * app/api/reports/aggregate/route.ts
 * POST /api/reports/aggregate  - preview or generate an aggregated report
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { successResponse, badRequestResponse, forbiddenResponse, notFoundResponse, handleApiError } from "@/lib/utils/api";
import { ReportStatus, ReportPeriodType, UserRole } from "@/types/global";
import { calculateAggregation, persistAggregatedReport, AggregationCriteria, AggregationNoReportsError } from "@/lib/data/reportAggregation";

const AggregationRequestSchema = z.object({
    scopeType: z.enum(["campus", "group", "all"]),
    scopeId: z.string().uuid().optional(),
    periodType: z.nativeEnum(ReportPeriodType),
    periodYear: z.number().int().min(2000).max(2100),
    periodMonth: z.number().int().min(1).max(12).optional(),
    periodWeek: z.number().int().min(1).max(53).optional(),
    templateId: z.string().uuid().optional(),
    includeStatuses: z.array(z.nativeEnum(ReportStatus)).optional(),
    metricIds: z.array(z.string()).optional(),
    action: z.enum(["preview", "generate"]).default("preview"),
});

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
        }

        const body = AggregationRequestSchema.parse(await req.json());
        const scopeType = body.scopeType;
        let scopeId = body.scopeId;

        if (auth.user.role === UserRole.CAMPUS_ADMIN || auth.user.role === UserRole.CAMPUS_PASTOR) {
            scopeId = auth.user.campusId;
        }

        if (auth.user.role === UserRole.GROUP_ADMIN || auth.user.role === UserRole.GROUP_PASTOR) {
            if (scopeType === "group") {
                scopeId = auth.user.orgGroupId;
            }
        }

        const criteria: AggregationCriteria = {
            scopeType: body.scopeType,
            scopeId,
            periodType: body.periodType,
            periodYear: body.periodYear,
            periodMonth: body.periodMonth,
            periodWeek: body.periodWeek,
            templateId: body.templateId,
            includeStatuses: body.includeStatuses,
            metricIds: body.metricIds,
            action: body.action,
        };

        if (criteria.scopeType === "campus" && !criteria.scopeId) {
            return badRequestResponse("campus scope requires scopeId.");
        }
        if (criteria.scopeType === "group" && !criteria.scopeId) {
            return badRequestResponse("group scope requires scopeId.");
        }

        const aggregationResult = await calculateAggregation(criteria, auth.user);

        if (criteria.action === "generate") {
            const report = await persistAggregatedReport(aggregationResult, auth.user);
            return NextResponse.json(successResponse({ report, aggregation: aggregationResult }));
        }

        return NextResponse.json(successResponse({ aggregation: aggregationResult }));
    } catch (err) {
        if (err instanceof z.ZodError) {
            return badRequestResponse("Invalid aggregation request payload.");
        }
        if (err instanceof AggregationNoReportsError) {
            return notFoundResponse(err.message);
        }
        if (err instanceof Error && err.message.includes("not authorized")) {
            return forbiddenResponse(err.message);
        }
        if (err instanceof Error && err.message.includes("requires")) {
            return badRequestResponse(err.message);
        }
        return handleApiError(err);
    }
}
