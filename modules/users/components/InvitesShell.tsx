"use client";

/**
 * modules/users/components/InvitesShell.tsx
 *
 * Tabbed wrapper that hosts the legacy single-invite UI (InvitesPage) and
 * the bulk-invite + pre-register surface (BulkInvitesPage). Tab key is
 * persisted in `?tab=` so the unified URL remains deep-linkable and the
 * 308 redirect from `/invites/bulk` lands on the right tab.
 */

import { useEffect, useMemo, useState } from "react";
import { Tabs } from "antd";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CONTENT } from "@/config/content";
import { useAuth } from "@/providers/AuthProvider";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole } from "@/types/global";
import { InvitesPage } from "./InvitesPage";
import { BulkInvitesPage } from "@/modules/bulk-invites/components/BulkInvitesPage";

const TAB_KEYS = ["links", "bulk"] as const;
type TabKey = (typeof TAB_KEYS)[number];

export function InvitesShell() {
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryTab = searchParams.get("tab");
    const [active, setActive] = useState<TabKey>(
        TAB_KEYS.includes(queryTab as TabKey) ? (queryTab as TabKey) : "links",
    );

    useEffect(() => {
        if (TAB_KEYS.includes(queryTab as TabKey) && queryTab !== active) {
            setActive(queryTab as TabKey);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryTab]);

    const canBulk = user ? Boolean(ROLE_CONFIG[user.role as UserRole]?.canBulkInvite) : false;

    const items = useMemo(() => {
        const base: Array<{ key: TabKey; label: string; children: React.ReactNode }> = [
            {
                key: "links",
                label: ((CONTENT.invites as unknown) as Record<string, string>).pageTitle ?? "Invite Links",
                children: <InvitesPage />,
            },
        ];
        if (canBulk) {
            base.push({
                key: "bulk",
                label:
                    ((CONTENT.bulkInvites as Record<string, unknown>)?.pageTitle as string | undefined) ??
                    "Bulk Invites",
                children: <BulkInvitesPage />,
            });
        }
        return base;
    }, [canBulk]);

    const onChange = (key: string) => {
        const next = TAB_KEYS.includes(key as TabKey) ? (key as TabKey) : "links";
        setActive(next);
        const params = new URLSearchParams(searchParams.toString());
        if (next === "links") params.delete("tab");
        else params.set("tab", next);
        const tail = params.toString();
        router.replace(`${pathname}${tail ? `?${tail}` : ""}`);
    };

    return <Tabs activeKey={active} onChange={onChange} destroyOnHidden={false} items={items} />;
}

export default InvitesShell;
