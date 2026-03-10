/**
 * config/routes.ts
 * Typed route constants — single source of truth for all app + API paths.
 * Import these everywhere; never write string paths inline.
 *
 * Architecture: flat dashboard URLs — role determines what you SEE, not which
 * URL you visit. No /leader/ or /superadmin/ prefixes. All authenticated users
 * share the same route namespace under (dashboard).
 */

import { UserRole } from "@/types/global";

/* ── Application Routes ─────────────────────────────────────────────────────── */

export const APP_ROUTES = {
    /* — Public / Auth — */
    home: "/",
    login: "/login",
    register: "/register",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    join: "/join",
    about: "/about",
    privacy: "/privacy",
    terms: "/terms",
    offline: "/offline",
    profile: "/profile",
    profileEdit: "/profile/edit",
    profileChangePassword: "/profile/change-password",

    /* — Dashboard (all authenticated roles — flat, no role prefix) — */
    dashboard: "/dashboard",
    reports: "/reports",
    reportDetail: (id: string) => `/reports/${id}`,
    reportNew: "/reports/new",
    reportEdit: (id: string) => `/reports/${id}/edit`,
    analytics: "/analytics",
    inbox: "/inbox",
    settings: "/settings",

    /* — Superadmin-only features (same flat namespace, access controlled in page/layout) — */
    templates: "/templates",
    templateNew: "/templates/new",
    templateDetail: (id: string) => `/templates/${id}`,
    users: "/users",
    userDetail: (id: string) => `/users/${id}`,
    org: "/org",
    invites: "/invites",
    goals: "/goals",

    /* — Bug Reports — */
    bugReports: "/bug-reports",
    bugReportsManage: "/bug-reports/manage",

    /* — Member (scaffolded, no routes built yet) — */
    member: {
        dashboard: "/member/dashboard",
    },
} as const;

/* ── Dashboard Routes by Role (used by AuthProvider redirect) ──────────────── */

export const ROLE_DASHBOARD_ROUTES: Record<UserRole, string> = {
    [UserRole.SUPERADMIN]: APP_ROUTES.dashboard,
    [UserRole.SPO]: APP_ROUTES.dashboard,
    [UserRole.CEO]: APP_ROUTES.dashboard,
    [UserRole.OFFICE_OF_CEO]: APP_ROUTES.dashboard,
    [UserRole.CHURCH_MINISTRY]: APP_ROUTES.dashboard,
    [UserRole.GROUP_PASTOR]: APP_ROUTES.dashboard,
    [UserRole.GROUP_ADMIN]: APP_ROUTES.dashboard,
    [UserRole.CAMPUS_PASTOR]: APP_ROUTES.dashboard,
    [UserRole.CAMPUS_ADMIN]: APP_ROUTES.dashboard,
    [UserRole.DATA_ENTRY]: APP_ROUTES.reports,
    [UserRole.MEMBER]: APP_ROUTES.dashboard,
};

/* ── API Routes ─────────────────────────────────────────────────────────────── */

export const API_ROUTES = {
    auth: {
        login: "/api/auth/login",
        logout: "/api/auth/logout",
        me: "/api/auth/me",
        register: "/api/auth/register",
        refreshToken: "/api/auth/refresh",
        forgotPassword: "/api/auth/forgot-password",
        resetPassword: "/api/auth/reset-password",
        changePassword: "/api/auth/change-password",
    },
    reports: {
        list: "/api/reports",
        detail: (id: string) => `/api/reports/${id}`,
        submit: (id: string) => `/api/reports/${id}/submit`,
        approve: (id: string) => `/api/reports/${id}/approve`,
        review: (id: string) => `/api/reports/${id}/review`,
        lock: (id: string) => `/api/reports/${id}/lock`,
        requestEdit: (id: string) => `/api/reports/${id}/request-edit`,
        history: (id: string) => `/api/reports/${id}/history`,
    },
    reportTemplates: {
        list: "/api/report-templates",
        detail: (id: string) => `/api/report-templates/${id}`,
        versions: (id: string) => `/api/report-templates/${id}/versions`,
    },
    reportUpdateRequests: {
        list: "/api/report-update-requests",
        detail: (id: string) => `/api/report-update-requests/${id}`,
        approve: (id: string) => `/api/report-update-requests/${id}/approve`,
        reject: (id: string) => `/api/report-update-requests/${id}/reject`,
    },
    users: {
        list: "/api/users",
        detail: (id: string) => `/api/users/${id}`,
        profile: "/api/users/profile",
    },
    org: {
        groups: "/api/org/groups",
        group: (id: string) => `/api/org/groups/${id}`,
        campuses: "/api/org/campuses",
        campus: (id: string) => `/api/org/campuses/${id}`,
    },
    analytics: {
        overview: "/api/analytics/overview",
        metrics: "/api/analytics/metrics",
        reports: "/api/analytics/reports",
        compliance: "/api/analytics/compliance",
        goals: "/api/analytics/goals",
        quarterly: "/api/analytics/quarterly",
    },
    goals: {
        list: "/api/goals",
        forReport: "/api/goals/for-report",
        detail: (id: string) => `/api/goals/${id}`,
        unlockRequest: (id: string) => `/api/goals/${id}/unlock-request`,
        approveUnlock: (id: string) => `/api/goals/${id}/unlock-request/approve`,
        rejectUnlock: (id: string) => `/api/goals/${id}/unlock-request/reject`,
    },
    notifications: {
        list: "/api/notifications",
        markRead: (id: string) => `/api/notifications/${id}/read`,
        markAllRead: "/api/notifications/read-all",
    },
    inviteLinks: {
        list: "/api/invite-links",
        create: "/api/invite-links",
        validate: (token: string) => `/api/invite-links/validate/${token}`,
        revoke: (id: string) => `/api/invite-links/${id}`,
    },
    bugReports: {
        list: "/api/bug-reports",
        detail: (id: string) => `/api/bug-reports/${id}`,
    },
} as const;
