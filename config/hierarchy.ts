/**
 * config/hierarchy.ts
 * Org hierarchy configuration — 2 levels: Group → Campus.
 * Used to drive org management UI, breadcrumbs, and filtering.
 */

import { UserRole } from "@/types/global";

export const ORG_HIERARCHY_CONFIG: OrgLevelConfig[] = [
    {
        level: "GROUP",
        label: "Group",
        childLevel: "CAMPUS",
        leaderRole: UserRole.GROUP_PASTOR,
        adminRole: UserRole.GROUP_ADMIN,
    },
    {
        level: "CAMPUS",
        label: "Campus",
        parentLevel: "GROUP",
        leaderRole: UserRole.CAMPUS_PASTOR,
        adminRole: UserRole.CAMPUS_ADMIN,
    },
];

/** Map from org level to its config */
export const ORG_LEVEL_MAP: Record<"GROUP" | "CAMPUS", OrgLevelConfig> = {
    GROUP: ORG_HIERARCHY_CONFIG[0],
    CAMPUS: ORG_HIERARCHY_CONFIG[1],
};

/** Which roles are scoped to the CAMPUS level */
export const CAMPUS_SCOPED_ROLES: UserRole[] = [
    UserRole.CAMPUS_PASTOR,
    UserRole.CAMPUS_ADMIN,
    UserRole.DATA_ENTRY,
    UserRole.USHER,
];

/** Which roles are scoped to the GROUP level */
export const GROUP_SCOPED_ROLES: UserRole[] = [
    UserRole.GROUP_PASTOR,
    UserRole.GROUP_ADMIN,
];

/** Which roles have no org-scope restriction (see all) */
export const GLOBAL_SCOPE_ROLES: UserRole[] = [
    UserRole.SUPERADMIN,
    UserRole.SPO,
    UserRole.CEO,
    UserRole.OFFICE_OF_CEO,
    UserRole.CHURCH_MINISTRY,
];

/** Get the org scope type for a role */
export function getOrgScope(role: UserRole): "campus" | "group" | "global" {
    if (CAMPUS_SCOPED_ROLES.includes(role)) return "campus";
    if (GROUP_SCOPED_ROLES.includes(role)) return "group";
    return "global";
}
