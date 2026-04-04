import { renderEmailLayout } from "@/lib/email/templates/layout";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export interface InviteEmailTemplateInput {
  inviterName: string;
  role: string;
  joinUrl: string;
}

export interface PasswordResetEmailTemplateInput {
  resetUrl: string;
}

export interface ReportStatusEmailTemplateInput {
  reporterName: string;
  reportTitle: string;
  newStatus: string;
  reviewerName?: string;
  comment?: string;
  reportUrl: string;
}

export interface DeadlineReminderTemplateInput {
  userName: string;
  reportTitle: string;
  deadlineDate: string;
  reportUrl: string;
}

export const emailTemplates = {
  invite(input: InviteEmailTemplateInput) {
    return {
      subject: "You've been invited to Harvesters Reporting System",
      html: renderEmailLayout({
        heading: "You're invited",
        bodyHtml: `
          <p><strong>${escapeHtml(input.inviterName)}</strong> has invited you to join as <strong>${escapeHtml(input.role)}</strong>.</p>
          <a href="${escapeHtml(input.joinUrl)}" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;margin:16px 0">Accept Invitation</a>
          <p style="font-size:13px;color:#6b7280">If the button doesn't work, use this link: ${escapeHtml(input.joinUrl)}</p>
        `,
      }),
    };
  },
  passwordReset(input: PasswordResetEmailTemplateInput) {
    return {
      subject: "Reset Your Password — Harvesters Reporting",
      html: renderEmailLayout({
        heading: "Password Reset",
        bodyHtml: `
          <p>You requested a password reset for your Harvesters Reporting account.</p>
          <a href="${escapeHtml(input.resetUrl)}" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;margin:16px 0">Reset Password</a>
        `,
      }),
    };
  },
  reportStatus(input: ReportStatusEmailTemplateInput) {
    return {
      subject: `Report ${input.newStatus}: ${input.reportTitle}`,
      html: renderEmailLayout({
        heading: "Report Update",
        bodyHtml: `
          <p>Hi ${escapeHtml(input.reporterName)},</p>
          <p>Your report <strong>${escapeHtml(input.reportTitle)}</strong> is now <strong>${escapeHtml(input.newStatus)}</strong>${input.reviewerName ? ` by ${escapeHtml(input.reviewerName)}` : ""}.</p>
          ${input.comment ? `<blockquote style="border-left:3px solid #10b981;margin:16px 0;padding:8px 16px;background:#f3f4f6;border-radius:0 8px 8px 0">${escapeHtml(input.comment)}</blockquote>` : ""}
          <a href="${escapeHtml(input.reportUrl)}" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;margin:16px 0">View Report</a>
        `,
      }),
    };
  },
  deadlineReminder(input: DeadlineReminderTemplateInput) {
    return {
      subject: `Deadline Approaching: ${input.reportTitle}`,
      html: renderEmailLayout({
        heading: "Deadline Reminder",
        accent: "#f59e0b",
        bodyHtml: `
          <p>Hi ${escapeHtml(input.userName)},</p>
          <p>The report <strong>${escapeHtml(input.reportTitle)}</strong> is due on <strong>${escapeHtml(input.deadlineDate)}</strong>.</p>
          <a href="${escapeHtml(input.reportUrl)}" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;margin:16px 0">Submit Report</a>
        `,
      }),
    };
  },
};

