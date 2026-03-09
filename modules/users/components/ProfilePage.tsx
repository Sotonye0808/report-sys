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
    fetch(API_ROUTES.users.profile)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setProfile(j.data);
      })
      .catch(() => {
        /* no-op */
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
      const res = await fetch(API_ROUTES.users.profile, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      setProfile(json.data);
      message.success(CONTENT.profile.profileUpdated as string);
      setEditing(false);
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={5} />;

  const displayName = `${profile?.firstName ?? user.firstName} ${profile?.lastName ?? user.lastName}`;
  const campus = user.campusId;
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
          {campus && <InfoRow label={CONTENT.profile.campusLabel as string} value={campus} />}
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
      const res = await fetch(API_ROUTES.auth.changePassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? (CONTENT.errors as Record<string, string>).generic);
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
    </div>
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

const NOTIF_KEY = "hs-notif-prefs";

interface NotifPrefs {
  email: boolean;
  inApp: boolean;
  deadlineReminders: boolean;
}

const DEFAULT_PREFS: NotifPrefs = { email: true, inApp: true, deadlineReminders: true };

function loadPrefs(): NotifPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

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

function NotificationsTab() {
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
    setLoaded(true);

    // Check push notification support
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setPushSupported(true);
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setPushEnabled(!!sub);
        });
      });
    }
  }, []);

  const handleChange = (key: keyof NotifPrefs, val: boolean) => {
    const next = { ...prefs, [key]: val };
    setPrefs(next);
    if (typeof window !== "undefined") localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
  };

  const handleTogglePush = async () => {
    if (!pushSupported) return;
    setPushLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      if (pushEnabled) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) await sub.unsubscribe();
        setPushEnabled(false);
        message.info((CONTENT.settings as Record<string, string>).pushDisabled);
      } else {
        const permission = await Notification.requestPermission();
        if (permission === "denied") {
          message.warning((CONTENT.settings as Record<string, string>).pushPermissionDenied);
          return;
        }
        await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });
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
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => message.success((CONTENT.settings as Record<string, string>).saved)}
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
