# Premium Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore every protected admin flow, make pre-session reminders safe and idempotent, and upgrade Google Calendar reverse sync so app-owned event changes update CRM sessions while the dashboard inbox becomes truly operational.

**Architecture:** Add a single frontend admin fetch contract with global unauthorized handling, then migrate all stray admin `fetch()` calls onto it. Align the reminder state machine across TypeScript, migrations, UI, and cron release logic, and move reverse sync behavior behind pure derivation helpers so the cron can safely reschedule/cancel only eligible sessions while keeping manual events in the inbox.

**Tech Stack:** React 18, TanStack Query, Vitest, Vercel serverless handlers, Neon PostgreSQL, Google Calendar API, TypeScript, Zod

---

## File Map

### New files

- `src/lib/api/admin-fetch.ts`
  Shared admin request helper. Owns the auth storage key, `Authorization` header building, JSON parsing, and the unauthorized browser event.
- `src/lib/api/admin-fetch.test.ts`
  Unit tests for the new admin fetch contract.
- `src/lib/dashboard/calendar-inbox.ts`
  Pure helpers to convert inbox items into `QuickBooking` prefill data.
- `src/lib/dashboard/calendar-inbox.test.ts`
  Unit tests for inbox-to-quick-booking prefill logic.
- `supabase/migrations/007_premium_hardening.sql`
  DB alignment for `reminder_status` including `processing`.

### Modified files

- `src/lib/api/auth-headers.ts`
  Re-export the shared header builder from `admin-fetch.ts` so existing API wrappers keep working.
- `src/contexts/AuthContext.tsx`
  Listen to unauthorized/storage events and clear auth consistently.
- `src/components/admin/layout/AdminLayout.tsx`
  Extend `QuickBookingContext` state to carry inbox prefill data.
- `src/contexts/QuickBookingContext.tsx`
  Add `initialData` support to `openQuickBooking(...)`.
- `src/components/admin/QuickBooking.tsx`
  Use `adminFetch`, fix authenticated search/submit, and hydrate modal state from inbox prefill.
- `src/pages/admin/Dashboard.tsx`
  Add inbox loading/error/action states and open Quick Booking with prefill data from `get_for_create`.
- `src/hooks/useDashboard.ts`
  Replace raw fetches with `adminFetch` and keep `dismiss`/`get_for_create` behavior distinct.
- `src/pages/admin/SessionCreate.tsx`
  Use `adminFetch` for `/api/forms/emails/send`.
- `src/pages/admin/Settings.tsx`
  Use `adminFetch` for tag creation.
- `src/pages/admin/ClientImport.tsx`
  Use `adminFetch` for CSV import and quick-entry client creation.
- `src/pages/admin/ClientOCRImport.tsx`
  Use `adminFetch` for OCR extract/save routes.
- `src/lib/communications/types.ts`
  Add `"processing"` to `ReminderStatus`.
- `src/lib/communications/reminders.ts`
  Add due/release helpers used by the cron and sessions handler.
- `src/lib/communications/reminders.test.ts`
  Cover the new reminder due/release behavior.
- `src/pages/admin/SessionDetail.tsx`
  Render the new `processing` reminder label.
- `api/sessions/index.ts`
  Import shared reminder scheduling helper instead of keeping a private copy.
- `src/lib/calendar/reverse-sync.ts`
  Add pure reverse-sync derivation helpers for cancel/reschedule decisions.
- `src/lib/calendar/reverse-sync.test.ts`
  Cover cancel/reschedule guards and malformed event behavior.
- `api/_calendar.ts`
  Ensure the event typing used by reverse sync includes Google `status`.
- `api/cron/index.ts`
  Use the new reminder helpers, release claimed reminder rows safely, stop leaking raw error messages, and apply reverse-sync actions to sessions.

---

### Task 1: Shared Admin Fetch Contract

**Files:**
- Create: `src/lib/api/admin-fetch.ts`
- Test: `src/lib/api/admin-fetch.test.ts`
- Modify: `src/lib/api/auth-headers.ts`

- [ ] **Step 1: Write the failing admin-fetch tests**

```ts
// src/lib/api/admin-fetch.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ADMIN_AUTH_KEY,
  ADMIN_UNAUTHORIZED_EVENT,
  AdminUnauthorizedError,
  adminFetch,
} from "./admin-fetch";

describe("adminFetch", () => {
  beforeEach(() => {
    localStorage.setItem(
      ADMIN_AUTH_KEY,
      JSON.stringify({
        id: "admin-1",
        email: "daniela@example.com",
        name: "Daniela",
        token: "secret-token",
      })
    );
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("sends the bearer token from stored admin auth", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await adminFetch<{ ok: boolean }>("/api/dashboard/stats");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/dashboard/stats",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer secret-token",
          "Content-Type": "application/json",
        }),
      })
    );
  });

  it("dispatches an unauthorized event and throws a typed error on 401", async () => {
    const onUnauthorized = vi.fn();
    window.addEventListener(ADMIN_UNAUTHORIZED_EVENT, onUnauthorized as EventListener);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        })
      )
    );

    await expect(adminFetch("/api/clients")).rejects.toBeInstanceOf(
      AdminUnauthorizedError
    );
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run the new tests to verify they fail**

Run:

```bash
npx vitest run src/lib/api/admin-fetch.test.ts
```

Expected:

- FAIL because `src/lib/api/admin-fetch.ts` does not exist yet.

- [ ] **Step 3: Write the minimal shared helper**

```ts
// src/lib/api/admin-fetch.ts
import { DEFAULT_CONFIG } from "@/lib/config/therapist";

export const ADMIN_AUTH_KEY = `${DEFAULT_CONFIG.localStoragePrefix}-auth`;
export const ADMIN_UNAUTHORIZED_EVENT = "daniela-crm:admin-unauthorized";

export interface StoredAdminAuth {
  id: string;
  email: string;
  name: string;
  token?: string | null;
}

export class AdminUnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AdminUnauthorizedError";
  }
}

export function readStoredAdminAuth(): StoredAdminAuth | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(ADMIN_AUTH_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredAdminAuth;
  } catch {
    window.localStorage.removeItem(ADMIN_AUTH_KEY);
    return null;
  }
}

export function clearStoredAdminAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_AUTH_KEY);
}

export function getAuthHeaders(): HeadersInit {
  const auth = readStoredAdminAuth();
  return auth?.token
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
      }
    : { "Content-Type": "application/json" };
}

export function notifyAdminUnauthorized() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ADMIN_UNAUTHORIZED_EVENT));
}

export async function adminFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options?.headers ?? {}) },
  });

  if (response.status === 401) {
    notifyAdminUnauthorized();
    throw new AdminUnauthorizedError("Unauthorized");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
```

- [ ] **Step 4: Re-export the shared header builder**

```ts
// src/lib/api/auth-headers.ts
export { getAuthHeaders } from "./admin-fetch";
```

- [ ] **Step 5: Run the focused tests and keep them green**

Run:

```bash
npx vitest run src/lib/api/admin-fetch.test.ts
```

Expected:

- PASS with 2 tests passing.

- [ ] **Step 6: Commit the shared auth contract**

```bash
git add src/lib/api/admin-fetch.ts src/lib/api/admin-fetch.test.ts src/lib/api/auth-headers.ts
git commit -m "feat: add shared admin fetch contract"
```

---

### Task 2: Auth Session Loss + Admin Caller Migration + Inbox Prefill

**Files:**
- Create: `src/lib/dashboard/calendar-inbox.ts`
- Test: `src/lib/dashboard/calendar-inbox.test.ts`
- Modify: `src/contexts/AuthContext.tsx`
- Modify: `src/contexts/QuickBookingContext.tsx`
- Modify: `src/components/admin/layout/AdminLayout.tsx`
- Modify: `src/components/admin/QuickBooking.tsx`
- Modify: `src/hooks/useDashboard.ts`
- Modify: `src/pages/admin/Dashboard.tsx`
- Modify: `src/pages/admin/SessionCreate.tsx`
- Modify: `src/pages/admin/Settings.tsx`
- Modify: `src/pages/admin/ClientImport.tsx`
- Modify: `src/pages/admin/ClientOCRImport.tsx`

- [ ] **Step 1: Write the failing inbox prefill helper test**

```ts
// src/lib/dashboard/calendar-inbox.test.ts
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
      scheduledAt: "2026-04-10T14:30",
      durationMinutes: 120,
    });
  });
});
```

- [ ] **Step 2: Run the new helper test to verify it fails**

Run:

```bash
npx vitest run src/lib/dashboard/calendar-inbox.test.ts
```

Expected:

- FAIL because the helper file does not exist yet.

- [ ] **Step 3: Add the inbox-to-QuickBooking prefill helper**

```ts
// src/lib/dashboard/calendar-inbox.ts
export interface CalendarInboxPrefillSource {
  summary: string;
  attendee_email: string | null;
  start_at: string;
  end_at: string;
}

export interface QuickBookingInitialData {
  clientName?: string;
  clientEmail?: string;
  scheduledAt?: string;
  durationMinutes?: number;
}

function toDateTimeLocalValue(iso: string) {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + "T" + [pad(date.getHours()), pad(date.getMinutes())].join(":");
}

export function buildQuickBookingInitialData(
  item: CalendarInboxPrefillSource
): QuickBookingInitialData {
  const clientName =
    item.summary.split("—").pop()?.trim() || item.summary.trim();
  const durationMinutes = Math.max(
    0,
    Math.round(
      (new Date(item.end_at).getTime() - new Date(item.start_at).getTime()) /
        (1000 * 60)
    )
  );

  return {
    clientName,
    clientEmail: item.attendee_email ?? "",
    scheduledAt: toDateTimeLocalValue(item.start_at),
    durationMinutes,
  };
}
```

- [ ] **Step 4: Extend the admin session contract and migrate stray callers**

```ts
// src/contexts/QuickBookingContext.tsx
import { createContext, useContext } from "react";
import type { QuickBookingInitialData } from "@/lib/dashboard/calendar-inbox";

interface QuickBookingContextType {
  openQuickBooking: (initialData?: QuickBookingInitialData) => void;
}

export const QuickBookingContext = createContext<QuickBookingContextType | undefined>(
  undefined
);

export function useQuickBooking(): QuickBookingContextType {
  const context = useContext(QuickBookingContext);
  if (context === undefined) {
    throw new Error("useQuickBooking must be used within AdminLayout");
  }
  return context;
}
```

```ts
// src/contexts/AuthContext.tsx
import {
  ADMIN_AUTH_KEY,
  ADMIN_UNAUTHORIZED_EVENT,
  clearStoredAdminAuth,
  readStoredAdminAuth,
} from "@/lib/api/admin-fetch";

useEffect(() => {
  const syncFromStorage = () => {
    setUser(readStoredAdminAuth());
    setIsLoading(false);
  };

  const handleUnauthorized = () => {
    clearStoredAdminAuth();
    setUser(null);
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === ADMIN_AUTH_KEY) {
      syncFromStorage();
    }
  };

  syncFromStorage();
  window.addEventListener("storage", handleStorage);
  window.addEventListener(ADMIN_UNAUTHORIZED_EVENT, handleUnauthorized);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(ADMIN_UNAUTHORIZED_EVENT, handleUnauthorized);
  };
}, []);
```

```ts
// src/components/admin/layout/AdminLayout.tsx
const [quickBookingOpen, setQuickBookingOpen] = useState(false);
const [quickBookingInitialData, setQuickBookingInitialData] =
  useState<QuickBookingInitialData | undefined>(undefined);

const openQuickBooking = useCallback((initialData?: QuickBookingInitialData) => {
  setQuickBookingInitialData(initialData);
  setQuickBookingOpen(true);
}, []);

<QuickBooking
  open={quickBookingOpen}
  onOpenChange={(nextOpen) => {
    setQuickBookingOpen(nextOpen);
    if (!nextOpen) setQuickBookingInitialData(undefined);
  }}
  initialData={quickBookingInitialData}
/>;
```

```ts
// Representative migration examples
// src/pages/admin/SessionCreate.tsx
import { adminFetch } from "@/lib/api/admin-fetch";

async function sendForms(clientId: string, sessionId: string, serviceType: string) {
  await adminFetch("/api/forms/emails/send", {
    method: "POST",
    body: JSON.stringify({
      client_id: clientId,
      session_id: sessionId,
      service_type: serviceType,
      send_anamnesis: true,
    }),
  });
}

// src/components/admin/QuickBooking.tsx
import { adminFetch } from "@/lib/api/admin-fetch";

const data = await adminFetch<ClientSearchResult[]>(
  `/api/clients/search?q=${encodeURIComponent(debouncedQuery)}`
);

const result = await adminFetch<QuickBookingResult>("/api/sessions/quick", {
  method: "POST",
  body: JSON.stringify({
    client_name: selectedClient.name,
    client_phone: phone,
    client_gender: selectedClient.isNew ? gender : undefined,
    client_language: selectedClient.isNew ? preferredLanguage : undefined,
    scheduled_at: scheduledAt,
    service_type: serviceType,
  }),
});
```

- [ ] **Step 5: Finish the dashboard inbox UX wiring**

```ts
// src/hooks/useDashboard.ts
import { adminFetch } from "@/lib/api/admin-fetch";

export function useCalendarInbox() {
  return useQuery({
    queryKey: ["calendar-inbox"],
    queryFn: () => adminFetch<CalendarInboxEntry[]>("/api/dashboard/calendar-inbox"),
    refetchInterval: 60_000,
  });
}

export function useResolveInboxItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { inbox_id: string; action: "dismiss" | "get_for_create" }) =>
      adminFetch<CalendarInboxEntry | { success: true }>(
        "/api/dashboard/calendar-inbox-resolve",
        {
          method: "POST",
          body: JSON.stringify(params),
        }
      ),
    onSuccess: (_, variables) => {
      if (variables.action === "dismiss") {
        queryClient.invalidateQueries({ queryKey: ["calendar-inbox"] });
      }
    },
  });
}
```

```tsx
// src/pages/admin/Dashboard.tsx
import { buildQuickBookingInitialData } from "@/lib/dashboard/calendar-inbox";

const {
  data: calendarInbox,
  isLoading: calendarInboxLoading,
  error: calendarInboxError,
} = useCalendarInbox();
const [calendarActionId, setCalendarActionId] = useState<string | null>(null);

async function handleCreateFromInbox(inboxId: string) {
  setCalendarActionId(inboxId);
  try {
    const payload = await resolveInboxItem.mutateAsync({
      inbox_id: inboxId,
      action: "get_for_create",
    });

    if ("summary" in payload) {
      openQuickBooking(buildQuickBookingInitialData(payload));
    }
  } finally {
    setCalendarActionId(null);
  }
}
```

- [ ] **Step 6: Run the focused tests and a targeted typecheck**

Run:

```bash
npx vitest run src/lib/api/admin-fetch.test.ts src/lib/dashboard/calendar-inbox.test.ts
npx tsc --noEmit
```

Expected:

- Both test files PASS.
- TypeScript still passes.

- [ ] **Step 7: Commit the admin-flow restoration**

```bash
git add src/contexts/AuthContext.tsx src/contexts/QuickBookingContext.tsx src/components/admin/layout/AdminLayout.tsx src/components/admin/QuickBooking.tsx src/hooks/useDashboard.ts src/pages/admin/Dashboard.tsx src/pages/admin/SessionCreate.tsx src/pages/admin/Settings.tsx src/pages/admin/ClientImport.tsx src/pages/admin/ClientOCRImport.tsx src/lib/dashboard/calendar-inbox.ts src/lib/dashboard/calendar-inbox.test.ts
git commit -m "feat: restore admin auth flows and inbox prefill"
```

---

### Task 3: Reminder State Alignment Across DB, Types, UI, and Helpers

**Files:**
- Create: `supabase/migrations/007_premium_hardening.sql`
- Modify: `src/lib/communications/types.ts`
- Modify: `src/lib/communications/reminders.ts`
- Modify: `src/lib/communications/reminders.test.ts`
- Modify: `api/sessions/index.ts`
- Modify: `src/pages/admin/SessionDetail.tsx`

- [ ] **Step 1: Extend the failing reminder helper tests**

```ts
// Add to src/lib/communications/reminders.test.ts
import { getReminderRecoveryStatus, isPreSessionReminderDue } from "./reminders";

it("does not send while a reminder is already processing", () => {
  const result = shouldSendPreSessionReminder({
    now: new Date("2026-04-01T10:00:00Z"),
    scheduledAt: new Date("2026-04-02T10:00:00Z"),
    preferredChannel: "email",
    emailAvailable: true,
    smsAvailable: false,
    whatsappAvailable: false,
    reminderStatus: "processing",
  });

  expect(result).toBe(false);
});

it("uses next_reminder_due_at when deciding whether the reminder is due", () => {
  expect(
    isPreSessionReminderDue({
      now: new Date("2026-04-01T10:00:00Z"),
      scheduledAt: new Date("2026-04-02T10:00:00Z"),
      nextReminderDueAt: new Date("2026-04-01T09:30:00Z"),
    })
  ).toBe(true);
});

it("releases failed reminder attempts back to pending while the session is still active", () => {
  expect(
    getReminderRecoveryStatus({
      now: new Date("2026-04-01T10:00:00Z"),
      scheduledAt: new Date("2026-04-02T10:00:00Z"),
      sessionStatus: "scheduled",
      emailAvailable: true,
    })
  ).toBe("pending");
});

it("marks the reminder as skipped once the session can no longer receive reminders", () => {
  expect(
    getReminderRecoveryStatus({
      now: new Date("2026-04-02T12:30:00Z"),
      scheduledAt: new Date("2026-04-02T10:00:00Z"),
      sessionStatus: "completed",
      emailAvailable: true,
    })
  ).toBe("skipped");
});
```

- [ ] **Step 2: Run the reminder tests to verify they fail**

Run:

```bash
npx vitest run src/lib/communications/reminders.test.ts
```

Expected:

- FAIL because `"processing"` is not in `ReminderStatus` and the new helper functions do not exist yet.

- [ ] **Step 3: Add the new reminder helpers and shared due-date logic**

```ts
// src/lib/communications/types.ts
export type ReminderStatus =
  | "pending"
  | "scheduled"
  | "processing"
  | "sent"
  | "skipped";
```

```ts
// src/lib/communications/reminders.ts
type ReminderSessionStatus =
  | "scheduled"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export function getNextReminderDueAt(scheduledAt: string) {
  const scheduledDate = new Date(scheduledAt);
  if (Number.isNaN(scheduledDate.getTime())) return null;

  const dueAt = new Date(scheduledDate.getTime() - 24 * 60 * 60 * 1000);
  return dueAt.toISOString();
}

export function isPreSessionReminderDue(input: {
  now: Date;
  scheduledAt: Date;
  nextReminderDueAt?: Date | null;
}) {
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
}) {
  const active = input.sessionStatus === "scheduled" || input.sessionStatus === "confirmed";
  const inFuture = input.scheduledAt.getTime() > input.now.getTime();
  return active && inFuture && input.emailAvailable ? "pending" : "skipped";
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
}) {
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
```

- [ ] **Step 4: Align sessions handler, migration, and UI labels**

```sql
-- supabase/migrations/007_premium_hardening.sql
BEGIN;

ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_reminder_status_check;

ALTER TABLE sessions
  ADD CONSTRAINT sessions_reminder_status_check
  CHECK (reminder_status IN ('pending', 'scheduled', 'processing', 'sent', 'skipped'));

COMMIT;
```

```ts
// api/sessions/index.ts
import { getNextReminderDueAt } from "../../src/lib/communications/reminders.ts";
```

```tsx
// src/pages/admin/SessionDetail.tsx
const REMINDER_LABELS: Record<string, string> = {
  pending: "Pendente",
  scheduled: "Agendado",
  processing: "A processar",
  sent: "Enviado",
  skipped: "Ignorado",
};
```

- [ ] **Step 5: Run reminder-focused checks**

Run:

```bash
npx vitest run src/lib/communications/reminders.test.ts
npx tsc --noEmit
```

Expected:

- Reminder tests PASS.
- TypeScript still passes with `processing` now in the union.

- [ ] **Step 6: Commit the reminder alignment**

```bash
git add supabase/migrations/007_premium_hardening.sql src/lib/communications/types.ts src/lib/communications/reminders.ts src/lib/communications/reminders.test.ts api/sessions/index.ts src/pages/admin/SessionDetail.tsx
git commit -m "fix: align reminder processing state across app"
```

---

### Task 4: Safe Pre-Session Reminder Cron

**Files:**
- Modify: `api/cron/index.ts`
- Modify: `src/lib/communications/reminders.ts`

- [ ] **Step 1: Write the failing helper assertion for release behavior**

```ts
// Add to src/lib/communications/reminders.test.ts
it("falls back to the due date instead of a hard-coded window when next_reminder_due_at is available", () => {
  expect(
    shouldSendPreSessionReminder({
      now: new Date("2026-04-01T10:00:00Z"),
      scheduledAt: new Date("2026-04-02T10:00:00Z"),
      nextReminderDueAt: new Date("2026-04-01T09:00:00Z"),
      preferredChannel: "email",
      emailAvailable: true,
      smsAvailable: false,
      whatsappAvailable: false,
      reminderStatus: "pending",
    })
  ).toBe(true);
});
```

- [ ] **Step 2: Run the reminder suite to verify the new assertion fails first**

Run:

```bash
npx vitest run src/lib/communications/reminders.test.ts
```

Expected:

- FAIL if `shouldSendPreSessionReminder` still ignores `nextReminderDueAt`.

- [ ] **Step 3: Update the cron selection and release logic**

```ts
// Representative shape inside api/cron/index.ts
const sessions = await sql(
  `SELECT s.id AS session_id, s.client_id, s.scheduled_at, s.service_type, s.status,
          s.reminder_status, s.next_reminder_due_at,
          s.manage_token, s.manage_token_expires_at,
          c.first_name, c.email, c.preferred_language, c.preferred_channel
   FROM sessions s
   JOIN clients c ON c.id = s.client_id
   WHERE s.status IN ('scheduled', 'confirmed')
     AND s.reminder_status IN ('pending', 'scheduled')
     AND s.next_reminder_due_at IS NOT NULL
     AND s.next_reminder_due_at <= now()
     AND c.email IS NOT NULL`
);

for (const session of sessions) {
  const claimed = await sql(
    `UPDATE sessions
     SET reminder_status = 'processing'
     WHERE id = $1 AND reminder_status IN ('pending', 'scheduled')
     RETURNING id`,
    [session.session_id]
  );
  if (claimed.length === 0) continue;

  const shouldSend = shouldSendPreSessionReminder({
    now: new Date(),
    scheduledAt: new Date(session.scheduled_at),
    nextReminderDueAt: session.next_reminder_due_at
      ? new Date(session.next_reminder_due_at)
      : null,
    preferredChannel: profile.preferredChannel,
    emailAvailable: Boolean(session.email),
    smsAvailable: false,
    whatsappAvailable: false,
    reminderStatus: "pending",
  });

  if (!shouldSend) {
    await sql(
      `UPDATE sessions
       SET reminder_status = $2
       WHERE id = $1`,
      [
        session.session_id,
        getReminderRecoveryStatus({
          now: new Date(),
          scheduledAt: new Date(session.scheduled_at),
          sessionStatus: session.status,
          emailAvailable: Boolean(session.email),
        }),
      ]
    );
    continue;
  }

  try {
    const result = await resend.emails.send({ from: FROM_EMAIL, to: session.email, subject: content.subject, html });

    await sql(
      `UPDATE sessions
       SET reminder_status = 'sent',
           last_reminder_sent_at = now(),
           next_reminder_due_at = NULL
       WHERE id = $1`,
      [session.session_id]
    );
  } catch (error) {
    await sql(
      `UPDATE sessions
       SET reminder_status = $2
       WHERE id = $1`,
      [
        session.session_id,
        getReminderRecoveryStatus({
          now: new Date(),
          scheduledAt: new Date(session.scheduled_at),
          sessionStatus: session.status,
          emailAvailable: Boolean(session.email),
        }),
      ]
    );
    continue;
  }
}
```

- [ ] **Step 4: Stop leaking raw cron errors**

```ts
// api/cron/index.ts
  } catch (error: unknown) {
    console.error("Cron error:", error instanceof Error ? error.message : error);
    return res.status(500).json({ error: "Internal server error" });
  }
```

- [ ] **Step 5: Run the reminder tests, cron bundle, and a focused grep**

Run:

```bash
npx vitest run src/lib/communications/reminders.test.ts
npx esbuild api/cron/index.ts --bundle --platform=node --format=esm --outfile=/tmp/premium-hardening-cron.js
rg -n "processing" api/cron/index.ts src/lib/communications/types.ts src/pages/admin/SessionDetail.tsx supabase/migrations/007_premium_hardening.sql
```

Expected:

- Reminder tests PASS.
- Cron bundles successfully.
- `processing` appears in cron, TS types, UI, and migration.

- [ ] **Step 6: Commit the safe reminder cron**

```bash
git add api/cron/index.ts src/lib/communications/reminders.ts src/lib/communications/reminders.test.ts
git commit -m "fix: harden pre-session reminder cron"
```

---

### Task 5: Pure Reverse Sync Mutation Rules

**Files:**
- Modify: `src/lib/calendar/reverse-sync.ts`
- Modify: `src/lib/calendar/reverse-sync.test.ts`
- Modify: `api/_calendar.ts`

- [ ] **Step 1: Add failing reverse-sync mutation tests**

```ts
// Add to src/lib/calendar/reverse-sync.test.ts
import { deriveSessionSyncAction } from "./reverse-sync";

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

  it("does not auto-cancel completed or in-progress sessions", () => {
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
});
```

- [ ] **Step 2: Run the reverse-sync tests to verify they fail**

Run:

```bash
npx vitest run src/lib/calendar/reverse-sync.test.ts
```

Expected:

- FAIL because `deriveSessionSyncAction` does not exist yet.

- [ ] **Step 3: Add the pure sync-derivation helper**

```ts
// src/lib/calendar/reverse-sync.ts
interface CalendarEventLike {
  id?: string | null;
  status?: string | null;
  summary?: string | null;
  description?: string | null;
  start?: { dateTime?: string; date?: string } | null;
  end?: { dateTime?: string; date?: string } | null;
  attendees?: Array<{ email?: string }> | null;
}

interface ReverseSyncSessionLike {
  id: string;
  google_calendar_event_id: string | null;
  scheduled_at: string;
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
}

export function getEventStartValue(event: CalendarEventLike) {
  return event.start?.dateTime ?? event.start?.date ?? null;
}

export function deriveSessionSyncAction(
  event: CalendarEventLike,
  session: ReverseSyncSessionLike
) {
  if (session.status === "completed" || session.status === "in_progress") {
    return null;
  }

  if (event.status === "cancelled") {
    if (session.status === "scheduled" || session.status === "confirmed") {
      return { type: "cancel" as const };
    }
    return null;
  }

  const nextStart = getEventStartValue(event);
  if (!nextStart) return null;

  if (nextStart !== session.scheduled_at) {
    return {
      type: "reschedule" as const,
      scheduledAt: nextStart,
    };
  }

  return null;
}
```

- [ ] **Step 4: Align the Google event typing**

```ts
// api/_calendar.ts
export async function listCalendarEvents(params: {
  timeMin?: string;
  timeMax?: string;
  syncToken?: string;
}): Promise<{
  events: Array<{
    id?: string | null;
    status?: string | null;
    summary?: string | null;
    description?: string | null;
    start?: { dateTime?: string; date?: string } | null;
    end?: { dateTime?: string; date?: string } | null;
    attendees?: Array<{ email?: string }> | null;
  }>;
  nextSyncToken: string | null;
}> {
  // existing implementation, only with the stronger return type
}
```

- [ ] **Step 5: Run the reverse-sync test file**

Run:

```bash
npx vitest run src/lib/calendar/reverse-sync.test.ts
```

Expected:

- PASS with all reverse-sync tests green.

- [ ] **Step 6: Commit the pure reverse-sync rules**

```bash
git add src/lib/calendar/reverse-sync.ts src/lib/calendar/reverse-sync.test.ts api/_calendar.ts
git commit -m "test: cover reverse sync mutation rules"
```

---

### Task 6: Apply Reverse Sync Mutations + Final Inbox UX

**Files:**
- Modify: `api/cron/index.ts`
- Modify: `src/pages/admin/Dashboard.tsx`
- Modify: `src/hooks/useDashboard.ts`
- Modify: `src/components/admin/QuickBooking.tsx`

- [ ] **Step 1: Build the session map and apply safe reverse-sync mutations**

```ts
// Representative shape inside api/cron/index.ts
const sessionRows = await sql(
  `SELECT id, client_id, google_calendar_event_id, scheduled_at, status
   FROM sessions
   WHERE google_calendar_event_id IS NOT NULL`
);

const sessionsByEventId = new Map(
  sessionRows.map((row: Record<string, unknown>) => [
    String(row.google_calendar_event_id),
    row,
  ])
);

for (const item of reconcileResult.matched) {
  const session = sessionsByEventId.get(item.google_event_id);
  if (!session) continue;

  const action = deriveSessionSyncAction(item.raw_event as Parameters<typeof deriveSessionSyncAction>[0], {
    id: String(session.id),
    google_calendar_event_id: String(session.google_calendar_event_id),
    scheduled_at: String(session.scheduled_at),
    status: session.status as "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show",
  });

  if (action?.type === "reschedule") {
    await sql(
      `UPDATE sessions
       SET scheduled_at = $2,
           status = 'scheduled',
           reschedule_reason = 'Updated from Google Calendar',
           next_reminder_due_at = $3,
           calendar_sync_status = 'synced',
           calendar_last_synced_at = now()
       WHERE id = $1`,
      [session.id, action.scheduledAt, getNextReminderDueAt(action.scheduledAt)]
    );

    await sql(
      `INSERT INTO session_change_log (
         session_id, client_id, action, previous_status, new_status,
         previous_scheduled_at, new_scheduled_at, reason, actor
       )
       VALUES ($1, $2, 'rescheduled', $3, 'scheduled', $4, $5, $6, 'system')`,
      [session.id, session.client_id, session.status, session.scheduled_at, action.scheduledAt, "Google Calendar reverse sync"]
    );
  }

  if (action?.type === "cancel") {
    await sql(
      `UPDATE sessions
       SET status = 'cancelled',
           cancellation_reason = 'Cancelled in Google Calendar',
           next_reminder_due_at = NULL,
           calendar_sync_status = 'synced',
           calendar_last_synced_at = now()
       WHERE id = $1`,
      [session.id]
    );

    await sql(
      `INSERT INTO session_change_log (
         session_id, client_id, action, previous_status, new_status,
         previous_scheduled_at, new_scheduled_at, reason, actor
       )
       VALUES ($1, $2, 'cancelled', $3, 'cancelled', $4, $4, $5, 'system')`,
      [session.id, session.client_id, session.status, session.scheduled_at, "Google Calendar reverse sync"]
    );
  }

  if (!action) {
    await sql(
      `UPDATE sessions
       SET calendar_last_synced_at = now(), calendar_sync_status = 'synced'
       WHERE id = $1`,
      [session.id]
    );
  }
}
```

- [ ] **Step 2: Finish the dashboard inbox card states**

```tsx
// src/pages/admin/Dashboard.tsx
{calendarInboxLoading ? (
  <Card className="md:col-span-2">
    <CardHeader>
      <CardTitle>Calendário — Por Rever</CardTitle>
      <CardDescription>A carregar eventos do Google Calendar…</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      {[1, 2].map((item) => (
        <div key={item} className="flex items-center justify-between rounded-lg border p-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-28" />
        </div>
      ))}
    </CardContent>
  </Card>
) : calendarInboxError ? (
  <Card className="md:col-span-2">
    <CardHeader>
      <CardTitle>Calendário — Por Rever</CardTitle>
      <CardDescription>Não foi possível carregar a inbox do calendário.</CardDescription>
    </CardHeader>
  </Card>
) : calendarInbox && calendarInbox.length > 0 ? (
  // existing card with handleCreateFromInbox(item.id)
) : null}
```

- [ ] **Step 3: Keep Quick Booking prefill deterministic**

```ts
// Representative logic inside src/components/admin/QuickBooking.tsx
useEffect(() => {
  if (!open || !initialData) return;

  if (initialData.clientName) {
    setSearchQuery(initialData.clientName);
    setSelectedClient({
      id: "calendar-inbox-prefill",
      name: initialData.clientName,
      phone: null,
      email: initialData.clientEmail ?? null,
      isNew: true,
    });
  }

  if (initialData.scheduledAt) {
    setScheduledAt(initialData.scheduledAt);
  }
}, [open, initialData]);
```

- [ ] **Step 4: Run focused verification for reverse sync and the dashboard hooks**

Run:

```bash
npx vitest run src/lib/calendar/reverse-sync.test.ts src/lib/dashboard/calendar-inbox.test.ts
npx esbuild api/cron/index.ts --bundle --platform=node --format=esm --outfile=/tmp/premium-hardening-cron.js
npx tsc --noEmit
```

Expected:

- Reverse-sync and inbox helper tests PASS.
- Cron bundles.
- TypeScript passes.

- [ ] **Step 5: Commit the reverse-sync integration**

```bash
git add api/cron/index.ts src/pages/admin/Dashboard.tsx src/hooks/useDashboard.ts src/components/admin/QuickBooking.tsx
git commit -m "feat: apply reverse sync updates and inbox prefill"
```

---

### Task 7: Full Verification And Ship Readiness

**Files:**
- Modify: none
- Test: existing suite

- [ ] **Step 1: Run the complete automated verification**

Run:

```bash
npx vitest run
npx tsc --noEmit
npx esbuild api/cron/index.ts --bundle --platform=node --format=esm --outfile=/tmp/cron-bundle-check.js
npx eslint src api --ext .ts,.tsx
```

Expected:

- `vitest`: all tests passing
- `tsc`: no output
- `esbuild`: bundle succeeds
- `eslint`: no new errors in touched files; if legacy warnings remain elsewhere, note them explicitly

- [ ] **Step 2: Smoke the key flows manually**

Run:

```bash
npx vite --port 5199 --host 127.0.0.1 --clearScreen false
```

Manual checks:

1. login to `/admin/login`
2. quick booking search works and creates a session without `401`
3. session create page sends forms without `401`
4. CSV import and OCR import routes no longer fail with `Unauthorized`
5. dashboard inbox shows loading/error/ready states correctly
6. clicking `Criar Sessão` on an inbox item opens Quick Booking prefilled
7. clearing `localStorage` while on `/admin/dashboard` returns the app to login cleanly

- [ ] **Step 3: Record migration/deploy notes in the final summary**

Final summary must call out:

- run `supabase/migrations/007_premium_hardening.sql`
- `APP_URL`, `ADMIN_API_TOKEN`, `ADMIN_PASSWORD`, `CRON_SECRET`, and Google Calendar env vars must stay configured
- reverse sync only auto-mutates app-owned events; manual events still require inbox review

- [ ] **Step 4: Commit any final touch-ups from verification**

```bash
git add .
git commit -m "chore: finalize premium hardening verification"
```
