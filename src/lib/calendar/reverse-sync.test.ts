import { describe, expect, it } from "vitest";
import {
  parseEventToInboxItem,
  isAppCreatedEvent,
  reconcileEvents,
  deriveSessionSyncAction,
} from "./reverse-sync";

describe("isAppCreatedEvent", () => {
  it("detects app-created events by CRM URL in description", () => {
    expect(
      isAppCreatedEvent({
        description:
          "Ver no CRM: https://danielaalveshealing.com/admin/sessoes/abc-123",
      })
    ).toBe(true);
  });

  it("returns false for manually created events", () => {
    expect(isAppCreatedEvent({ description: "Client massage" })).toBe(false);
  });

  it("returns false when description is null", () => {
    expect(isAppCreatedEvent({ description: null })).toBe(false);
  });
});

describe("parseEventToInboxItem", () => {
  it("extracts fields from a Google Calendar event", () => {
    const event = {
      id: "gcal_123",
      summary: "Healing Touch — Maria",
      description: "Client notes",
      start: { dateTime: "2026-04-05T10:00:00+01:00" },
      end: { dateTime: "2026-04-05T12:00:00+01:00" },
      attendees: [{ email: "maria@example.com" }],
    };
    const item = parseEventToInboxItem(event);
    expect(item.google_event_id).toBe("gcal_123");
    expect(item.summary).toBe("Healing Touch — Maria");
    expect(item.attendee_email).toBe("maria@example.com");
    expect(item.start_at).toBe("2026-04-05T10:00:00+01:00");
    expect(item.end_at).toBe("2026-04-05T12:00:00+01:00");
    expect(item.description).toBe("Client notes");
  });

  it("handles events without attendees", () => {
    const event = {
      id: "gcal_456",
      summary: "Break",
      description: null,
      start: { dateTime: "2026-04-05T12:00:00Z" },
      end: { dateTime: "2026-04-05T13:00:00Z" },
    };
    const item = parseEventToInboxItem(event);
    expect(item.attendee_email).toBeNull();
    expect(item.description).toBeNull();
  });

  it("handles all-day events with date instead of dateTime", () => {
    const event = {
      id: "gcal_789",
      summary: "All Day Event",
      description: null,
      start: { date: "2026-04-05" },
      end: { date: "2026-04-06" },
    };
    const item = parseEventToInboxItem(event);
    expect(item.start_at).toBe("2026-04-05");
    expect(item.end_at).toBe("2026-04-06");
  });
});

describe("reconcileEvents", () => {
  it("auto-matches events whose google_event_id exists in sessions", () => {
    const events = [
      {
        id: "gcal_known",
        summary: "Test",
        description: null,
        start: { dateTime: "2026-04-05T10:00:00Z" },
        end: { dateTime: "2026-04-05T12:00:00Z" },
      },
    ];
    const knownEventIds = new Set(["gcal_known"]);
    const existingInboxIds = new Set<string>();
    const result = reconcileEvents(events, knownEventIds, existingInboxIds);
    expect(result.matched).toHaveLength(1);
    expect(result.matched[0].google_event_id).toBe("gcal_known");
    expect(result.pending).toHaveLength(0);
  });

  it("marks unmatched events as pending", () => {
    const events = [
      {
        id: "gcal_new",
        summary: "Unknown Session",
        description: null,
        start: { dateTime: "2026-04-05T10:00:00Z" },
        end: { dateTime: "2026-04-05T12:00:00Z" },
      },
    ];
    const result = reconcileEvents(events, new Set(), new Set());
    expect(result.pending).toHaveLength(1);
    expect(result.pending[0].google_event_id).toBe("gcal_new");
  });

  it("skips events already in inbox", () => {
    const events = [
      {
        id: "gcal_existing",
        summary: "Old",
        description: null,
        start: { dateTime: "2026-04-05T10:00:00Z" },
        end: { dateTime: "2026-04-05T12:00:00Z" },
      },
    ];
    const result = reconcileEvents(
      events,
      new Set(),
      new Set(["gcal_existing"])
    );
    expect(result.matched).toHaveLength(0);
    expect(result.pending).toHaveLength(0);
    expect(result.skipped).toHaveLength(1);
  });

  it("also auto-matches app-created events by description pattern", () => {
    const events = [
      {
        id: "gcal_app",
        summary: "Healing Touch — Ana",
        description: "Ver no CRM: https://danielaalveshealing.com/admin/sessoes/uuid-here",
        start: { dateTime: "2026-04-05T10:00:00Z" },
        end: { dateTime: "2026-04-05T12:00:00Z" },
      },
    ];
    const result = reconcileEvents(events, new Set(), new Set());
    expect(result.matched).toHaveLength(1);
    expect(result.pending).toHaveLength(0);
  });
});

describe("deriveSessionSyncAction", () => {
  it("reschedules scheduled sessions when the Google start date changes", () => {
    const action = deriveSessionSyncAction(
      {
        id: "gcal_1",
        status: "confirmed",
        start: { dateTime: "2026-04-11T15:00:00+01:00" },
        end: { dateTime: "2026-04-11T17:00:00+01:00" },
      },
      {
        id: "session-1",
        google_calendar_event_id: "gcal_1",
        scheduled_at: "2026-04-11T14:00:00+01:00",
        status: "scheduled",
      }
    );

    expect(action).toEqual({
      type: "reschedule",
      scheduledAt: "2026-04-11T15:00:00+01:00",
    });
  });

  it("cancels confirmed sessions when Google marks the event as cancelled", () => {
    const action = deriveSessionSyncAction(
      { id: "gcal_2", status: "cancelled" },
      {
        id: "session-2",
        google_calendar_event_id: "gcal_2",
        scheduled_at: "2026-04-11T14:00:00+01:00",
        status: "confirmed",
      }
    );

    expect(action).toEqual({ type: "cancel" });
  });

  it("does not auto-cancel completed sessions", () => {
    expect(
      deriveSessionSyncAction(
        { id: "gcal_3", status: "cancelled" },
        {
          id: "session-3",
          google_calendar_event_id: "gcal_3",
          scheduled_at: "2026-04-11T14:00:00+01:00",
          status: "completed",
        }
      )
    ).toBeNull();
  });

  it("does not auto-cancel in-progress sessions", () => {
    expect(
      deriveSessionSyncAction(
        { id: "gcal_4", status: "cancelled" },
        {
          id: "session-4",
          google_calendar_event_id: "gcal_4",
          scheduled_at: "2026-04-11T14:00:00+01:00",
          status: "in_progress",
        }
      )
    ).toBeNull();
  });

  it("returns null when the event datetime matches the session exactly", () => {
    expect(
      deriveSessionSyncAction(
        {
          id: "gcal_5",
          status: "confirmed",
          start: { dateTime: "2026-04-11T14:00:00+01:00" },
        },
        {
          id: "session-5",
          google_calendar_event_id: "gcal_5",
          scheduled_at: "2026-04-11T14:00:00+01:00",
          status: "scheduled",
        }
      )
    ).toBeNull();
  });

  it("handles all-day events using the date field", () => {
    const action = deriveSessionSyncAction(
      {
        id: "gcal_6",
        status: "confirmed",
        start: { date: "2026-04-12" },
      },
      {
        id: "session-6",
        google_calendar_event_id: "gcal_6",
        scheduled_at: "2026-04-11T14:00:00+01:00",
        status: "confirmed",
      }
    );
    expect(action?.type).toBe("reschedule");
    expect((action as { scheduledAt: string } | null)?.scheduledAt).toBe("2026-04-12");
  });
});
