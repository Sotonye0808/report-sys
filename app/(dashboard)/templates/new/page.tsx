import { redirect } from "next/navigation";
import { verifyAuth } from "@/lib/utils/auth";
import { TemplateNewPage } from "@/modules/templates";
import { APP_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";

const TEMPLATES_ALLOWED_ROLES: UserRole[] = [
  UserRole.SUPERADMIN,
  UserRole.GROUP_ADMIN,
  UserRole.GROUP_PASTOR,
  UserRole.SPO,
  UserRole.CEO,
  UserRole.CHURCH_MINISTRY,
];

export default async function Page() {
  const auth = await verifyAuth(null, TEMPLATES_ALLOWED_ROLES);
  if (!auth.success) {
    redirect(APP_ROUTES.dashboard);
  }
  return <TemplateNewPage />;
}
