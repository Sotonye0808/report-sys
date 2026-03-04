import { ReportEditPage } from "@/modules/reports";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  return <ReportEditPage params={params} />;
}
