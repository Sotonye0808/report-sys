import type { Metadata } from "next";
import { ReportsListPage } from "@/modules/reports";
import { CONTENT } from "@/config/content";

export const metadata: Metadata = {
  title: CONTENT.reports.pageTitle as string,
  description: CONTENT.seo.reportsDescription,
};

export default function Page() {
  return <ReportsListPage />;
}
