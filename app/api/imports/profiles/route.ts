/**
 * GET /api/imports/profiles — list saved mapping profiles for current user
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/data/prisma";
import { verifyAuth } from "@/lib/utils/auth";
import { successResponse, forbiddenResponse, handleApiError } from "@/lib/utils/api";
import { ROLE_CONFIG } from "@/config/roles";

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        if (!ROLE_CONFIG[auth.user.role]?.canImportSpreadsheets) {
            return NextResponse.json(forbiddenResponse("Imports not permitted"), { status: 403 });
        }
        const url = new URL(req.url);
        const templateId = url.searchParams.get("templateId");
        const rows = await prisma.importMappingProfile.findMany({
            where: {
                ownerId: auth.user.id,
                templateId: templateId ?? undefined,
            },
            orderBy: [{ updatedAt: "desc" }],
            take: 100,
        });
        return NextResponse.json(successResponse(rows));
    } catch (err) {
        return handleApiError(err);
    }
}
