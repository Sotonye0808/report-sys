/**
 * Root landing page — server component.
 *
 * Auth-aware: shows "Welcome back, <First>" + dashboard CTA when an active
 * session cookie is present, otherwise sign-in / how-it-works CTAs.
 *
 * Content is read through the admin-config substrate (`landing` namespace)
 * with the typed fallback in `config/content.ts`. Admins can edit hero copy,
 * features, and quick-links from Admin Config without a deploy.
 */

import Link from "next/link";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/utils/auth";
import { loadAdminConfig } from "@/lib/data/adminConfig";
import { loadPublicCopy } from "@/lib/data/publicCopy";
import { CONTENT } from "@/config/content";
import { ROLE_DASHBOARD_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";
import { AppFooter } from "@/components/ui/AppFooter";
import { PublicPageHeader } from "@/components/ui/PublicPageHeader";

interface QuickLink {
    label: string;
    href: string;
}

interface HeroCopy {
    eyebrow?: string;
    headline?: string;
    subheadline?: string;
    primaryCtaGuestLabel?: string;
    primaryCtaGuestHref?: string;
    primaryCtaAuthLabel?: string;
    secondaryCtaLabel?: string;
    secondaryCtaHref?: string;
}

interface LandingPayload {
    hero?: HeroCopy;
    features?: Array<{ title: string; body: string }>;
    quickLinksHeading?: string;
    quickLinks?: { authenticated?: QuickLink[]; guest?: QuickLink[] };
    welcomeBack?: string;
    signedOutBadge?: string;
    learnMore?: string;
}

async function readAuth(): Promise<{ firstName?: string; role?: UserRole; signedIn: boolean }> {
    try {
        const store = await cookies();
        const token = store.get(process.env.COOKIE_NAME ?? "hrs_token")?.value;
        if (!token) return { signedIn: false };
        const payload = verifyAccessToken(token);
        if (!payload) return { signedIn: false };
        return {
            signedIn: true,
            role: payload.role as UserRole,
            firstName: payload.email?.split("@")[0],
        };
    } catch {
        return { signedIn: false };
    }
}

export default async function LandingPage() {
    const auth = await readAuth();
    // loadPublicCopy applies sanitisation + deep-merges any partial admin
    // override onto the typed fallback so the page never renders blank fields.
    const snap = await loadPublicCopy<LandingPayload>("landing").catch(() => null);
    const fallback = (CONTENT.landing as unknown) as LandingPayload;
    const data = snap?.payload ?? fallback;

    const hero = data.hero ?? fallback.hero ?? {};
    const features = data.features ?? fallback.features ?? [];
    const quickLinks = auth.signedIn
        ? data.quickLinks?.authenticated ?? fallback.quickLinks?.authenticated ?? []
        : data.quickLinks?.guest ?? fallback.quickLinks?.guest ?? [];

    const dashboardHref = auth.role
        ? ROLE_DASHBOARD_ROUTES[auth.role] ?? "/dashboard"
        : "/dashboard";
    const primaryHref = auth.signedIn ? dashboardHref : hero.primaryCtaGuestHref ?? "/login";
    const primaryLabel = auth.signedIn
        ? hero.primaryCtaAuthLabel ?? "Open my dashboard"
        : hero.primaryCtaGuestLabel ?? "Sign in";

    return (
        <main className="min-h-screen flex flex-col bg-ds-surface-base">
            <PublicPageHeader
                auth={{
                    signedIn: auth.signedIn,
                    dashboardHref,
                    firstName: auth.firstName,
                }}
                welcomeBack={data.welcomeBack ?? undefined}
                signedOutBadge={data.signedOutBadge ?? undefined}
            />

            {/* Hero */}
            <section className="px-6 md:px-10 py-12 md:py-20 max-w-5xl mx-auto w-full">
                {hero.eyebrow && (
                    <p className="text-xs font-semibold uppercase tracking-wide text-ds-brand-accent mb-3">
                        {hero.eyebrow}
                    </p>
                )}
                <h1 className="text-3xl md:text-5xl font-bold text-ds-text-primary leading-tight mb-4">
                    {hero.headline ?? "Reporting, simplified."}
                </h1>
                {hero.subheadline && (
                    <p className="text-base md:text-lg text-ds-text-secondary max-w-3xl mb-8">
                        {hero.subheadline}
                    </p>
                )}
                <div className="flex flex-wrap gap-3">
                    <Link
                        href={primaryHref}
                        className="px-5 py-2.5 rounded-ds-md bg-ds-brand-accent text-white font-medium text-sm hover:opacity-90 transition-opacity no-underline"
                    >
                        {primaryLabel}
                    </Link>
                    {hero.secondaryCtaHref && hero.secondaryCtaLabel && (
                        <Link
                            href={hero.secondaryCtaHref}
                            className="px-5 py-2.5 rounded-ds-md border border-ds-border-base text-ds-text-primary font-medium text-sm hover:bg-ds-surface-sunken transition-colors no-underline"
                        >
                            {hero.secondaryCtaLabel}
                        </Link>
                    )}
                </div>
            </section>

            {/* Features */}
            {features.length > 0 && (
                <section className="px-6 md:px-10 pb-12 max-w-5xl mx-auto w-full">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((f) => (
                            <article
                                key={f.title}
                                className="p-5 bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base"
                            >
                                <h3 className="text-sm font-semibold text-ds-text-primary mb-1.5">
                                    {f.title}
                                </h3>
                                <p className="text-xs text-ds-text-secondary leading-relaxed">{f.body}</p>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {/* Quick links */}
            {quickLinks.length > 0 && (
                <section className="px-6 md:px-10 pb-16 max-w-5xl mx-auto w-full">
                    <h2 className="text-sm font-semibold text-ds-text-primary mb-3">
                        {data.quickLinksHeading ?? "Jump in"}
                    </h2>
                    <ul className="flex flex-wrap gap-2">
                        {quickLinks.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="inline-flex items-center px-3 py-1.5 rounded-ds-md border border-ds-border-base bg-ds-surface-elevated text-sm text-ds-text-primary hover:bg-ds-surface-sunken transition-colors no-underline"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <div className="mt-auto px-6 md:px-10 border-t border-ds-border-subtle">
                <AppFooter />
            </div>
        </main>
    );
}
