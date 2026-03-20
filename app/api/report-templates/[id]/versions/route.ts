/**
 * app/api/report-templates/[id]/versions/route.ts
 * GET /api/report-templates/:id/versions — list historical template versions
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { getTemplateVersionHistory } from "@/modules/reports/services/templateHistory";
import { successResponse, unauthorizedResponse, notFoundResponse, handleApiError } from "@/lib/utils/api";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id } = await params;
        const versions = await getTemplateVersionHistory(id);
        if (!versions) return notFoundResponse("Template not found.");

        return NextResponse.json(successResponse(versions));
    } catch (err) {
        return handleApiError(err);
    }
}
