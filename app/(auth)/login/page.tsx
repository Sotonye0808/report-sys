"use client";

import { useState } from "react";
import { Form, Alert } from "antd";
import { UserOutlined, LockOutlined, DownOutlined, RightOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { CONTENT } from "@/config/content";
import { APP_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

/** All seeded demo accounts — password is always Nlp2026! */
const DEMO_ACCOUNTS = [
  { role: "Superadmin", email: "superadmin@harvesters.org" },
  { role: "SPO", email: "spo@harvesters.org" },
  { role: "CEO", email: "ceo@harvesters.org" },
  { role: "Church Ministry", email: "churchministry@harvesters.org" },
  { role: "Group Pastor", email: "grouppastor@harvesters.org" },
  { role: "Group Admin", email: "groupadmin@harvesters.org" },
  { role: "Campus Pastor", email: "campuspastor@harvesters.org" },
  { role: "Campus Admin", email: "campusadmin@harvesters.org" },
  { role: "Data Entry", email: "dataentry@harvesters.org" },
] as const;

const DEMO_PASSWORD = "Nlp2026!";

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const [form] = Form.useForm<LoginFormValues>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);

  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setError(null);
    try {
      await login(values.email, values.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : CONTENT.auth.errors.serverError);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (email: string) => {
    form.setFieldsValue({ email, password: DEMO_PASSWORD });
  };

  return (
    <div className="bg-ds-surface-elevated border border-ds-border-base rounded-ds-2xl shadow-ds-xl p-8 space-y-6">
      {/* Logo / Brand */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-ds-xl bg-ds-brand-accent mb-2">
          <span className="text-white font-bold text-xl">H</span>
        </div>
        <h1 className="text-2xl font-bold text-ds-text-primary">{CONTENT.auth.loginTitle}</h1>
        <p className="text-sm text-ds-text-secondary">{CONTENT.auth.loginSubtitle}</p>
      </div>

      {error && (
        <Alert type="error" message={error} showIcon closable onClose={() => setError(null)} />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        className="space-y-1"
      >
        <Form.Item
          name="email"
          label={CONTENT.auth.emailLabel}
          rules={[
            { required: true, message: CONTENT.auth.errors.emailRequired },
            { type: "email", message: "Enter a valid email" },
          ]}
        >
          <Input
            prefix={<UserOutlined className="text-ds-text-subtle" />}
            placeholder={CONTENT.auth.emailPlaceholder}
            size="large"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={CONTENT.auth.passwordLabel}
          rules={[{ required: true, message: CONTENT.auth.errors.passwordRequired }]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-ds-text-subtle" />}
            placeholder={CONTENT.auth.passwordPlaceholder}
            size="large"
            autoComplete="current-password"
          />
        </Form.Item>

        <div className="flex justify-end mb-2">
          <Link
            href={APP_ROUTES.forgotPassword}
            className="text-sm text-ds-text-link hover:underline"
          >
            {CONTENT.auth.forgotPassword}
          </Link>
        </div>

        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
          {loading ? CONTENT.auth.loggingIn : CONTENT.auth.loginButton}
        </Button>
      </Form>

      <p className="text-center text-sm text-ds-text-secondary">
        {CONTENT.auth.noAccount}{" "}
        <Link href={APP_ROUTES.join} className="text-ds-text-link hover:underline font-medium">
          {CONTENT.auth.registerLink}
        </Link>
      </p>

      {/* Demo credentials panel — always visible */}
      <div className="mt-4 border border-ds-border-subtle rounded-ds-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowCredentials((v) => !v)}
          className="flex items-center justify-between w-full px-4 py-3 bg-ds-surface-sunken hover:bg-ds-surface-base transition-colors text-left cursor-pointer border-none outline-none"
        >
          <span className="text-xs font-semibold text-ds-text-secondary tracking-wide uppercase">
            Demo Accounts (all roles)
          </span>
          {showCredentials ? (
            <DownOutlined className="text-xs text-ds-text-subtle" />
          ) : (
            <RightOutlined className="text-xs text-ds-text-subtle" />
          )}
        </button>
        {showCredentials && (
          <div className="px-4 py-3 space-y-1.5 bg-ds-surface-base">
            <p className="text-[11px] text-ds-text-subtle mb-2">
              Password for all accounts:{" "}
              <code className="font-mono bg-ds-surface-sunken px-1.5 py-0.5 rounded text-ds-text-primary">
                {DEMO_PASSWORD}
              </code>
            </p>
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => fillCredentials(a.email)}
                className="flex items-center justify-between w-full text-left group bg-transparent border-none cursor-pointer p-0 outline-none"
              >
                <span className="text-xs text-ds-text-subtle group-hover:text-ds-text-primary transition-colors font-mono">
                  {a.email}
                </span>
                <span className="text-[11px] text-ds-brand-accent font-medium ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {a.role}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
