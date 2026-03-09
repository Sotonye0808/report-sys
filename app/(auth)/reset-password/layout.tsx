import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CONTENT } from "@/config/content";

export const metadata: Metadata = {
  title: CONTENT.auth.resetTitle as string,
  description: CONTENT.seo.resetPasswordDescription,
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
