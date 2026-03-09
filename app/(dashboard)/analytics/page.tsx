import type { Metadata } from "next";
import { AnalyticsPage } from "@/modules/analytics";
import { CONTENT } from "@/config/content";

export const metadata: Metadata = {
  title: CONTENT.analytics.pageTitle as string,
  description: CONTENT.seo.analyticsDescription,
};

export default function Page() {
  return <AnalyticsPage />;
}
