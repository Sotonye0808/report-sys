/**
 * /how-it-works — public, server-rendered, content sourced from the
 * `howItWorks` admin-config namespace with a typed fallback in
 * `config/content.ts`. Tab key persists in `?tab=` so the page-level
 * `<HelpLink />` anchor can deep-link into the right article.
 */

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { HowItWorksPage } from "@/modules/how-it-works";
import { loadAdminConfig } from "@/lib/data/adminConfig";
import { CONTENT } from "@/config/content";
import { AppFooter } from "@/components/ui/AppFooter";

export const metadata: Metadata = {
    title: "How it works · Harvesters Reporting",
    description:
        "Walkthroughs of every flow + role + admin tool, with FAQs and in-page playgrounds.",
};

export default async function Page() {
    const snap = await loadAdminConfig("howItWorks").catch(() => null);
    const fallback = CONTENT.howItWorks as unknown as Record<string, unknown>;
    const initial = (snap?.payload ?? fallback) as never;

    return (
        <main className="min-h-screen flex flex-col bg-ds-surface-base">
            <header className="px-6 md:px-10 py-4 flex items-center justify-between border-b border-ds-border-subtle">
                <Link href="/" className="flex items-center gap-3 no-underline">
                    <Image
                        src="/logo/white-bg-harvesters-Logo.svg"
                        alt="Harvesters"
                        width={32}
                        height={32}
                    />
                    <span className="text-sm font-semibold text-ds-text-primary">
                        Harvesters Reporting
                    </span>
                </Link>
                <nav className="flex items-center gap-4 text-sm">
                    <Link
                        href="/login"
                        className="text-ds-text-secondary hover:text-ds-text-primary"
                    >
                        Sign in
                    </Link>
                </nav>
            </header>
            <div className="flex-1">
                <HowItWorksPage initial={initial} />
            </div>
            <div className="mt-auto px-6 md:px-10 border-t border-ds-border-subtle">
                <AppFooter />
            </div>
        </main>
    );
}
