"use client";

/**
 * modules/how-it-works/components/HowItWorksPage.tsx
 *
 * Tabbed walk-through of the platform: per-feature/per-role articles,
 * scenarios, FAQs, and in-page playgrounds. Content comes from the
 * `howItWorks` admin-config namespace (DB-first → typed fallback in
 * `config/content.ts`). Tab key persists in `?tab=` for deep linking
 * (used by the page-level `<HelpLink />` anchor).
 */

import { useEffect, useMemo, useState } from "react";
import { Tabs, Collapse, Empty, Tag } from "antd";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CONTENT } from "@/config/content";
import { getPlayground } from "@/modules/how-it-works/playgrounds";

interface FAQ {
    q: string;
    a: string;
}

interface Section {
    heading: string;
    body: string;
    bullets?: string[];
    example?: string;
}

interface Tab {
    slug: string;
    title: string;
    audience?: string | string[];
    sections?: Section[];
    faqs?: FAQ[];
    playgroundIds?: string[];
}

interface HowItWorksPayload {
    pageTitle?: string;
    pageSubtitle?: string;
    intro?: string;
    tabs?: Tab[];
    playgroundComingSoon?: string;
    relatedHelpHeading?: string;
}

interface Props {
    initial: HowItWorksPayload;
}

export function HowItWorksPage({ initial }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryTab = searchParams.get("tab");
    const fallback = (CONTENT.howItWorks as unknown) as HowItWorksPayload;

    const data: HowItWorksPayload = initial ?? fallback ?? {};
    const tabs = data.tabs ?? fallback.tabs ?? [];
    const playgroundComingSoon =
        data.playgroundComingSoon ?? fallback.playgroundComingSoon ?? "Hands-on playground — coming soon for this section.";

    const initialTab = useMemo(() => {
        if (queryTab && tabs.some((t) => t.slug === queryTab)) return queryTab;
        return tabs[0]?.slug ?? "overview";
    }, [queryTab, tabs]);
    const [active, setActive] = useState(initialTab);

    useEffect(() => {
        if (queryTab && queryTab !== active && tabs.some((t) => t.slug === queryTab)) {
            setActive(queryTab);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryTab]);

    const onChange = (key: string) => {
        setActive(key);
        const params = new URLSearchParams(searchParams.toString());
        if (key === tabs[0]?.slug) params.delete("tab");
        else params.set("tab", key);
        const tail = params.toString();
        router.replace(`${pathname}${tail ? `?${tail}` : ""}`);
    };

    if (tabs.length === 0) {
        return <Empty description="No how-it-works content configured yet." />;
    }

    const items = tabs.map((tab) => ({
        key: tab.slug,
        label: tab.title,
        children: <TabContent tab={tab} playgroundComingSoon={playgroundComingSoon} />,
    }));

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
            <header className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-ds-text-primary mb-2">
                    {data.pageTitle ?? "How it works"}
                </h1>
                {data.pageSubtitle && (
                    <p className="text-sm text-ds-text-secondary">{data.pageSubtitle}</p>
                )}
                {data.intro && (
                    <p className="text-xs text-ds-text-subtle mt-3 leading-relaxed">{data.intro}</p>
                )}
            </header>
            <Tabs activeKey={active} onChange={onChange} items={items} destroyOnHidden={false} />
        </div>
    );
}

function TabContent({ tab, playgroundComingSoon }: { tab: Tab; playgroundComingSoon: string }) {
    const sections = tab.sections ?? [];
    const faqs = tab.faqs ?? [];
    const playgroundIds = tab.playgroundIds ?? [];

    return (
        <div className="flex flex-col gap-6 mt-2">
            {sections.length > 0 && (
                <div className="grid gap-4">
                    {sections.map((sec, idx) => (
                        <article
                            key={`${tab.slug}-sec-${idx}`}
                            className="p-4 bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base"
                        >
                            <h2 className="text-base font-semibold text-ds-text-primary mb-2">
                                {sec.heading}
                            </h2>
                            <p className="text-sm text-ds-text-secondary leading-relaxed whitespace-pre-line">
                                {sec.body}
                            </p>
                            {sec.bullets && sec.bullets.length > 0 && (
                                <ul className="list-disc pl-5 mt-2 text-sm text-ds-text-secondary space-y-1">
                                    {sec.bullets.map((b, i) => (
                                        <li key={i}>{b}</li>
                                    ))}
                                </ul>
                            )}
                            {sec.example && (
                                <div className="mt-3 px-3 py-2 rounded-ds-md bg-ds-surface-sunken border border-ds-border-subtle">
                                    <p className="text-xs uppercase tracking-wide text-ds-text-subtle mb-1">
                                        Example
                                    </p>
                                    <p className="text-xs text-ds-text-secondary whitespace-pre-line">{sec.example}</p>
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            )}

            {playgroundIds.length > 0 && (
                <section>
                    <h3 className="text-sm font-semibold text-ds-text-primary mb-2">Playground</h3>
                    <div className="grid gap-3">
                        {playgroundIds.map((id) => {
                            const pg = getPlayground(id);
                            if (!pg) return null;
                            return (
                                <article
                                    key={id}
                                    className="p-4 bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base"
                                >
                                    <header className="mb-3">
                                        <p className="text-sm font-semibold text-ds-text-primary">{pg.title}</p>
                                        <p className="text-xs text-ds-text-subtle">{pg.description}</p>
                                    </header>
                                    <pg.Component />
                                </article>
                            );
                        })}
                        {/* Surface a hint if every id was unknown to the registry */}
                        {playgroundIds.every((id) => !getPlayground(id)) && (
                            <p className="text-xs text-ds-text-subtle italic">{playgroundComingSoon}</p>
                        )}
                    </div>
                </section>
            )}

            {faqs.length > 0 && (
                <section>
                    <h3 className="text-sm font-semibold text-ds-text-primary mb-2 flex items-center gap-2">
                        FAQs
                        <Tag>{faqs.length}</Tag>
                    </h3>
                    <Collapse
                        accordion
                        items={faqs.map((f, i) => ({
                            key: `${tab.slug}-faq-${i}`,
                            label: <span className="text-sm">{f.q}</span>,
                            children: (
                                <p className="text-sm text-ds-text-secondary leading-relaxed whitespace-pre-line">
                                    {f.a}
                                </p>
                            ),
                        }))}
                    />
                </section>
            )}
        </div>
    );
}

export default HowItWorksPage;
