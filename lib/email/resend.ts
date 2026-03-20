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
    return sendEmail({
        to: params.to,
        subject: "You've been invited to Harvesters Reporting System",
        html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
        <div style="background:#10b981;color:#fff;padding:16px 24px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;font-size:20px">Harvesters Reporting System</h1>
        </div>
        <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p>Hi,</p>
          <p><strong>${escapeHtml(params.inviterName)}</strong> has invited you to join the Harvesters Reporting System as <strong>${escapeHtml(params.role)}</strong>.</p>
          <a href="${escapeHtml(params.joinUrl)}" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;margin:16px 0">
            Accept Invitation
          </a>
          <p style="font-size:13px;color:#6b7280">If the button doesn't work, copy and paste this link: ${escapeHtml(params.joinUrl)}</p>
        </div>
      </div>
    `,
    });
}

export async function sendPasswordResetEmail(params: {
    to: string;
    resetUrl: string;
}) {
    return sendEmail({
        to: params.to,
        subject: "Reset Your Password — Harvesters Reporting",
        html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
        <div style="background:#10b981;color:#fff;padding:16px 24px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;font-size:20px">Password Reset</h1>
        </div>
        <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p>You requested a password reset for your Harvesters Reporting account.</p>
          <a href="${escapeHtml(params.resetUrl)}" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;margin:16px 0">
            Reset Password
          </a>
          <p style="font-size:13px;color:#6b7280">This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
        </div>
      </div>
    `,
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
    return sendEmail({
        to: params.to,
        subject: `Report ${params.newStatus}: ${params.reportTitle}`,
        html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
        <div style="background:#10b981;color:#fff;padding:16px 24px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;font-size:20px">Report Update</h1>
        </div>
        <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p>Hi ${escapeHtml(params.reporterName)},</p>
          <p>Your report <strong>${escapeHtml(params.reportTitle)}</strong> has been marked as <strong>${escapeHtml(params.newStatus)}</strong>${params.reviewerName ? ` by ${escapeHtml(params.reviewerName)}` : ""}.</p>
          ${params.comment ? `<blockquote style="border-left:3px solid #10b981;margin:16px 0;padding:8px 16px;background:#f3f4f6;border-radius:0 8px 8px 0">${escapeHtml(params.comment)}</blockquote>` : ""}
          <a href="${escapeHtml(params.reportUrl)}" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;margin:16px 0">
            View Report
          </a>
        </div>
      </div>
    `,
    });
}

export async function sendDeadlineReminderEmail(params: {
    to: string;
    userName: string;
    reportTitle: string;
    deadlineDate: string;
    reportUrl: string;
}) {
    return sendEmail({
        to: params.to,
        subject: `Deadline Approaching: ${params.reportTitle}`,
        html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
        <div style="background:#f59e0b;color:#fff;padding:16px 24px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;font-size:20px">Deadline Reminder</h1>
        </div>
        <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p>Hi ${escapeHtml(params.userName)},</p>
          <p>The report <strong>${escapeHtml(params.reportTitle)}</strong> is due on <strong>${escapeHtml(params.deadlineDate)}</strong>.</p>
          <a href="${escapeHtml(params.reportUrl)}" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;margin:16px 0">
            Submit Report
          </a>
        </div>
      </div>
    `,
    });
}

/* ── Utility ────────────────────────────────────────────────────────────────── */

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
