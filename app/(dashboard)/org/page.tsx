import { redirect } from "next/navigation";
import { verifyAuth } from "@/lib/utils/auth";
import { OrgPage } from "@/modules/org";
import { APP_ROUTES } from "@/config/routes";

export default async function Page() {
  const auth = await verifyAuth();
  if (!auth.success || auth.user.role !== "SUPERADMIN") {
    redirect(APP_ROUTES.dashboard);
  }
  return <OrgPage />;
}
