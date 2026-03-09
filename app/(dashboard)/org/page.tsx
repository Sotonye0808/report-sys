import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifyAuth } from "@/lib/utils/auth";
import { OrgPage } from "@/modules/org";
import { APP_ROUTES } from "@/config/routes";
import { CONTENT } from "@/config/content";

export const metadata: Metadata = {
  title: CONTENT.org.pageTitle as string,
  description: CONTENT.seo.orgDescription,
};

export default async function Page() {
  const auth = await verifyAuth();
  if (!auth.success || auth.user.role !== "SUPERADMIN") {
    redirect(APP_ROUTES.dashboard);
  }
  return <OrgPage />;
}
