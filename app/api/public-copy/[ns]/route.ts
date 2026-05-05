/**
 * GET /api/public-copy/[ns]  — return the merged + sanitised public-copy
 *                              snapshot for a public-page namespace.
 *
 * Read is open to anyone (the same content powers the public marketing
 * pages). Writes still go through `/api/admin-config/[ns]` so the existing
 * version-conflict + audit pipeline applies — this surface is read-only.
 */

import { NextRequest, NextResponse } from "next/server";
import { successResponse, badRequestResponse, handleApiError } from "@/lib/utils/api";
import { loadPublicCopy, type PublicCopyNamespace } from "@/lib/data/publicCopy";

const ALLOWED: ReadonlySet<PublicCopyNamespace> = new Set([
    "landing",
    "howItWorks",
    "aboutPage",
    "privacyPage",
    "termsPage",
    "footer",
]);

export async function GET(req: NextRequest, ctx: { params: Promise<{ ns: string }> }) {
    try {
        const { ns } = await ctx.params;
        if (!ALLOWED.has(ns as PublicCopyNamespace)) {
            return NextResponse.json(badRequestResponse(`Unknown public-copy namespace: ${ns}`), {
                status: 400,
            });
        }
        const snap = await loadPublicCopy(ns as PublicCopyNamespace);
        // Public read — no auth check on purpose; the same payload renders on
        // marketing pages without a session.
        void req;
        return NextResponse.json(successResponse(snap));
    } catch (err) {
        return handleApiError(err);
    }
}
