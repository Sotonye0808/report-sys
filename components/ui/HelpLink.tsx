"use client";

/**
 * components/ui/HelpLink.tsx
 *
 * Tiny floating "Need help?" anchor that deep-links into the right
 * `/how-it-works?tab=...` article for the current page. The path → tab map
 * lives in `CONTENT.helpAnchors` (admin-editable in a future namespace);
 * pages with no mapped anchor still see a generic link to the index.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { CONTENT } from "@/config/content";

interface HelpLinkProps {
    /** Optional tab slug override; otherwise resolved from current path. */
    tab?: string;
    /** When true, render inline (no fixed position) for in-content placement. */
    inline?: boolean;
    className?: string;
}

function resolveAnchor(pathname: string): string | undefined {
    const map = (CONTENT.helpAnchors ?? {}) as Record<string, string>;
    if (map[pathname]) return map[pathname];
    // Fallback: try the path's first segment (e.g. `/reports/123` → `/reports`).
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return undefined;
    const firstSegment = `/${segments[0]}`;
    return map[firstSegment];
}

export function HelpLink({ tab, inline = false, className }: HelpLinkProps) {
    const pathname = usePathname() ?? "/";
    const resolved = tab ?? resolveAnchor(pathname);
    const href = resolved ? `/how-it-works?tab=${resolved}` : "/how-it-works";
    const label = (CONTENT.helpLinkLabel as string) ?? "Need help?";
    const aria = (CONTENT.helpLinkAria as string) ?? "Open help for this page";

    const baseClasses = inline
        ? "inline-flex items-center gap-1 text-xs text-ds-text-secondary hover:text-ds-text-primary"
        : "fixed bottom-6 right-6 z-30 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-ds-border-base bg-ds-surface-elevated text-xs text-ds-text-primary shadow-ds-md hover:bg-ds-surface-sunken transition-colors no-underline";

    return (
        <Link
            href={href}
            aria-label={aria}
            target="_blank"
            rel="noreferrer"
            className={[baseClasses, className].filter(Boolean).join(" ")}
        >
            <QuestionCircleOutlined />
            <span>{label}</span>
        </Link>
    );
}

export default HelpLink;
