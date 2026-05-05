/**
 * /how-it-works — public, server-rendered, content sourced from the
 * `howItWorks` admin-config namespace with a typed fallback in
 * `config/content.ts`. Tab key persists in `?tab=` so the page-level
 * `<HelpLink />` anchor can deep-link into the right article.
 *
 * Auth-aware: when a valid session cookie is present the header swaps
 * "Sign in" for "Dashboard" so signed-in users have a one-click route back.
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { HowItWorksPage } from "@/modules/how-it-works";
import { loadPublicCopy } from "@/lib/data/publicCopy";
import { CONTENT } from "@/config/content";
import { verifyAccessToken } from "@/lib/utils/auth";
import { ROLE_DASHBOARD_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";
import { AppFooter } from "@/components/ui/AppFooter";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { PublicPageHeader } from "@/components/ui/PublicPageHeader";

export const metadata: Metadata = {
    title: "How it works · Harvesters Reporting",
    description:
        "Walkthroughs of every flow + role + admin tool, with FAQs and in-page playgrounds.",
};

async function readAuth(): Promise<{
    signedIn: boolean;
    firstName?: string;
    dashboardHref: string;
}> {
    try {
        const store = await cookies();
        const token = store.get(process.env.COOKIE_NAME ?? "hrs_token")?.value;
        if (!token) return { signedIn: false, dashboardHref: "/dashboard" };
        const payload = verifyAccessToken(token);
        if (!payload) return { signedIn: false, dashboardHref: "/dashboard" };
        const role = payload.role as UserRole;
        return {
            signedIn: true,
            firstName: payload.email?.split("@")[0],
            dashboardHref: ROLE_DASHBOARD_ROUTES[role] ?? "/dashboard",
        };
    } catch {
        return { signedIn: false, dashboardHref: "/dashboard" };
    }
}

export default async function Page() {
    const auth = await readAuth();
    // Sanitised + fallback-merged read so partial admin edits never blank a tab.
    const snap = await loadPublicCopy("howItWorks").catch(() => null);
    const fallback = CONTENT.howItWorks as unknown as Record<string, unknown>;
    const initial = (snap?.payload ?? fallback) as never;
    const landingCopy = (CONTENT.landing as unknown) as {
        welcomeBack?: string;
        signedOutBadge?: string;
    };

    return (
        <main className="min-h-screen flex flex-col bg-ds-surface-base">
            <PublicPageHeader
                auth={{
                    signedIn: auth.signedIn,
                    dashboardHref: auth.dashboardHref,
                    firstName: auth.firstName,
                }}
                welcomeBack={landingCopy.welcomeBack}
                signedOutBadge={landingCopy.signedOutBadge}
            />
            <div className="flex-1">
                {/*
                  HowItWorksPage uses useSearchParams for the ?tab= deep-link
                  contract, which Next.js requires to live inside a Suspense
                  boundary so prerender doesn't bail out at build time.
                */}
                <Suspense fallback={<div className="px-6 py-10 max-w-5xl mx-auto"><LoadingSkeleton rows={6} /></div>}>
                    <HowItWorksPage initial={initial} />
                </Suspense>
            </div>
            <div className="mt-auto px-6 md:px-10 border-t border-ds-border-subtle">
                <AppFooter />
            </div>
        </main>
    );
}
