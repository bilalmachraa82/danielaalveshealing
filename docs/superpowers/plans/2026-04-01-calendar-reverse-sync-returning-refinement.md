# Calendar Reverse Sync And Returning Flow Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Google Calendar reverse sync with a safe review inbox and refine the returning-client public flow into simple vs changed-context paths.

**Architecture:** A new reverse-sync layer will poll Google Calendar, automatically reconcile sessions created by the app, and upsert unmatched calendar events into a review inbox surfaced in the admin dashboard. The public prepare flow will keep the existing data model but use a stricter returning-flow variant derived from the client's answers to show a lighter path for simple check-ins and a deeper path when health or focus changes are declared.

**Tech Stack:** React, Vite, TanStack Query, Vercel Node handlers, Neon Postgres, Google Calendar API, Vitest.

---

## File Map

- Modify: `api/_calendar.ts` — add list/read helpers for reverse sync polling
- Modify: `api/cron/index.ts` — add `calendar-reverse-sync` job
- Modify: `api/dashboard/index.ts` — expose pending calendar inbox items
- Modify: `src/hooks/useDashboard.ts` — fetch calendar inbox data and review actions
- Modify: `src/pages/admin/Dashboard.tsx` — show inbox card with actions
- Modify: `api/forms/index.ts` — expose stronger returning metadata if needed by the public flow
- Modify: `src/pages/public/PreparePage.tsx` — dynamic returning simple vs changed-context flow
- Modify: `src/lib/types/database.types.ts` — add calendar inbox types
- Modify: `vercel.json` — add cron path for reverse sync
- Create: `src/lib/calendar/reverse-sync.ts` — matching/reconciliation helpers
- Create: `src/lib/calendar/reverse-sync.test.ts` — helper tests
- Modify: `src/lib/communications/journey.ts` — add returning variant helper
- Modify: `src/lib/communications/journey.test.ts` — TDD coverage for returning variants
- Create: `supabase/migrations/004_calendar_reverse_sync_inbox.sql` — inbox persistence

---

## Task 1: Database — Calendar Inbox Table

**Files:**
- Create: `supabase/migrations/004_calendar_reverse_sync_inbox.sql`
- Modify: `src/lib/types/database.types.ts`

- [ ] **Step 1.1: Write the SQL migration**

```sql
BEGIN;

CREATE TABLE IF NOT EXISTS calendar_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_event_id TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  attendee_email TEXT,
  -- Resolution: matched to existing session, created new, or dismissed
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'matched', 'created', 'dismissed')),
  matched_session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  resolved_by TEXT CHECK (resolved_by IN ('auto', 'admin')),
  resolved_at TIMESTAMPTZ,
  raw_event JSONB NOT NULL DEFAULT '{}'::jsonb,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calendar_inbox_status
  ON calendar_inbox(status) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_calendar_inbox_start
  ON calendar_inbox(start_at DESC);

CREATE INDEX IF NOT EXISTS idx_calendar_inbox_google_event
  ON calendar_inbox(google_event_id);

-- Track last sync cursor for incremental polling
CREATE TABLE IF NOT EXISTS calendar_sync_state (
  id TEXT PRIMARY KEY DEFAULT 'default',
  sync_token TEXT,
  last_full_sync_at TIMESTAMPTZ,
  last_incremental_sync_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO calendar_sync_state (id) VALUES ('default')
  ON CONFLICT (id) DO NOTHING;

COMMIT;
```

- [ ] **Step 1.2: Add TypeScript types for calendar inbox**

Add to `src/lib/types/database.types.ts`:

```typescript
export type CalendarInboxStatus = 'pending' | 'matched' | 'created' | 'dismissed';

export interface CalendarInboxItem {
  id: string;
  google_event_id: string;
  summary: string;
  description: string | null;
  start_at: string;
  end_at: string;
  attendee_email: string | null;
  status: CalendarInboxStatus;
  matched_session_id: string | null;
  resolved_by: 'auto' | 'admin' | null;
  resolved_at: string | null;
  raw_event: Record<string, unknown>;
  synced_at: string;
  created_at: string;
}

export interface CalendarSyncState {
  id: string;
  sync_token: string | null;
  last_full_sync_at: string | null;
  last_incremental_sync_at: string | null;
  updated_at: string;
}
```

---

## Task 2: Calendar API Helpers — List & Reconcile

**Files:**
- Modify: `api/_calendar.ts`
- Create: `src/lib/calendar/reverse-sync.ts`
- Create: `src/lib/calendar/reverse-sync.test.ts`

- [ ] **Step 2.1: Write failing tests for reconciliation logic**

Create `src/lib/calendar/reverse-sync.test.ts` with tests:
- `reconcileEvents` matches a calendar event to an existing session by `google_calendar_event_id`
- `reconcileEvents` marks unmatched events as `pending` inbox items
- `reconcileEvents` ignores events already in the inbox (by `google_event_id`)
- `parseEventToInboxItem` extracts summary, start, end, attendee email from a Google Calendar event
- `isAppCreatedEvent` returns true when event description contains the CRM URL pattern

```typescript
import { describe, expect, it } from "vitest";
import {
  parseEventToInboxItem,
  isAppCreatedEvent,
  reconcileEvents,
} from "./reverse-sync";

describe("isAppCreatedEvent", () => {
  it("detects app-created events by CRM URL in description", () => {
    expect(isAppCreatedEvent({ description: "Ver no CRM: https://danielaalveshealing.com/admin/sessoes/abc-123" }))
      .toBe(true);
  });

  it("returns false for manually created events", () => {
    expect(isAppCreatedEvent({ description: "Client massage" }))
      .toBe(false);
  });

  it("returns false when description is null", () => {
    expect(isAppCreatedEvent({ description: null }))
      .toBe(false);
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
  });
});

describe("reconcileEvents", () => {
  it("auto-matches events whose google_event_id exists in sessions", () => {
    const events = [{ id: "gcal_known", summary: "Test", start: { dateTime: "2026-04-05T10:00:00Z" }, end: { dateTime: "2026-04-05T12:00:00Z" } }];
    const knownEventIds = new Set(["gcal_known"]);
    const existingInboxIds = new Set<string>();
    const result = reconcileEvents(events, knownEventIds, existingInboxIds);
    expect(result.matched).toHaveLength(1);
    expect(result.pending).toHaveLength(0);
  });

  it("marks unmatched events as pending", () => {
    const events = [{ id: "gcal_new", summary: "Unknown", start: { dateTime: "2026-04-05T10:00:00Z" }, end: { dateTime: "2026-04-05T12:00:00Z" } }];
    const result = reconcileEvents(events, new Set(), new Set());
    expect(result.pending).toHaveLength(1);
  });

  it("skips events already in inbox", () => {
    const events = [{ id: "gcal_existing", summary: "Old", start: { dateTime: "2026-04-05T10:00:00Z" }, end: { dateTime: "2026-04-05T12:00:00Z" } }];
    const result = reconcileEvents(events, new Set(), new Set(["gcal_existing"]));
    expect(result.matched).toHaveLength(0);
    expect(result.pending).toHaveLength(0);
  });
});
```

- [ ] **Step 2.2: Implement reconciliation helpers (GREEN)**

Create `src/lib/calendar/reverse-sync.ts`:
- `isAppCreatedEvent(event)` → checks if event.description contains `/admin/sessoes/`
- `parseEventToInboxItem(event)` → maps Google Calendar event to `CalendarInboxItem` draft
- `reconcileEvents(events, knownEventIds, existingInboxIds)` → returns `{ matched, pending, skipped }`

- [ ] **Step 2.3: Add list helpers to `api/_calendar.ts`**

Add to the existing calendar module:
- `listCalendarEvents(params: { timeMin: string; timeMax: string; syncToken?: string })` — wraps `calendar.events.list` with pagination
- `getCalendarSyncToken()` — fetches the stored sync token from `calendar_sync_state`
- Export `getCalendarClient` (currently private) so the cron handler can reuse it

---

## Task 3: Cron Job — Calendar Reverse Sync

**Files:**
- Modify: `api/cron/index.ts`
- Modify: `vercel.json`

- [ ] **Step 3.1: Add `calendar-reverse-sync` route to cron handler**

In `api/cron/index.ts`, add case `"calendar-reverse-sync"`:
1. Load `calendar_sync_state` from DB
2. Call `listCalendarEvents` with `syncToken` (incremental) or `timeMin = now - 7d` (first run)
3. Load known `google_calendar_event_id` set from sessions table
4. Load existing `google_event_id` set from `calendar_inbox`
5. Call `reconcileEvents(events, knownIds, existingInboxIds)`
6. For each `matched` → update `calendar_inbox` with status `matched` + `resolved_by: 'auto'`
7. For each `pending` → INSERT into `calendar_inbox` with status `pending`
8. Save new `syncToken` to `calendar_sync_state`
9. Return `{ success, matched, pending, skipped }`

- [ ] **Step 3.2: Register cron in `vercel.json`**

Add to the `crons` array:
```json
{ "path": "/api/cron/calendar-reverse-sync", "schedule": "*/15 * * * *" }
```

Every 15 minutes — light polling since Google Calendar API uses sync tokens for incremental fetches.

---

## Task 4: Dashboard — Calendar Inbox Card

**Files:**
- Modify: `api/dashboard/index.ts`
- Modify: `src/hooks/useDashboard.ts`
- Modify: `src/pages/admin/Dashboard.tsx`

- [ ] **Step 4.1: Add `calendar-inbox` API route**

In `api/dashboard/index.ts`, add case `"calendar-inbox"`:
```sql
SELECT id, google_event_id, summary, start_at, end_at, attendee_email, status, synced_at
FROM calendar_inbox
WHERE status = 'pending'
ORDER BY start_at ASC
LIMIT 20
```

Also add case `"calendar-inbox-resolve"` (POST via a separate handler or query param):
- Accepts `{ inbox_id, action: 'dismiss' | 'create_session' }`
- `dismiss` → UPDATE status = 'dismissed', resolved_by = 'admin', resolved_at = now()
- `create_session` → redirect to QuickBooking pre-filled (return the inbox item data)

- [ ] **Step 4.2: Add `useCalendarInbox` hook**

In `src/hooks/useDashboard.ts`:
```typescript
export interface CalendarInboxEntry {
  id: string;
  google_event_id: string;
  summary: string;
  start_at: string;
  end_at: string;
  attendee_email: string | null;
  status: string;
  synced_at: string;
}

export function useCalendarInbox() {
  return useQuery({
    queryKey: ["calendar-inbox"],
    queryFn: async (): Promise<CalendarInboxEntry[]> => {
      const res = await fetch("/api/dashboard/calendar-inbox");
      if (!res.ok) throw new Error("Failed to fetch calendar inbox");
      return res.json();
    },
    refetchInterval: 60_000, // Refresh every minute
  });
}
```

Also add mutation hook `useResolveInboxItem()` using `useMutation` that POSTs to `/api/dashboard/calendar-inbox-resolve` and invalidates `["calendar-inbox"]`.

- [ ] **Step 4.3: Add inbox card to Dashboard**

In `src/pages/admin/Dashboard.tsx`, after the existing cards grid, add a new card:
- Title: "Calendário — Itens por Rever" with Calendar icon
- Badge with pending count
- List of pending items showing: summary, date/time, attendee email
- Two action buttons per item: "Dispensar" (dismiss) and "Criar Sessão" (opens QuickBooking pre-filled)
- Empty state: "Nenhum evento por rever"
- Only show the card when there are pending items (hide when empty)

---

## Task 5: Returning Flow — Journey Logic Refinement

**Files:**
- Modify: `src/lib/communications/journey.ts`
- Modify: `src/lib/communications/journey.test.ts`
- Modify: `src/lib/communications/types.ts`

- [ ] **Step 5.1: Add `ReturningFlowVariant` type**

In `src/lib/communications/types.ts`:
```typescript
export type ReturningFlowVariant = 'simple' | 'changed_context';
```

- [ ] **Step 5.2: Write failing tests for `deriveReturningVariant`**

In `src/lib/communications/journey.test.ts`, add:
```typescript
import { deriveReturningVariant } from "./journey";

describe("deriveReturningVariant", () => {
  it("returns 'simple' when no health changes and continuation focus", () => {
    expect(deriveReturningVariant({
      healthChanges: false,
      sessionFocus: "continuation",
      feelingSinceLast: "better",
    })).toBe("simple");
  });

  it("returns 'simple' when feeling same and continuation", () => {
    expect(deriveReturningVariant({
      healthChanges: false,
      sessionFocus: "continuation",
      feelingSinceLast: "same",
    })).toBe("simple");
  });

  it("returns 'changed_context' when health changes reported", () => {
    expect(deriveReturningVariant({
      healthChanges: true,
      sessionFocus: "continuation",
      feelingSinceLast: "better",
    })).toBe("changed_context");
  });

  it("returns 'changed_context' when new topic requested", () => {
    expect(deriveReturningVariant({
      healthChanges: false,
      sessionFocus: "new_topic",
      feelingSinceLast: "same",
    })).toBe("changed_context");
  });

  it("returns 'changed_context' when feeling worse", () => {
    expect(deriveReturningVariant({
      healthChanges: false,
      sessionFocus: "continuation",
      feelingSinceLast: "worse",
    })).toBe("changed_context");
  });
});
```

- [ ] **Step 5.3: Implement `deriveReturningVariant` (GREEN)**

In `src/lib/communications/journey.ts`:
```typescript
import type { ReturningFlowVariant } from "./types";

export function deriveReturningVariant(input: {
  healthChanges: boolean;
  sessionFocus: "continuation" | "new_topic" | "";
  feelingSinceLast: "better" | "same" | "worse" | "";
}): ReturningFlowVariant {
  if (input.healthChanges) return "changed_context";
  if (input.sessionFocus === "new_topic") return "changed_context";
  if (input.feelingSinceLast === "worse") return "changed_context";
  return "simple";
}
```

---

## Task 6: PreparePage — Dynamic Returning Flow

**Files:**
- Modify: `src/pages/public/PreparePage.tsx`

- [ ] **Step 6.1: Split returning check-in into simple vs changed-context**

Currently the returning flow is:
- Step 1: Quick check-in (feeling_since_last, 4 scales, health_changes toggle, session_focus)
- Step 2: Practical info

Refine to:
- Step 1 (triage): Ask 3 quick questions — `feeling_since_last`, `health_changes` toggle, `session_focus` radio
- If `deriveReturningVariant` → `"simple"`:
  - Step 2: Practical info (skip deep questions, auto-fill scales to last session values)
  - Total: 2 steps
- If `deriveReturningVariant` → `"changed_context"`:
  - Step 2: Full check-in (4 feeling scales + health_changes_details + new_topic_details + observations)
  - Step 3: Practical info
  - Total: 3 steps

Implementation approach:
1. Import `deriveReturningVariant` from journey.ts
2. Compute variant reactively from `draft.returning_checkin` state
3. Update `computeTotalSteps`: returning simple = 2, returning changed = 3
4. Update step rendering logic: insert the deep-check-in step conditionally between triage and practical info
5. Update `getStepLabel` for the new step labels

- [ ] **Step 6.2: Adjust submit payload for simple variant**

When variant is `"simple"`, the submitted `returning_checkin` should still include the triage answers but set scale values to defaults (5) and leave detail fields empty. This ensures the `returning_checkins` table always gets a complete row.

---

## Task 7: API — Expose Returning Metadata

**Files:**
- Modify: `api/forms/index.ts`

- [ ] **Step 7.1: Add last check-in data to prepare API response**

In the `GET /api/forms/prepare/:token` handler, after fetching client/session data, also query:
```sql
SELECT feeling_physically, feeling_psychologically, feeling_emotionally, feeling_energetically
FROM returning_checkins
WHERE client_id = $1
ORDER BY completed_at DESC
LIMIT 1
```

Add to the `PrepareApiResponse`:
- `last_checkin_scales: { physically: number; psychologically: number; emotionally: number; energetically: number } | null`

This lets the simple flow pre-fill scales with last-known values.

---

## Task 8: Verification & Cleanup

- [ ] **Step 8.1: Run all tests**

```bash
npx vitest run
```

All existing tests + new tests must pass.

- [ ] **Step 8.2: TypeScript type check**

```bash
npx tsc --noEmit
```

No type errors.

- [ ] **Step 8.3: Manual smoke test checklist**

- Calendar reverse sync cron endpoint responds with `{ success: true }` when called with CRON_SECRET
- Dashboard shows inbox card when pending items exist
- Dismiss action removes item from inbox
- Returning client with no changes → 2-step simple flow
- Returning client with health changes → 3-step changed-context flow
- Submit works correctly for both variants

---

## Dependency Graph

```
Task 1 (DB schema) ──────────────┐
                                  ├── Task 3 (Cron job) ── Task 4 (Dashboard)
Task 2 (Reconcile helpers) ──────┘
                                      
Task 5 (Journey logic) ── Task 6 (PreparePage) ── Task 7 (API metadata)

Task 8 (Verification) depends on all above
```

**Parallelism:** Tasks 1+2 can run in parallel. Tasks 5+6+7 are independent of Tasks 1+2+3+4. Maximum parallelism: two tracks (calendar track + returning flow track) converging at Task 8.
