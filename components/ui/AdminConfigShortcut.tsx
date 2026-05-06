"use client";

/**
 * components/ui/AdminConfigShortcut.tsx
 *
 * Floating "Edit page copy" affordance shown only to SUPERADMIN visitors
 * on public pages. Deep-links into the matching Admin Config tab so admins
 * don't have to hunt for the editor.
 *
 * Visibility:
 *   - Hidden by default. Reveals itself only after `/api/auth/me` returns
 *     `role === SUPERADMIN`. Anonymous + non-admin visitors see nothing.
 *
 * Anchor mapping:
 *   - The `pathToTab` map below resolves the current pathname to a tab key
 *     accepted by `/admin-config?tab=…`. Unknown paths fall back to the
 *     home tab.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { EditOutlined } from "@ant-design/icons";

interface MeUser {
    id?: string;
    role?: string;
}

const PATH_TO_TAB: Record<string, string> = {
    "/": "landing",
    "/how-it-works": "howItWorks",
    "/about": "aboutPage",
    "/privacy": "privacyPage",
    "/terms": "termsPage",
};

interface Props {
    /** The pathname this CTA is rendered next to. Resolves the deep-link tab. */
    pathname: keyof typeof PATH_TO_TAB | string;
    /** Override the deep-link tab when needed. */
    tabOverride?: string;
}

export function AdminConfigShortcut({ pathname, tabOverride }: Props) {
    const [isSuperadmin, setIsSuperadmin] = useState(false);

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            try {
                const res = await fetch("/api/auth/me", { credentials: "include" });
                if (!res.ok) return;
                const json = (await res.json()) as { success?: boolean; data?: MeUser };
                if (cancelled) return;
                if (json?.success && json.data?.role === "SUPERADMIN") {
                    setIsSuperadmin(true);
                }
            } catch {
                // Silent — non-admins simply never see the affordance.
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    if (!isSuperadmin) return null;
    const tab = tabOverride ?? PATH_TO_TAB[pathname] ?? "landing";

    return (
        <Link
            href={`/admin-config?tab=${encodeURIComponent(tab)}`}
            className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ds-brand-accent text-white shadow-ds-md hover:shadow-ds-lg transition-shadow no-underline text-sm font-medium"
            aria-label="Edit this page's copy in Admin Config"
        >
            <EditOutlined />
            <span>Edit page copy</span>
        </Link>
    );
}

export default AdminConfigShortcut;
