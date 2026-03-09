import type { Metadata } from "next";
import { InvitesPage } from "@/modules/users";
import { CONTENT } from "@/config/content";

export const metadata: Metadata = {
  title: CONTENT.invites.pageTitle as string,
  description: CONTENT.seo.invitesDescription,
};

export default function Page() {
  return <InvitesPage />;
}
