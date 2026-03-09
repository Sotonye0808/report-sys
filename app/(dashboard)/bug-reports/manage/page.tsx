import type { Metadata } from "next";
import { BugReportManagePage } from "@/modules/bug-reports";
import { CONTENT } from "@/config/content";

export const metadata: Metadata = {
  title: CONTENT.bugReports.managePageTitle as string,
  description: CONTENT.seo.bugReportsManageDescription,
};

export default function BugReportsManagePage() {
  return <BugReportManagePage />;
}
