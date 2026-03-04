"use client";

import { useAuth } from "@/providers/AuthProvider";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole } from "@/types/global";

/**
 * useRole
 * Returns the current user's role config and permission helpers.
 */
export function useRole() {
    const { user } = useAuth();
    const role = user?.role;
    const config = role ? ROLE_CONFIG[role] : null;

    return {
        role,
        config,
        /** Check if the current user's role is one of the provided roles */
        hasRole: (roles: UserRole | UserRole[]): boolean => {
            if (!role) return false;
            return Array.isArray(roles) ? roles.includes(role) : roles === role;
        },
        /** Capabilities shorthand */
        can: {
            createReports: config?.canCreateReports ?? false,
            fillReports: config?.canFillReports ?? false,
            submitReports: config?.canSubmitReports ?? false,
            requestEdits: config?.canRequestEdits ?? false,
            approveReports: config?.canApproveReports ?? false,
            markReviewed: config?.canMarkReviewed ?? false,
            lockReports: config?.canLockReports ?? false,
            manageTemplates: config?.canManageTemplates ?? false,
            dataEntry: config?.canDataEntry ?? false,
            manageUsers: config?.canManageUsers ?? false,
            manageOrg: config?.canManageOrg ?? false,
            setGoals: config?.canSetGoals ?? false,
            approveGoalUnlock: config?.canApproveGoalUnlock ?? false,
        },
    };
}
