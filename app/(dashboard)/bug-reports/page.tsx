import type { Metadata } from "next";
import { BugReportPage } from "@/modules/bug-reports";
import { CONTENT } from "@/config/content";

export const metadata: Metadata = {
  title: CONTENT.bugReports.pageTitle as string,
  description: CONTENT.seo.bugReportsDescription,
};

export default function BugReportsPage() {
  return <BugReportPage />;
}
