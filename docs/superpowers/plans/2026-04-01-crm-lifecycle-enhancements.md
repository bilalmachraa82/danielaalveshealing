# CRM Lifecycle Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the remaining CRM lifecycle gaps: consent governance, session self-service, stronger calendar orchestration, public-flow consent capture, and a premium client timeline.

**Architecture:** Extend the Phase 1 communication foundations with additional consent and lifecycle tables, then wire admin, public pages, and APIs around a single session-management model. The app remains the source of truth for appointments; Google Calendar becomes a synchronized projection. Timeline data comes from explicit event logging instead of reconstructing history from ad hoc queries.

**Tech Stack:** Vite, React, TypeScript, Vercel serverless routes, Neon/PostgreSQL SQL migrations, Vitest

---

## File Structure

- Create: `supabase/migrations/003_crm_lifecycle_enhancements.sql`
- Create: `src/lib/communications/consents.ts`
- Create: `src/lib/communications/manage.ts`
- Create: `src/lib/communications/timeline.ts`
- Create: `src/lib/communications/manage.test.ts`
- Modify: `src/lib/types/database.types.ts`
- Modify: `src/lib/schemas/client.schema.ts`
- Modify: `src/lib/schemas/session.schema.ts`
- Modify: `src/lib/api/sessions.ts`
- Modify: `src/hooks/useSessions.ts`
- Modify: `src/hooks/useClients.ts`
- Modify: `src/pages/admin/ClientCreate.tsx`
- Modify: `src/pages/admin/ClientEdit.tsx`
- Modify: `src/pages/admin/ClientDetail.tsx`
- Modify: `src/pages/admin/SessionDetail.tsx`
- Modify: `src/pages/admin/Settings.tsx`
- Modify: `src/hooks/useDashboard.ts`
- Modify: `src/pages/public/PreparePage.tsx`
- Modify: `src/pages/public/AnamnesisPage.tsx`
- Create: `src/pages/public/ManageSessionPage.tsx`
- Modify: `src/App.tsx`
- Modify: `api/clients/index.ts`
- Modify: `api/sessions/index.ts`
- Modify: `api/forms/index.ts`
- Modify: `api/cron/index.ts`
- Modify: `api/dashboard/index.ts`
- Modify: `api/_calendar.ts`

### Task 1: Schema For Consents, Session Management, And Timeline

**Files:**
- Create: `supabase/migrations/003_crm_lifecycle_enhancements.sql`
- Create: `src/lib/communications/manage.ts`
- Create: `src/lib/communications/manage.test.ts`
- Modify: `src/lib/types/database.types.ts`

- [ ] **Step 1: Write the failing test for self-service policy**

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/communications/manage.test.ts`
Expected: FAIL because `canClientManageSession` does not exist yet

- [ ] **Step 3: Add migration for granular consent fields, manage tokens, and timeline tables**

```sql
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS consent_health_data BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_health_data_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_health_data_source TEXT,
  ADD COLUMN IF NOT EXISTS service_consent_email BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS service_consent_sms BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS service_consent_whatsapp BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_consent_email BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_consent_sms BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_consent_whatsapp BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_version TEXT DEFAULT '2026-04',
  ADD COLUMN IF NOT EXISTS consent_updated_at TIMESTAMPTZ;

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS manage_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS manage_token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS client_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS calendar_sync_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS calendar_last_synced_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS communication_log (...);
CREATE TABLE IF NOT EXISTS session_change_log (...);
```

- [ ] **Step 4: Implement minimal self-service policy helper and shared database types**

```ts
export function canClientManageSession(input: { now: Date; scheduledAt: Date }) {
  const hours = (input.scheduledAt.getTime() - input.now.getTime()) / 36e5;
  return {
    canConfirm: hours > 0,
    canReschedule: hours >= 24,
    canCancel: hours >= 24,
  };
}
```

- [ ] **Step 5: Run targeted tests**

Run: `npm test -- src/lib/communications/manage.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/003_crm_lifecycle_enhancements.sql src/lib/communications/manage.ts src/lib/communications/manage.test.ts src/lib/types/database.types.ts
git commit -m "feat: add lifecycle schema and session management foundations"
```

### Task 2: Consent Governance In Admin And Public First Touchpoints

**Files:**
- Create: `src/lib/communications/consents.ts`
- Modify: `src/lib/schemas/client.schema.ts`
- Modify: `src/pages/admin/ClientCreate.tsx`
- Modify: `src/pages/admin/ClientEdit.tsx`
- Modify: `api/clients/index.ts`
- Modify: `src/pages/public/PreparePage.tsx`
- Modify: `src/pages/public/AnamnesisPage.tsx`
- Modify: `api/forms/index.ts`

- [ ] **Step 1: Write the failing test for consent normalization**

```ts
import { describe, expect, it } from "vitest";
import { buildServiceConsentSnapshot } from "./consents";

describe("buildServiceConsentSnapshot", () => {
  it("defaults missing channel permissions to false", () => {
    expect(buildServiceConsentSnapshot({})).toMatchObject({
      email: false,
      sms: false,
      whatsapp: false,
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/communications/manage.test.ts`
Expected: FAIL because `buildServiceConsentSnapshot` does not exist yet

- [ ] **Step 3: Extend client schema, admin forms, and API payload handling**

```ts
service_consent_email: z.boolean().default(false),
service_consent_sms: z.boolean().default(false),
service_consent_whatsapp: z.boolean().default(false),
marketing_consent_email: z.boolean().default(false),
marketing_consent_sms: z.boolean().default(false),
marketing_consent_whatsapp: z.boolean().default(false),
consent_health_data: z.boolean().default(false),
```

- [ ] **Step 4: Add first-touch consent capture in public pages**

```ts
payload.consents = {
  consent_health_data,
  service_consent_email,
  service_consent_sms,
  service_consent_whatsapp,
  marketing_consent_email,
  marketing_consent_sms,
  marketing_consent_whatsapp,
  consent_source: "prepare_public",
};
```

- [ ] **Step 5: Run targeted tests and build**

Run: `npm test -- src/lib/communications/manage.test.ts src/lib/communications/journey.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/communications/consents.ts src/lib/schemas/client.schema.ts src/pages/admin/ClientCreate.tsx src/pages/admin/ClientEdit.tsx api/clients/index.ts src/pages/public/PreparePage.tsx src/pages/public/AnamnesisPage.tsx api/forms/index.ts src/lib/types/database.types.ts
git commit -m "feat: add consent governance across admin and public flows"
```

### Task 3: Session Self-Service, Reschedule, Cancel, And Calendar Sync

**Files:**
- Modify: `api/sessions/index.ts`
- Modify: `api/_calendar.ts`
- Modify: `api/cron/index.ts`
- Modify: `src/lib/api/sessions.ts`
- Modify: `src/hooks/useSessions.ts`
- Modify: `src/lib/schemas/session.schema.ts`
- Modify: `src/pages/admin/SessionDetail.tsx`
- Create: `src/pages/public/ManageSessionPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write the failing test for manage-link copy and policy**

```ts
import { describe, expect, it } from "vitest";
import { buildSessionManageState } from "./manage";

describe("buildSessionManageState", () => {
  it("marks late cancellations as blocked", () => {
    const state = buildSessionManageState({
      now: new Date("2026-04-02T10:00:00Z"),
      scheduledAt: new Date("2026-04-03T07:00:00Z"),
      status: "scheduled",
    });

    expect(state.canCancel).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/communications/manage.test.ts`
Expected: FAIL because `buildSessionManageState` does not exist yet

- [ ] **Step 3: Add manage token issuance, public manage endpoints, and admin reschedule UI**

```ts
case "manage":
  return await handleManageSession(req, res, sql, pathSegments[1]);
```

```tsx
<Input
  type="datetime-local"
  value={rescheduleAt}
  onChange={(e) => setRescheduleAt(e.target.value)}
/>
```

- [ ] **Step 4: Upgrade Google Calendar sync to carry attendees, manage links, and sync metadata**

```ts
attendees: params.clientEmail ? [{ email: params.clientEmail }] : undefined,
description: `${existingDescription}\n\nGerir sessão: ${params.manageUrl}`,
sendUpdates: "all",
```

- [ ] **Step 5: Reset reminder state on reschedule and log lifecycle changes**

```ts
if (data.scheduled_at) {
  fields.push(`reminder_status = 'pending'`);
  fields.push(`next_reminder_due_at = ...`);
}
```

- [ ] **Step 6: Run targeted tests, full tests, and build**

Run: `npm test -- src/lib/communications/manage.test.ts && npm test && npm run build`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add api/sessions/index.ts api/_calendar.ts api/cron/index.ts src/lib/api/sessions.ts src/hooks/useSessions.ts src/lib/schemas/session.schema.ts src/pages/admin/SessionDetail.tsx src/pages/public/ManageSessionPage.tsx src/App.tsx src/lib/types/database.types.ts
git commit -m "feat: add session self-service and calendar lifecycle sync"
```

### Task 4: Premium Timeline And Communication History

**Files:**
- Create: `src/lib/communications/timeline.ts`
- Modify: `api/dashboard/index.ts`
- Modify: `api/clients/index.ts`
- Modify: `src/hooks/useClients.ts`
- Modify: `src/pages/admin/ClientDetail.tsx`
- Modify: `src/pages/admin/Settings.tsx`
- Modify: `src/hooks/useDashboard.ts`
- Modify: `api/forms/index.ts`
- Modify: `api/cron/index.ts`
- Modify: `api/sessions/index.ts`

- [ ] **Step 1: Write the failing test for timeline event sorting**

```ts
import { describe, expect, it } from "vitest";
import { sortTimelineEvents } from "./timeline";

describe("sortTimelineEvents", () => {
  it("orders events newest first", () => {
    const events = sortTimelineEvents([
      { id: "1", occurred_at: "2026-04-01T10:00:00Z" },
      { id: "2", occurred_at: "2026-04-02T10:00:00Z" },
    ]);

    expect(events[0].id).toBe("2");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/communications/manage.test.ts`
Expected: FAIL because `sortTimelineEvents` does not exist yet

- [ ] **Step 3: Add normalized timeline helper and `/api/clients/:id/timeline`**

```ts
return [...sessionEvents, ...formEvents, ...communicationEvents, ...consentEvents]
  .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
```

- [ ] **Step 4: Surface the timeline and consent profile in admin**

```tsx
<CardTitle>Timeline</CardTitle>
<CardDescription>Histórico completo do cliente</CardDescription>
```

- [ ] **Step 5: Update dashboard/settings labels for new communication types**

```ts
pre_session_reminder: "Reminder Pré-Sessão",
post_session_checkin: "Check-In Pós-Sessão",
```

- [ ] **Step 6: Run full verification**

Run: `npm test && npm run build`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/lib/communications/timeline.ts api/dashboard/index.ts api/clients/index.ts src/hooks/useClients.ts src/pages/admin/ClientDetail.tsx src/pages/admin/Settings.tsx src/hooks/useDashboard.ts api/forms/index.ts api/cron/index.ts api/sessions/index.ts src/lib/types/database.types.ts
git commit -m "feat: add premium client timeline and communication history"
```

## Self-Review

### Spec coverage

- consent governance: covered by Task 2
- session self-service and calendar orchestration: covered by Task 3
- first public touchpoint consent capture and contextual public flows: covered by Task 2
- premium timeline/history: covered by Task 4

### Placeholder scan

- no `TODO`, `TBD`, or “later” placeholders remain
- each task names exact files and concrete verification commands

### Type consistency

- consent channels are fixed as `email | sms | whatsapp`
- session manage state depends on the existing session status union
- timeline events normalize on `occurred_at`
