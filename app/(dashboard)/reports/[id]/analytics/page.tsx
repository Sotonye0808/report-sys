import type { Metadata } from "next";
import { ReportAnalyticsPage } from "@/modules/reports";
import { CONTENT } from "@/config/content";
import { db } from "@/lib/data/db";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const report = await db.report.findUnique({ where: { id }, select: { title: true } });
  return {
    title: `${report?.title ?? "Report Analytics"}`,
    description: CONTENT.seo.analyticsDescription,
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ReportAnalyticsPage reportId={id} />;
}
