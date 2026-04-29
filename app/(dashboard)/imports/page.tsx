import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ImportWizardPage } from "@/modules/imports";
import { CONTENT } from "@/config/content";
import { verifyAuth } from "@/lib/utils/auth";
import { APP_ROUTES } from "@/config/routes";
import { ROLE_CONFIG } from "@/config/roles";

export const metadata: Metadata = {
    title: ((CONTENT.imports as unknown as Record<string, string>)?.pageTitle ?? "Imports") as string,
};

export default async function Page() {
    const auth = await verifyAuth(null);
    if (!auth.success || !ROLE_CONFIG[auth.user.role]?.canImportSpreadsheets) {
        redirect(APP_ROUTES.dashboard);
    }
    return <ImportWizardPage />;
}
