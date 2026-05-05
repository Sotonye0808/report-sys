/**
 * /terms — public, server-rendered. Content sourced from the `termsPage`
 * admin-config namespace with a typed fallback in `config/content.ts`.
 */

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/utils/auth";
import { CONTENT } from "@/config/content";
import { ROLE_DASHBOARD_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";
import { AppFooter } from "@/components/ui/AppFooter";
import { PublicPageHeader } from "@/components/ui/PublicPageHeader";
import { loadPublicCopy } from "@/lib/data/publicCopy";

export const metadata: Metadata = {
    title: "Terms · Harvesters Reporting",
    description: "House rules for using the platform.",
};

interface PageSection {
    heading: string;
    body: string;
}
interface PagePayload {
    title?: string;
    subtitle?: string;
    sections?: PageSection[];
}

async function readAuth() {
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

export default async function TermsPage() {
    const auth = await readAuth();
    const snap = await loadPublicCopy<PagePayload>("termsPage").catch(() => null);
    const fallback = (CONTENT.termsPage as unknown) as PagePayload;
    const data = snap?.payload ?? fallback;
    const sections = data.sections ?? fallback.sections ?? [];
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
            <div className="flex-1 px-6 md:px-10 py-10 max-w-3xl mx-auto w-full">
                <h1 className="text-3xl font-semibold text-ds-text-primary mb-2">
                    {data.title ?? "Terms"}
                </h1>
                {data.subtitle && (
                    <p className="text-sm text-ds-text-secondary mb-8">{data.subtitle}</p>
                )}
                <div className="space-y-6">
                    {sections.map((s, i) => (
                        <section key={`${s.heading}-${i}`}>
                            <h2 className="text-base font-semibold text-ds-text-primary mb-1.5">
                                {s.heading}
                            </h2>
                            <p className="text-sm text-ds-text-secondary leading-relaxed whitespace-pre-line">
                                {s.body}
                            </p>
                        </section>
                    ))}
                </div>
            </div>
            <div className="mt-auto px-6 md:px-10 border-t border-ds-border-subtle">
                <AppFooter />
            </div>
        </main>
    );
}
