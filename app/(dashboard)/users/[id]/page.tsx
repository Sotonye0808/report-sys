import { redirect } from "next/navigation";
import { verifyAuth } from "@/lib/utils/auth";
import { UserDetailPage } from "@/modules/users";
import { APP_ROUTES } from "@/config/routes";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const auth = await verifyAuth();
  if (!auth.success || auth.user.role !== "SUPERADMIN") {
    redirect(APP_ROUTES.dashboard);
  }
  return <UserDetailPage params={params} />;
}
