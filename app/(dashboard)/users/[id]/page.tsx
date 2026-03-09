import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifyAuth } from "@/lib/utils/auth";
import { UserDetailPage } from "@/modules/users";
import { APP_ROUTES } from "@/config/routes";
import { CONTENT } from "@/config/content";
import { db } from "@/lib/data/db";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    select: { firstName: true, lastName: true },
  });
  return {
    title: user ? `${user.firstName} ${user.lastName}` : (CONTENT.users.pageTitle as string),
    description: CONTENT.seo.userDetailDescription,
  };
}

export default async function Page({ params }: PageProps) {
  const auth = await verifyAuth();
  if (!auth.success || auth.user.role !== "SUPERADMIN") {
    redirect(APP_ROUTES.dashboard);
  }
  return <UserDetailPage params={params} />;
}
