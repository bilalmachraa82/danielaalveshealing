import type { PreferredChannel, ReminderStatus } from "./types";

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
  preferredChannel: PreferredChannel;
  emailAvailable: boolean;
  smsAvailable: boolean;
  whatsappAvailable: boolean;
  reminderStatus: ReminderStatus;
}) {
  const resolvedChannel = resolveReminderDeliveryChannel(input);
  const diffMs = input.scheduledAt.getTime() - input.now.getTime();
  const hoursUntilSession = diffMs / (1000 * 60 * 60);

  return (
    resolvedChannel === "email" &&
    input.reminderStatus !== "sent" &&
    hoursUntilSession >= 22 &&
    hoursUntilSession <= 26
  );
}
