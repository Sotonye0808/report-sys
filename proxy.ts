/**
 * proxy.ts — Next.js 16 Edge-runtime proxy (replaces middleware.ts).
 *
 * Responsibilities:
 *  1. Security headers on every response (CSP, HSTS, X-Frame-Options, etc.)
 *  2. Rate limiting on API routes (Upstash Ratelimit — edge-compatible)
 *  3. Auth route guards:
 *     - Unauthenticated users → redirect to /login?from={pathname}
 *     - Authenticated users visiting /login → redirect to their dashboard
 *     - /templates, /users, /org, /invites, /goals → SUPERADMIN only
 *     - All other dashboard routes → any authenticated role
 *
 * JWT secret must match ACCESS_SECRET in lib/utils/auth.ts.
 */

import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/* ── Security Headers ──────────────────────────────────────────────────────── */

const SECURITY_HEADERS: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
        "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

function applySecurityHeaders(response: NextResponse): NextResponse {
    for (const [key, val] of Object.entries(SECURITY_HEADERS)) {
        response.headers.set(key, val);
    }
    return response;
}

/* ── Rate Limiters (Edge-compatible, lazy-init) ────────────────────────────── */

let _redis: Redis | null = null;
function getRedis(): Redis | null {
    if (_redis) return _redis;
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
    _redis = Redis.fromEnv();
    return _redis;
}

const PREFIX = process.env.REDIS_PREFIX ?? "hrs:";

let _apiLimiter: Ratelimit | null = null;
let _authLimiter: Ratelimit | null = null;
let _bulkLimiter: Ratelimit | null = null;

function getApiLimiter(): Ratelimit | null {
    if (_apiLimiter) return _apiLimiter;
    const r = getRedis();
    if (!r) return null;
    _apiLimiter = new Ratelimit({ redis: r, limiter: Ratelimit.slidingWindow(60, "60 s"), prefix: `${PREFIX}rl:api`, analytics: true });
    return _apiLimiter;
}

function getAuthLimiter(): Ratelimit | null {
    if (_authLimiter) return _authLimiter;
    const r = getRedis();
    if (!r) return null;
    _authLimiter = new Ratelimit({ redis: r, limiter: Ratelimit.slidingWindow(10, "60 s"), prefix: `${PREFIX}rl:auth`, analytics: true });
    return _authLimiter;
}

function getBulkLimiter(): Ratelimit | null {
    if (_bulkLimiter) return _bulkLimiter;
    const r = getRedis();
    if (!r) return null;
    // Bulk operations are expected to be coalesced in a single request. Allow a higher burst.
    _bulkLimiter = new Ratelimit({ redis: r, limiter: Ratelimit.slidingWindow(120, "60 s"), prefix: `${PREFIX}rl:bulk`, analytics: true });
    return _bulkLimiter;
}

/* ── Auth Constants ────────────────────────────────────────────────────────── */

const AUTH_COOKIE = process.env.COOKIE_NAME ?? "hrs_token";
const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET ?? "dev-access-secret-change-me",
);

/** Auth pages — redirect to dashboard if already logged in */
const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/join", "/verify-email"];

/** Routes accessible only to SUPERADMIN */
const SUPERADMIN_ROUTES = ["/templates", "/users", "/org", "/invites", "/goals"];

/** All protected route prefixes — require any authenticated user */
const PROTECTED_PREFIX = [
    "/dashboard",
    "/reports",
    "/analytics",
    "/inbox",
    "/settings",
    "/profile",
    "/templates",
    "/users",
    "/org",
    "/invites",
    "/goals",
];

const ROLE_DASHBOARD: Record<string, string> = {
    SUPERADMIN: "/dashboard",
    SPO: "/dashboard",
    CEO: "/dashboard",
    CHURCH_MINISTRY: "/dashboard",
    GROUP_PASTOR: "/dashboard",
    GROUP_ADMIN: "/dashboard",
    CAMPUS_PASTOR: "/dashboard",
    CAMPUS_ADMIN: "/dashboard",
    DATA_ENTRY: "/reports",
    MEMBER: "/dashboard",
};

/* ── Auth Helpers ──────────────────────────────────────────────────────────── */

function redirectTo(url: string, req: NextRequest) {
    return applySecurityHeaders(NextResponse.redirect(new URL(url, req.url)));
}

interface TokenPayload {
    userId: string;
    role: string;
    email: string;
}

async function getTokenPayload(token: string): Promise<TokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (
            typeof payload["userId"] === "string" &&
            typeof payload["role"] === "string" &&
            typeof payload["email"] === "string"
        ) {
            return {
                userId: payload["userId"],
                role: payload["role"],
                email: payload["email"],
            };
        }
        return null;
    } catch {
        return null;
    }
}

/* ── Proxy (Next.js 16 edge proxy — replaces middleware) ───────────────────── */

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    /* ─── API routes: rate limiting + security headers ─────────────────────── */
    if (pathname.startsWith("/api/")) {
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            req.headers.get("x-real-ip") ??
            "unknown";

        const isAuth = pathname.startsWith("/api/auth/");
        const isBulk = pathname === "/api/goals/bulk";
        const limiter = isAuth ? getAuthLimiter() : isBulk ? getBulkLimiter() : getApiLimiter();
        const identifier = `${ip}:${isAuth ? "auth" : isBulk ? "bulk" : "api"}`;

        if (limiter) {
            try {
                const { success, limit, remaining, reset } = await limiter.limit(identifier);

                if (!success) {
                    return applySecurityHeaders(
                        NextResponse.json(
                            { success: false, error: "Too many requests. Please try again later.", code: 429 },
                            {
                                status: 429,
                                headers: {
                                    "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
                                    "X-RateLimit-Limit": String(limit),
                                    "X-RateLimit-Remaining": "0",
                                },
                            },
                        ),
                    );
                }

                const response = applySecurityHeaders(NextResponse.next());
                response.headers.set("X-RateLimit-Limit", String(limit));
                response.headers.set("X-RateLimit-Remaining", String(remaining));
                return response;
            } catch {
                // Redis unavailable — let the request through
                return applySecurityHeaders(NextResponse.next());
            }
        }

        // No Redis configured — pass through with security headers
        return applySecurityHeaders(NextResponse.next());
    }

    /* ─── Page routes: auth guards ─────────────────────────────────────────── */

    const token = req.cookies.get(AUTH_COOKIE)?.value ?? null;
    const user = token ? await getTokenPayload(token) : null;

    /* 1. Public / auth routes */
    const isPublic = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
    if (isPublic) {
        if (user) {
            return redirectTo(ROLE_DASHBOARD[user.role] ?? "/dashboard", req);
        }
        return applySecurityHeaders(NextResponse.next());
    }

    /* 2. Protected routes — require authentication */
    const isProtected = PROTECTED_PREFIX.some(
        (p) => pathname === p || pathname.startsWith(p + "/"),
    );

    if (isProtected && !user) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("from", pathname);
        return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }

    if (!user) return applySecurityHeaders(NextResponse.next());

    /* 3. Superadmin-only routes */
    const isSuperadminRoute = SUPERADMIN_ROUTES.some(
        (p) => pathname === p || pathname.startsWith(p + "/"),
    );
    if (isSuperadminRoute && user.role !== "SUPERADMIN") {
        return redirectTo(ROLE_DASHBOARD[user.role] ?? "/dashboard", req);
    }

    return applySecurityHeaders(NextResponse.next());
}

/* ── Matcher ───────────────────────────────────────────────────────────────── */

export const config = {
    matcher: [
        /*
         * Match all request paths EXCEPT:
         *  - _next/static (static files)
         *  - _next/image  (Next.js image optimisation)
         *  - favicon.ico, manifest, robots, sw.js, logo/…
         */
        "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.json|robots\\.txt|sw\\.js|logo/|offline).*)",
    ],
};
