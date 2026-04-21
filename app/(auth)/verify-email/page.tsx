"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Alert, Spin } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, MailOutlined } from "@ant-design/icons";
import { CONTENT } from "@/config/content";
import { API_ROUTES, APP_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";

interface VerificationResult {
  email?: string;
  oldEmail?: string;
  isEmailVerified?: boolean;
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const mode = searchParams.get("mode") === "change" ? "change" : "verify";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");
  const [result, setResult] = useState<VerificationResult | null>(null);

  const endpoint = useMemo(
    () =>
      mode === "change"
        ? API_ROUTES.auth.emailChangeConfirm
        : API_ROUTES.auth.emailVerificationConfirm,
    [mode],
  );

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    const run = async () => {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const payload = await res.json();
        if (!res.ok || !payload.success) {
          setStatus("error");
          setMessage(payload.error ?? "Verification failed.");
          return;
        }

        setResult(payload.data ?? null);
        setStatus("success");
      } catch {
        setStatus("error");
        setMessage((CONTENT.errors as Record<string, string>).generic);
      }
    };

    void run();
  }, [endpoint, token]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <Spin size="large" />
        <p className="text-sm text-ds-text-secondary">Processing your email verification link…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-4 text-center">
        <CloseCircleOutlined className="text-4xl text-ds-state-error" />
        <h1 className="text-xl font-semibold text-ds-text-primary">Unable to verify email</h1>
        <Alert type="error" showIcon message={message} />
        <div className="flex justify-center gap-3">
          <Link href={APP_ROUTES.login}>
            <Button>{CONTENT.auth.loginButton as string}</Button>
          </Link>
          <Link href={APP_ROUTES.profile}>
            <Button type="primary">Open Profile</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-center">
      <CheckCircleOutlined className="text-4xl text-ds-state-success" />
      <h1 className="text-xl font-semibold text-ds-text-primary">
        {mode === "change" ? "Email changed successfully" : "Email verified successfully"}
      </h1>
      {result?.email && (
        <div className="inline-flex items-center gap-2 text-sm text-ds-text-secondary bg-ds-surface-sunken border border-ds-border-base rounded-ds-lg px-3 py-2">
          <MailOutlined />
          <span>{result.email}</span>
        </div>
      )}
      {mode === "change" && result?.oldEmail && (
        <p className="text-xs text-ds-text-subtle">Previous email: {result.oldEmail}</p>
      )}
      <div className="flex justify-center gap-3">
        <Link href={APP_ROUTES.login}>
          <Button>{CONTENT.auth.loginButton as string}</Button>
        </Link>
        <Link href={APP_ROUTES.dashboard}>
          <Button type="primary">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="bg-ds-surface-elevated border border-ds-border-base rounded-ds-2xl shadow-ds-xl p-8">
      <Suspense
        fallback={
          <div className="py-10 text-center">
            <Spin />
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
