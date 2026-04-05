import { UserRole } from "@/types/global";

export interface AggregationScopeOption {
    value: string;
    label: string;
}

export interface OrgRollupContext {
    roleScopeType: "campus" | "group" | "all";
    roleScopeId: string;
    resolvedCampusIds: string[];
    scopeOptions: {
        groups: AggregationScopeOption[];
        campuses: AggregationScopeOption[];
    };
}

export function resolveOrgRollupContext(params: {
    role?: UserRole;
    userCampusId?: string;
    userGroupId?: string;
    hierarchy?: OrgGroupWithDetails[];
}): OrgRollupContext {
    const hierarchy = params.hierarchy ?? [];
    const groupOptions = hierarchy.map((group) => ({ value: group.id, label: group.name }));
    const campusOptions = hierarchy.flatMap((group) =>
        group.campuses.map((campus) => ({
            value: campus.id,
            label: `${group.name} / ${campus.name}`,
        })),
    );

    if (params.role === UserRole.CAMPUS_ADMIN || params.role === UserRole.CAMPUS_PASTOR) {
        return {
            roleScopeType: "campus",
            roleScopeId: params.userCampusId ?? "",
            resolvedCampusIds: params.userCampusId ? [params.userCampusId] : [],
            scopeOptions: { groups: groupOptions, campuses: campusOptions },
        };
    }

    if (params.role === UserRole.GROUP_ADMIN || params.role === UserRole.GROUP_PASTOR) {
        const campusesInGroup =
            hierarchy.find((group) => group.id === params.userGroupId)?.campuses ?? [];
        return {
            roleScopeType: "group",
            roleScopeId: params.userGroupId ?? "",
            resolvedCampusIds: campusesInGroup.map((campus) => campus.id),
            scopeOptions: { groups: groupOptions, campuses: campusOptions },
        };
    }

    return {
        roleScopeType: "all",
        roleScopeId: "",
        resolvedCampusIds: campusOptions.map((campus) => campus.value),
        scopeOptions: { groups: groupOptions, campuses: campusOptions },
    };
}
