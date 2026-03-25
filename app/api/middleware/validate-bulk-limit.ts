/**
 * app/api/middleware/validate-bulk-limit.ts
 * Shared request validator to block expensive bulk payloads before DB work.
 */

import { NextResponse } from "next/server";

export function validateBulkLimit(payload: unknown, maxItems = 10000): null | ReturnType<typeof NextResponse.json> {
  if (!Array.isArray(payload)) {
    return null;
  }

  if (payload.length > maxItems) {
    return NextResponse.json(
      {
        success: false,
        error: `Payload size too large. Limit is ${maxItems} items. Use smaller batches or contact support for special cases.`,
        code: 413,
        details: { actual: payload.length, limit: maxItems },
      },
      { status: 413 },
    );
  }

  return null;
}
