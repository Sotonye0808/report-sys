"use client";

import { useEffect } from "react";
import { Button } from "antd";
import { CONTENT } from "@/config/content";
import { APP_ROUTES } from "@/config/routes";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-ds-surface-base px-6 text-center">
      <div className="w-16 h-16 rounded-ds-2xl bg-ds-status-error-bg flex items-center justify-center text-3xl">
        ⚠
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl font-semibold text-ds-text-primary">{CONTENT.errors.errorTitle}</h1>
        <p className="text-ds-text-secondary">{CONTENT.errors.errorDescription}</p>
        {process.env.NODE_ENV === "development" && (
          <pre className="mt-4 text-xs text-left bg-ds-surface-sunken border border-ds-border-subtle rounded-ds-lg p-4 overflow-auto max-h-40">
            {error.message}
          </pre>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={reset} type="primary" size="large">
          {CONTENT.errors.errorCta}
        </Button>
        <Button href={APP_ROUTES.dashboard} size="large">
          {CONTENT.nav.dashboard}
        </Button>
      </div>
    </div>
  );
}
