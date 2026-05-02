/**
 * lib/email/resend.ts
 *
 * Resend email client — initialised from RESEND_API_KEY env var.
 * All outbound emails flow through the helpers below.
 *
 * Set these env vars before going live:
 *   RESEND_API_KEY   — Resend API key
 *   EMAIL_FROM       — Verified sender, e.g. "Harvesters <noreply@harvesters.org>"
 */

import { Resend } from "resend";
import { emailTemplates } from "@/lib/email/templates/registry";
import { renderTemplate } from "@/lib/email/templates/render";

const FROM = process.env.EMAIL_FROM ?? "Harvesters Reporting <noreply@harvesters.org>";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/* ── Low-level send ─────────────────────────────────────────────────────────── */

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  if (!process.env.RESEND_API_KEY || !resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping email send:", subject);
    return null;
  }

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    text,
  });

  if (error) {
    console.error("[email] Failed to send:", error);
    throw new Error(error.message);
  }

  return data;
}

/* ── Domain-specific email helpers ──────────────────────────────────────────── */

async function renderOrFallback(
  templateId: string,
  vars: Record<string, string | number | undefined>,
  legacyFallback: () => { subject: string; html: string },
): Promise<{ subject: string; html: string }> {
  try {
    const rendered = await renderTemplate(templateId, vars);
    if (rendered) {
      return { subject: rendered.subject, html: rendered.html };
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`[email] renderer failed for ${templateId}; falling back`, err);
  }
  return legacyFallback();
}

export async function sendInviteEmail(params: {
  to: string;
  inviterName: string;
  role: string;
  joinUrl: string;
}) {
  const { subject, html } = await renderOrFallback(
    "invite",
    {
      inviterName: params.inviterName,
      role: params.role,
      joinUrl: params.joinUrl,
    },
    () => emailTemplates.invite(params),
  );
  return sendEmail({ to: params.to, subject, html });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
}) {
  const { subject, html } = await renderOrFallback(
    "passwordReset",
    { resetUrl: params.resetUrl },
    () => emailTemplates.passwordReset(params),
  );
  return sendEmail({ to: params.to, subject, html });
}

export async function sendReportStatusEmail(params: {
  to: string;
  reporterName: string;
  reportTitle: string;
  newStatus: string;
  reviewerName?: string;
  comment?: string;
  reportUrl: string;
}) {
  const reviewerSuffix = params.reviewerName ? ` by ${params.reviewerName}` : "";
  const commentBlock = params.comment
    ? `<blockquote style="border-left:3px solid #10b981;margin:16px 0;padding:8px 16px;background:#f3f4f6;border-radius:0 8px 8px 0">${params.comment}</blockquote>`
    : "";
  const { subject, html } = await renderOrFallback(
    "reportStatus",
    {
      reporterName: params.reporterName,
      reportTitle: params.reportTitle,
      newStatus: params.newStatus,
      reviewerSuffix,
      commentBlock,
      reportUrl: params.reportUrl,
    },
    () => emailTemplates.reportStatus(params),
  );
  return sendEmail({ to: params.to, subject, html });
}

export async function sendDeadlineReminderEmail(params: {
  to: string;
  userName: string;
  reportTitle: string;
  deadlineDate: string;
  reportUrl: string;
}) {
  const { subject, html } = await renderOrFallback(
    "deadlineReminder",
    {
      userName: params.userName,
      reportTitle: params.reportTitle,
      deadlineDate: params.deadlineDate,
      reportUrl: params.reportUrl,
    },
    () => emailTemplates.deadlineReminder(params),
  );
  return sendEmail({ to: params.to, subject, html });
}

export async function sendEmailVerificationEmail(params: {
  to: string;
  firstName?: string;
  email: string;
  verifyUrl: string;
}) {
  const { subject, html } = await renderOrFallback(
    "emailVerification",
    {
      firstName: params.firstName ?? "there",
      email: params.email,
      verifyUrl: params.verifyUrl,
    },
    () => emailTemplates.emailVerification(params),
  );
  return sendEmail({ to: params.to, subject, html });
}

export async function sendEmailChangeVerificationEmail(params: {
  to: string;
  firstName?: string;
  currentEmail: string;
  newEmail: string;
  verifyUrl: string;
}) {
  const { subject, html } = await renderOrFallback(
    "emailChangeVerification",
    {
      firstName: params.firstName ?? "there",
      currentEmail: params.currentEmail,
      newEmail: params.newEmail,
      verifyUrl: params.verifyUrl,
    },
    () => emailTemplates.emailChangeVerification(params),
  );
  return sendEmail({ to: params.to, subject, html });
}

export async function sendEmailChangedNoticeEmail(params: {
  to: string;
  firstName?: string;
  oldEmail: string;
  newEmail: string;
}) {
  const { subject, html } = await renderOrFallback(
    "emailChangedNotice",
    {
      firstName: params.firstName ?? "there",
      oldEmail: params.oldEmail,
      newEmail: params.newEmail,
    },
    () => emailTemplates.emailChangedNotice(params),
  );
  return sendEmail({ to: params.to, subject, html });
}
