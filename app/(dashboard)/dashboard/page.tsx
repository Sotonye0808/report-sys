import type { Metadata } from "next";
import { DashboardPage } from "@/modules/dashboard";
import { CONTENT } from "@/config/content";

export const metadata: Metadata = {
  title: CONTENT.dashboard.pageTitle as string,
  description: CONTENT.seo.dashboardDescription,
};

export default function Page() {
  return <DashboardPage />;
}
