/**
 * config/nav.ts
 * Single unified navigation item array with allowedRoles[] on every item.
 * Role determines which nav items are visible — no separate arrays per role.
 * Sidebar filters via getNavItems(role) which returns the filtered subset.
 */

import {
    AppstoreOutlined,
    BarChartOutlined,
    BellOutlined,
    BugOutlined,
    DatabaseOutlined,
    FileTextOutlined,
    LayoutOutlined,
    LinkOutlined,
    SettingOutlined as _SettingOutlined,
    TeamOutlined,
    ApartmentOutlined,
    TrophyOutlined,
} from "@ant-design/icons";
import { UserRole } from "@/types/global";
import { APP_ROUTES } from "./routes";
import { CONTENT } from "./content";

/* ── All dashboard nav items — filtered by role at render time ──────────── */

export const DASHBOARD_NAV_ITEMS: NavItem[] = [
    {
        key: "dashboard",
        label: CONTENT.nav.dashboard,
        href: APP_ROUTES.dashboard,
        icon: AppstoreOutlined,
        allowedRoles: [
            UserRole.SUPERADMIN,
            UserRole.CAMPUS_ADMIN,
            UserRole.CAMPUS_PASTOR,
            UserRole.GROUP_ADMIN,
            UserRole.GROUP_PASTOR,
            UserRole.CHURCH_MINISTRY,
            UserRole.CEO,
            UserRole.OFFICE_OF_CEO,
            UserRole.SPO,
            UserRole.DATA_ENTRY,
            UserRole.MEMBER,
        ],
    },
    {
        key: "reports",
        label: CONTENT.nav.reports,
        href: APP_ROUTES.reports,
        icon: FileTextOutlined,
        allowedRoles: [
            UserRole.SUPERADMIN,
            UserRole.CAMPUS_ADMIN,
            UserRole.CAMPUS_PASTOR,
            UserRole.GROUP_ADMIN,
            UserRole.GROUP_PASTOR,
            UserRole.CHURCH_MINISTRY,
            UserRole.CEO,
            UserRole.OFFICE_OF_CEO,
            UserRole.SPO,
            UserRole.DATA_ENTRY,
            UserRole.MEMBER,
        ],
    },
    {
        key: "reports-aggregate",
        label: CONTENT.nav.aggregatedReports,
        href: APP_ROUTES.reportAggregate,
        icon: DatabaseOutlined,
        allowedRoles: [
            UserRole.SUPERADMIN,
            UserRole.CEO,
            UserRole.OFFICE_OF_CEO,
            UserRole.SPO,
            UserRole.CHURCH_MINISTRY,
            UserRole.GROUP_ADMIN,
            UserRole.GROUP_PASTOR,
            UserRole.CAMPUS_ADMIN,
            UserRole.CAMPUS_PASTOR,
        ],
    },
    {
        key: "analytics",
        label: CONTENT.nav.analytics,
        href: APP_ROUTES.analytics,
        icon: BarChartOutlined,
        allowedRoles: [
            UserRole.SUPERADMIN,
            UserRole.GROUP_ADMIN,
            UserRole.GROUP_PASTOR,
            UserRole.CHURCH_MINISTRY,
            UserRole.CEO,
            UserRole.OFFICE_OF_CEO,
            UserRole.SPO,
        ],
    },
    {
        key: "inbox",
        label: CONTENT.nav.inbox,
        href: APP_ROUTES.inbox,
        icon: BellOutlined,
        allowedRoles: [
            UserRole.SUPERADMIN,
            UserRole.CAMPUS_ADMIN,
            UserRole.CAMPUS_PASTOR,
            UserRole.GROUP_ADMIN,
            UserRole.GROUP_PASTOR,
            UserRole.CHURCH_MINISTRY,
            UserRole.CEO,
            UserRole.OFFICE_OF_CEO,
            UserRole.SPO,
            UserRole.DATA_ENTRY,
            UserRole.MEMBER,
        ],
    },
    /* — Superadmin-only — */
    {
        key: "templates",
        label: CONTENT.nav.templates,
        href: APP_ROUTES.templates,
        icon: LayoutOutlined,
        allowedRoles: [
            UserRole.SUPERADMIN,
            UserRole.GROUP_ADMIN,
            UserRole.GROUP_PASTOR,
            UserRole.SPO,
            UserRole.CEO,
            UserRole.OFFICE_OF_CEO,
            UserRole.CHURCH_MINISTRY,
        ],
    },
    {
        key: "users",
        label: CONTENT.nav.users,
        href: APP_ROUTES.users,
        icon: TeamOutlined,
        allowedRoles: [UserRole.SUPERADMIN],
    },
    {
        key: "org",
        label: CONTENT.nav.org,
        href: APP_ROUTES.org,
        icon: ApartmentOutlined,
        allowedRoles: [UserRole.SUPERADMIN],
    },
    {
        key: "goals",
        label: CONTENT.nav.goals,
        href: APP_ROUTES.goals,
        icon: TrophyOutlined,
        allowedRoles: [
            UserRole.SUPERADMIN,
            UserRole.GROUP_ADMIN,
            UserRole.GROUP_PASTOR,
            UserRole.CAMPUS_ADMIN,
            UserRole.CAMPUS_PASTOR,
            UserRole.SPO,
            UserRole.CEO,
            UserRole.OFFICE_OF_CEO,
            UserRole.CHURCH_MINISTRY,
        ],
    },
    {
        key: "invites",
        label: CONTENT.nav.invites,
        href: APP_ROUTES.invites,
        icon: LinkOutlined,
        allowedRoles: [
            UserRole.SUPERADMIN,
            UserRole.CAMPUS_ADMIN,
            UserRole.CAMPUS_PASTOR,
            UserRole.GROUP_ADMIN,
            UserRole.GROUP_PASTOR,
        ],
    },
    {
        key: "bug-reports",
        label: CONTENT.nav.bugReports,
        href: APP_ROUTES.bugReports,
        icon: BugOutlined,
        allowedRoles: [
            UserRole.SUPERADMIN,
            UserRole.CAMPUS_ADMIN,
            UserRole.CAMPUS_PASTOR,
            UserRole.GROUP_ADMIN,
            UserRole.GROUP_PASTOR,
            UserRole.CHURCH_MINISTRY,
            UserRole.CEO,
            UserRole.OFFICE_OF_CEO,
            UserRole.SPO,
            UserRole.DATA_ENTRY,
            UserRole.MEMBER,
        ],
    },
    {
        key: "bug-reports-manage",
        label: CONTENT.nav.bugReportsManage,
        href: APP_ROUTES.bugReportsManage,
        icon: BugOutlined,
        allowedRoles: [UserRole.SUPERADMIN],
    },
];

/* ── Backwards-compat exports (consumed by layouts during migration) ──────── */
/** @deprecated Use DASHBOARD_NAV_ITEMS instead */
export const LEADER_NAV_ITEMS = DASHBOARD_NAV_ITEMS;
/** @deprecated Use DASHBOARD_NAV_ITEMS instead */
export const SUPERADMIN_NAV_ITEMS = DASHBOARD_NAV_ITEMS;

/* ── Helper: filter nav items by role ───────────────────────────────────── */

export function getNavItems(role: UserRole): NavItem[] {
    return DASHBOARD_NAV_ITEMS.filter((item) => item.allowedRoles.includes(role));
}
