import { describe, expect, it } from "vitest";

import {
  buildClientTimeline,
  getEmailTimelineTitle,
  getSessionActionTimelineTitle,
} from "./timeline";

describe("buildClientTimeline", () => {
  it("sorts mixed events by most recent first", () => {
    const timeline = buildClientTimeline([
      {
        id: "communication-1",
        type: "communication",
        title: "Reminder",
        description: null,
        occurred_at: "2026-04-01T10:00:00Z",
      },
      {
        id: "session-1",
        type: "session",
        title: "Sessão confirmada",
        description: null,
        occurred_at: "2026-04-03T10:00:00Z",
      },
    ]);

    expect(timeline.map((event) => event.id)).toEqual([
      "session-1",
      "communication-1",
    ]);
  });
});

describe("getSessionActionTimelineTitle", () => {
  it("maps reminder reset events to a user-facing title", () => {
    expect(getSessionActionTimelineTitle("reminder_reset")).toBe(
      "Reminder pré-sessão reajustado"
    );
  });
});

describe("getEmailTimelineTitle", () => {
  it("maps pre-session reminder emails to the premium wording", () => {
    expect(getEmailTimelineTitle("pre_session_reminder")).toBe(
      "Reminder pré-sessão enviado"
    );
  });
});
