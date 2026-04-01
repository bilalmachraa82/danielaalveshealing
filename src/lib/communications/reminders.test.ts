import { describe, expect, it } from "vitest";

import {
  resolveReminderDeliveryChannel,
  shouldSendPreSessionReminder,
} from "./reminders";

describe("resolveReminderDeliveryChannel", () => {
  it("falls back to email when the preferred fast channel is not wired yet", () => {
    const channel = resolveReminderDeliveryChannel({
      preferredChannel: "whatsapp",
      emailAvailable: true,
      smsAvailable: false,
      whatsappAvailable: false,
    });

    expect(channel).toBe("email");
  });
});

describe("shouldSendPreSessionReminder", () => {
  it("sends a 24h email reminder when the session is upcoming and email can be used", () => {
    const result = shouldSendPreSessionReminder({
      now: new Date("2026-04-01T10:00:00Z"),
      scheduledAt: new Date("2026-04-02T10:00:00Z"),
      preferredChannel: "email",
      emailAvailable: true,
      smsAvailable: false,
      whatsappAvailable: false,
      reminderStatus: "pending",
    });

    expect(result).toBe(true);
  });

  it("does not send again after the reminder was already marked as sent", () => {
    const result = shouldSendPreSessionReminder({
      now: new Date("2026-04-01T10:00:00Z"),
      scheduledAt: new Date("2026-04-02T10:00:00Z"),
      preferredChannel: "email",
      emailAvailable: true,
      smsAvailable: false,
      whatsappAvailable: false,
      reminderStatus: "sent",
    });

    expect(result).toBe(false);
  });
});
