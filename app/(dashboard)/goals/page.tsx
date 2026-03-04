import { GoalsPage } from "@/modules/goals";
import { CONTENT } from "@/config/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: (CONTENT.goals as Record<string, unknown>).pageTitle as string,
};

export default function Page() {
    return <GoalsPage />;
}
