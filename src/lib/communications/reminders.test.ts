import { describe, expect, it } from "vitest";

import {
  getReminderRecoveryStatus,
  isPreSessionReminderDue,
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

  it("does not send while a reminder is already processing", () => {
    const result = shouldSendPreSessionReminder({
      now: new Date("2026-04-01T10:00:00Z"),
      scheduledAt: new Date("2026-04-02T10:00:00Z"),
      preferredChannel: "email",
      emailAvailable: true,
      smsAvailable: false,
      whatsappAvailable: false,
      reminderStatus: "processing",
    });

    expect(result).toBe(false);
  });
});

describe("isPreSessionReminderDue", () => {
  it("uses next_reminder_due_at when deciding whether the reminder is due", () => {
    expect(
      isPreSessionReminderDue({
        now: new Date("2026-04-01T10:00:00Z"),
        scheduledAt: new Date("2026-04-02T10:00:00Z"),
        nextReminderDueAt: new Date("2026-04-01T09:30:00Z"),
      })
    ).toBe(true);
  });

  it("falls back to the 22-26h window when next_reminder_due_at is not set", () => {
    expect(
      isPreSessionReminderDue({
        now: new Date("2026-04-01T10:00:00Z"),
        scheduledAt: new Date("2026-04-02T10:00:00Z"),
        nextReminderDueAt: null,
      })
    ).toBe(true);
  });
});

describe("getReminderRecoveryStatus", () => {
  it("releases failed reminder attempts back to pending while the session is still active", () => {
    expect(
      getReminderRecoveryStatus({
        now: new Date("2026-04-01T10:00:00Z"),
        scheduledAt: new Date("2026-04-02T10:00:00Z"),
        sessionStatus: "scheduled",
        emailAvailable: true,
      })
    ).toBe("pending");
  });

  it("marks the reminder as skipped once the session can no longer receive reminders", () => {
    expect(
      getReminderRecoveryStatus({
        now: new Date("2026-04-02T12:30:00Z"),
        scheduledAt: new Date("2026-04-02T10:00:00Z"),
        sessionStatus: "completed",
        emailAvailable: true,
      })
    ).toBe("skipped");
  });
});
