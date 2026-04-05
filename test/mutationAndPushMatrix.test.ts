import assert from "node:assert";
import { describe, it } from "node:test";
import { apiMutation } from "../lib/utils/apiMutation";
import { dispatchNotificationChannels } from "../lib/utils/notificationOrchestrator";
import { NotificationType } from "../types/global.js";

describe("mutation write completion behavior", () => {
  it("returns completed success state for profile/org write payloads", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ success: true, data: { updated: true } }), {
        status: 200,
        headers: { "x-request-id": "req-mutation-ok" },
      })) as typeof fetch;

    const profileRes = await apiMutation<{ updated: boolean }, { firstName: string }>(
      "/api/users/profile",
      { method: "PUT", body: { firstName: "Updated" } },
    );
    const orgRes = await apiMutation<{ updated: boolean }, { name: string }>(
      "/api/org/campuses/campus-1",
      { method: "PUT", body: { name: "Campus A" } },
    );

    assert.strictEqual(profileRes.ok, true);
    assert.strictEqual(orgRes.ok, true);
    assert.strictEqual(profileRes.data?.updated, true);
    assert.strictEqual(orgRes.data?.updated, true);

    globalThis.fetch = originalFetch;
  });
});

describe("push sync matrix", () => {
  it("granted + existing subscription => queued", async () => {
    const result = await dispatchNotificationChannels(
      {
        userId: "push-user-1",
        type: NotificationType.REPORT_SUBMITTED,
        title: "Title",
        message: "Message",
      },
      {
        preferences: { email: false, inApp: false, deadlineReminders: true, push: true },
        pushSubscriptions: [{ endpoint: "https://example.com/push/1", createdAt: new Date().toISOString() }],
      },
    );

    assert.strictEqual(result.push, "queued");
  });

  it("granted + no subscription => skipped", async () => {
    const result = await dispatchNotificationChannels(
      {
        userId: "push-user-2",
        type: NotificationType.REPORT_SUBMITTED,
        title: "Title",
        message: "Message",
      },
      {
        preferences: { email: false, inApp: false, deadlineReminders: true, push: true },
        pushSubscriptions: [],
      },
    );

    assert.strictEqual(result.push, "skipped");
  });

  it("missing VAPID key path keeps push dispatch skipped in orchestrator", async () => {
    const originalVapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    const result = await dispatchNotificationChannels(
      {
        userId: "push-user-3",
        type: NotificationType.REPORT_SUBMITTED,
        title: "Title",
        message: "Message",
      },
      {
        preferences: { email: false, inApp: false, deadlineReminders: true, push: false },
      },
    );

    assert.strictEqual(result.push, "skipped");
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = originalVapid;
  });
});
