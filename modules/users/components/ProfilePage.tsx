"use client";

/**
 * modules/users/components/ProfilePage.tsx
 * Profile view + inline edit for the current authenticated user.
 * Tabs: Profile Â· Security Â· Appearance Â· Notifications
 */

import { useState, useEffect } from "react";
import { Form, message, Tabs, Divider, Alert, Switch, Select } from "antd";
import {
  UserOutlined,
  LockOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  BulbOutlined,
  BellOutlined,
  CheckOutlined,
  MobileOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useTheme } from "next-themes";
import { useAuth } from "@/providers/AuthProvider";
import { CONTENT } from "@/config/content";
import { API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import { RoleBadge } from "@/components/ui/StatusBadge";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ROLE_CONFIG } from "@/config/roles";
import { fmtDate } from "@/lib/utils/formatDate";
import { apiMutation } from "@/lib/utils/apiMutation";
import { useEntityNames, pickName } from "@/lib/hooks/useEntityNames";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/* Shared primitives                                                           */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-4 py-3 border-b border-ds-border-subtle last:border-0">
      <span className="text-xs font-medium text-ds-text-subtle uppercase tracking-wide sm:w-40 sm:flex-shrink-0 sm:pt-0.5">
        {label}
      </span>
      <span className="text-sm text-ds-text-primary break-all">{value ?? "â€”"}</span>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-base font-semibold text-ds-text-primary">{title}</h2>
      <div className="h-px flex-1 bg-ds-border-base" />
    </div>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-ds-brand-accent text-base">{icon}</span>
        <h2 className="text-sm font-semibold text-ds-text-primary">{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/* Profile tab                                                                 */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function ProfileTab({ user }: { user: AuthUser }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    apiMutation<UserProfile>(API_ROUTES.users.profile, { method: "GET" })
      .then((result) => {
        if (result.ok && result.data) setProfile(result.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = () => {
    form.setFieldsValue({
      firstName: profile?.firstName ?? user.firstName,
      lastName: profile?.lastName ?? user.lastName,
      phone: profile?.phone ?? "",
    });
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    form.resetFields();
  };

  const handleSave = async (values: { firstName: string; lastName: string; phone?: string }) => {
    setSaving(true);
    try {
      const result = await apiMutation<UserProfile, typeof values>(API_ROUTES.users.profile, {
        method: "PUT",
        body: values,
      });
      if (!result.ok) {
        message.error(result.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      if (result.data) setProfile(result.data);
      message.success(CONTENT.profile.profileUpdated as string);
      setEditing(false);
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setSaving(false);
    }
  };

  // Resolve raw FK ids on the user record into human-readable names.
  // Without this, the campus field used to render the UUID directly.
  const { names: entityNames } = useEntityNames({
    campusIds: [user.campusId],
    groupIds: [user.orgGroupId],
  });

  if (loading) return <LoadingSkeleton rows={5} />;

  const displayName = `${profile?.firstName ?? user.firstName} ${profile?.lastName ?? user.lastName}`;
  const campusName = pickName(entityNames.campuses, user.campusId, "—");
  const groupName = pickName(entityNames.groups, user.orgGroupId, "—");
  const initials =
    `${(profile?.firstName ?? user.firstName)[0] ?? ""}${(profile?.lastName ?? user.lastName)[0] ?? ""}`.toUpperCase();

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Avatar + name hero */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base">
        <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-ds-brand-accent text-white font-bold text-2xl select-none">
          {initials}
        </div>
        <div className="text-center sm:text-left">
          <p className="text-xl font-bold text-ds-text-primary">{displayName}</p>
          <p className="text-sm text-ds-text-secondary mt-0.5">{profile?.email ?? user.email}</p>
          <div className="mt-2">
            <RoleBadge role={user.role} />
          </div>
        </div>
        {!editing && (
          <div className="sm:ml-auto">
            <Button icon={<EditOutlined />} size="small" onClick={handleEdit}>
              {CONTENT.profile.editProfile as string}
            </Button>
          </div>
        )}
      </div>

      {/* Edit form */}
      {editing ? (
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
          <SectionHeading title={CONTENT.profile.personalInfoLabel as string} />
          <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Form.Item
                name="firstName"
                label={CONTENT.profile.firstNameLabel as string}
                rules={[{ required: true, message: "First name is required." }]}
              >
                <Input prefix={<UserOutlined className="text-ds-text-subtle" />} />
              </Form.Item>
              <Form.Item
                name="lastName"
                label={CONTENT.profile.lastNameLabel as string}
                rules={[{ required: true, message: "Last name is required." }]}
              >
                <Input />
              </Form.Item>
            </div>
            <Form.Item name="phone" label={CONTENT.profile.phoneLabel as string}>
              <Input placeholder="+234 800 000 0000" />
            </Form.Item>
            <div className="flex gap-3 justify-end">
              <Button icon={<CloseOutlined />} onClick={handleCancel}>
                {CONTENT.common.cancel as string}
              </Button>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                {saving
                  ? (CONTENT.profile.saving as string)
                  : (CONTENT.profile.saveChanges as string)}
              </Button>
            </div>
          </Form>
        </div>
      ) : (
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
          <SectionHeading title={CONTENT.profile.accountInfoLabel as string} />
          <InfoRow
            label={CONTENT.profile.firstNameLabel as string}
            value={profile?.firstName ?? user.firstName}
          />
          <InfoRow
            label={CONTENT.profile.lastNameLabel as string}
            value={profile?.lastName ?? user.lastName}
          />
          <InfoRow
            label={CONTENT.profile.emailLabel as string}
            value={profile?.email ?? user.email}
          />
          <InfoRow label={CONTENT.profile.phoneLabel as string} value={profile?.phone} />
          <InfoRow
            label={CONTENT.profile.roleLabel as string}
            value={ROLE_CONFIG[user.role]?.label ?? user.role}
          />
          {user.campusId && (
            <InfoRow label={CONTENT.profile.campusLabel as string} value={campusName} />
          )}
          {user.orgGroupId && (
            <InfoRow label={CONTENT.profile.groupLabel as string} value={groupName} />
          )}
          <InfoRow
            label={CONTENT.profile.memberSince as string}
            value={fmtDate(profile?.createdAt)}
          />
        </div>
      )}
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/* Security (change password) tab                                              */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function SecurityTab() {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      setError(CONTENT.auth.errors.passwordsDoNotMatch as string);
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await apiMutation(API_ROUTES.auth.changePassword, {
        method: "POST",
        body: {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
      });
      if (!result.ok) {
        setError(result.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      setSuccess(true);
      form.resetFields();
    } catch {
      setError((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md space-y-4">
      {success && (
        <Alert
          type="success"
          message={CONTENT.profile.passwordUpdated as string}
          showIcon
          closable
          onClose={() => setSuccess(false)}
        />
      )}
      {error && (
        <Alert type="error" message={error} showIcon closable onClose={() => setError(null)} />
      )}

      <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
        <SectionHeading title={CONTENT.profile.passwordSection as string} />
        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
          <Form.Item
            name="currentPassword"
            label={CONTENT.profile.currentPasswordLabel as string}
            rules={[{ required: true, message: "Current password is required." }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-ds-text-subtle" />}
              placeholder="Your current password"
            />
          </Form.Item>
          <Divider className="my-3" />
          <Form.Item
            name="newPassword"
            label={CONTENT.profile.newPasswordLabel as string}
            rules={[
              { required: true, message: "New password is required." },
              { min: 8, message: "Password must be at least 8 characters." },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-ds-text-subtle" />}
              placeholder="At least 8 characters"
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={CONTENT.profile.confirmPasswordLabel as string}
            rules={[{ required: true, message: "Please confirm your new password." }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-ds-text-subtle" />}
              placeholder="Repeat your new password"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={saving} block>
            {saving
              ? (CONTENT.common.saving as string)
              : (CONTENT.profile.updatePassword as string)}
          </Button>
        </Form>
      </div>

      <EmailSecuritySection />
    </div>
  );
}

function EmailSecuritySection() {
  const profileText = CONTENT.profile as any;
  const [newEmail, setNewEmail] = useState("");
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [requestingEmailChange, setRequestingEmailChange] = useState(false);
  const [status, setStatus] = useState<EmailVerificationStatusPayload | null>(null);

  const loadStatus = async () => {
    setLoadingStatus(true);
    try {
      const result = await apiMutation<EmailVerificationStatusPayload>(
        API_ROUTES.auth.emailVerificationStatus,
        { method: "GET" },
      );
      if (result.ok && result.data) {
        setStatus(result.data);
      }
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  const resendVerification = async () => {
    setSendingVerification(true);
    try {
      const result = await apiMutation<{ sent: boolean; email: string }>(
        API_ROUTES.auth.emailVerificationRequest,
        { method: "POST" },
      );
      if (!result.ok) {
        message.error(result.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      message.success(profileText.verificationEmailSent as string);
      await loadStatus();
    } finally {
      setSendingVerification(false);
    }
  };

  const requestEmailChange = async () => {
    const email = newEmail.trim();
    if (!email) {
      message.warning("Enter a new email address.");
      return;
    }

    setRequestingEmailChange(true);
    try {
      const result = await apiMutation<{ pendingEmail: string }>(
        API_ROUTES.auth.emailChangeRequest,
        {
          method: "POST",
          body: { newEmail: email },
        },
      );
      if (!result.ok) {
        message.error(result.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      message.success(profileText.emailChangeRequested as string);
      setNewEmail("");
      await loadStatus();
    } finally {
      setRequestingEmailChange(false);
    }
  };

  if (loadingStatus) {
    return <LoadingSkeleton rows={3} />;
  }

  if (!status) {
    return null;
  }

  return (
    <SectionCard icon={<MailOutlined />} title={profileText.emailSecuritySection as string}>
      <div className="space-y-4">
        <div className="rounded-ds-lg border border-ds-border-base p-3 bg-ds-surface-sunken">
          <p className="text-sm font-medium text-ds-text-primary">
            {profileText.emailVerificationLabel as string}
          </p>
          <p className="text-xs text-ds-text-subtle mt-0.5">
            {profileText.verificationStatusHint as string}
          </p>
          <p className="text-sm text-ds-text-primary mt-2">{status.email}</p>
          <p className="text-xs mt-1">
            {status.isEmailVerified
              ? (profileText.emailVerifiedBadge as string)
              : (profileText.emailUnverifiedBadge as string)}
          </p>
          {status.emailVerificationSentAt ? (
            <p className="text-xs text-ds-text-subtle mt-1">
              {profileText.verificationSentTo as string}: {status.email}
            </p>
          ) : null}
          {!status.isEmailVerified && status.emailServiceReady ? (
            <Button
              className="mt-3"
              onClick={resendVerification}
              loading={sendingVerification}
              icon={<MailOutlined />}
            >
              {profileText.resendVerification as string}
            </Button>
          ) : null}
        </div>

        {status.emailServiceReady ? (
          <div className="rounded-ds-lg border border-ds-border-base p-3 bg-ds-surface-sunken">
            <p className="text-sm font-medium text-ds-text-primary">
              {profileText.emailChangeLabel as string}
            </p>
            {status.pendingEmail ? (
              <div className="mt-2">
                <p className="text-xs text-ds-text-subtle">
                  {profileText.pendingEmailLabel as string}
                </p>
                <p className="text-sm text-ds-text-primary">{status.pendingEmail}</p>
                <p className="text-xs text-ds-text-subtle mt-1">
                  {profileText.confirmViaEmailHint as string}
                </p>
              </div>
            ) : null}

            <div className="mt-3 flex gap-2">
              <Input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder={profileText.newEmailPlaceholder as string}
                aria-label={profileText.newEmailLabel as string}
              />
              <Button type="primary" onClick={requestEmailChange} loading={requestingEmailChange}>
                {profileText.requestEmailChange as string}
              </Button>
            </div>
          </div>
        ) : (
          <Alert
            type="info"
            showIcon
            message="Email features are not active in this environment yet."
          />
        )}
      </div>
    </SectionCard>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/* Appearance tab                                                              */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const THEME_OPTIONS = [
  { value: "system", label: (CONTENT.settings as Record<string, string>).themeSystem },
  { value: "light", label: (CONTENT.settings as Record<string, string>).themeLight },
  { value: "dark", label: (CONTENT.settings as Record<string, string>).themeDark },
] as const;

function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <LoadingSkeleton rows={2} />;

  return (
    <div className="max-w-md">
      <SectionCard
        icon={<BulbOutlined />}
        title={(CONTENT.settings as Record<string, string>).appearanceSection}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ds-text-primary">
              {(CONTENT.settings as Record<string, string>).themeLabel}
            </p>
            <p className="text-xs text-ds-text-subtle mt-0.5">
              {(CONTENT.settings as Record<string, string>).themeDescription}
            </p>
          </div>
          <Select
            value={theme ?? "system"}
            onChange={(v) => setTheme(v)}
            options={THEME_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            style={{ width: 140 }}
            size="middle"
          />
        </div>
      </SectionCard>
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/* Notifications tab                                                           */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

interface NotifPrefs {
  email: boolean;
  inApp: boolean;
  deadlineReminders: boolean;
}

interface EmailVerificationStatusPayload {
  email: string;
  pendingEmail: string | null;
  isEmailVerified: boolean;
  emailVerifiedAt: string | null;
  emailVerificationSentAt: string | null;
  pendingEmailRequestedAt: string | null;
  pendingEmailSentAt: string | null;
  emailServiceReady: boolean;
}

const DEFAULT_PREFS: NotifPrefs = { email: true, inApp: true, deadlineReminders: true };

interface NotifRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}

function NotifRow({ label, description, checked, onChange }: NotifRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-ds-border-subtle last:border-b-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-ds-text-primary">{label}</p>
        <p className="text-xs text-ds-text-subtle mt-0.5">{description}</p>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}

const NOTIF_ROWS: Array<{ key: keyof NotifPrefs; labelKey: string; descKey: string }> = [
  { key: "email", labelKey: "emailNotificationsLabel", descKey: "emailNotificationsDescription" },
  { key: "inApp", labelKey: "inAppNotificationsLabel", descKey: "inAppNotificationsDescription" },
  {
    key: "deadlineReminders",
    labelKey: "deadlineRemindersLabel",
    descKey: "deadlineRemindersDescription",
  },
];

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  const upsertPushPreference = async (enabled: boolean) => {
    await apiMutation(API_ROUTES.notifications.preferences, {
      method: "PUT",
      body: { push: enabled },
    });
  };

  const syncPushStateFromBrowser = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushSupported(false);
      setPushEnabled(false);
      return;
    }

    setPushSupported(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const permission = Notification.permission;
      const sub = await reg.pushManager.getSubscription();
      const enabled = permission === "granted" && !!sub;
      setPushEnabled(enabled);

      if (enabled && sub) {
        // Ensure backend state is in sync with browser subscription state.
        await apiMutation(API_ROUTES.notifications.pushSubscriptions, {
          method: "POST",
          body: sub.toJSON(),
        });
      }
    } catch {
      setPushEnabled(false);
    }
  };

  useEffect(() => {
    apiMutation<NotifPrefs>(API_ROUTES.notifications.preferences, { method: "GET" })
      .then((result) => {
        if (result.ok && result.data) {
          setPrefs(result.data);
        } else {
          setPrefs(DEFAULT_PREFS);
        }
        setHasUnsavedChanges(false);
      })
      .finally(() => setLoaded(true));

    void syncPushStateFromBrowser();
  }, []);

  const handleChange = (key: keyof NotifPrefs, val: boolean) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: val };
      setHasUnsavedChanges(true);
      return next;
    });
  };

  const savePreferences = async () => {
    setSavingPrefs(true);
    try {
      const result = await apiMutation<NotifPrefs, NotifPrefs>(
        API_ROUTES.notifications.preferences,
        {
          method: "PUT",
          body: prefs,
        },
      );
      if (!result.ok) {
        message.error(result.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      const persisted = result.data ?? prefs;
      setPrefs(persisted);
      setHasUnsavedChanges(false);
      message.success((CONTENT.settings as Record<string, string>).saved);
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleTogglePush = async () => {
    if (!pushSupported) return;
    setPushLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      if (pushEnabled) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          const removeResult = await apiMutation(API_ROUTES.notifications.pushSubscriptions, {
            method: "DELETE",
            body: { endpoint: sub.endpoint },
          });
          if (!removeResult.ok) {
            message.warning(
              removeResult.error ?? (CONTENT.errors as Record<string, string>).generic,
            );
          }
          await sub.unsubscribe();
        }
        await upsertPushPreference(false);
        setPushEnabled(false);
        message.info((CONTENT.settings as Record<string, string>).pushDisabled);
      } else {
        let permission = Notification.permission;
        if (permission !== "granted") {
          permission = await Notification.requestPermission();
        }
        if (permission === "denied") {
          message.warning((CONTENT.settings as Record<string, string>).pushPermissionDenied);
          return;
        }

        if (permission !== "granted") {
          message.warning((CONTENT.settings as Record<string, string>).pushPermissionDenied);
          return;
        }

        const existingSub = await reg.pushManager.getSubscription();
        if (existingSub) {
          const saveExistingResult = await apiMutation(API_ROUTES.notifications.pushSubscriptions, {
            method: "POST",
            body: existingSub.toJSON(),
          });
          if (!saveExistingResult.ok) {
            message.error(
              saveExistingResult.error ?? (CONTENT.errors as Record<string, string>).generic,
            );
            return;
          }

          await upsertPushPreference(true);
          setPushEnabled(true);
          message.success((CONTENT.settings as Record<string, string>).pushEnabled);
          return;
        }

        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          message.error(
            (CONTENT.settings as Record<string, string>).pushNotConfigured ??
              (CONTENT.errors as Record<string, string>).generic,
          );
          return;
        }

        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
        });

        const saveSubscriptionResult = await apiMutation(
          API_ROUTES.notifications.pushSubscriptions,
          {
            method: "POST",
            body: subscription.toJSON(),
          },
        );
        if (!saveSubscriptionResult.ok) {
          await subscription.unsubscribe().catch(() => undefined);
          message.error(
            saveSubscriptionResult.error ?? (CONTENT.errors as Record<string, string>).generic,
          );
          return;
        }

        await upsertPushPreference(true);
        setPushEnabled(true);
        message.success((CONTENT.settings as Record<string, string>).pushEnabled);
      }
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setPushLoading(false);
    }
  };

  if (!loaded) return <LoadingSkeleton rows={3} />;

  return (
    <div className="max-w-md space-y-6">
      <SectionCard
        icon={<BellOutlined />}
        title={(CONTENT.settings as Record<string, string>).notificationsSection}
      >
        {NOTIF_ROWS.map((row) => (
          <NotifRow
            key={row.key}
            label={(CONTENT.settings as Record<string, string>)[row.labelKey]}
            description={(CONTENT.settings as Record<string, string>)[row.descKey]}
            checked={prefs[row.key]}
            onChange={(val) => handleChange(row.key, val)}
          />
        ))}
        <div className="flex justify-end mt-4">
          {hasUnsavedChanges && (
            <span className="text-xs text-ds-text-subtle mr-3 self-center">
              {(CONTENT.settings as Record<string, string>).unsavedChanges}
            </span>
          )}
          <Button
            type="primary"
            icon={<CheckOutlined />}
            loading={savingPrefs}
            onClick={savePreferences}
          >
            {(CONTENT.settings as Record<string, string>).savePreferences}
          </Button>
        </div>
      </SectionCard>

      <SectionCard
        icon={<MobileOutlined />}
        title={(CONTENT.settings as Record<string, string>).pushNotificationsSection}
      >
        <div className="flex items-start justify-between gap-4 py-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-ds-text-primary">
              {(CONTENT.settings as Record<string, string>).pushNotificationsLabel}
            </p>
            <p className="text-xs text-ds-text-subtle mt-0.5">
              {pushSupported
                ? (CONTENT.settings as Record<string, string>).pushNotificationsDescription
                : (CONTENT.settings as Record<string, string>).pushNotSupported}
            </p>
          </div>
          <Switch
            checked={pushEnabled}
            onChange={handleTogglePush}
            loading={pushLoading}
            disabled={!pushSupported}
          />
        </div>
      </SectionCard>
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/* ProfilePage                                                                 */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export function ProfilePage({ defaultTab }: { defaultTab?: string }) {
  const { user } = useAuth();

  if (!user) return <LoadingSkeleton rows={6} />;

  const TAB_ITEMS = [
    {
      key: "profile",
      label: (
        <span className="flex items-center gap-2">
          <UserOutlined />
          {CONTENT.profile.tabs.profile as string}
        </span>
      ),
      children: <ProfileTab user={user} />,
    },
    {
      key: "security",
      label: (
        <span className="flex items-center gap-2">
          <LockOutlined />
          {CONTENT.profile.tabs.security as string}
        </span>
      ),
      children: <SecurityTab />,
    },
    {
      key: "appearance",
      label: (
        <span className="flex items-center gap-2">
          <BulbOutlined />
          {CONTENT.profile.tabs.appearance as string}
        </span>
      ),
      children: <AppearanceTab />,
    },
    {
      key: "notifications",
      label: (
        <span className="flex items-center gap-2">
          <BellOutlined />
          {CONTENT.profile.tabs.notifications as string}
        </span>
      ),
      children: <NotificationsTab />,
    },
  ];

  return (
    <PageLayout>
      <PageHeader
        title={CONTENT.profile.pageTitle as string}
        subtitle={`${user.firstName} ${user.lastName}`}
      />
      <Tabs defaultActiveKey={defaultTab ?? "profile"} items={TAB_ITEMS} className="mt-2" />
    </PageLayout>
  );
}
