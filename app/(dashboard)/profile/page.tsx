import { ProfilePage } from "@/modules/users";
import { CONTENT } from "@/config/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: CONTENT.profile.pageTitle as string,
};

interface PageProps {
    searchParams: Promise<{ tab?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
    const { tab } = await searchParams;
    return <ProfilePage defaultTab={tab} />;
}
