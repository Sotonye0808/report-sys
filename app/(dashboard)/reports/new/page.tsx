import type { Metadata } from "next";
import { ReportNewPage } from "@/modules/reports";
import { CONTENT } from "@/config/content";

export const metadata: Metadata = {
  title: CONTENT.reports.newReport as string,
  description: CONTENT.seo.newReportDescription,
};

export default function Page() {
  return <ReportNewPage />;
}
