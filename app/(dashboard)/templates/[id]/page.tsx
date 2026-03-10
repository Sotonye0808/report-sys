import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifyAuth } from "@/lib/utils/auth";
import { TemplateDetailPage } from "@/modules/templates";
import { APP_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";
import { CONTENT } from "@/config/content";
import { db } from "@/lib/data/db";

const TEMPLATES_ALLOWED_ROLES: UserRole[] = [
  UserRole.SUPERADMIN,
  UserRole.GROUP_ADMIN,
  UserRole.GROUP_PASTOR,
  UserRole.SPO,
  UserRole.CEO,
  UserRole.OFFICE_OF_CEO,
  UserRole.CHURCH_MINISTRY,
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const template = await db.reportTemplate.findUnique({ where: { id }, select: { name: true } });
  return {
    title: template ? `${template.name} — Template` : (CONTENT.templates.pageTitle as string),
    description: CONTENT.seo.templateDetailDescription,
  };
}

export default async function Page({ params }: PageProps) {
  const auth = await verifyAuth(null, TEMPLATES_ALLOWED_ROLES);
  if (!auth.success) {
    redirect(APP_ROUTES.dashboard);
  }
  return <TemplateDetailPage params={params} />;
}
