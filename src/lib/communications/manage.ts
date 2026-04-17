import type { SessionStatus } from "../types/database.types.js";

export function canClientManageSession(input: {
  now: Date;
  scheduledAt: Date;
}) {
  const hoursUntilSession =
    (input.scheduledAt.getTime() - input.now.getTime()) / (1000 * 60 * 60);

  return {
    canConfirm: hoursUntilSession > 0,
    canReschedule: hoursUntilSession >= 24,
    canCancel: hoursUntilSession >= 24,
  };
}

export function buildSessionManageState(input: {
  now: Date;
  scheduledAt: Date;
  status: SessionStatus;
}) {
  const base = canClientManageSession(input);
  const isActive = input.status === "scheduled" || input.status === "confirmed";
  const isPast = input.scheduledAt.getTime() <= input.now.getTime();
  const blockingReason =
    !isActive
      ? "status_closed"
      : isPast
        ? "session_started"
        : !base.canCancel || !base.canReschedule
          ? "notice_period"
          : null;

  return {
    ...base,
    canConfirm: isActive && base.canConfirm,
    canReschedule: isActive && base.canReschedule,
    canCancel: isActive && base.canCancel,
    isClosed: !isActive || isPast,
    blockingReason,
  };
}

export function createManageTokenExpiry(
  scheduledAt?: Date,
  now = new Date(),
  minimumDays = 14
) {
  const minimumExpiry = new Date(
    now.getTime() + minimumDays * 24 * 60 * 60 * 1000
  );

  if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) {
    return minimumExpiry.toISOString();
  }

  const sessionWindowExpiry = new Date(
    scheduledAt.getTime() + 2 * 24 * 60 * 60 * 1000
  );

  return new Date(
    Math.max(minimumExpiry.getTime(), sessionWindowExpiry.getTime())
  ).toISOString();
}
