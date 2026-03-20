/**
 * lib/utils/audit.ts
 *
 * Central audit / event service for domain actions.
 *Aim: avoid duplicate reporting and notification code in routes.
 */
import type { Prisma } from "@/prisma/generated";
import { db } from "@/lib/data/db";
import { createNotification } from "@/lib/utils/notifications";
import { sendReportStatusEmail } from "@/lib/email/resend";
import { ReportEventType, NotificationType, ReportStatus } from "@/types/global";

export type AuditTarget = "report" | "template" | "goal";

export interface AuditEventParams {
    reportId: string;
    actorId: string;
    eventType: ReportEventType;
    details?: string;
    previousStatus?: ReportStatus;
    newStatus?: ReportStatus;
    timestamp?: Date;
}

/**
 * Create a report event in DB (#report_event table) in transaction context.
 */
export async function createReportEvent(
    params: AuditEventParams,
    tx?: Prisma.TransactionClient,
) {
    const target = tx ?? db;

    const event = await target.reportEvent.create({
        data: {
            reportId: params.reportId,
            eventType: params.eventType,
            actorId: params.actorId,
            timestamp: params.timestamp ?? new Date(),
            details: params.details,
            previousStatus: params.previousStatus,
            newStatus: params.newStatus,
        },
    });

    return event;
}

export interface AuditNotificationParams {
    reportId: string;
    recipientId: string;
    eventType: NotificationType;
    title: string;
    message: string;
    actorName?: string;
    reportTitle?: string;
    recipientEmail?: string;
}

/**
 * Create in-app notification and one optional email notification.
 */
export async function createAuditNotification(
    params: AuditNotificationParams,
    tx?: Prisma.TransactionClient,
) {
    const target = tx ?? db;

    await createNotification(
        {
            userId: params.recipientId,
            type: params.eventType,
            title: params.title,
            message: params.message,
            reportId: params.reportId,
        },
        tx,
    );

    const emailAddress = params.recipientEmail
        ? params.recipientEmail
        : (await target.user.findUnique({ where: { id: params.recipientId } }))?.email;

    if (!emailAddress || !process.env.RESEND_API_KEY) {
        return;
    }

    // Fire and forget; don't block on failures.
    sendReportStatusEmail({
        to: emailAddress,
        reporterName: params.actorName ?? "",
        reportTitle: params.reportTitle ?? "Report",
        newStatus: params.title,
        reportUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/reports/${params.reportId}`,
    }).catch((err) => {
        // eslint-disable-next-line no-console
        console.warn("[audit] Failed to send report status email:", err);
    });
}

/**
 * Generic audit event builder (future-proof for templates/goals).
 */
export async function createAuditEvent(
    targetType: AuditTarget,
    targetId: string,
    actorId: string,
    eventType: string,
    details?: string,
    tx?: Prisma.TransactionClient,
) {
    // Table and event schemas vary by target type; adapt as needed.
    if (targetType === "report") {
        return createReportEvent(
            {
                reportId: targetId,
                actorId,
                eventType: eventType as ReportEventType,
                details,
                timestamp: new Date(),
            },
            tx,
        );
    }

    // Future targets: template, goal
    return null;
}
