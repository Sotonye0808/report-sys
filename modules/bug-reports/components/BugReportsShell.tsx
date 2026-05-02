"use client";

/**
 * modules/bug-reports/components/BugReportsShell.tsx
 *
 * Tabbed wrapper that hosts the existing BugReportPage (submit) and the
 * BugReportManagePage (admin queue). The "Manage" tab is only rendered for
 * users that can manage bug reports (currently superadmin), which is the
 * same gating the standalone /bug-reports/manage page enforced.
 */

import { useEffect, useMemo, useState } from "react";
import { Tabs } from "antd";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CONTENT } from "@/config/content";
import { useAuth } from "@/providers/AuthProvider";
import { UserRole } from "@/types/global";
import { BugReportPage } from "./BugReportPage";
import { BugReportManagePage } from "./BugReportManagePage";

const TAB_KEYS = ["submit", "manage"] as const;
type TabKey = (typeof TAB_KEYS)[number];

export function BugReportsShell() {
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryTab = searchParams.get("tab");
    const [active, setActive] = useState<TabKey>(
        TAB_KEYS.includes(queryTab as TabKey) ? (queryTab as TabKey) : "submit",
    );

    useEffect(() => {
        if (TAB_KEYS.includes(queryTab as TabKey) && queryTab !== active) {
            setActive(queryTab as TabKey);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryTab]);

    const canManage = user?.role === UserRole.SUPERADMIN;

    const items = useMemo(() => {
        const base: Array<{ key: TabKey; label: string; children: React.ReactNode }> = [
            {
                key: "submit",
                label: ((CONTENT.bugReports as unknown) as Record<string, string>).pageTitle ?? "Report a Bug",
                children: <BugReportPage />,
            },
        ];
        if (canManage) {
            base.push({
                key: "manage",
                label: ((CONTENT.bugReports as unknown) as Record<string, string>).managePageTitle ?? "Bug Reports",
                children: <BugReportManagePage />,
            });
        }
        return base;
    }, [canManage]);

    const onChange = (key: string) => {
        const next = TAB_KEYS.includes(key as TabKey) ? (key as TabKey) : "submit";
        setActive(next);
        const params = new URLSearchParams(searchParams.toString());
        if (next === "submit") params.delete("tab");
        else params.set("tab", next);
        const tail = params.toString();
        router.replace(`${pathname}${tail ? `?${tail}` : ""}`);
    };

    return <Tabs activeKey={active} onChange={onChange} destroyOnHidden={false} items={items} />;
}

export default BugReportsShell;
