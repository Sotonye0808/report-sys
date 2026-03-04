/**
 * middleware.ts
 * Edge-runtime route protection for the Harvesters Reporting System.
 *
 * Rules:
 *  - Unauthenticated users → redirect to /login
 *  - Authenticated users visiting /login → redirect to their dashboard
 *  - /superadmin/* → SUPERADMIN only
 *  - /leader/* → all roles EXCEPT MEMBER
 *  - /member/* → MEMBER only
 *  - Wrong-role access → redirect to the user's correct dashboard
 */

import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/* ── Constants ─────────────────────────────────────────────────────────────── */

const AUTH_COOKIE = "hrs_token";
const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET ?? "harvesters-dev-secret-change-in-production",
);

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/join"];

const SUPERADMIN_ONLY = ["/superadmin"];
const LEADER_ROUTES = ["/leader"];
const MEMBER_ROUTES = ["/member"];

/* ── UserRole enum values (duplicated here — no Node imports in Edge) ───────── */

const LEADER_ROLES = new Set([
    "SPO",
    "CEO",
    "CHURCH_MINISTRY",
    "GROUP_PASTOR",
    "GROUP_ADMIN",
    "CAMPUS_PASTOR",
    "CAMPUS_ADMIN",
    "DATA_ENTRY",
]);

const ROLE_DASHBOARD: Record<string, string> = {
    SUPERADMIN: "/superadmin/dashboard",
    SPO: "/leader/dashboard",
    CEO: "/leader/dashboard",
    CHURCH_MINISTRY: "/leader/dashboard",
    GROUP_PASTOR: "/leader/dashboard",
    GROUP_ADMIN: "/leader/dashboard",
    CAMPUS_PASTOR: "/leader/dashboard",
    CAMPUS_ADMIN: "/leader/dashboard",
    DATA_ENTRY: "/leader/reports",
    MEMBER: "/member/dashboard",
};

/* ── Helpers ───────────────────────────────────────────────────────────────── */

function redirectTo(url: string, req: NextRequest) {
    return NextResponse.redirect(new URL(url, req.url));
}

function startsWithAny(path: string, prefixes: string[]) {
    return prefixes.some((p) => path.startsWith(p));
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

/* ── Middleware ────────────────────────────────────────────────────────────── */

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const token = req.cookies.get(AUTH_COOKIE)?.value ?? null;
    const user = token ? await getTokenPayload(token) : null;

    /* ── 1. Public / static paths — always allow ──────────────────────────── */
    // (The matcher below already excludes _next, api, static assets)

    /* ── 2. Auth routes (/login, /register, etc.) ─────────────────────────── */
    if (AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
        if (user) {
            // Already logged in → send to their dashboard
            const dashboard = ROLE_DASHBOARD[user.role] ?? "/login";
            return redirectTo(dashboard, req);
        }
        return NextResponse.next();
    }

    /* ── 3. Protected routes — must be authenticated ──────────────────────── */
    const isProtected =
        startsWithAny(pathname, SUPERADMIN_ONLY) ||
        startsWithAny(pathname, LEADER_ROUTES) ||
        startsWithAny(pathname, MEMBER_ROUTES) ||
        pathname.startsWith("/profile");

    if (isProtected && !user) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (!user) return NextResponse.next();

    /* ── 4. Role-based route guard ─────────────────────────────────────────── */
    const { role } = user;
    const userDashboard = ROLE_DASHBOARD[role] ?? "/login";

    // /superadmin/* — SUPERADMIN only
    if (startsWithAny(pathname, SUPERADMIN_ONLY) && role !== "SUPERADMIN") {
        return redirectTo(userDashboard, req);
    }

    // /leader/* — all leader roles
    if (startsWithAny(pathname, LEADER_ROUTES) && !LEADER_ROLES.has(role)) {
        return redirectTo(userDashboard, req);
    }

    // /member/* — MEMBER only
    if (startsWithAny(pathname, MEMBER_ROUTES) && role !== "MEMBER") {
        return redirectTo(userDashboard, req);
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
