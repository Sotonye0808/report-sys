import assert from "node:assert";
import { describe, it } from "node:test";
import { dispatchNotificationChannels } from "../lib/utils/notificationOrchestrator";
import { NotificationType } from "../types/global.js";

describe("notification orchestrator", () => {
  it("skips email gracefully when RESEND_API_KEY is missing", async () => {
    const originalResend = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;

    let inAppCreated = 0;
    const result = await dispatchNotificationChannels(
      {
        userId: "user-1",
        type: NotificationType.REPORT_SUBMITTED,
        title: "Report submitted",
        message: "Your report has been submitted",
        emailTo: "test@example.com",
        emailSubject: "Subject",
        emailHtml: "<p>Hello</p>",
      },
      {
        preferences: { email: true, inApp: true, deadlineReminders: true, push: false },
        createInAppNotification: async () => {
          inAppCreated += 1;
        },
      },
    );

    assert.strictEqual(inAppCreated, 1);
    assert.strictEqual(result.inApp, "sent");
    assert.strictEqual(result.email, "skipped");
    assert.strictEqual(result.push, "skipped");

    process.env.RESEND_API_KEY = originalResend;
  });

  it("marks push as queued when push preference enabled and subscriptions exist", async () => {
    const result = await dispatchNotificationChannels(
      {
        userId: "user-1",
        type: NotificationType.REPORT_SUBMITTED,
        title: "Report submitted",
        message: "Your report has been submitted",
      },
      {
        preferences: { email: false, inApp: false, deadlineReminders: true, push: true },
        pushSubscriptions: [{ endpoint: "https://example.com/push/1", createdAt: new Date().toISOString() }],
      },
    );

    assert.strictEqual(result.inApp, "skipped");
    assert.strictEqual(result.email, "skipped");
    assert.strictEqual(result.push, "queued");
  });
});

