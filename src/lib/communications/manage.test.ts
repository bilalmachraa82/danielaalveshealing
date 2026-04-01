import { describe, expect, it } from "vitest";

import { canClientManageSession } from "./manage";

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
