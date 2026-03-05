"use client";

/**
 * app/(auth)/join/page.tsx
 * Invite-link registration flow.
 * Reads ?token= from URL, validates the invite, then presents a registration form.
 * On submit → POST /api/auth/register with inviteToken, which assigns role/campus.
 */

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Form, Alert, Spin } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { CONTENT } from "@/config/content";
import { API_ROUTES, APP_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

/* ── Invite metadata returned by GET /api/invite-links/[token] ───────────── */

interface InviteMeta {
  token:     string;
  targetRole: string;
  campusId?: string;
  groupId?:  string;
  expiresAt: string;
}

/* ── Registration form values ─────────────────────────────────────────────── */

interface JoinFormValues {
  firstName:       string;
  lastName:        string;
  email:           string;
  password:        string;
  confirmPassword: string;
}

/* ── Inner component — uses useSearchParams (must be inside Suspense) ─────── */

function JoinForm() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get("token") ?? "";

  const [invite,    setInvite]    = useState<InviteMeta | null>(null);
  const [status,    setStatus]    = useState<"loading" | "valid" | "invalid" | "done">("loading");
  const [errorMsg,  setErrorMsg]  = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const [form] = Form.useForm<JoinFormValues>();

  /* Validate invite token on mount */
  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setErrorMsg("No invite token found in this URL.");
      return;
    }

    const validate = async () => {
      try {
        const res  = await fetch(API_ROUTES.inviteLinks.validate(token));
        const json = await res.json();
        if (!res.ok || !json.success) {
          setStatus("invalid");
          setErrorMsg(json.error ?? "This invite link is invalid or has expired.");
        } else {
          setInvite(json.data);
          setStatus("valid");
        }
      } catch {
        setStatus("invalid");
        setErrorMsg((CONTENT.errors as Record<string, string>).generic ?? "Something went wrong.");
      }
    };

    validate();
  }, [token]);

  /* Submit registration */
  const handleSubmit = async (values: JoinFormValues) => {
    if (values.password !== values.confirmPassword) {
      form.setFields([
        { name: "confirmPassword", errors: [CONTENT.auth.errors.passwordsDoNotMatch as string] },
      ]);
      return;
    }

    setSubmitting(true);
    try {
      const res  = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName:   values.firstName,
          lastName:    values.lastName,
          email:       values.email,
          password:    values.password,
          inviteToken: token,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      setStatus("done");
    } catch {
      setErrorMsg((CONTENT.errors as Record<string, string>).generic ?? "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading ──────────────────────────────────────────────────────────── */
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Spin size="large" />
        <p className="text-sm text-ds-text-secondary">Validating invite link…</p>
      </div>
    );
  }

  /* ── Invalid / expired ────────────────────────────────────────────────── */
  if (status === "invalid") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <CloseCircleOutlined className="text-4xl text-ds-state-error" />
        <h2 className="text-lg font-semibold text-ds-text-primary">
          {(CONTENT.auth.inviteInvalidTitle as string) ?? "Invalid Invite Link"}
        </h2>
        <p className="text-sm text-ds-text-secondary">
          {errorMsg || "This invite link is invalid or has already been used."}
        </p>
        <Button onClick={() => router.push(APP_ROUTES.login)}>
          {(CONTENT.auth.goToLogin as string) ?? "Go to Login"}
        </Button>
      </div>
    );
  }

  /* ── Success ──────────────────────────────────────────────────────────── */
  if (status === "done") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <CheckCircleOutlined className="text-4xl text-ds-brand-accent" />
        <h2 className="text-lg font-semibold text-ds-text-primary">
          {(CONTENT.auth.registrationSuccessTitle as string) ?? "Account Created!"}
        </h2>
        <p className="text-sm text-ds-text-secondary">
          {(CONTENT.auth.registrationSuccessMessage as string) ??
            "Your account is ready. Please log in."}
        </p>
        <Button type="primary" onClick={() => router.push(APP_ROUTES.login)}>
          {(CONTENT.auth.loginButton as string)}
        </Button>
      </div>
    );
  }

  /* ── Registration form ────────────────────────────────────────────────── */
  return (
    <>
      {/* Invite context banner */}
      {invite && (
        <div className="mb-5 px-4 py-3 bg-ds-brand-accent-subtle border border-ds-brand-accent rounded-ds-lg text-sm text-ds-text-primary">
          <span className="font-semibold">{CONTENT.auth.inviteRoleLabel as string}: </span>
          <span className="text-ds-brand-accent font-medium">{invite.targetRole}</span>
          {invite.campusId && (
            <span className="ml-3 text-ds-text-secondary">· Campus assigned</span>
          )}
        </div>
      )}

      {errorMsg && (
        <Alert type="error" message={errorMsg} showIcon closable className="mb-4"
          onClose={() => setErrorMsg("")} />
      )}

      <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="firstName"
            label={CONTENT.auth.firstNameLabel as string}
            rules={[{ required: true, message: "First name is required." }]}
          >
            <Input size="large" prefix={<UserOutlined className="text-ds-text-subtle" />} />
          </Form.Item>

          <Form.Item
            name="lastName"
            label={CONTENT.auth.lastNameLabel as string}
            rules={[{ required: true, message: "Last name is required." }]}
          >
            <Input size="large" />
          </Form.Item>
        </div>

        <Form.Item
          name="email"
          label={CONTENT.auth.emailLabel as string}
          rules={[
            { required: true, message: CONTENT.auth.errors.emailRequired as string },
            { type: "email",  message: CONTENT.auth.errors.emailInvalid as string },
          ]}
        >
          <Input
            size="large"
            type="email"
            prefix={<MailOutlined className="text-ds-text-subtle" />}
            placeholder={CONTENT.auth.emailPlaceholder as string}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={CONTENT.auth.passwordLabel as string}
          rules={[
            { required: true, message: CONTENT.auth.errors.passwordRequired as string },
            { min: 8,          message: CONTENT.auth.errors.passwordTooShort as string },
          ]}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined className="text-ds-text-subtle" />}
            placeholder={CONTENT.auth.passwordPlaceholder as string}
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label={CONTENT.auth.confirmPasswordLabel as string}
          rules={[{ required: true, message: "Please confirm your password." }]}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined className="text-ds-text-subtle" />}
            placeholder={CONTENT.auth.confirmPasswordLabel as string}
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={submitting}
          className="mt-2"
        >
          {CONTENT.auth.registerButton as string}
        </Button>
      </Form>

      <p className="mt-4 text-center text-sm text-ds-text-secondary">
        {(CONTENT.auth.alreadyHaveAccount as string) ?? "Already have an account?"}{" "}
        <a
          href={APP_ROUTES.login}
          className="text-ds-brand-accent hover:underline font-medium"
        >
          {CONTENT.auth.loginLink as string}
        </a>
      </p>
      <p className="mt-2 text-center text-xs text-ds-text-subtle">
        {CONTENT.auth.noInvite as string}{" "}
        <a
          href={APP_ROUTES.register}
          className="text-ds-brand-accent hover:underline"
        >
          {CONTENT.auth.registerWithoutInvite as string}
        </a>
      </p>
    </>
  );
}

/* ── Layout wrapper ───────────────────────────────────────────────────────── */

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-ds-surface-base flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-ds-2xl bg-ds-brand-accent mb-4">
            <span className="text-white font-bold text-2xl">H</span>
          </div>
          <h1 className="text-2xl font-bold text-ds-text-primary tracking-tight">
            {CONTENT.auth.joinTitle as string}
          </h1>
          <p className="text-sm text-ds-text-secondary mt-1">
            {CONTENT.auth.joinSubtitle as string}
          </p>
        </div>

        {/* Card */}
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6 shadow-ds-md">
          <Suspense
            fallback={
              <div className="flex justify-center py-8">
                <Spin size="large" />
              </div>
            }
          >
            <JoinForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
