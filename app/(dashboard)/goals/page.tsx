import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GoalsPage } from "@/modules/goals";
import { CONTENT } from "@/config/content";
import { verifyAuth } from "@/lib/utils/auth";
import { APP_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";

const GOALS_ALLOWED_ROLES: UserRole[] = [
  UserRole.SUPERADMIN,
  UserRole.GROUP_ADMIN,
  UserRole.GROUP_PASTOR,
  UserRole.CAMPUS_ADMIN,
  UserRole.CAMPUS_PASTOR,
  UserRole.SPO,
  UserRole.CEO,
  UserRole.OFFICE_OF_CEO,
  UserRole.CHURCH_MINISTRY,
];

export const metadata: Metadata = {
  title: CONTENT.goals.pageTitle as string,
  description: CONTENT.seo.goalsDescription,
};

export default async function Page() {
  const auth = await verifyAuth(null, GOALS_ALLOWED_ROLES);
  if (!auth.success) {
    redirect(APP_ROUTES.dashboard);
  }
  return <GoalsPage />;
}
