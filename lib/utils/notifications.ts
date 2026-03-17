/**
 * lib/utils/notifications.ts
 *
 * Central helper(s) for creating in-app notifications and keeping the cache fresh.
 * This is intended for server-side usage in API routes where domain events should
 * emit user-facing alerts (report submission, locking, unlocking, etc.).
 */

import type { Prisma } from "@/prisma/generated";
import { db, cache } from "@/lib/data/db";
import { NotificationType } from "@/types/global";

export interface CreateNotificationParams {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    reportId?: string;
    relatedId?: string;
}

export async function createNotification(
    params: CreateNotificationParams,
    tx?: Prisma.TransactionClient,
) {
    const target = tx ?? db;
    const notification = await target.notification.create({
        data: {
            userId: params.userId,
            type: params.type,
            title: params.title,
            message: params.message,
            reportId: params.reportId,
            relatedId: params.relatedId,
        },
    });

    // Invalidate the cache only when we're not inside an active transaction.
    if (!tx) {
        await cache.invalidatePattern(`notifications:${params.userId}*`);
    }

    return notification;
}

export async function invalidateNotificationsCache(userId: string) {
    await cache.invalidatePattern(`notifications:${userId}*`);
}
