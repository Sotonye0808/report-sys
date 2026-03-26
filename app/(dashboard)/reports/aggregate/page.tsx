import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ReportAggregationPage } from "@/modules/reports/components/ReportAggregationPage";
import { verifyAuth } from "@/lib/utils/auth";
import { APP_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";
import { CONTENT } from "@/config/content";

const REPORTS_ALLOWED_ROLES: UserRole[] = [
  UserRole.SUPERADMIN,
  UserRole.GROUP_ADMIN,
  UserRole.GROUP_PASTOR,
  UserRole.CAMPUS_ADMIN,
  UserRole.CAMPUS_PASTOR,
  UserRole.CEO,
  UserRole.OFFICE_OF_CEO,
  UserRole.SPO,
  UserRole.CHURCH_MINISTRY,
];

export const metadata: Metadata = {
  title: "Aggregate Reports",
  description: CONTENT.seo.reportsDescription,
};

export default async function Page() {
  const auth = await verifyAuth(null, REPORTS_ALLOWED_ROLES);
  if (!auth.success) {
    redirect(APP_ROUTES.dashboard);
  }
  return <ReportAggregationPage />;
}
