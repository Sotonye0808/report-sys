"use client";

/**
 * components/ui/PublicPageHeader.tsx
 *
 * Auth-aware, responsive header used by the public landing and how-it-works
 * pages. Server components pass in a snapshot of auth state (read from the
 * request cookie) so the header renders correctly on first paint without a
 * client-side flicker; the actual nav links are also auth-aware.
 *
 * Mobile UX: when the viewport is < md, a hamburger toggles a Drawer that
 * houses the same nav links so nothing overflows on narrow screens.
 */

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Drawer } from "antd";
import { MenuOutlined } from "@ant-design/icons";

interface AuthSnapshot {
    signedIn: boolean;
    dashboardHref?: string;
    firstName?: string;
}

interface NavLink {
    label: string;
    href: string;
    /** Only render when the auth state matches. `any` (default) always renders. */
    audience?: "any" | "authenticated" | "guest";
}

interface Props {
    auth: AuthSnapshot;
    /** Optional override; defaults to the standard set. */
    extraLinks?: NavLink[];
    /** Welcome / signed-out badge copy (config-driven where the page provides it). */
    welcomeBack?: string;
    signedOutBadge?: string;
}

const DEFAULT_LINKS: NavLink[] = [
    { label: "How it works", href: "/how-it-works" },
];

export function PublicPageHeader({
    auth,
    extraLinks = [],
    welcomeBack,
    signedOutBadge,
}: Props) {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const links: NavLink[] = [
        ...DEFAULT_LINKS,
        ...extraLinks,
        auth.signedIn
            ? {
                  label: "Dashboard",
                  href: auth.dashboardHref ?? "/dashboard",
                  audience: "authenticated",
              }
            : { label: "Sign in", href: "/login", audience: "guest" },
    ];

    const visibleLinks = links.filter((l) => {
        if (!l.audience || l.audience === "any") return true;
        if (l.audience === "authenticated") return auth.signedIn;
        if (l.audience === "guest") return !auth.signedIn;
        return true;
    });

    const badge = auth.signedIn
        ? `${welcomeBack ?? "Welcome back"}${auth.firstName ? `, ${auth.firstName}` : ""}`
        : signedOutBadge ?? "Not signed in";

    return (
        <header className="px-4 sm:px-6 md:px-10 py-4 flex items-center justify-between border-b border-ds-border-subtle gap-3">
            <Link href="/" className="flex items-center gap-3 no-underline min-w-0">
                <Image
                    src="/logo/white-bg-harvesters-Logo.svg"
                    alt="Harvesters"
                    width={32}
                    height={32}
                    className="flex-shrink-0"
                    priority
                />
                <span className="text-sm font-semibold text-ds-text-primary truncate">
                    Harvesters Reporting
                </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-4 text-sm">
                {visibleLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="text-ds-text-secondary hover:text-ds-text-primary"
                    >
                        {link.label}
                    </Link>
                ))}
                <span className="text-xs text-ds-text-subtle hidden lg:inline">{badge}</span>
            </nav>

            {/* Mobile hamburger */}
            <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-ds-md border border-ds-border-base text-ds-text-primary hover:bg-ds-surface-sunken transition-colors"
                aria-label="Open navigation menu"
                aria-expanded={drawerOpen ? "true" : "false"}
            >
                <MenuOutlined />
            </button>

            <Drawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                placement="right"
                width={280}
                title="Menu"
                styles={{ body: { padding: 0 } }}
            >
                <ul className="flex flex-col py-2">
                    {visibleLinks.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                onClick={() => setDrawerOpen(false)}
                                className="block px-5 py-3 text-sm text-ds-text-primary hover:bg-ds-surface-sunken transition-colors no-underline"
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
                <div className="px-5 py-3 border-t border-ds-border-subtle">
                    <p className="text-xs text-ds-text-subtle">{badge}</p>
                </div>
            </Drawer>
        </header>
    );
}

export default PublicPageHeader;
