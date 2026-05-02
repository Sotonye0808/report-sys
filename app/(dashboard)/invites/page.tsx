import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InvitesShell } from "@/modules/users";
import { CONTENT } from "@/config/content";
import { verifyAuth } from "@/lib/utils/auth";
import { APP_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";

const INVITES_ALLOWED_ROLES: UserRole[] = [
  UserRole.SUPERADMIN,
  UserRole.CAMPUS_ADMIN,
  UserRole.CAMPUS_PASTOR,
  UserRole.GROUP_ADMIN,
  UserRole.GROUP_PASTOR,
];

export const metadata: Metadata = {
  title: CONTENT.invites.pageTitle as string,
  description: CONTENT.seo.invitesDescription,
};

export default async function Page() {
  const auth = await verifyAuth(null, INVITES_ALLOWED_ROLES);
  if (!auth.success) {
    redirect(APP_ROUTES.dashboard);
  }
  return <InvitesShell />;
}
