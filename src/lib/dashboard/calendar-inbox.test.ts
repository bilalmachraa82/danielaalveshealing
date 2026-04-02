import { describe, expect, it } from "vitest";
import { buildQuickBookingInitialData } from "./calendar-inbox";

describe("buildQuickBookingInitialData", () => {
  it("extracts client name, email, start time and duration from an inbox item", () => {
    const result = buildQuickBookingInitialData({
      summary: "Healing Touch — Ana Silva",
      attendee_email: "ana@example.com",
      start_at: "2026-04-10T14:30:00+01:00",
      end_at: "2026-04-10T16:30:00+01:00",
    });

    expect(result).toEqual({
      clientName: "Ana Silva",
      clientEmail: "ana@example.com",
      scheduledAt: expect.stringMatching(/2026-04-10T\d{2}:30/),
      durationMinutes: 120,
    });
  });

  it("uses the full summary as client name when there is no em-dash", () => {
    const result = buildQuickBookingInitialData({
      summary: "Reunião",
      attendee_email: null,
      start_at: "2026-04-10T14:00:00Z",
      end_at: "2026-04-10T15:00:00Z",
    });

    expect(result.clientName).toBe("Reunião");
    expect(result.clientEmail).toBe("");
  });
});
