"use client";

/**
 * modules/auth/components/SettingsPage.tsx
 * App Preferences — appearance (theme) + notification toggles.
 * Distinct from ProfilePage which handles identity & password.
 */

import { useEffect, useState } from "react";
import { Switch, message, Select } from "antd";
import {
  BulbOutlined,
  BellOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useTheme } from "next-themes";
import { CONTENT } from "@/config/content";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import Button from "@/components/ui/Button";

/* ── Notification prefs stored in localStorage ──────────────────────────── */

const NOTIF_KEY = "hs-notif-prefs";

interface NotifPrefs {
  email: boolean;
  inApp: boolean;
  deadlineReminders: boolean;
}

const DEFAULT_PREFS: NotifPrefs = {
  email: true,
  inApp: true,
  deadlineReminders: true,
};

function loadPrefs(): NotifPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

/* ── Section component ───────────────────────────────────────────────────── */

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function SectionCard({ icon, title, children }: SectionCardProps) {
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

/* ── Theme selector ──────────────────────────────────────────────────────── */

const THEME_OPTIONS = [
  { value: "system", label: (CONTENT.settings as Record<string, string>).themeSystem },
  { value: "light",  label: (CONTENT.settings as Record<string, string>).themeLight },
  { value: "dark",   label: (CONTENT.settings as Record<string, string>).themeDark },
] as const;

function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="h-10 bg-ds-surface-sunken rounded-ds-lg animate-pulse" />
    );
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-ds-text-primary">
          {(CONTENT.settings as Record<string, string>).themeLabel}
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
  );
}

/* ── Notification toggle row ─────────────────────────────────────────────── */

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

/* ── Notification section ────────────────────────────────────────────────── */

const NOTIF_ROWS: Array<{
  key: keyof NotifPrefs;
  labelKey: string;
  descKey: string;
}> = [
  {
    key: "email",
    labelKey: "emailNotificationsLabel",
    descKey: "emailNotificationsDescription",
  },
  {
    key: "inApp",
    labelKey: "inAppNotificationsLabel",
    descKey: "inAppNotificationsDescription",
  },
  {
    key: "deadlineReminders",
    labelKey: "deadlineRemindersLabel",
    descKey: "deadlineRemindersDescription",
  },
];

function NotificationsSection() {
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
    setLoaded(true);
  }, []);

  const handleChange = (key: keyof NotifPrefs, val: boolean) => {
    const next = { ...prefs, [key]: val };
    setPrefs(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
    }
  };

  const handleSave = () => {
    message.success((CONTENT.settings as Record<string, string>).saved);
  };

  if (!loaded) {
    return <div className="h-24 bg-ds-surface-sunken rounded-ds-lg animate-pulse" />;
  }

  return (
    <>
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
        <Button type="primary" icon={<CheckOutlined />} onClick={handleSave}>
          {(CONTENT.settings as Record<string, string>).saved}
        </Button>
      </div>
    </>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export function SettingsPage() {
  return (
    <PageLayout>
      <PageHeader title={(CONTENT.settings as Record<string, string>).pageTitle} />
      <div className="max-w-xl space-y-6">
        <SectionCard
          icon={<BulbOutlined />}
          title={(CONTENT.settings as Record<string, string>).appearanceSection}
        >
          <AppearanceSection />
        </SectionCard>

        <SectionCard
          icon={<BellOutlined />}
          title={(CONTENT.settings as Record<string, string>).notificationsSection}
        >
          <NotificationsSection />
        </SectionCard>
      </div>
    </PageLayout>
  );
}
