import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BugReportManagePage } from "@/modules/bug-reports";
import { CONTENT } from "@/config/content";
import { verifyAuth } from "@/lib/utils/auth";
import { APP_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";

export const metadata: Metadata = {
  title: CONTENT.bugReports.managePageTitle as string,
  description: CONTENT.seo.bugReportsManageDescription,
};

export default async function Page() {
  const auth = await verifyAuth(null, [UserRole.SUPERADMIN]);
  if (!auth.success) {
    redirect(APP_ROUTES.dashboard);
  }
  return <BugReportManagePage />;
}
