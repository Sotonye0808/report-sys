"use client";

/**
 * app/(auth)/forgot-password/page.tsx
 */

import { useState } from "react";
import { Form } from "antd";
import Link from "next/link";
import { MailOutlined } from "@ant-design/icons";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface ForgotFormValues {
  email: string;
}

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [form] = Form.useForm<ForgotFormValues>();

  const handleSubmit = async (values: ForgotFormValues) => {
    setLoading(true);
    try {
      const res = await fetch(API_ROUTES.auth.forgotPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      setSent(true);
      if (json.devToken) setDevToken(json.devToken);
    } catch {
      /* still show success to prevent enumeration */
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ds-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-8 shadow-ds-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-ds-brand-accent/10 rounded-ds-xl flex items-center justify-center mx-auto mb-4">
              <MailOutlined className="text-2xl text-ds-brand-accent" />
            </div>
            <h1 className="text-2xl font-bold text-ds-text-primary">
              {CONTENT.auth.forgotTitle as string}
            </h1>
            <p className="text-sm text-ds-text-secondary mt-1">
              {CONTENT.auth.forgotSubtitle as string}
            </p>
          </div>

          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-ds-text-primary">
                If an account exists for that email, we&rsquo;ve sent reset instructions.
              </p>

              {/* Dev hint */}
              {devToken && (
                <div className="bg-ds-surface-sunken rounded-ds-lg p-3 text-left mt-4">
                  <p className="text-xs font-semibold text-ds-text-subtle mb-1">
                    Dev Mode — Reset Token
                  </p>
                  <p className="text-xs font-mono break-all text-ds-text-primary">{devToken}</p>
                  <Link
                    href={`${APP_ROUTES.resetPassword}?token=${devToken}`}
                    className="text-xs text-ds-brand-accent mt-2 inline-block"
                  >
                    Open reset page →
                  </Link>
                </div>
              )}

              <Link href={APP_ROUTES.login} className="text-sm text-ds-brand-accent block mt-4">
                {CONTENT.auth.loginLink as string}
              </Link>
            </div>
          ) : (
            <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
              <Form.Item
                name="email"
                label={CONTENT.auth.emailLabel as string}
                rules={[
                  { required: true, message: CONTENT.auth.errors.emailRequired as string },
                  { type: "email", message: "Enter a valid email address." },
                ]}
              >
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  size="large"
                  placeholder={CONTENT.auth.emailPlaceholder as string}
                  prefix={<MailOutlined className="text-ds-text-subtle" />}
                />
              </Form.Item>

              <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                {CONTENT.auth.sendResetLink as string}
              </Button>

              <p className="text-center text-sm text-ds-text-secondary mt-4">
                {CONTENT.auth.alreadyHaveAccount as string}{" "}
                <Link href={APP_ROUTES.login} className="text-ds-brand-accent">
                  {CONTENT.auth.loginLink as string}
                </Link>
              </p>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
