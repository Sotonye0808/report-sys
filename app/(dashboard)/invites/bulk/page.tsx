import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BulkInvitesPage } from "@/modules/bulk-invites/components/BulkInvitesPage";
import { CONTENT } from "@/config/content";
import { verifyAuth } from "@/lib/utils/auth";
import { APP_ROUTES } from "@/config/routes";
import { ROLE_CONFIG } from "@/config/roles";

export const metadata: Metadata = {
    title: ((CONTENT.bulkInvites as unknown as Record<string, string>)?.pageTitle ?? "Bulk Invites") as string,
    description: CONTENT.seo.invitesDescription,
};

export default async function Page() {
    const auth = await verifyAuth(null);
    if (!auth.success || !ROLE_CONFIG[auth.user.role]?.canBulkInvite) {
        redirect(APP_ROUTES.dashboard);
    }
    return <BulkInvitesPage />;
}
