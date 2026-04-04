/**
 * lib/utils/api.ts
 * Standard API response helpers — used in every route handler.
 */

import { NextResponse } from "next/server";
import { logServerError } from "@/lib/utils/serverLogger";

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
export function successResponse<T>(data: T, requestId?: string): { success: true, data: T, requestId?: string } {
    return requestId ? { success: true, data, requestId } : { success: true, data };
}

export function errorResponse(error: string, status: number, requestId?: string) {
    return NextResponse.json({ success: false, error, code: status, ...(requestId ? { requestId } : {}) } satisfies ApiResponse<never> & { requestId?: string }, {
        status,
        headers: requestId ? { "x-request-id": requestId } : undefined,
    });
}

export function unauthorizedResponse(message = "Unauthorised", requestId?: string) {
    return errorResponse(message, 401, requestId);
}

export function forbiddenResponse(message = "Insufficient permissions", requestId?: string) {
    return errorResponse(message, 403, requestId);
}

export function notFoundResponse(message = "Not found", requestId?: string) {
    return errorResponse(message, 404, requestId);
}

export function badRequestResponse(message = "Bad request", requestId?: string) {
    return errorResponse(message, 400, requestId);
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

export function handleApiError(
    err: unknown,
    options?: { requestId?: string; route?: string; context?: Record<string, unknown> },
) {
    const payload = getErrorPayload(err);
    logServerError("[API Error]", {
        requestId: options?.requestId,
        route: options?.route,
        error: payload,
        ...options?.context,
    });

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
            ...(process.env.NODE_ENV !== "production" ? { debug: payload } : {}),
            ...(options?.requestId ? { requestId: options.requestId } : {}),
        },
        {
            status,
            headers: options?.requestId ? { "x-request-id": options.requestId } : undefined,
        },
    );
}
