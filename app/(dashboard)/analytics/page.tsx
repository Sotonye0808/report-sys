import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AnalyticsPage } from "@/modules/analytics";
import { CONTENT } from "@/config/content";
import { verifyAuth } from "@/lib/utils/auth";
import { APP_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";

const ANALYTICS_ALLOWED_ROLES: UserRole[] = [
  UserRole.SUPERADMIN,
  UserRole.GROUP_ADMIN,
  UserRole.GROUP_PASTOR,
  UserRole.CHURCH_MINISTRY,
  UserRole.CEO,
  UserRole.OFFICE_OF_CEO,
  UserRole.SPO,
];

export const metadata: Metadata = {
  title: CONTENT.analytics.pageTitle as string,
  description: CONTENT.seo.analyticsDescription,
};

export default async function Page() {
  const auth = await verifyAuth(null, ANALYTICS_ALLOWED_ROLES);
  if (!auth.success) {
    redirect(APP_ROUTES.dashboard);
  }
  return <AnalyticsPage />;
}
