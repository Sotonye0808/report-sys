/**
 * modules/reports/services/reportWorkflow.ts
 *
 * Shared report workflow service (submit/request-edit/approve/review/lock/unlock)
 */
import { db, cache } from "@/lib/data/db";
import { createReportEvent, createAuditNotification } from "@/lib/utils/audit";
import { ReportStatus, ReportEventType, NotificationType, UserRole, ReportEditStatus } from "@/types/global";
import { canTransition } from "@/modules/reports/services/reportWorkflowUtils";


async function getApproverCandidate(report: { orgGroupId?: string | null; campusId?: string | null }) {
    const groupAdmin = report.orgGroupId
        ? await db.user.findFirst({
            where: { role: UserRole.GROUP_ADMIN, orgGroupId: report.orgGroupId, isActive: true },
        })
        : null;

    const campusPastor = report.campusId
        ? await db.user.findFirst({
            where: { role: UserRole.CAMPUS_PASTOR, campusId: report.campusId, isActive: true },
        })
        : null;

    const superadmin = await db.user.findFirst({ where: { role: UserRole.SUPERADMIN, isActive: true } });

    return groupAdmin ?? campusPastor ?? superadmin;
}

interface BaseWorkflowParams {
    reportId: string;
    actorId: string;
    actorName?: string;
    actorRole: UserRole;
}

async function performTransition(
    params: BaseWorkflowParams,
    from: ReportStatus,
    to: ReportStatus,
    eventType: ReportEventType,
    notificationType: NotificationType,
    details?: string,
) {
    const report = await db.report.findUnique({ where: { id: params.reportId } });
    if (!report) throw new Error("Report not found.");

    const currentStatus = report.status as unknown as ReportStatus;

    if (!canTransition(currentStatus, to, params.actorRole)) {
        throw new Error(`Cannot transition report from ${currentStatus} to ${to} as ${params.actorRole}`);
    }

    const recipientId = report.submittedById ?? report.createdById;
    const recipientEmail = recipientId ? (await db.user.findUnique({ where: { id: recipientId } }))?.email : undefined;

    const updated = await db.$transaction(async (tx) => {
        const merged = await tx.report.update({
            where: { id: params.reportId },
            data: {
                status: to,
                updatedAt: new Date(),
                ...(to === ReportStatus.LOCKED ? { lockedAt: new Date() } : {}),
                ...(to === ReportStatus.DRAFT ? { lockedAt: null } : {}),
                ...(to === ReportStatus.REVIEWED ? { reviewedById: params.actorId } : {}),
            },
        });

        await createReportEvent(
            {
                reportId: params.reportId,
                actorId: params.actorId,
                eventType,
                previousStatus: currentStatus,
                newStatus: to,
                details,
            },
            tx,
        );

        if (recipientId && recipientId !== params.actorId) {
            await createAuditNotification(
                {
                    reportId: params.reportId,
                    recipientId,
                    eventType: notificationType,
                    title: `Report ${to}`,
                    message: `${params.actorName ?? "A user"} changed report status from ${report.status} to ${to}.`,
                    actorName: params.actorName,
                    reportTitle: report.title ?? "Report",
                    recipientEmail,
                },
                tx,
            );
        }

        return merged;
    });

    await cache.invalidatePattern(`report:${params.reportId}*`);
    await cache.invalidatePattern("reports:list:*");
    if (recipientId) await cache.invalidatePattern(`notifications:${recipientId}*`);

    return updated;
}

export async function submitReport(params: BaseWorkflowParams) {
    return performTransition(
        params,
        ReportStatus.DRAFT,
        ReportStatus.SUBMITTED,
        ReportEventType.SUBMITTED,
        NotificationType.REPORT_SUBMITTED,
    );
}

export async function requestEditReport(params: BaseWorkflowParams, reason: string) {
    const report = await db.report.findUnique({ where: { id: params.reportId } });
    if (!report) throw new Error("Report not found.");
    const recipientId = report.submittedById ?? report.createdById;

    const updated = await db.$transaction(async (tx) => {
        const reportUpdate = await tx.report.update({
            where: { id: params.reportId },
            data: { status: ReportStatus.REQUIRES_EDITS, notes: reason, updatedAt: new Date() },
        });

        await tx.reportEdit.create({
            data: {
                reportId: params.reportId,
                submittedById: params.actorId,
                reason,
                status: ReportEditStatus.SUBMITTED,
                sections: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });

        await createReportEvent(
            {
                reportId: params.reportId,
                actorId: params.actorId,
                eventType: ReportEventType.EDIT_REQUESTED,
                previousStatus: report.status as unknown as ReportStatus,
                newStatus: ReportStatus.REQUIRES_EDITS,
                details: reason,
            },
            tx,
        );

        if (recipientId && recipientId !== params.actorId) {
            const recipientEmail = (await tx.user.findUnique({ where: { id: recipientId } }))?.email;
            await createAuditNotification(
                {
                    reportId: params.reportId,
                    recipientId,
                    eventType: NotificationType.REPORT_EDIT_REQUESTED,
                    title: "Edit Requested",
                    message: `${params.actorName ?? "A user"} requested edits: ${reason}`,
                    actorName: params.actorName,
                    reportTitle: report.title ?? "Report",
                    recipientEmail,
                },
                tx,
            );
        }

        return reportUpdate;
    });

    await cache.invalidatePattern(`report:${params.reportId}*`);
    await cache.invalidatePattern("reports:list:*");
    if (recipientId) await cache.invalidatePattern(`notifications:${recipientId}*`);
    return updated;
}

export async function approveReport(params: BaseWorkflowParams, detail?: string) {
    return performTransition(
        params,
        ReportStatus.SUBMITTED,
        ReportStatus.APPROVED,
        ReportEventType.APPROVED,
        NotificationType.REPORT_APPROVED,
        detail,
    );
}

export async function reviewReport(params: BaseWorkflowParams, detail?: string) {
    return performTransition(
        params,
        ReportStatus.APPROVED,
        ReportStatus.REVIEWED,
        ReportEventType.REVIEWED,
        NotificationType.REPORT_REVIEWED,
        detail,
    );
}

export async function lockReport(params: BaseWorkflowParams) {
    return performTransition(
        params,
        ReportStatus.REVIEWED,
        ReportStatus.LOCKED,
        ReportEventType.LOCKED,
        NotificationType.REPORT_LOCKED,
    );
}

export async function unlockReport(params: BaseWorkflowParams) {
    return performTransition(
        params,
        ReportStatus.LOCKED,
        ReportStatus.DRAFT,
        ReportEventType.UNLOCKED,
        NotificationType.REPORT_UNLOCKED,
    );
}

export async function createReportEdit(
    reportId: string,
    actorId: string,
    actorName: string | undefined,
    reason: string,
    sections: unknown[] = [],
) {
    const report = await db.report.findUnique({ where: { id: reportId } });
    if (!report) throw new Error("Report not found.");

    const edit = await db.reportEdit.create({
        data: {
            reportId,
            submittedById: actorId,
            reason,
            sections: sections as unknown as any,
            status: ReportEditStatus.DRAFT,
        },
    });

    await createReportEvent({
        reportId,
        actorId,
        eventType: ReportEventType.EDIT_REQUESTED,
        details: reason,
        previousStatus: report.status as unknown as ReportStatus,
        newStatus: report.status as unknown as ReportStatus,
    });

    return edit;
}

export async function submitReportEdit(
    reportId: string,
    editId: string,
    actorId: string,
    actorName: string | undefined,
) {
    const edit = await db.reportEdit.findUnique({ where: { id: editId } });
    if (!edit || edit.reportId !== reportId) throw new Error("Edit request not found.");
    if (edit.status !== ReportEditStatus.DRAFT) throw new Error("Only draft edits can be submitted.");

    const report = await db.report.findUnique({ where: { id: reportId } });
    if (!report) throw new Error("Report not found.");

    const updated = await db.$transaction(async (tx) => {
        const e = await tx.reportEdit.update({
            where: { id: editId },
            data: { status: ReportEditStatus.SUBMITTED, updatedAt: new Date() },
        });

        await tx.report.update({
            where: { id: reportId },
            data: { status: ReportStatus.REQUIRES_EDITS, notes: edit.reason, updatedAt: new Date() },
        });

        await createReportEvent(
            {
                reportId,
                actorId,
                eventType: ReportEventType.EDIT_SUBMITTED,
                previousStatus: report.status as unknown as ReportStatus,
                newStatus: ReportStatus.REQUIRES_EDITS,
                details: edit.reason,
            },
            tx,
        );

        const recipientId = report.submittedById ?? report.createdById;
        const recipientEmail = recipientId ? (await tx.user.findUnique({ where: { id: recipientId } }))?.email : undefined;

        if (recipientId && recipientId !== actorId) {
            await createAuditNotification(
                {
                    reportId,
                    recipientId,
                    eventType: NotificationType.REPORT_EDIT_SUBMITTED,
                    title: "Edit Submitted",
                    message: `${actorName ?? "A user"} submitted an edit request: ${edit.reason}`,
                    actorName,
                    reportTitle: report.title ?? "Report",
                    recipientEmail,
                },
                tx,
            );
        }

        return e;
    });

    await cache.invalidatePattern(`report:${reportId}*`);
    await cache.invalidatePattern("reports:list:*");
    if (report.submittedById) await cache.invalidatePattern(`notifications:${report.submittedById}*`);

    return updated;
}

export async function approveReportEdit(
    reportId: string,
    editId: string,
    actorId: string,
    actorName: string | undefined,
) {
    const edit = await db.reportEdit.findUnique({ where: { id: editId } });
    if (!edit || edit.reportId !== reportId) throw new Error("Edit request not found.");
    if (edit.status !== ReportEditStatus.SUBMITTED) throw new Error("Only submitted edits can be approved.");

    const report = await db.report.findUnique({ where: { id: reportId } });
    if (!report) throw new Error("Report not found.");

    const updated = await db.$transaction(async (tx) => {
        const e = await tx.reportEdit.update({
            where: { id: editId },
            data: {
                status: ReportEditStatus.APPROVED,
                reviewedById: actorId,
                reviewNotes: `Approved by ${actorName ?? "Review"}`,
                updatedAt: new Date(),
            },
        });

        await tx.report.update({
            where: { id: reportId },
            data: { status: ReportStatus.SUBMITTED, updatedAt: new Date() },
        });

        await createReportEvent(
            {
                reportId,
                actorId,
                eventType: ReportEventType.EDIT_APPROVED,
                previousStatus: report.status as unknown as ReportStatus,
                newStatus: ReportStatus.SUBMITTED,
                details: edit.reason,
            },
            tx,
        );

        const requester = await tx.user.findUnique({ where: { id: edit.submittedById } });
        if (requester) {
            await createAuditNotification(
                {
                    reportId,
                    recipientId: requester.id,
                    eventType: NotificationType.REPORT_EDIT_APPROVED,
                    title: "Edit Approved",
                    message: `Your edit request has been approved.`,
                    actorName,
                    reportTitle: report.title ?? "Report",
                    recipientEmail: requester.email,
                },
                tx,
            );
        }

        return e;
    });

    await cache.invalidatePattern(`report:${reportId}*`);
    await cache.invalidatePattern("reports:list:*");
    await cache.invalidatePattern(`notifications:${edit.submittedById}*`);

    return updated;
}

export async function rejectReportEdit(
    reportId: string,
    editId: string,
    actorId: string,
    actorName: string | undefined,
    reason?: string,
) {
    const edit = await db.reportEdit.findUnique({ where: { id: editId } });
    if (!edit || edit.reportId !== reportId) throw new Error("Edit request not found.");
    if (edit.status !== ReportEditStatus.SUBMITTED) throw new Error("Only submitted edits can be rejected.");

    const report = await db.report.findUnique({ where: { id: reportId } });
    if (!report) throw new Error("Report not found.");

    const updated = await db.$transaction(async (tx) => {
        const e = await tx.reportEdit.update({
            where: { id: editId },
            data: {
                status: ReportEditStatus.REJECTED,
                reviewedById: actorId,
                reviewNotes: reason,
                updatedAt: new Date(),
            },
        });

        await tx.report.update({
            where: { id: reportId },
            data: { status: ReportStatus.REQUIRES_EDITS, updatedAt: new Date() },
        });

        await createReportEvent(
            {
                reportId,
                actorId,
                eventType: ReportEventType.EDIT_REJECTED,
                previousStatus: report.status as unknown as ReportStatus,
                newStatus: ReportStatus.REQUIRES_EDITS,
                details: reason || "",
            },
            tx,
        );

        const requester = await tx.user.findUnique({ where: { id: edit.submittedById } });
        if (requester) {
            await createAuditNotification(
                {
                    reportId,
                    recipientId: requester.id,
                    eventType: NotificationType.REPORT_EDIT_REJECTED,
                    title: "Edit Rejected",
                    message: `Your edit request was rejected${reason ? `: ${reason}` : "."}`,
                    actorName,
                    reportTitle: report.title ?? "Report",
                    recipientEmail: requester.email,
                },
                tx,
            );
        }

        return e;
    });

    await cache.invalidatePattern(`report:${reportId}*`);
    await cache.invalidatePattern("reports:list:*");
    await cache.invalidatePattern(`notifications:${edit.submittedById}*`);

    return updated;
}
