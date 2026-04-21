import { createHash, randomBytes } from "node:crypto";
import { db } from "@/lib/data/db";
import { sendEmail } from "@/lib/email/resend";
import { emailTemplates } from "@/lib/email/templates/registry";
import { createNotification } from "@/lib/utils/notifications";
import { getAppUrl, isEmailServiceReady } from "@/lib/utils/emailServiceReadiness";
import { EmailActionType, NotificationType } from "@/types/global";

const EMAIL_VERIFICATION_TOKEN_TTL_HOURS = Number(process.env.EMAIL_VERIFICATION_TOKEN_TTL_HOURS ?? 24);
const EMAIL_CHANGE_TOKEN_TTL_HOURS = Number(process.env.EMAIL_CHANGE_TOKEN_TTL_HOURS ?? 24);

export class EmailActionError extends Error {
    status: number;

    constructor(message: string, status = 400) {
        super(message);
        this.name = "EmailActionError";
        this.status = status;
    }
}

export interface EmailVerificationStatus {
    email: string;
    pendingEmail: string | null;
    isEmailVerified: boolean;
    emailVerifiedAt: Date | null;
    emailVerificationSentAt: Date | null;
    pendingEmailRequestedAt: Date | null;
    pendingEmailSentAt: Date | null;
    emailServiceReady: boolean;
}

function hashToken(token: string): string {
    return createHash("sha256")
        .update(`${token}:${process.env.JWT_SECRET ?? "dev-email-token-salt"}`)
        .digest("hex");
}

function generateRawToken(): string {
    return randomBytes(32).toString("hex");
}

async function invalidateOpenTokens(userId: string, type: EmailActionType) {
    await db.emailActionToken.updateMany({
        where: {
            userId,
            type: type as any,
            usedAt: null,
            invalidatedAt: null,
            expiresAt: { gt: new Date() },
        },
        data: { invalidatedAt: new Date() },
    });
}

async function createToken(
    userId: string,
    type: EmailActionType,
    ttlHours: number,
    targetEmail?: string,
) {
    const rawToken = generateRawToken();
    const tokenHash = hashToken(rawToken);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);

    await invalidateOpenTokens(userId, type);
    await db.emailActionToken.create({
        data: {
            userId,
            type: type as any,
            tokenHash,
            targetEmail: targetEmail ?? null,
            expiresAt,
        },
    });

    return { rawToken, expiresAt };
}

export async function getEmailVerificationStatus(userId: string): Promise<EmailVerificationStatus> {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new EmailActionError("User not found.", 404);
    }

    return {
        email: user.email,
        pendingEmail: (user as any).pendingEmail ?? null,
        isEmailVerified: Boolean((user as any).emailVerifiedAt),
        emailVerifiedAt: (user as any).emailVerifiedAt ?? null,
        emailVerificationSentAt: (user as any).emailVerificationSentAt ?? null,
        pendingEmailRequestedAt: (user as any).pendingEmailRequestedAt ?? null,
        pendingEmailSentAt: (user as any).pendingEmailSentAt ?? null,
        emailServiceReady: isEmailServiceReady(),
    };
}

export async function ensureEmailVerificationPrompt(userId: string, email: string) {
    if (!isEmailServiceReady()) return;

    const unreadPrompt = await db.notification.findFirst({
        where: {
            userId,
            type: NotificationType.EMAIL_VERIFICATION_REQUIRED as any,
            read: false,
        },
    });

    if (unreadPrompt) return;

    await createNotification({
        userId,
        type: NotificationType.EMAIL_VERIFICATION_REQUIRED,
        title: "Verify your email",
        message: `Please verify ${email} to secure your account and receive important updates.`,
        relatedId: "verify-email",
    });
}

export async function clearEmailVerificationPrompts(userId: string) {
    await db.notification.updateMany({
        where: {
            userId,
            type: NotificationType.EMAIL_VERIFICATION_REQUIRED as any,
            read: false,
        },
        data: {
            read: true,
            readAt: new Date(),
        },
    });
}

export async function syncVerificationPromptForUser(userId: string) {
    const status = await getEmailVerificationStatus(userId);
    if (!status.emailServiceReady) return status;

    if (status.isEmailVerified) {
        await clearEmailVerificationPrompts(userId);
        return status;
    }

    await ensureEmailVerificationPrompt(userId, status.email);
    return status;
}

export async function requestEmailVerification(userId: string) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new EmailActionError("User not found.", 404);
    }

    if ((user as any).emailVerifiedAt) {
        return {
            sent: false,
            alreadyVerified: true,
            email: user.email,
            emailServiceReady: isEmailServiceReady(),
        };
    }

    if (!isEmailServiceReady()) {
        return {
            sent: false,
            alreadyVerified: false,
            email: user.email,
            emailServiceReady: false,
        };
    }

    const { rawToken } = await createToken(
        user.id,
        EmailActionType.VERIFY_PRIMARY_EMAIL,
        EMAIL_VERIFICATION_TOKEN_TTL_HOURS,
    );

    const verifyUrl = `${getAppUrl()}/verify-email?token=${rawToken}&mode=verify`;
    const template = emailTemplates.emailVerification({
        firstName: user.firstName,
        email: user.email,
        verifyUrl,
    });

    await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
    });

    await db.user.update({
        where: { id: user.id },
        data: { emailVerificationSentAt: new Date() } as any,
    });

    await ensureEmailVerificationPrompt(user.id, user.email);

    return {
        sent: true,
        alreadyVerified: false,
        email: user.email,
        emailServiceReady: true,
    };
}

function getInvalidTokenMessage(tokenRow: { usedAt: Date | null; expiresAt: Date; invalidatedAt: Date | null }) {
    if (tokenRow.usedAt) return "This verification link has already been used.";
    if (tokenRow.invalidatedAt) return "This verification link is no longer valid.";
    if (tokenRow.expiresAt <= new Date()) return "This verification link has expired.";
    return "This verification link is invalid.";
}

export async function confirmPrimaryEmail(token: string) {
    const tokenHash = hashToken(token);

    const existing = await db.emailActionToken.findUnique({
        where: { tokenHash },
        include: { user: true },
    });

    if (!existing || existing.type !== (EmailActionType.VERIFY_PRIMARY_EMAIL as any)) {
        throw new EmailActionError("This verification link is invalid.", 400);
    }

    if (existing.usedAt || existing.invalidatedAt || existing.expiresAt <= new Date()) {
        throw new EmailActionError(getInvalidTokenMessage(existing), 400);
    }

    await db.$transaction(async (tx) => {
        await tx.user.update({
            where: { id: existing.userId },
            data: { emailVerifiedAt: new Date() } as any,
        });

        await tx.emailActionToken.update({
            where: { id: existing.id },
            data: { usedAt: new Date() },
        });
    });

    await clearEmailVerificationPrompts(existing.userId);

    await createNotification({
        userId: existing.userId,
        type: NotificationType.EMAIL_VERIFIED,
        title: "Email verified",
        message: `${existing.user.email} has been verified successfully.`,
    });

    return {
        email: existing.user.email,
        isEmailVerified: true,
    };
}

export async function requestEmailChange(userId: string, newEmail: string) {
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed) {
        throw new EmailActionError("A valid new email address is required.", 400);
    }

    if (!isEmailServiceReady()) {
        throw new EmailActionError("Email service is not configured for this environment.", 400);
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new EmailActionError("User not found.", 404);
    }

    if (trimmed === user.email.toLowerCase()) {
        throw new EmailActionError("The new email must be different from your current email.", 400);
    }

    const duplicate = await db.user.findFirst({
        where: {
            id: { not: user.id },
            OR: [
                { email: { equals: trimmed, mode: "insensitive" } },
                { pendingEmail: { equals: trimmed, mode: "insensitive" } as any },
            ],
        },
    });
    if (duplicate) {
        throw new EmailActionError("That email is already in use by another account.", 409);
    }

    const { rawToken } = await createToken(
        user.id,
        EmailActionType.CONFIRM_PENDING_EMAIL,
        EMAIL_CHANGE_TOKEN_TTL_HOURS,
        trimmed,
    );

    const verifyUrl = `${getAppUrl()}/verify-email?token=${rawToken}&mode=change`;

    await db.user.update({
        where: { id: user.id },
        data: {
            pendingEmail: trimmed,
            pendingEmailRequestedAt: new Date(),
            pendingEmailSentAt: new Date(),
        } as any,
    });

    const verifyTemplate = emailTemplates.emailChangeVerification({
        firstName: user.firstName,
        currentEmail: user.email,
        newEmail: trimmed,
        verifyUrl,
    });

    await sendEmail({
        to: trimmed,
        subject: verifyTemplate.subject,
        html: verifyTemplate.html,
    });

    const noticeTemplate = emailTemplates.emailChangeRequestedNotice({
        firstName: user.firstName,
        currentEmail: user.email,
        newEmail: trimmed,
    });

    await sendEmail({
        to: user.email,
        subject: noticeTemplate.subject,
        html: noticeTemplate.html,
    });

    await createNotification({
        userId: user.id,
        type: NotificationType.EMAIL_CHANGE_REQUESTED,
        title: "Email change requested",
        message: `We've sent a confirmation link to ${trimmed}.`,
    });

    return {
        pendingEmail: trimmed,
        emailServiceReady: true,
    };
}

export async function confirmPendingEmailChange(token: string) {
    const tokenHash = hashToken(token);
    const existing = await db.emailActionToken.findUnique({
        where: { tokenHash },
        include: { user: true },
    });

    if (!existing || existing.type !== (EmailActionType.CONFIRM_PENDING_EMAIL as any)) {
        throw new EmailActionError("This email-change link is invalid.", 400);
    }

    if (existing.usedAt || existing.invalidatedAt || existing.expiresAt <= new Date()) {
        throw new EmailActionError(getInvalidTokenMessage(existing), 400);
    }

    const targetEmail = (existing.targetEmail ?? "").toLowerCase();
    if (!targetEmail) {
        throw new EmailActionError("This email-change request is invalid.", 400);
    }

    const duplicate = await db.user.findFirst({
        where: {
            id: { not: existing.userId },
            OR: [
                { email: { equals: targetEmail, mode: "insensitive" } },
                { pendingEmail: { equals: targetEmail, mode: "insensitive" } as any },
            ],
        },
    });
    if (duplicate) {
        throw new EmailActionError("That email is already in use by another account.", 409);
    }

    const oldEmail = existing.user.email;

    await db.$transaction(async (tx) => {
        await tx.user.update({
            where: { id: existing.userId },
            data: {
                email: targetEmail,
                emailVerifiedAt: new Date(),
                pendingEmail: null,
                pendingEmailRequestedAt: null,
                pendingEmailSentAt: null,
            } as any,
        });

        await tx.emailActionToken.update({
            where: { id: existing.id },
            data: { usedAt: new Date() },
        });

        await tx.emailActionToken.updateMany({
            where: {
                userId: existing.userId,
                type: EmailActionType.CONFIRM_PENDING_EMAIL as any,
                usedAt: null,
                id: { not: existing.id },
            },
            data: { invalidatedAt: new Date() },
        });
    });

    await clearEmailVerificationPrompts(existing.userId);

    await createNotification({
        userId: existing.userId,
        type: NotificationType.EMAIL_CHANGED,
        title: "Email changed",
        message: `Your account email is now ${targetEmail}.`,
    });

    const changedTemplate = emailTemplates.emailChangedNotice({
        firstName: existing.user.firstName,
        oldEmail,
        newEmail: targetEmail,
    });

    if (isEmailServiceReady()) {
        await Promise.allSettled([
            sendEmail({ to: oldEmail, subject: changedTemplate.subject, html: changedTemplate.html }),
            sendEmail({ to: targetEmail, subject: changedTemplate.subject, html: changedTemplate.html }),
        ]);
    }

    return {
        oldEmail,
        email: targetEmail,
        isEmailVerified: true,
    };
}
