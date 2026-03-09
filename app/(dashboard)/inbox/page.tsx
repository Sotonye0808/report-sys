import type { Metadata } from "next";
import { InboxPage } from "@/modules/notifications";
import { CONTENT } from "@/config/content";

export const metadata: Metadata = {
  title: CONTENT.notifications.pageTitle as string,
  description: CONTENT.seo.inboxDescription,
};

export default function Page() {
  return <InboxPage />;
}
