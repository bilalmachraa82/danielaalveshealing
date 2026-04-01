import type { SessionStatus } from "@/lib/types/database.types";

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

  return {
    ...base,
    canConfirm: isActive && base.canConfirm,
    canReschedule: isActive && base.canReschedule,
    canCancel: isActive && base.canCancel,
    isClosed: !isActive || input.scheduledAt.getTime() <= input.now.getTime(),
  };
}

export function createManageTokenExpiry(days = 14) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}
