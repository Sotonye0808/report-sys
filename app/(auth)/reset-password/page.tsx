"use client";

/**
 * app/(auth)/reset-password/page.tsx
 */

import { useState, Suspense } from "react";
import { Form } from "antd";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LockOutlined } from "@ant-design/icons";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface ResetFormValues {
  password: string;
  confirmPassword: string;
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm<ResetFormValues>();

  const handleSubmit = async (values: ResetFormValues) => {
    if (values.password !== values.confirmPassword) {
      form.setFields([
        { name: "confirmPassword", errors: [CONTENT.auth.errors.passwordsDoNotMatch as string] },
      ]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ROUTES.auth.resetPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: values.password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? (CONTENT.auth.errors.serverError as string));
        return;
      }
      setDone(true);
    } catch {
      setError(CONTENT.auth.errors.serverError as string);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm text-ds-state-error mb-4">
          {CONTENT.auth.errors.invalidToken as string}
        </p>
        <Link href={APP_ROUTES.forgotPassword} className="text-ds-brand-accent text-sm">
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-ds-text-primary">Your password has been reset successfully.</p>
        <Link href={APP_ROUTES.login} className="text-ds-brand-accent text-sm block">
          {CONTENT.auth.loginLink as string}
        </Link>
      </div>
    );
  }

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
      {error && (
        <div className="bg-ds-state-error/10 border border-ds-state-error/30 rounded-ds-lg p-3 mb-4">
          <p className="text-xs text-ds-state-error">{error}</p>
        </div>
      )}

      <Form.Item
        name="password"
        label={CONTENT.auth.newPasswordLabel as string}
        rules={[
          { required: true, message: CONTENT.auth.errors.passwordRequired as string },
          { min: 8, message: CONTENT.auth.errors.passwordTooShort as string },
        ]}
      >
        <Input.Password size="large" prefix={<LockOutlined className="text-ds-text-subtle" />} />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label={CONTENT.auth.confirmPasswordLabel as string}
        rules={[{ required: true, message: "Please confirm your password." }]}
      >
        <Input.Password size="large" prefix={<LockOutlined className="text-ds-text-subtle" />} />
      </Form.Item>

      <Button type="primary" htmlType="submit" size="large" block loading={loading}>
        {CONTENT.auth.resetButton as string}
      </Button>

      <p className="text-center text-sm text-ds-text-secondary mt-4">
        {CONTENT.auth.alreadyHaveAccount as string}{" "}
        <Link href={APP_ROUTES.login} className="text-ds-brand-accent">
          {CONTENT.auth.loginLink as string}
        </Link>
      </p>
    </Form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ds-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-8 shadow-ds-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-ds-brand-accent/10 rounded-ds-xl flex items-center justify-center mx-auto mb-4">
              <LockOutlined className="text-2xl text-ds-brand-accent" />
            </div>
            <h1 className="text-2xl font-bold text-ds-text-primary">
              {CONTENT.auth.resetTitle as string}
            </h1>
            <p className="text-sm text-ds-text-secondary mt-1">
              {CONTENT.auth.resetSubtitle as string}
            </p>
          </div>

          <Suspense
            fallback={<div className="animate-pulse h-40 bg-ds-surface-sunken rounded-ds-lg" />}
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
