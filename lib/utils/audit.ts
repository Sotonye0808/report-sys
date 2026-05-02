/**
 * lib/utils/audit.ts
 *
 * Central audit / event service for domain actions.
 *Aim: avoid duplicate reporting and notification code in routes.
 */
import type { Prisma } from "@/prisma/generated";
import { db } from "@/lib/data/db";
import { dispatchNotificationChannels } from "@/lib/utils/notificationOrchestrator";
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
 * Best-effort: mirror a domain audit event into the impersonation event log
 * when the calling request is happening under an active impersonation
 * session. Lets superadmin "preview log" surface every concrete mutation
 * carried out while impersonating without per-handler instrumentation.
 *
 * Failures here never break the surrounding flow.
 */
async function tagImpersonationIfActive(args: { eventType: string; details?: string }): Promise<void> {
    try {
        const { getImpersonationContext } = await import("@/lib/auth/impersonationContext");
        const ctx = await getImpersonationContext();
        if (!ctx) return;
        const { recordEvent } = await import("@/lib/auth/impersonation");
        await recordEvent(ctx.sessionId, "MUTATION_APPLIED", {
            path: args.details ?? args.eventType,
            method: "AUDIT",
            status: 200,
        });
    } catch {
        // ignore — audit must never break flow
    }
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

    void tagImpersonationIfActive({
        eventType: params.eventType,
        details: `report:${params.reportId}`,
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

async function resolveRecipientEmail(
    recipientId: string,
    fallbackEmail?: string,
    tx?: Prisma.TransactionClient,
) {
    if (fallbackEmail) {
        return fallbackEmail;
    }

    const target = tx ?? db;
    const user = await target.user.findUnique({
        where: { id: recipientId },
        select: { email: true },
    });
    return user?.email;
}

/**
 * Create in-app notification and one optional email notification.
 */
export async function createAuditNotification(
    params: AuditNotificationParams,
    tx?: Prisma.TransactionClient,
) {
    const target = tx ?? db;
    const emailAddress = await resolveRecipientEmail(
        params.recipientId,
        params.recipientEmail,
        tx,
    );

    if (tx) {
        // Keep transactional write path side-effect free outside the DB transaction.
        // Email/push orchestration is intentionally skipped in transactional contexts
        // to avoid dispatching external notifications before a successful commit.
        await target.notification.create({
            data: {
                userId: params.recipientId,
                type: params.eventType,
                title: params.title,
                message: params.message,
                reportId: params.reportId,
            },
        });
    } else {
        await dispatchNotificationChannels({
            userId: params.recipientId,
            type: params.eventType,
            title: params.title,
            message: params.message,
            reportId: params.reportId,
            emailTo: emailAddress,
            emailSubject: params.title,
            emailHtml: `<p>${params.message}</p>`,
        });
    }

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

export async function createTemplateVersionSnapshot(
    params: {
        templateId: string;
        versionNumber: number;
        snapshot: unknown;
        actorId: string;
    },
    tx?: Prisma.TransactionClient,
) {
    const target = tx ?? db;
    return target.reportTemplateVersion.create({
        data: {
            templateId: params.templateId,
            versionNumber: params.versionNumber,
            snapshot: params.snapshot as Prisma.InputJsonValue,
            createdById: params.actorId,
        },
    });
}
