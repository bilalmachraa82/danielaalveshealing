import type { PreferredChannel, ReminderStatus } from "./types";

type ReminderSessionStatus =
  | "scheduled"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export function getNextReminderDueAt(scheduledAt: string): string | null {
  const scheduledDate = new Date(scheduledAt);
  if (Number.isNaN(scheduledDate.getTime())) return null;
  const dueAt = new Date(scheduledDate.getTime() - 24 * 60 * 60 * 1000);
  return dueAt.toISOString();
}

export function isPreSessionReminderDue(input: {
  now: Date;
  scheduledAt: Date;
  nextReminderDueAt?: Date | null;
}): boolean {
  if (input.nextReminderDueAt) {
    return input.nextReminderDueAt.getTime() <= input.now.getTime();
  }
  const diffMs = input.scheduledAt.getTime() - input.now.getTime();
  const hoursUntilSession = diffMs / (1000 * 60 * 60);
  return hoursUntilSession >= 22 && hoursUntilSession <= 26;
}

export function getReminderRecoveryStatus(input: {
  now: Date;
  scheduledAt: Date;
  sessionStatus: ReminderSessionStatus;
  emailAvailable: boolean;
}): "pending" | "skipped" {
  const active =
    input.sessionStatus === "scheduled" || input.sessionStatus === "confirmed";
  const inFuture = input.scheduledAt.getTime() > input.now.getTime();
  return active && inFuture && input.emailAvailable ? "pending" : "skipped";
}

export function resolveReminderDeliveryChannel(input: {
  preferredChannel: PreferredChannel;
  emailAvailable: boolean;
  smsAvailable: boolean;
  whatsappAvailable: boolean;
}) {
  if (input.preferredChannel === "email" && input.emailAvailable) {
    return "email" as const;
  }

  if (input.preferredChannel === "sms" && input.smsAvailable) {
    return "sms" as const;
  }

  if (input.preferredChannel === "whatsapp" && input.whatsappAvailable) {
    return "whatsapp" as const;
  }

  if (input.emailAvailable) {
    return "email" as const;
  }

  return null;
}

export function shouldSendPreSessionReminder(input: {
  now: Date;
  scheduledAt: Date;
  nextReminderDueAt?: Date | null;
  preferredChannel: PreferredChannel;
  emailAvailable: boolean;
  smsAvailable: boolean;
  whatsappAvailable: boolean;
  reminderStatus: ReminderStatus;
}): boolean {
  const resolvedChannel = resolveReminderDeliveryChannel(input);

  return (
    resolvedChannel === "email" &&
    input.reminderStatus !== "sent" &&
    input.reminderStatus !== "processing" &&
    isPreSessionReminderDue({
      now: input.now,
      scheduledAt: input.scheduledAt,
      nextReminderDueAt: input.nextReminderDueAt ?? null,
    })
  );
}
