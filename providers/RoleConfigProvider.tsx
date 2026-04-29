"use client";

/**
 * providers/RoleConfigProvider.tsx
 *
 * Fetches the public admin-config snapshot once on mount and exposes a
 * resolved role/hierarchy/dashboard map to any client component. Components
 * that need a role label or capability bit should read from this provider
 * (via `useResolvedRole`) instead of importing ROLE_CONFIG directly.
 *
 * Falls back to ROLE_CONFIG / ORG_HIERARCHY_CONFIG if the fetch fails so
 * the app never blocks on the substrate.
 */

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ROLE_CONFIG } from "@/config/roles";
import { ORG_HIERARCHY_CONFIG } from "@/config/hierarchy";
import { API_ROUTES } from "@/config/routes";
import { CONTENT } from "@/config/content";
import { useAuth } from "@/providers/AuthProvider";
import { UserRole } from "@/types/global";

export interface PublicHierarchyLevel {
    level: string;
    label: string;
    parentLevel?: string | null;
    childLevel?: string | null;
    leaderRole?: UserRole;
    adminRole?: UserRole;
    depth: number;
}

interface PublicConfigSnapshot {
    roles: Record<UserRole, RoleConfig & { isOverride?: boolean }>;
    hierarchy: PublicHierarchyLevel[];
    dashboardLayout: Record<string, unknown>;
    pwaInstall: Record<string, unknown>;
}

interface RoleConfigContextValue extends PublicConfigSnapshot {
    isLoading: boolean;
    /** Returns a label for a role. SUPERADMIN label is always frozen. */
    labelFor: (role: UserRole) => string;
    /** Returns the resolved RoleConfig (override merged with fallback). */
    configFor: (role: UserRole) => RoleConfig;
    /** Refresh from server (called after admin-config writes). */
    reload: () => Promise<void>;
}

function defaultHierarchy(): PublicHierarchyLevel[] {
    return ORG_HIERARCHY_CONFIG.map((level, idx) => ({
        level: level.level,
        label: level.label,
        parentLevel: level.parentLevel ?? null,
        childLevel: level.childLevel ?? null,
        leaderRole: level.leaderRole,
        adminRole: level.adminRole,
        depth: idx,
    }));
}

function defaultRolesMap(): Record<UserRole, RoleConfig & { isOverride?: boolean }> {
    const out = {} as Record<UserRole, RoleConfig & { isOverride?: boolean }>;
    for (const role of Object.keys(ROLE_CONFIG) as UserRole[]) {
        out[role] = { ...ROLE_CONFIG[role], isOverride: false };
    }
    return out;
}

const RoleConfigContext = createContext<RoleConfigContextValue | null>(null);

export function RoleConfigProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [snapshot, setSnapshot] = useState<PublicConfigSnapshot>(() => ({
        roles: defaultRolesMap(),
        hierarchy: defaultHierarchy(),
        dashboardLayout: {},
        pwaInstall: (CONTENT.pwaInstall ?? {}) as Record<string, unknown>,
    }));
    const [isLoading, setIsLoading] = useState(false);

    const reload = async () => {
        if (!user) return;
        try {
            setIsLoading(true);
            const res = await fetch(API_ROUTES.adminConfig.public, { cache: "no-store" });
            const json = (await res.json()) as { success: boolean; data?: PublicConfigSnapshot };
            if (res.ok && json.success && json.data) {
                setSnapshot({
                    ...json.data,
                    pwaInstall: json.data.pwaInstall ?? (CONTENT.pwaInstall ?? {}),
                });
            }
        } catch {
            // keep fallback snapshot
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) void reload();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const value = useMemo<RoleConfigContextValue>(() => ({
        ...snapshot,
        isLoading,
        labelFor: (role: UserRole) => {
            if (role === UserRole.SUPERADMIN) return ROLE_CONFIG[UserRole.SUPERADMIN].label;
            return snapshot.roles[role]?.label ?? ROLE_CONFIG[role]?.label ?? role;
        },
        configFor: (role: UserRole) => snapshot.roles[role] ?? ROLE_CONFIG[role],
        reload,
    }), [snapshot, isLoading, user?.id]);

    return <RoleConfigContext.Provider value={value}>{children}</RoleConfigContext.Provider>;
}

export function useRoleConfig() {
    const ctx = useContext(RoleConfigContext);
    if (!ctx) {
        // Return a graceful fallback so consumers do not throw outside the provider
        // tree (e.g. server-rendered shells before mount).
        return {
            roles: defaultRolesMap(),
            hierarchy: defaultHierarchy(),
            dashboardLayout: {} as Record<string, unknown>,
            pwaInstall: (CONTENT.pwaInstall ?? {}) as Record<string, unknown>,
            isLoading: false,
            labelFor: (role: UserRole) => ROLE_CONFIG[role]?.label ?? role,
            configFor: (role: UserRole) => ROLE_CONFIG[role],
            reload: async () => undefined,
        } satisfies RoleConfigContextValue;
    }
    return ctx;
}

export function useResolvedRole() {
    const { user } = useAuth();
    const { configFor, labelFor } = useRoleConfig();
    if (!user) return { role: undefined, config: undefined, label: undefined };
    const role = user.role;
    return { role, config: configFor(role), label: labelFor(role) };
}
