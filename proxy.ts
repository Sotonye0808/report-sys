/**
 * proxy.ts — Next.js 16 Edge-runtime route guard.
 *
 * Rules:
 *  - Unauthenticated users → redirect to /login?from={pathname}
 *  - Authenticated users visiting /login → redirect to their dashboard
 *  - /templates, /users, /org, /invites, /goals → SUPERADMIN only
 *  - All other dashboard routes → any authenticated role
 *
 * JWT secret must match ACCESS_SECRET in lib/utils/auth.ts.
 */

import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/* ── Constants ─────────────────────────────────────────────────────────────── */

const AUTH_COOKIE = process.env.COOKIE_NAME ?? "hrs_token";
// Must match ACCESS_SECRET in lib/utils/auth.ts
const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET ?? "dev-access-secret-change-me",
);

/** Auth pages — redirect to dashboard if already logged in */
const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/join"];

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

/* ── Helpers ───────────────────────────────────────────────────────────────── */

function redirectTo(url: string, req: NextRequest) {
    return NextResponse.redirect(new URL(url, req.url));
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

/* ── Proxy (Next.js 16 middleware) ─────────────────────────────────────────── */

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const token = req.cookies.get(AUTH_COOKIE)?.value ?? null;
    const user = token ? await getTokenPayload(token) : null;

    /* ── 1. Public / auth routes ──────────────────────────────────────────── */
    const isPublic = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
    if (isPublic) {
        if (user) {
            return redirectTo(ROLE_DASHBOARD[user.role] ?? "/dashboard", req);
        }
        return NextResponse.next();
    }

    /* ── 2. Protected routes — require authentication ─────────────────────── */
    const isProtected = PROTECTED_PREFIX.some(
        (p) => pathname === p || pathname.startsWith(p + "/"),
    );

    if (isProtected && !user) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (!user) return NextResponse.next();

    /* ── 3. Superadmin-only routes ────────────────────────────────────────── */
    const isSuperadminRoute = SUPERADMIN_ROUTES.some(
        (p) => pathname === p || pathname.startsWith(p + "/"),
    );
    if (isSuperadminRoute && user.role !== "SUPERADMIN") {
        return redirectTo(ROLE_DASHBOARD[user.role] ?? "/dashboard", req);
    }

    return NextResponse.next();
}

/* ── Matcher ───────────────────────────────────────────────────────────────── */

export const config = {
    matcher: [
        /*
         * Match all request paths EXCEPT:
         *  - _next/static (static files)
         *  - _next/image  (Next.js image optimisation)
         *  - favicon.ico, manifest, robots, sw.js, logo/…
         *  - /api/* (API routes handle their own auth)
         */
        "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.json|robots\\.txt|sw\\.js|logo/|offline).*)",
    ],
};
