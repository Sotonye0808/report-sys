import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InboxPage } from "@/modules/notifications";
import { CONTENT } from "@/config/content";
import { verifyAuth } from "@/lib/utils/auth";
import { APP_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";

const INBOX_ALLOWED_ROLES: UserRole[] = [
  UserRole.SUPERADMIN,
  UserRole.CAMPUS_ADMIN,
  UserRole.CAMPUS_PASTOR,
  UserRole.GROUP_ADMIN,
  UserRole.GROUP_PASTOR,
  UserRole.CHURCH_MINISTRY,
  UserRole.CEO,
  UserRole.OFFICE_OF_CEO,
  UserRole.SPO,
  UserRole.DATA_ENTRY,
];

export const metadata: Metadata = {
  title: CONTENT.notifications.pageTitle as string,
  description: CONTENT.seo.inboxDescription,
};

export default async function Page() {
  const auth = await verifyAuth(null, INBOX_ALLOWED_ROLES);
  if (!auth.success) {
    redirect(APP_ROUTES.dashboard);
  }
  return <InboxPage />;
}
