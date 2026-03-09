import type { Metadata } from "next";
import { GoalsPage } from "@/modules/goals";
import { CONTENT } from "@/config/content";

export const metadata: Metadata = {
  title: CONTENT.goals.pageTitle as string,
  description: CONTENT.seo.goalsDescription,
};

export default function Page() {
  return <GoalsPage />;
}
