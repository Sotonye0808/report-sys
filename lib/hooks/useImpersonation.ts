"use client";

/**
 * lib/hooks/useImpersonation.ts
 *
 * Read-only convenience hook over AuthProvider's impersonation surface.
 * Returns `{ active, mode, expiresAt, exit, switchMode }` for banner/UI use.
 */

import { useAuth } from "@/providers/AuthProvider";

export function useImpersonation() {
    const { user, stopImpersonation, switchImpersonationMode } = useAuth();
    const active = user?.impersonation;
    return {
        active,
        mode: active?.mode,
        expiresAt: active?.expiresAt,
        impersonatedRole: active?.impersonatedRole,
        impersonatedUserId: active?.impersonatedUserId,
        exit: stopImpersonation,
        switchMode: switchImpersonationMode,
    } as const;
}
