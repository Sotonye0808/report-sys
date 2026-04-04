import type { NextRequest } from "next/server";

export interface RequestContext {
  requestId: string;
  route: string;
  method: string;
}

export function getRequestContext(req: NextRequest): RequestContext {
  const existing = req.headers.get("x-request-id");
  const requestId = existing && existing.trim().length > 0 ? existing : crypto.randomUUID();
  const { pathname } = new URL(req.url);

  return {
    requestId,
    route: pathname,
    method: req.method,
  };
}

