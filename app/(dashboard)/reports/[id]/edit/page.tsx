import type { Metadata } from "next";
import { ReportEditPage } from "@/modules/reports";
import { CONTENT } from "@/config/content";
import { db } from "@/lib/data/db";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const report = await db.report.findUnique({ where: { id }, select: { title: true } });
  return {
    title: report ? `Edit — ${report.title}` : (CONTENT.reports.editReport as string),
    description: CONTENT.seo.reportEditDescription,
  };
}

export default function Page({ params }: PageProps) {
  return <ReportEditPage params={params} />;
}
