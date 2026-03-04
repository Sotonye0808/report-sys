/**
 * lib/utils/api.ts
 * Standard API response helpers — used in every route handler.
 */

import { NextResponse } from "next/server";

export function successResponse<T>(data: T, status = 200) {
    return NextResponse.json({ success: true, data } satisfies ApiResponse<T>, { status });
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

export function handleApiError(err: unknown) {
    console.error("[API Error]", err);
    const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
    return errorResponse(message, 500);
}
