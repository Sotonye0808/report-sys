import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CONTENT } from "@/config/content";

/**
 * Invite join page layout.
 * Extends root metadata with invite-specific Open Graph / Twitter card tags
 * so that shared invite links render rich previews in social apps and messaging.
 */
export const metadata: Metadata = {
  title: {
    absolute: `${CONTENT.seo.joinTitle} — Harvesters Reporting System`,
  },
  description: CONTENT.seo.joinDescription,
  openGraph: {
    title: `${CONTENT.seo.joinTitle} — Harvesters Reporting System`,
    description: CONTENT.seo.joinDescription,
    type: "website",
    images: [
      {
        url: "/logo/icon-512.svg",
        width: 512,
        height: 512,
        alt: "Harvesters International Christian Centre",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `${CONTENT.seo.joinTitle} — Harvesters Reporting System`,
    description: CONTENT.seo.joinDescription,
    images: ["/logo/icon-512.svg"],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
