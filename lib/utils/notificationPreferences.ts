import { cache } from "@/lib/data/db";

export interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  deadlineReminders: boolean;
  push: boolean;
}

export interface PushSubscriptionRecord {
  endpoint: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
  createdAt: string;
}

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email: true,
  inApp: true,
  deadlineReminders: true,
  push: false,
};

function preferencesKey(userId: string) {
  return `notifications:preferences:${userId}`;
}

function subscriptionsKey(userId: string) {
  return `notifications:push-subscriptions:${userId}`;
}

export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  const cached = await cache.get(preferencesKey(userId));
  if (!cached) return DEFAULT_NOTIFICATION_PREFERENCES;

  try {
    const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
    return {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...(parsed as Partial<NotificationPreferences>),
    };
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

export async function setNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  const current = await getNotificationPreferences(userId);
  const next = { ...current, ...preferences };
  await cache.set(preferencesKey(userId), JSON.stringify(next));
  return next;
}

export async function getPushSubscriptions(userId: string): Promise<PushSubscriptionRecord[]> {
  const cached = await cache.get(subscriptionsKey(userId));
  if (!cached) return [];

  try {
    const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
    return Array.isArray(parsed) ? (parsed as PushSubscriptionRecord[]) : [];
  } catch {
    return [];
  }
}

export async function upsertPushSubscription(
  userId: string,
  subscription: PushSubscriptionRecord,
): Promise<PushSubscriptionRecord[]> {
  const existing = await getPushSubscriptions(userId);
  const filtered = existing.filter((item) => item.endpoint !== subscription.endpoint);
  const next = [...filtered, subscription];
  await cache.set(subscriptionsKey(userId), JSON.stringify(next));
  return next;
}

export async function removePushSubscription(
  userId: string,
  endpoint: string,
): Promise<PushSubscriptionRecord[]> {
  const existing = await getPushSubscriptions(userId);
  const next = existing.filter((item) => item.endpoint !== endpoint);
  await cache.set(subscriptionsKey(userId), JSON.stringify(next));
  return next;
}

