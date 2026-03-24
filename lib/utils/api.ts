/**
 * lib/utils/api.ts
 * Standard API response helpers — used in every route handler.
 */

import { NextResponse } from "next/server";

/** Returns a plain { success: true, data } object — wrap in NextResponse.json() at the call site. */
export function successResponse<T>(data: T): { success: true; data: T } {
    return { success: true, data };
}

export function errorResponse(error: string, status: number) {
    return NextResponse.json({ success: false, error, code: status } satisfies ApiResponse<never>, {
        status,
    });
}

export function unauthorizedResponse(message = "Unauthorised") {
    return errorResponse(message, 401);
}

export function forbiddenResponse(message = "Insufficient permissions") {
    return errorResponse(message, 403);
}

export function notFoundResponse(message = "Not found") {
    return errorResponse(message, 404);
}

export function badRequestResponse(message = "Bad request") {
    return errorResponse(message, 400);
}

function getErrorPayload(err: unknown) {
    if (err instanceof Error) {
        const extra: Record<string, unknown> = {};
        for (const key in err) {
            // Include non-standard fields like code/meta from Prisma.
            (extra as any)[key] = (err as any)[key];
        }

        return {
            name: err.name,
            message: err.message,
            stack: err.stack,
            ...extra,
        };
    }
    if (typeof err === "string") {
        return { message: err };
    }
    return { message: "Unknown error" };
}

export function handleApiError(err: unknown) {
    const payload = getErrorPayload(err);
    console.error("[API Error]", payload);
    const message = payload?.message ?? "An unexpected error occurred";

    // Include debug metadata for production diagnosis (per request).
    return NextResponse.json(
        {
            success: false,
            error: message,
            code: 500,
            debug: payload,
        },
        { status: 500 },
    );
}
