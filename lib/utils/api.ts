/**
 * lib/utils/api.ts
 * Standard API response helpers — used in every route handler.
 */

import { NextResponse } from "next/server";

interface PrismaClientKnownRequestErrorLike {
    name: string;
    code: string;
}

function isPrismaClientKnownRequestError(err: unknown): err is PrismaClientKnownRequestErrorLike {
    return (
        typeof err === "object" &&
        err !== null &&
        "name" in err &&
        "code" in err &&
        (err as any).name === "PrismaClientKnownRequestError"
    );
}

/** Returns a plain { success: true, data } object — wrap in NextResponse.json() at the call site. */
export function successResponse<T>(data: T): { success: true, data: T } {
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

    let status = 500;
    let error = payload?.message ?? "An unexpected error occurred";

    if (isPrismaClientKnownRequestError(err)) {
        // ETIMEDOUT at query time should be treated as temporary service unavailability.
        if (err.code === "ETIMEDOUT" || err.code === "P1001" || err.code === "P1010") {
            status = 503;
            error = "Database connection timeout, please retry shortly";
        }

        if (err.code === "P2002") {
            status = 409;
            error = "Conflict: duplicate data";
        }
    }

    return NextResponse.json(
        {
            success: false,
            error,
            code: status,
            debug: payload,
        },
        { status },
    );
}
