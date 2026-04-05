import { DEADLINE_CONFIG } from "@/config/reports";
import { CONTENT } from "@/config/content";
import { NotificationType } from "@/types/global";
import { dispatchNotificationChannels } from "@/lib/utils/notificationOrchestrator";
import { logServerWarn } from "@/lib/utils/serverLogger";

export async function dispatchDeadlineReminder(params: {
  report: {
    id: string;
    title?: string | null;
    deadline?: Date | string | null;
  };
  recipient: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  requestId?: string;
}) {
  const deadlineValue = params.report.deadline;
  if (!deadlineValue) return { dispatched: false, reason: "missing_deadline" as const };

  const deadlineDate =
    deadlineValue instanceof Date ? deadlineValue : new Date(deadlineValue);
  if (Number.isNaN(deadlineDate.getTime())) {
    return { dispatched: false, reason: "invalid_deadline" as const };
  }

  const diffMs = deadlineDate.getTime() - Date.now();
  if (diffMs <= 0) return { dispatched: false, reason: "deadline_passed" as const };

  const leadMs = DEADLINE_CONFIG.reminderLeadHours * 60 * 60 * 1000;
  if (diffMs > leadMs) return { dispatched: false, reason: "outside_lead_window" as const };

  const reminderContent = CONTENT.notifications.deadlineReminder as Record<string, string>;
  const recipientName =
    `${params.recipient.firstName ?? ""} ${params.recipient.lastName ?? ""}`.trim() ||
    reminderContent.fallbackRecipient;
  const reportTitle = params.report.title ?? reminderContent.fallbackReportTitle;
  const reportUrl = `/reports/${params.report.id}`;
  const message = `${reminderContent.messagePrefix} ${reportTitle} ${reminderContent.messageDueOn} ${deadlineDate.toLocaleString()}.`;

  try {
    const result = await dispatchNotificationChannels({
      userId: params.recipient.id,
      type: NotificationType.REPORT_DEADLINE_REMINDER,
      title: reminderContent.title,
      message,
      reportId: params.report.id,
      emailTo: params.recipient.email,
      emailSubject: `Deadline Approaching: ${reportTitle}`,
      emailHtml: `<p>Hi ${recipientName},</p><p>${message}</p><p><a href="${reportUrl}">${reminderContent.actionLabel}</a></p>`,
    });

    return { dispatched: true, result } as const;
  } catch (error) {
    logServerWarn("[deadline-reminder] dispatch failed", {
      requestId: params.requestId,
      reportId: params.report.id,
      recipientId: params.recipient.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return { dispatched: false, reason: "dispatch_failed" as const };
  }
}
