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

export async function sendInviteEmail(params: {
  to: string;
  inviterName: string;
  role: string;
  joinUrl: string;
}) {
  const template = emailTemplates.invite(params);
  return sendEmail({
    to: params.to,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
}) {
  const template = emailTemplates.passwordReset(params);
  return sendEmail({
    to: params.to,
    subject: template.subject,
    html: template.html,
  });
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
  const template = emailTemplates.reportStatus(params);
  return sendEmail({
    to: params.to,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendDeadlineReminderEmail(params: {
  to: string;
  userName: string;
  reportTitle: string;
  deadlineDate: string;
  reportUrl: string;
}) {
  const template = emailTemplates.deadlineReminder(params);
  return sendEmail({
    to: params.to,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendEmailVerificationEmail(params: {
  to: string;
  firstName?: string;
  email: string;
  verifyUrl: string;
}) {
  const template = emailTemplates.emailVerification(params);
  return sendEmail({
    to: params.to,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendEmailChangeVerificationEmail(params: {
  to: string;
  firstName?: string;
  currentEmail: string;
  newEmail: string;
  verifyUrl: string;
}) {
  const template = emailTemplates.emailChangeVerification(params);
  return sendEmail({
    to: params.to,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendEmailChangedNoticeEmail(params: {
  to: string;
  firstName?: string;
  oldEmail: string;
  newEmail: string;
}) {
  const template = emailTemplates.emailChangedNotice(params);
  return sendEmail({
    to: params.to,
    subject: template.subject,
    html: template.html,
  });
}
