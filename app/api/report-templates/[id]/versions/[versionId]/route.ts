/**
 * app/api/report-templates/:id/versions/:versionId/route.ts
 * GET /api/report-templates/:id/versions/:versionId — get a single template version snapshot
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { db } from "@/lib/data/db";
import { successResponse, notFoundResponse, unauthorizedResponse, handleApiError } from "@/lib/utils/api";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; versionId: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id, versionId } = await params;

        const version = await db.reportTemplateVersion.findUnique({ where: { id: versionId } });

        if (!version || version.templateId !== id) {
            return notFoundResponse("Template version not found.");
        }

        return NextResponse.json(successResponse(version));
    } catch (err) {
        return handleApiError(err);
    }
}
