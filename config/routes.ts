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
    verifyEmail: "/verify-email",
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
    reportAnalytics: (id: string) => `/reports/${id}/analytics`,
    reportAggregate: "/reports/aggregate",
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

    /* — Admin Config (superadmin) — */
    adminConfig: "/admin-config",

    /* — Quick Form (USHER / DATA_ENTRY) — */
    quickForm: "/quick-form",
    quickFormFill: (assignmentId: string) => `/quick-form/${assignmentId}`,

    /* — Spreadsheet Imports — */
    imports: "/imports",
    importDetail: (id: string) => `/imports/${id}`,

    /* — Bulk Invites — */
    invitesBulk: "/invites/bulk",

    /* — Activation (after pre-register) — */
    activate: "/activate",

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
    [UserRole.USHER]: APP_ROUTES.quickForm,
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
        emailVerificationRequest: "/api/auth/email-verification/request",
        emailVerificationConfirm: "/api/auth/email-verification/confirm",
        emailVerificationStatus: "/api/auth/email-verification/status",
        emailChangeRequest: "/api/auth/email-change/request",
        emailChangeConfirm: "/api/auth/email-change/confirm",
    },
    reports: {
        list: "/api/reports",
        detail: (id: string) => `/api/reports/${id}`,
        submit: (id: string) => `/api/reports/${id}/submit`,
        approve: (id: string) => `/api/reports/${id}/approve`,
        review: (id: string) => `/api/reports/${id}/review`,
        lock: (id: string) => `/api/reports/${id}/lock`,
        unlock: (id: string) => `/api/reports/${id}/unlock`,

        requestEdit: (id: string) => `/api/reports/${id}/request-edit`,
        edits: (id: string) => `/api/reports/${id}/edits`,
        editsSubmit: (id: string) => `/api/reports/${id}/edits/submit`,
        editsApprove: (id: string, editId: string) => `/api/reports/${id}/edits/${editId}/approve`,
        editsReject: (id: string, editId: string) => `/api/reports/${id}/edits/${editId}/reject`,
        history: (id: string) => `/api/reports/${id}/history`,
        aggregate: "/api/reports/aggregate",
        quickViews: (id: string) => `/api/reports/${id}/quick-views`,
    },
    reportTemplates: {
        list: "/api/report-templates",
        detail: (id: string) => `/api/report-templates/${id}`,
        versions: (id: string) => `/api/report-templates/${id}/versions`,
        versionDetail: (id: string, versionId: string) => `/api/report-templates/${id}/versions/${versionId}`,
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
        hierarchy: "/api/org/hierarchy",
        hierarchyBulk: "/api/org/hierarchy/bulk",
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
        bulk: "/api/goals/bulk",
        forReport: "/api/goals/for-report",
        detail: (id: string) => `/api/goals/${id}`,
        unlockRequest: (id: string) => `/api/goals/${id}/unlock-request`,
        approveUnlock: (id: string) => `/api/goals/${id}/unlock-request/approve`,
        rejectUnlock: (id: string) => `/api/goals/${id}/unlock-request/reject`,
        editRequests: "/api/goals/edit-requests",
        editRequestApprove: (id: string) => `/api/goals/edit-requests/${id}/approve`,
        editRequestReject: (id: string) => `/api/goals/edit-requests/${id}/reject`,
        automation: "/api/goals/automation",
    },
    notifications: {
        list: "/api/notifications",
        markRead: (id: string) => `/api/notifications/${id}/read`,
        markAllRead: "/api/notifications/read-all",
        preferences: "/api/notifications/preferences",
        pushSubscriptions: "/api/notifications/push-subscriptions",
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
    assets: {
        sessions: "/api/assets/sessions",
        sessionUpload: (id: string) => `/api/assets/sessions/${id}/upload`,
        sessionFinalize: (id: string) => `/api/assets/sessions/${id}/finalize`,
        sessionDiscard: (id: string) => `/api/assets/sessions/${id}/discard`,
        cleanup: "/api/assets/cleanup",
    },
    adminConfig: {
        list: "/api/admin-config",
        public: "/api/admin-config/public",
        namespace: (ns: string) => `/api/admin-config/${ns}`,
        reset: (ns: string) => `/api/admin-config/${ns}/reset`,
        reconcile: "/api/admin-config/reconcile",
    },
    orgUnits: {
        list: "/api/org/units",
        detail: (id: string) => `/api/org/units/${id}`,
        archive: (id: string) => `/api/org/units/${id}/archive`,
        promote: (id: string) => `/api/org/units/${id}/promote`,
    },
    rolesV2: {
        list: "/api/roles",
        detail: (id: string) => `/api/roles/${id}`,
    },
    publicCopy: {
        namespace: (ns: string) => `/api/public-copy/${ns}`,
    },
    labels: {
        resolve: "/api/labels/resolve",
    },
    formAssignments: {
        list: "/api/form-assignments",
        detail: (id: string) => `/api/form-assignments/${id}`,
        complete: (id: string) => `/api/form-assignments/${id}/complete`,
        cancel: (id: string) => `/api/form-assignments/${id}/cancel`,
        materialise: "/api/form-assignments/materialise",
    },
    formAssignmentRules: {
        list: "/api/form-assignment-rules",
        detail: (id: string) => `/api/form-assignment-rules/${id}`,
    },
    imports: {
        list: "/api/imports",
        detail: (id: string) => `/api/imports/${id}`,
        file: (id: string) => `/api/imports/${id}/file`,
        mapping: (id: string) => `/api/imports/${id}/mapping`,
        validate: (id: string) => `/api/imports/${id}/validate`,
        commit: (id: string) => `/api/imports/${id}/commit`,
        cancel: (id: string) => `/api/imports/${id}/cancel`,
        profiles: "/api/imports/profiles",
    },
    inviteLinksBulk: "/api/invite-links/bulk",
    preregister: "/api/users/preregister",
    activate: "/api/auth/activate",
    pwaDismissal: "/api/notifications/pwa-dismissal",
    emailTest: "/api/email/test",
    impersonation: {
        start: "/api/impersonation/start",
        stop: "/api/impersonation/stop",
        me: "/api/impersonation/me",
        mode: "/api/impersonation/mode",
        sessions: "/api/impersonation/sessions",
    },
} as const;
