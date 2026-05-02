/**
 * lib/utils/joinRedirect.ts
 *
 * Sanitises query-param redirect targets used by /join (and similar invite
 * landing flows). Only whitelisted authenticated routes are allowed;
 * everything else falls back to the dashboard.
 *
 * Allowed query string parameters per target are also whitelisted so that
 * a malicious `redirect=...&payload=...` cannot smuggle arbitrary state
 * into the destination page.
 */

import { APP_ROUTES } from "@/config/routes";

/** Path → list of allowed query keys that can travel through redirect. */
const ALLOWED_TARGETS: Record<string, string[]> = {
    [APP_ROUTES.reportNew]: ["templateId", "period", "metricIds", "campusId", "groupId"],
    [APP_ROUTES.reports]: ["campusId", "groupId", "period", "status"],
    [APP_ROUTES.reportAggregate]: ["templateId", "scope", "period"],
    [APP_ROUTES.quickForm]: [],
    [APP_ROUTES.goals]: ["templateId", "year"],
    [APP_ROUTES.imports]: [],
};

const FALLBACK = APP_ROUTES.dashboard;

/**
 * Parse a raw `redirect` query string (URL-encoded).
 * Returns a sanitised pathname + filtered query string,
 * or the dashboard fallback if anything fails validation.
 */
export function sanitiseJoinRedirect(rawRedirect: string | null | undefined): string {
    if (!rawRedirect) return FALLBACK;

    let decoded: string;
    try {
        decoded = decodeURIComponent(rawRedirect);
    } catch {
        return FALLBACK;
    }

    if (!decoded.startsWith("/")) return FALLBACK;
    if (decoded.startsWith("//")) return FALLBACK; // protocol-relative
    if (decoded.includes("@")) return FALLBACK; // user-info smuggling

    let pathname: string;
    let queryStr: string;
    const qIndex = decoded.indexOf("?");
    if (qIndex < 0) {
        pathname = decoded;
        queryStr = "";
    } else {
        pathname = decoded.slice(0, qIndex);
        queryStr = decoded.slice(qIndex + 1);
    }

    if (!Object.prototype.hasOwnProperty.call(ALLOWED_TARGETS, pathname)) {
        return FALLBACK;
    }

    const allowedKeys = ALLOWED_TARGETS[pathname];
    const cleanedParams = new URLSearchParams();
    if (queryStr) {
        const candidate = new URLSearchParams(queryStr);
        for (const [k, v] of candidate.entries()) {
            if (allowedKeys.includes(k) && v.length <= 200) {
                cleanedParams.append(k, v);
            }
        }
    }
    const tail = cleanedParams.toString();
    return tail ? `${pathname}?${tail}` : pathname;
}
