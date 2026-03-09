import type { Metadata } from "next";
import { ProfilePage } from "@/modules/users";
import { CONTENT } from "@/config/content";

export const metadata: Metadata = {
  title: CONTENT.profile.pageTitle as string,
  description: CONTENT.seo.profileDescription,
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { tab } = await searchParams;
  return <ProfilePage defaultTab={tab} />;
}
