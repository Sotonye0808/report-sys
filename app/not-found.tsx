import { Button } from "antd";
import Link from "next/link";
import { CONTENT } from "@/config/content";
import { APP_ROUTES } from "@/config/routes";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-ds-surface-base px-6 text-center">
      <div className="space-y-1">
        <p className="text-8xl font-bold text-ds-brand-accent">404</p>
        <h1 className="text-2xl font-semibold text-ds-text-primary">
          {CONTENT.errors.notFoundTitle}
        </h1>
        <p className="text-ds-text-secondary max-w-sm">{CONTENT.errors.notFoundDescription}</p>
      </div>
      <Link href={APP_ROUTES.dashboard}>
        <Button type="primary" size="large">
          {CONTENT.errors.notFoundCta}
        </Button>
      </Link>
    </div>
  );
}
