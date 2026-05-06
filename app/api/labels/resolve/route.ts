/**
 * POST /api/labels/resolve
 *
 * Batched id → name lookup for the client. Used by `useEntityNames` so a
 * single round-trip resolves every label a page needs (campuses, groups,
 * units, roles, users) instead of N+1 lookups.
 *
 * Auth-required so we don't hand a user-listing endpoint to the world; the
 * payload is purely names + ids + role labels — no PII beyond a display
 * name (firstName + lastName).
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import {
    successResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { resolveEntityNames } from "@/lib/data/entityNames";

const Schema = z.object({
    campusIds: z.array(z.string()).max(500).optional(),
    groupIds: z.array(z.string()).max(500).optional(),
    unitIds: z.array(z.string()).max(500).optional(),
    roleIds: z.array(z.string()).max(500).optional(),
    userIds: z.array(z.string()).max(500).optional(),
});

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        const body = await req.json().catch(() => ({}));
        const parsed = Schema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid payload"),
                { status: 400 },
            );
        }
        const map = await resolveEntityNames(parsed.data);
        const res = NextResponse.json(successResponse(map));
        // Names rarely change; let the browser keep them for a few minutes
        // so subsequent navigations don't re-hit this endpoint.
        res.headers.set("Cache-Control", "private, max-age=300");
        return res;
    } catch (err) {
        return handleApiError(err);
    }
}
