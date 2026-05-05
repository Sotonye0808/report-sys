/**
 * lib/data/publicCopy.ts
 *
 * Thin wrapper around `lib/data/adminConfig.ts` for public-page namespaces
 * (`landing`, `howItWorks`, `aboutPage`, `privacyPage`, `termsPage`,
 * `footer`). Adds:
 *
 *   - sanitisation: blocks <script>, javascript: URLs, and protocol-relative
 *     URLs from string fields; trims length to a safe maximum;
 *   - shape preservation: callers always get back a fully-shaped object even
 *     when the override payload is partial (deep-merged onto the fallback);
 *   - typed reads: `loadPublicCopy("landing")` returns a snapshot whose
 *     payload is the same shape as `CONTENT.landing`.
 *
 * Public pages render their content from this loader at request time. The
 * underlying admin-config substrate cache + version handling stay unchanged.
 */

import { loadAdminConfig, type AdminConfigNamespaceName } from "@/lib/data/adminConfig";

export type PublicCopyNamespace =
    | "landing"
    | "howItWorks"
    | "aboutPage"
    | "privacyPage"
    | "termsPage"
    | "footer";

const PUBLIC_NAMESPACES: ReadonlySet<PublicCopyNamespace> = new Set([
    "landing",
    "howItWorks",
    "aboutPage",
    "privacyPage",
    "termsPage",
    "footer",
]);

const MAX_FIELD_LEN = 5000;

/**
 * Strip dangerous string content. Applied recursively to every string in the
 * payload tree before persistence and on read so legacy rows are sanitised
 * consistently.
 */
function sanitiseString(value: string): string {
    let out = value;
    // Drop <script ...>...</script> blocks (case-insensitive, multi-line).
    out = out.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    // Drop standalone <script ...> tags too.
    out = out.replace(/<script\b[^>]*>/gi, "");
    // Neutralise javascript: + vbscript: pseudo-protocols.
    out = out.replace(/\bjavascript:/gi, "blocked:");
    out = out.replace(/\bvbscript:/gi, "blocked:");
    // Reject protocol-relative URLs (//evil.example/path) — we want absolute
    // URLs to be either http(s):// or relative paths starting with /.
    out = out.replace(/(^|[\s"'(])\/\/+/g, "$1/");
    // Length cap to keep one rogue paste from filling the column.
    if (out.length > MAX_FIELD_LEN) out = out.slice(0, MAX_FIELD_LEN);
    return out;
}

export function sanitisePublicCopyPayload<T>(payload: T): T {
    if (payload == null) return payload;
    if (typeof payload === "string") return sanitiseString(payload) as never;
    if (Array.isArray(payload)) return payload.map((v) => sanitisePublicCopyPayload(v)) as never;
    if (typeof payload === "object") {
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(payload as Record<string, unknown>)) {
            out[k] = sanitisePublicCopyPayload(v);
        }
        return out as T;
    }
    return payload;
}

/**
 * Deep-merge `override` onto `fallback`. Plain objects merge key-by-key;
 * arrays replace wholesale (so an admin can shorten/reorder a list without
 * inheriting old entries); primitives override.
 */
function deepMerge<T>(fallback: T, override: unknown): T {
    if (override === undefined || override === null) return fallback;
    if (typeof fallback !== "object" || fallback === null) return override as T;
    if (Array.isArray(fallback) || Array.isArray(override)) return override as T;
    if (typeof override !== "object") return override as T;
    const out: Record<string, unknown> = { ...(fallback as Record<string, unknown>) };
    for (const [k, v] of Object.entries(override as Record<string, unknown>)) {
        const fb = (fallback as Record<string, unknown>)[k];
        out[k] = deepMerge(fb, v);
    }
    return out as T;
}

export interface PublicCopySnapshot<T = Record<string, unknown>> {
    namespace: PublicCopyNamespace;
    version: number;
    /** Fully-shaped payload (override deep-merged onto fallback, then sanitised). */
    payload: T;
    source: "db" | "fallback";
}

/**
 * Load a public-copy namespace with sanitisation and fallback merge applied.
 * Equivalent to `loadAdminConfig(ns)` for non-public namespaces, but adds the
 * public-copy guarantees on top.
 */
export async function loadPublicCopy<T = Record<string, unknown>>(
    namespace: PublicCopyNamespace,
): Promise<PublicCopySnapshot<T>> {
    if (!PUBLIC_NAMESPACES.has(namespace)) {
        throw new Error(`"${namespace}" is not a public-copy namespace`);
    }
    const snap = await loadAdminConfig(namespace as AdminConfigNamespaceName);
    // The fallback is always the full shape; deep-merge the (possibly partial)
    // override on top so callers can always rely on the shape being present.
    const fallbackSnap = await loadAdminConfig(namespace as AdminConfigNamespaceName);
    const fallbackPayload = fallbackSnap.source === "fallback" ? fallbackSnap.payload : null;
    const merged = deepMerge<T>(
        (fallbackPayload ?? snap.payload) as T,
        snap.source === "db" ? snap.payload : null,
    );
    return {
        namespace,
        version: snap.version,
        payload: sanitisePublicCopyPayload<T>(merged),
        source: snap.source,
    };
}
