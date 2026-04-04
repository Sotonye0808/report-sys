import { sendEmail } from "@/lib/email/resend";
import { createNotification } from "@/lib/utils/notifications";
import {
  type NotificationPreferences,
  type PushSubscriptionRecord,
  getNotificationPreferences,
  getPushSubscriptions,
} from "@/lib/utils/notificationPreferences";
import { NotificationType } from "@/types/global";

interface ChannelOrchestratorParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  emailTo?: string;
  emailSubject?: string;
  emailHtml?: string;
  reportId?: string;
  relatedId?: string;
}

interface ChannelOrchestratorOverrides {
  preferences?: NotificationPreferences;
  pushSubscriptions?: PushSubscriptionRecord[];
  createInAppNotification?: (payload: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    reportId?: string;
    relatedId?: string;
  }) => Promise<void>;
  sendEmailImpl?: (payload: {
    to: string;
    subject: string;
    html: string;
  }) => Promise<unknown>;
}

export interface ChannelDispatchResult {
  inApp: "sent" | "skipped";
  email: "sent" | "skipped" | "failed";
  push: "queued" | "skipped" | "failed";
}

export async function dispatchNotificationChannels(
  params: ChannelOrchestratorParams,
  overrides?: ChannelOrchestratorOverrides,
): Promise<ChannelDispatchResult> {
  const preferences = overrides?.preferences ?? (await getNotificationPreferences(params.userId));
  const result: ChannelDispatchResult = {
    inApp: "skipped",
    email: "skipped",
    push: "skipped",
  };

  if (preferences.inApp) {
    const inAppSender =
      overrides?.createInAppNotification ??
      (async (payload: {
        userId: string;
        type: NotificationType;
        title: string;
        message: string;
        reportId?: string;
        relatedId?: string;
      }) => {
        await createNotification(payload);
      });
    await inAppSender({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      reportId: params.reportId,
      relatedId: params.relatedId,
    });
    result.inApp = "sent";
  }

  if (preferences.email && params.emailTo && params.emailSubject && params.emailHtml) {
    if (!process.env.RESEND_API_KEY) {
      result.email = "skipped";
    } else {
      try {
        const sender = overrides?.sendEmailImpl ?? sendEmail;
        await sender({
          to: params.emailTo,
          subject: params.emailSubject,
          html: params.emailHtml,
        });
        result.email = "sent";
      } catch {
        result.email = "failed";
      }
    }
  }

  if (preferences.push) {
    const subscriptions =
      overrides?.pushSubscriptions ?? (await getPushSubscriptions(params.userId));
    if (subscriptions.length > 0) {
      // Push delivery transport is not yet wired in this slice.
      // We mark as queued to avoid claiming dispatch happened.
      result.push = "queued";
    }
  }

  return result;
}
