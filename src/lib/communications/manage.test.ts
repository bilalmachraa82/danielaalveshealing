import { describe, expect, it } from "vitest";

import {
  buildSessionManageState,
  canClientManageSession,
  createManageTokenExpiry,
} from "./manage";

describe("canClientManageSession", () => {
  it("allows reschedule more than 24h before the session", () => {
    expect(
      canClientManageSession({
        now: new Date("2026-04-01T10:00:00Z"),
        scheduledAt: new Date("2026-04-03T10:00:00Z"),
      }).canReschedule
    ).toBe(true);
  });
});

describe("buildSessionManageState", () => {
  it("marks late cancellations as blocked by the notice period", () => {
    const state = buildSessionManageState({
      now: new Date("2026-04-02T10:00:00Z"),
      scheduledAt: new Date("2026-04-03T07:00:00Z"),
      status: "scheduled",
    });

    expect(state.canCancel).toBe(false);
    expect(state.blockingReason).toBe("notice_period");
  });
});

describe("createManageTokenExpiry", () => {
  it("keeps the manage token valid for sessions scheduled far in the future", () => {
    const now = new Date("2026-04-01T10:00:00Z");
    const scheduledAt = new Date("2026-06-15T09:00:00Z");

    const expiresAt = createManageTokenExpiry(scheduledAt, now);

    expect(expiresAt).toBe("2026-06-17T09:00:00.000Z");
  });
});
