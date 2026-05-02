"use client";

/**
 * app/(auth)/join/page.tsx
 * Invite-link registration flow.
 * Reads ?token= from URL, validates the invite, then presents a registration form.
 * On submit → POST /api/auth/register with inviteToken, which assigns role/campus.
 */

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Form, Alert, Spin } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { CONTENT } from "@/config/content";
import { API_ROUTES, APP_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { sanitiseJoinRedirect } from "@/lib/utils/joinRedirect";

/* ── Invite metadata returned by GET /api/invite-links/[token] ───────────── */

interface InviteMeta {
  token: string;
  targetRole: string;
  campusId?: string;
  groupId?: string;
  expiresAt: string;
}

/* ── Registration form values ─────────────────────────────────────────────── */

interface JoinFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/* ── Success redirect with countdown ──────────────────────────────────────── */

function SuccessRedirect({
  router,
  email,
  emailServiceReady,
  redirectTarget,
}: {
  router: ReturnType<typeof useRouter>;
  email?: string;
  emailServiceReady?: boolean;
  redirectTarget?: string;
}) {
  const [seconds, setSeconds] = useState(5);

  const loginHref = redirectTarget && redirectTarget !== APP_ROUTES.dashboard
    ? `${APP_ROUTES.login}?from=${encodeURIComponent(redirectTarget)}`
    : APP_ROUTES.login;

  useEffect(() => {
    if (seconds <= 0) {
      router.push(loginHref);
      return;
    }
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, router, loginHref]);

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
      {emailServiceReady && email ? (
        <p className="text-xs text-ds-text-subtle">Verification email sent to {email}</p>
      ) : null}
      <p className="text-xs text-ds-text-subtle">
        {(CONTENT.auth.redirectingIn as string) ?? "Redirecting to login in"} {seconds}s…
      </p>
      <Button type="primary" onClick={() => router.push(loginHref)}>
        {CONTENT.auth.loginButton as string}
      </Button>
    </div>
  );
}

/* ── Inner component — uses useSearchParams (must be inside Suspense) ─────── */

function JoinForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const redirectTarget = sanitiseJoinRedirect(searchParams.get("redirect"));

  const [invite, setInvite] = useState<InviteMeta | null>(null);
  const [status, setStatus] = useState<
    "loading" | "valid" | "invalid" | "expired" | "used" | "done"
  >("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [emailServiceReady, setEmailServiceReady] = useState(false);

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
        const res = await fetch(API_ROUTES.inviteLinks.validate(token));
        const json = await res.json();
        if (!res.ok || !json.success) {
          const errText = (json.error ?? "") as string;
          if (errText.toLowerCase().includes("expired")) {
            setStatus("expired");
          } else if (errText.toLowerCase().includes("already been used")) {
            setStatus("used");
          } else {
            setStatus("invalid");
          }
          setErrorMsg(errText || "This invite link is invalid or has expired.");
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          inviteToken: token,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      setRegisteredEmail(json?.data?.user?.email ?? values.email);
      setEmailServiceReady(Boolean(json?.data?.user?.emailServiceReady));
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

  /* ── Invalid / expired / used ───────────────────────────────────────── */
  if (status === "invalid" || status === "expired" || status === "used") {
    const stateConfig = {
      expired: {
        icon: <ClockCircleOutlined className="text-4xl text-ds-state-warning" />,
        title: (CONTENT.auth.inviteExpiredTitle as string) ?? "Invite Link Expired",
        description:
          errorMsg ||
          "This invite link has expired. Please request a new one from your administrator.",
      },
      used: {
        icon: <ExclamationCircleOutlined className="text-4xl text-ds-text-subtle" />,
        title: (CONTENT.auth.inviteUsedTitle as string) ?? "Invite Already Used",
        description: errorMsg || "This invite link has already been used to create an account.",
      },
      invalid: {
        icon: <CloseCircleOutlined className="text-4xl text-ds-state-error" />,
        title: (CONTENT.auth.inviteInvalidTitle as string) ?? "Invalid Invite Link",
        description: errorMsg || "This invite link is invalid or has already been used.",
      },
    };
    const cfg = stateConfig[status];

    return (
      <div className="flex flex-col items-center gap-4 text-center">
        {cfg.icon}
        <h2 className="text-lg font-semibold text-ds-text-primary">{cfg.title}</h2>
        <p className="text-sm text-ds-text-secondary">{cfg.description}</p>
        <Button onClick={() => router.push(APP_ROUTES.login)}>
          {(CONTENT.auth.goToLogin as string) ?? "Go to Login"}
        </Button>
      </div>
    );
  }

  /* ── Success — auto-redirect with countdown ────────────────────────── */
  if (status === "done") {
    return (
      <SuccessRedirect
        router={router}
        email={registeredEmail}
        emailServiceReady={emailServiceReady}
        redirectTarget={redirectTarget}
      />
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
        <Alert
          type="error"
          message={errorMsg}
          showIcon
          closable
          className="mb-4"
          onClose={() => setErrorMsg("")}
        />
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
            { type: "email", message: CONTENT.auth.errors.emailInvalid as string },
          ]}
        >
          <Input
            size="large"
            type="email"
            inputMode="email"
            autoComplete="email"
            prefix={<MailOutlined className="text-ds-text-subtle" />}
            placeholder={CONTENT.auth.emailPlaceholder as string}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={CONTENT.auth.passwordLabel as string}
          rules={[
            { required: true, message: CONTENT.auth.errors.passwordRequired as string },
            { min: 8, message: CONTENT.auth.errors.passwordTooShort as string },
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
        <a href={APP_ROUTES.login} className="text-ds-brand-accent hover:underline font-medium">
          {CONTENT.auth.loginLink as string}
        </a>
      </p>
      <p className="mt-2 text-center text-xs text-ds-text-subtle">
        {CONTENT.auth.noInvite as string}{" "}
        <a href={APP_ROUTES.register} className="text-ds-brand-accent hover:underline">
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
          <Image
            src="/logo/dark-bg-harvesters-Logo.jpg"
            alt="Harvesters"
            width={56}
            height={56}
            className="rounded-ds-2xl mb-4"
            priority
          />
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
