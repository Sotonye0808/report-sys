/**
 * lib/auth/impersonationContext.ts
 *
 * Request-scoped accessor for the active impersonation session. Memoised via
 * React's `cache()` so a single handler invocation only loads the session
 * once across multiple `verifyAuth` / audit / mutation-guard callers.
 *
 * Server-only.
 */

import "server-only";

import { cache } from "react";
import { loadActiveSession, type ActiveImpersonation } from "@/lib/auth/impersonation";

/**
 * Returns the currently active impersonation session for this request, or
 * null. Cached for the life of the React render / route invocation.
 */
export const getImpersonationContext = cache(
    async (): Promise<ActiveImpersonation | null> => loadActiveSession(),
);
