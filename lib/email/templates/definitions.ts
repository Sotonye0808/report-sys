/**
 * lib/email/templates/definitions.ts
 *
 * Declarative shape for every email template the system can send. Each entry
 * exposes:
 *   - id            unique identifier (stable across versions; admins must NOT rename)
 *   - label         admin-facing label
 *   - description   short admin-facing description
 *   - defaultSubject subject string with `{{var}}` placeholders
 *   - defaultHtml   body HTML with `{{var}}` placeholders (the email layout
 *                   wrapper is applied by the renderer)
 *   - variables     allowlist of variable names valid in this template
 *   - sampleVars    sample values used for previews
 *
 * Admin overrides live in the `emailTemplates` admin-config namespace as
 * `{ [id]: { subject, html } }`. The renderer merges override → fallback;
 * the variable allowlist is fixed by the registry and not extensible at
 * runtime (defence in depth).
 */

export interface EmailTemplateDefinition {
    id: string;
    label: string;
    description: string;
    defaultSubject: string;
    /** Body HTML — wrapped in the shared layout when rendered. */
    defaultHtml: string;
    variables: string[];
    sampleVars: Record<string, string>;
}

const CTA = (label: string, href: string) =>
    `<a href="${href}" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;margin:16px 0">${label}</a>`;

export const EMAIL_TEMPLATE_DEFINITIONS: Record<string, EmailTemplateDefinition> = {
    invite: {
        id: "invite",
        label: "Invite link",
        description: "Sent when an admin generates an invite link for a recipient email.",
        defaultSubject: "You've been invited to Harvesters Reporting System",
        defaultHtml: `
            <p><strong>{{inviterName}}</strong> has invited you to join as <strong>{{role}}</strong>.</p>
            ${CTA("Accept Invitation", "{{joinUrl}}")}
            <p style="font-size:13px;color:#6b7280">If the button doesn't work, use this link: {{joinUrl}}</p>
        `,
        variables: ["inviterName", "role", "joinUrl"],
        sampleVars: {
            inviterName: "Pastor Sample",
            role: "Campus Admin",
            joinUrl: "https://example.com/join?token=sample",
        },
    },
    passwordReset: {
        id: "passwordReset",
        label: "Password reset",
        description: "Sent when a user requests a password reset link.",
        defaultSubject: "Reset Your Password — Harvesters Reporting",
        defaultHtml: `
            <p>You requested a password reset for your Harvesters Reporting account.</p>
            ${CTA("Reset Password", "{{resetUrl}}")}
        `,
        variables: ["resetUrl"],
        sampleVars: {
            resetUrl: "https://example.com/reset-password?token=sample",
        },
    },
    reportStatus: {
        id: "reportStatus",
        label: "Report status update",
        description: "Sent when a report is approved, reviewed, locked, or requires edits.",
        defaultSubject: "Report {{newStatus}}: {{reportTitle}}",
        defaultHtml: `
            <p>Hi {{reporterName}},</p>
            <p>Your report <strong>{{reportTitle}}</strong> is now <strong>{{newStatus}}</strong>{{reviewerSuffix}}.</p>
            {{commentBlock}}
            ${CTA("View Report", "{{reportUrl}}")}
        `,
        variables: [
            "reporterName",
            "reportTitle",
            "newStatus",
            "reviewerSuffix",
            "commentBlock",
            "reportUrl",
        ],
        sampleVars: {
            reporterName: "Sample User",
            reportTitle: "April Weekly Report",
            newStatus: "APPROVED",
            reviewerSuffix: " by Reviewer Name",
            commentBlock: "",
            reportUrl: "https://example.com/reports/sample",
        },
    },
    deadlineReminder: {
        id: "deadlineReminder",
        label: "Deadline reminder",
        description: "Sent ahead of a report's deadline.",
        defaultSubject: "Deadline Approaching: {{reportTitle}}",
        defaultHtml: `
            <p>Hi {{userName}},</p>
            <p>The report <strong>{{reportTitle}}</strong> is due on <strong>{{deadlineDate}}</strong>.</p>
            ${CTA("Submit Report", "{{reportUrl}}")}
        `,
        variables: ["userName", "reportTitle", "deadlineDate", "reportUrl"],
        sampleVars: {
            userName: "Sample User",
            reportTitle: "April Weekly Report",
            deadlineDate: "April 30, 2026",
            reportUrl: "https://example.com/reports/sample",
        },
    },
    emailVerification: {
        id: "emailVerification",
        label: "Email verification",
        description: "Sent when a user must verify their primary email address.",
        defaultSubject: "Verify your email — Harvesters Reporting",
        defaultHtml: `
            <p>Hi {{firstName}},</p>
            <p>Please verify <strong>{{email}}</strong> to secure your account.</p>
            ${CTA("Verify Email", "{{verifyUrl}}")}
            <p style="font-size:13px;color:#6b7280">If the button doesn't work, use this link: {{verifyUrl}}</p>
        `,
        variables: ["firstName", "email", "verifyUrl"],
        sampleVars: {
            firstName: "Sample",
            email: "user@example.com",
            verifyUrl: "https://example.com/verify-email?token=sample",
        },
    },
    emailChangeVerification: {
        id: "emailChangeVerification",
        label: "Email change confirmation",
        description: "Sent to the new email address to confirm an email change request.",
        defaultSubject: "Confirm your new email — Harvesters Reporting",
        defaultHtml: `
            <p>Hi {{firstName}},</p>
            <p>We received a request to change your account email from <strong>{{currentEmail}}</strong> to <strong>{{newEmail}}</strong>.</p>
            ${CTA("Confirm New Email", "{{verifyUrl}}")}
            <p style="font-size:13px;color:#6b7280">If this wasn't you, ignore this email and keep your current address.</p>
        `,
        variables: ["firstName", "currentEmail", "newEmail", "verifyUrl"],
        sampleVars: {
            firstName: "Sample",
            currentEmail: "old@example.com",
            newEmail: "new@example.com",
            verifyUrl: "https://example.com/verify-email?token=sample",
        },
    },
    emailChangeRequestedNotice: {
        id: "emailChangeRequestedNotice",
        label: "Email change requested (notice)",
        description: "Notice to the existing email when a change is requested.",
        defaultSubject: "Email change requested — Harvesters Reporting",
        defaultHtml: `
            <p>Hi {{firstName}},</p>
            <p>A request was made to change your account email from <strong>{{currentEmail}}</strong> to <strong>{{newEmail}}</strong>.</p>
            <p>If this was not you, update your password immediately.</p>
        `,
        variables: ["firstName", "currentEmail", "newEmail"],
        sampleVars: {
            firstName: "Sample",
            currentEmail: "old@example.com",
            newEmail: "new@example.com",
        },
    },
    emailChangedNotice: {
        id: "emailChangedNotice",
        label: "Email changed (notice)",
        description: "Notice sent after an email change is finalised.",
        defaultSubject: "Your email has been changed — Harvesters Reporting",
        defaultHtml: `
            <p>Hi {{firstName}},</p>
            <p>Your account email has been changed from <strong>{{oldEmail}}</strong> to <strong>{{newEmail}}</strong>.</p>
            <p>If this was not you, contact an administrator immediately.</p>
        `,
        variables: ["firstName", "oldEmail", "newEmail"],
        sampleVars: {
            firstName: "Sample",
            oldEmail: "old@example.com",
            newEmail: "new@example.com",
        },
    },
    activation: {
        id: "activation",
        label: "Account activation",
        description: "Sent when a pre-registered user receives an activation link.",
        defaultSubject: "Activate your Harvesters Reporting account",
        defaultHtml: `
            <p>Your account has been pre-created. Click below to set your password and sign in.</p>
            ${CTA("Activate account", "{{activationUrl}}")}
            <p style="font-size:12px;color:#666">This link expires in {{expiresInHours}} hours.</p>
        `,
        variables: ["activationUrl", "expiresInHours"],
        sampleVars: {
            activationUrl: "https://example.com/activate?token=sample",
            expiresInHours: "72",
        },
    },
};

export type EmailTemplateId = keyof typeof EMAIL_TEMPLATE_DEFINITIONS;
