import { db } from "@/lib/data/db";
import { UserRole } from "@/types/global";

type OrgLevel = "GROUP" | "CAMPUS";

export interface OrgHierarchyCampus {
    id: string;
    name: string;
    orgLevel: OrgLevel;
    parentId: string;
    isActive: boolean;
    country?: string;
    location?: string;
}

export interface OrgHierarchyGroup {
    id: string;
    name: string;
    orgLevel: OrgLevel;
    isActive: boolean;
    country?: string;
    leaderId?: string;
    campuses: OrgHierarchyCampus[];
}

export type OrgHierarchy = OrgHierarchyGroup[];

export function scopeByRole(user: AuthUser): { campusIds?: string[]; groupId?: string; all: boolean } {
    if (!user || !user.role) {
        return { all: false };
    }

    if (user.role === UserRole.CAMPUS_ADMIN || user.role === UserRole.CAMPUS_PASTOR) {
        return {
            all: false,
            campusIds: user.campusId ? [user.campusId] : [],
        };
    }

    if (user.role === UserRole.GROUP_ADMIN || user.role === UserRole.GROUP_PASTOR) {
        return {
            all: false,
            groupId: user.orgGroupId,
        };
    }

    return { all: true };
}

export function filterHierarchyByScope(hierarchy: OrgHierarchy, scope: { campusIds?: string[]; groupId?: string; all: boolean }): OrgHierarchy {
    if (scope.all) return hierarchy;

    if (scope.groupId) {
        return hierarchy
            .filter((group) => group.id === scope.groupId)
            .map((group) => ({
                ...group,
                campuses: group.campuses.filter((campus) =>
                    !scope.campusIds?.length || scope.campusIds.includes(campus.id),
                ),
            }));
    }

    if (scope.campusIds?.length) {
        return hierarchy
            .map((group) => ({
                ...group,
                campuses: group.campuses.filter((campus) => scope.campusIds?.includes(campus.id)),
            }))
            .filter((group) => group.campuses.length > 0);
    }

    return [];
}

export async function getOrgHierarchy(): Promise<OrgHierarchy> {
    const groups = await db.orgGroup.findMany({
        orderBy: { name: "asc" },
        include: {
            campuses: {
                orderBy: { name: "asc" },
            },
        },
    });

    return groups.map((group) => ({
        id: group.id,
        name: group.name,
        orgLevel: "GROUP",
        isActive: group.isActive,
        country: group.country ?? "",
        leaderId: group.leaderId ?? undefined,
        campuses: (group.campuses ?? []).map((campus) => ({
            id: campus.id,
            name: campus.name,
            orgLevel: "CAMPUS",
            parentId: campus.parentId,
            isActive: campus.isActive,
            country: campus.country ?? "",
            location: campus.location ?? "",
        })),
    }));
}
