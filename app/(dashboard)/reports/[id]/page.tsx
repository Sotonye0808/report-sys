import { ReportDetailPage } from "@/modules/reports";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  return <ReportDetailPage params={params} />;
}
