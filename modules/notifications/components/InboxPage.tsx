"use client";

/**
 * modules/notifications/components/InboxPage.tsx
 * Notification inbox — works for all roles that have inbox access.
 */

import { useRouter } from "next/navigation";
import { message } from "antd";
import { BellOutlined, CheckOutlined } from "@ant-design/icons";
import { useApiData } from "@/lib/hooks/useApiData";
import { useAuth } from "@/providers/AuthProvider";
import { CONTENT } from "@/config/content";
import { API_ROUTES, APP_ROUTES } from "@/config/routes";
import { fmtDateTime } from "@/lib/utils/formatDate";
import Button from "@/components/ui/Button";
import { PageLayout } from "@/components/ui/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

/* ── Notification row ─────────────────────────────────────────────────────── */

interface NotificationRowProps {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
}

function NotificationRow({ notification, onMarkRead }: NotificationRowProps) {
  const router = useRouter();
  const typeLabel =
    CONTENT.notifications.types[notification.type as keyof typeof CONTENT.notifications.types] ??
    notification.type;

  const handleClick = () => {
    if (!notification.read && !notification.isRead) onMarkRead(notification.id);
    if (notification.relatedId || notification.reportId) {
      const targetId = notification.reportId ?? notification.relatedId;
      if (targetId) router.push(APP_ROUTES.reportDetail(targetId));
    }
  };

  return (
    <li>
      <button
        onClick={handleClick}
        className={[
          "w-full flex items-start gap-3 px-4 py-4 text-left transition-colors",
          "hover:bg-ds-surface-sunken border-b border-ds-border-subtle last:border-b-0",
          "bg-transparent cursor-pointer",
          !notification.read && !notification.isRead ? "bg-ds-brand-accent/5" : "",
        ].join(" ")}
      >
        {/* Unread dot */}
        <span
          className={[
            "mt-1.5 w-2 h-2 rounded-full flex-shrink-0",
            !notification.read && !notification.isRead ? "bg-ds-brand-accent" : "bg-transparent",
          ].join(" ")}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={[
              "text-sm leading-snug",
              !notification.read && !notification.isRead
                ? "font-semibold text-ds-text-primary"
                : "font-normal text-ds-text-secondary",
            ].join(" ")}
          >
            {notification.message}
          </p>
          <p className="text-xs text-ds-text-subtle mt-1">
            {typeLabel} · {fmtDateTime(notification.createdAt)}
          </p>
        </div>
      </button>
    </li>
  );
}

/* ── InboxPage ────────────────────────────────────────────────────────────── */

export function InboxPage() {
  const { user } = useAuth();

  const { data: notifications, refetch } = useApiData<AppNotification[]>(
    user ? API_ROUTES.notifications.list : null,
  );

  const sorted = notifications
    ? [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    : undefined;

  const unreadCount = sorted?.filter((n) => !n.read && !n.isRead).length ?? 0;

  const handleMarkRead = async (id: string) => {
    try {
      await fetch(API_ROUTES.notifications.markRead(id), { method: "POST" });
      refetch();
    } catch {
      message.error(CONTENT.common.errorDefault as string);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch(API_ROUTES.notifications.markAllRead, { method: "POST" });
      message.success(
        (CONTENT.notifications.markAllRead as string) ?? "All notifications marked as read.",
      );
      refetch();
    } catch {
      message.error(CONTENT.common.errorDefault as string);
    }
  };

  return (
    <PageLayout
      title={CONTENT.notifications.pageTitle as string}
      subtitle={unreadCount > 0 ? `${unreadCount} unread` : undefined}
      actions={
        unreadCount > 0 ? (
          <Button icon={<CheckOutlined />} onClick={handleMarkAllRead}>
            {CONTENT.notifications.markAllRead as string}
          </Button>
        ) : undefined
      }
    >
      <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base overflow-hidden">
        {notifications === undefined ? (
          <div className="p-6">
            <LoadingSkeleton rows={5} />
          </div>
        ) : sorted && sorted.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<BellOutlined />}
              title={CONTENT.notifications.emptyState.title as string}
              description={CONTENT.notifications.emptyState.description as string}
            />
          </div>
        ) : (
          <ul>
            {sorted!.map((n) => (
              <NotificationRow key={n.id} notification={n} onMarkRead={handleMarkRead} />
            ))}
          </ul>
        )}
      </div>
    </PageLayout>
  );
}
