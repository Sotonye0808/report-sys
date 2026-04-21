"use client";

/**
 * app/(auth)/register/page.tsx
 * Public registration page (creates MEMBER account).
 * Invite token from URL params pre-fills and role-gates the form.
 */

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Form, Alert } from "antd";
import Link from "next/link";
import Image from "next/image";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirm: string;
  phone?: string;
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageContent />
    </Suspense>
  );
}

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("token") ?? undefined;

  const [form] = Form.useForm<RegisterFormValues>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");
  const [emailServiceReady, setEmailServiceReady] = useState(false);

  const handleSubmit = async (values: RegisterFormValues) => {
    if (values.password !== values.confirm) {
      setError(CONTENT.auth.errors.passwordsDoNotMatch);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ROUTES.auth.register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          phone: values.phone,
          inviteToken,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? CONTENT.auth.errors.serverError);
        return;
      }
      setRegisteredEmail(json?.data?.user?.email ?? values.email);
      setEmailServiceReady(Boolean(json?.data?.user?.emailServiceReady));
      setDone(true);
      /* Redirect to dashboard after brief pause */
      setTimeout(() => window.location.replace("/"), 1200);
    } catch {
      setError(CONTENT.auth.errors.serverError);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="bg-ds-surface-elevated border border-ds-border-base rounded-ds-2xl shadow-ds-xl p-8 text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-ds-xl bg-ds-state-success/10 mb-1">
          <span className="text-ds-state-success text-2xl">✓</span>
        </div>
        <h1 className="text-xl font-bold text-ds-text-primary">Account created!</h1>
        <p className="text-sm text-ds-text-secondary">Redirecting you now…</p>
        {emailServiceReady ? (
          <p className="text-xs text-ds-text-subtle">
            Verification email sent to {registeredEmail}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="bg-ds-surface-elevated border border-ds-border-base rounded-ds-2xl shadow-ds-xl p-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <Image
          src="/logo/white-bg-harvesters-Logo.svg"
          alt="Harvesters"
          width={48}
          height={48}
          className="rounded-ds-xl mb-2"
          priority
        />
        <h1 className="text-2xl font-bold text-ds-text-primary">{CONTENT.auth.registerTitle}</h1>
        <p className="text-sm text-ds-text-secondary">{CONTENT.auth.registerSubtitle}</p>
        {inviteToken && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-ds-state-success/10 text-ds-state-success text-xs rounded-ds-md font-medium">
            Invite link detected
          </span>
        )}
      </div>

      {error && (
        <Alert type="error" message={error} showIcon closable onClose={() => setError(null)} />
      )}

      <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
        <div className="grid grid-cols-2 gap-3">
          <Form.Item
            name="firstName"
            label={CONTENT.auth.firstNameLabel}
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder={CONTENT.auth.firstNamePlaceholder} size="large" />
          </Form.Item>

          <Form.Item
            name="lastName"
            label={CONTENT.auth.lastNameLabel}
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder={CONTENT.auth.lastNamePlaceholder} size="large" />
          </Form.Item>
        </div>

        <Form.Item
          name="email"
          label={CONTENT.auth.emailLabel}
          rules={[
            { required: true, message: CONTENT.auth.errors.emailRequired },
            { type: "email", message: "Enter a valid email" },
          ]}
        >
          <Input placeholder={CONTENT.auth.emailPlaceholder} size="large" autoComplete="email" />
        </Form.Item>

        <Form.Item name="phone" label={CONTENT.auth.phoneLabel}>
          <Input placeholder={CONTENT.auth.phonePlaceholder} size="large" />
        </Form.Item>

        <Form.Item
          name="password"
          label={CONTENT.auth.passwordLabel}
          rules={[
            { required: true, message: CONTENT.auth.errors.passwordRequired },
            { min: 8, message: CONTENT.auth.errors.passwordTooShort },
          ]}
        >
          <Input.Password
            placeholder={CONTENT.auth.passwordPlaceholder}
            size="large"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="confirm"
          label={CONTENT.auth.confirmPasswordLabel}
          rules={[{ required: true, message: "Please confirm your password." }]}
        >
          <Input.Password
            placeholder={CONTENT.auth.passwordPlaceholder}
            size="large"
            autoComplete="new-password"
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          loading={loading}
          className="mt-1"
        >
          {loading ? "Creating account…" : CONTENT.auth.registerButton}
        </Button>
      </Form>

      <p className="text-center text-sm text-ds-text-secondary">
        {CONTENT.auth.alreadyHaveAccount}{" "}
        <Link href={APP_ROUTES.login} className="text-ds-text-link hover:underline font-medium">
          {CONTENT.auth.loginLink}
        </Link>
      </p>
    </div>
  );
}
