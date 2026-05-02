import type { Metadata } from "next";
import { BugReportsShell } from "@/modules/bug-reports";
import { CONTENT } from "@/config/content";

export const metadata: Metadata = {
  title: CONTENT.bugReports.pageTitle as string,
  description: CONTENT.seo.bugReportsDescription,
};

export default function BugReportsPage() {
  return <BugReportsShell />;
}
