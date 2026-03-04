import { InvitesPage } from "@/modules/users";
import { CONTENT } from "@/config/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: CONTENT.invites.pageTitle as string,
};

export default function Page() {
    return <InvitesPage />;
}
