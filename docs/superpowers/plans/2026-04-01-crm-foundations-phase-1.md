# CRM Foundations Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the database/runtime model, add a usable client communication profile, make first-contact messaging context-aware for new vs returning clients in PT/EN, and introduce a provider-agnostic pre-session reminder foundation.

**Architecture:** Add a new migration for runtime drift and Phase 1 data fields, move client journey and communication decisions into small shared utility modules under `src/lib/communications`, then update admin forms, booking APIs, and cron logic to consume those modules. Keep existing public forms and premium styling intact, changing only the logic-driven parts of copy and consent surface.

**Tech Stack:** Vite, React, TypeScript, Vercel serverless routes, Neon/PostgreSQL SQL migrations, Vitest

---

## File Structure

- Create: `supabase/migrations/002_crm_foundations_phase1.sql`
- Create: `src/lib/communications/types.ts`
- Create: `src/lib/communications/profile.ts`
- Create: `src/lib/communications/journey.ts`
- Create: `src/lib/communications/templates.ts`
- Create: `src/lib/communications/reminders.ts`
- Create: `src/lib/communications/templates.test.ts`
- Create: `src/lib/communications/journey.test.ts`
- Create: `src/lib/communications/reminders.test.ts`
- Modify: `src/lib/types/database.types.ts`
- Modify: `src/lib/schemas/client.schema.ts`
- Modify: `src/pages/admin/ClientCreate.tsx`
- Modify: `src/pages/admin/ClientEdit.tsx`
- Modify: `api/clients/index.ts`
- Modify: `api/sessions/index.ts`
- Modify: `api/forms/index.ts`
- Modify: `api/cron/index.ts`
- Modify: `src/components/admin/QuickBooking.tsx`
- Modify: `src/pages/admin/SessionCreate.tsx`

### Task 1: Schema And Type Alignment

**Files:**
- Create: `supabase/migrations/002_crm_foundations_phase1.sql`
- Modify: `src/lib/types/database.types.ts`
- Test: `src/lib/communications/journey.test.ts`

- [ ] **Step 1: Write the failing test for new vs returning journey and supported services**

```ts
import { describe, expect, it } from "vitest";
import { deriveClientJourney } from "./journey";

describe("deriveClientJourney", () => {
  it("marks clients without completed sessions as new and supports home harmony", () => {
    const journey = deriveClientJourney({
      completedSessions: 0,
      serviceType: "home_harmony",
      referralSourceKnown: false,
    });

    expect(journey.clientKind).toBe("new");
    expect(journey.formVariant).toBe("healing_touch");
    expect(journey.shouldAskReferralSource).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/communications/journey.test.ts`
Expected: FAIL because `deriveClientJourney` does not exist yet

- [ ] **Step 3: Add migration for runtime drift and update shared database types**

```sql
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('female', 'male')),
  ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'pt' CHECK (preferred_language IN ('pt', 'en')),
  ADD COLUMN IF NOT EXISTS preferred_channel TEXT NOT NULL DEFAULT 'email' CHECK (preferred_channel IN ('email', 'sms', 'whatsapp'));

ALTER TABLE sessions
  DROP CONSTRAINT IF EXISTS sessions_service_type_check;

ALTER TABLE sessions
  ADD CONSTRAINT sessions_service_type_check
  CHECK (service_type IN ('healing_wellness', 'pura_radiancia', 'pure_earth_love', 'home_harmony', 'other'));

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS prepare_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS prepare_token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS google_calendar_event_id TEXT,
  ADD COLUMN IF NOT EXISTS reminder_status TEXT NOT NULL DEFAULT 'pending' CHECK (reminder_status IN ('pending', 'scheduled', 'sent', 'skipped')),
  ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_reminder_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reschedule_reason TEXT;

CREATE TABLE IF NOT EXISTS returning_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  feeling_since_last TEXT CHECK (feeling_since_last IN ('better', 'same', 'worse')),
  feeling_physically INT CHECK (feeling_physically BETWEEN 1 AND 10),
  feeling_psychologically INT CHECK (feeling_psychologically BETWEEN 1 AND 10),
  feeling_emotionally INT CHECK (feeling_emotionally BETWEEN 1 AND 10),
  feeling_energetically INT CHECK (feeling_energetically BETWEEN 1 AND 10),
  health_changes BOOLEAN DEFAULT false,
  health_changes_details TEXT,
  session_focus TEXT CHECK (session_focus IN ('continuation', 'new_topic')),
  new_topic_details TEXT,
  additional_observations TEXT,
  completed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

- [ ] **Step 4: Add the minimal shared journey helper**

```ts
export function deriveClientJourney(input: {
  completedSessions: number;
  serviceType: string;
  referralSourceKnown: boolean;
}) {
  const clientKind = input.completedSessions > 0 ? "returning" : "new";
  const formVariant =
    input.serviceType === "pura_radiancia" ? "pura_radiancia" : "healing_touch";

  return {
    clientKind,
    formVariant,
    shouldAskReferralSource: clientKind === "new" && !input.referralSourceKnown,
  };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- src/lib/communications/journey.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/002_crm_foundations_phase1.sql src/lib/types/database.types.ts src/lib/communications/journey.ts src/lib/communications/journey.test.ts
git commit -m "feat: align CRM schema with runtime foundations"
```

### Task 2: Client Communication Profile In Admin And API

**Files:**
- Create: `src/lib/communications/types.ts`
- Create: `src/lib/communications/profile.ts`
- Modify: `src/lib/schemas/client.schema.ts`
- Modify: `src/lib/types/database.types.ts`
- Modify: `src/pages/admin/ClientCreate.tsx`
- Modify: `src/pages/admin/ClientEdit.tsx`
- Modify: `api/clients/index.ts`
- Test: `src/lib/communications/journey.test.ts`

- [ ] **Step 1: Write the failing test for language and channel normalization**

```ts
import { describe, expect, it } from "vitest";
import { buildClientCommunicationProfile } from "./profile";

describe("buildClientCommunicationProfile", () => {
  it("defaults to PT and email when data is missing", () => {
    expect(buildClientCommunicationProfile({})).toMatchObject({
      preferredLanguage: "pt",
      preferredChannel: "email",
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/communications/journey.test.ts`
Expected: FAIL because `buildClientCommunicationProfile` does not exist yet

- [ ] **Step 3: Extend client schema, database types, API insert/update paths, and admin forms**

```ts
gender: z.enum(["female", "male"]).optional(),
preferred_language: z.enum(["pt", "en"]).default("pt"),
preferred_channel: z.enum(["email", "sms", "whatsapp"]).default("email"),
```

```tsx
<FormField
  control={form.control}
  name="preferred_language"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Idioma Preferido</FormLabel>
      <Select onValueChange={field.onChange} value={field.value}>
        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
        <SelectContent>
          <SelectItem value="pt">Português</SelectItem>
          <SelectItem value="en">English</SelectItem>
        </SelectContent>
      </Select>
    </FormItem>
  )}
/>
```

- [ ] **Step 4: Implement the shared profile helper**

```ts
export function buildClientCommunicationProfile(input: {
  preferred_language?: "pt" | "en" | null;
  preferred_channel?: "email" | "sms" | "whatsapp" | null;
  gender?: "female" | "male" | null;
}) {
  return {
    preferredLanguage: input.preferred_language ?? "pt",
    preferredChannel: input.preferred_channel ?? "email",
    gender: input.gender ?? null,
  };
}
```

- [ ] **Step 5: Run targeted tests**

Run: `npm test -- src/lib/communications/journey.test.ts`
Expected: PASS with both journey and profile assertions passing

- [ ] **Step 6: Commit**

```bash
git add src/lib/communications/types.ts src/lib/communications/profile.ts src/lib/schemas/client.schema.ts src/lib/types/database.types.ts src/pages/admin/ClientCreate.tsx src/pages/admin/ClientEdit.tsx api/clients/index.ts src/lib/communications/journey.test.ts
git commit -m "feat: add client communication profile"
```

### Task 3: Context-Aware First Contact And Form Sending

**Files:**
- Create: `src/lib/communications/templates.ts`
- Modify: `api/sessions/index.ts`
- Modify: `api/forms/index.ts`
- Modify: `src/components/admin/QuickBooking.tsx`
- Modify: `src/pages/admin/SessionCreate.tsx`
- Test: `src/lib/communications/templates.test.ts`

- [ ] **Step 1: Write the failing tests for PT/EN and new vs returning first-contact templates**

```ts
import { describe, expect, it } from "vitest";
import { buildBookingWhatsAppCopy } from "./templates";

describe("buildBookingWhatsAppCopy", () => {
  it("uses a returning-client PT message without onboarding language", () => {
    const copy = buildBookingWhatsAppCopy({
      clientName: "Maria",
      preferredLanguage: "pt",
      clientKind: "returning",
      serviceLabel: "Sessão Healing Touch",
      formattedDate: "3 de abril às 10:00",
      prepareUrl: "https://example.com/preparar/token",
    });

    expect(copy).toContain("Que bom voltar a recebê-la");
    expect(copy).not.toContain("Bem-vinda ao espaço");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/communications/templates.test.ts`
Expected: FAIL because `buildBookingWhatsAppCopy` does not exist yet

- [ ] **Step 3: Implement shared booking templates and update session/forms handlers to use them**

```ts
export function buildBookingWhatsAppCopy(input: {
  clientName: string;
  preferredLanguage: "pt" | "en";
  clientKind: "new" | "returning";
  serviceLabel: string;
  formattedDate: string;
  prepareUrl: string;
}) {
  if (input.preferredLanguage === "en") {
    return input.clientKind === "new"
      ? `Hello ${input.clientName}! Your ${input.serviceLabel} is booked for ${input.formattedDate}. Please complete this short preparation form: ${input.prepareUrl}`
      : `Hello ${input.clientName}! It will be lovely to welcome you back on ${input.formattedDate}. Please complete your short check-in here: ${input.prepareUrl}`;
  }

  return input.clientKind === "new"
    ? `Olá ${input.clientName}! A sua ${input.serviceLabel} está agendada para ${input.formattedDate}. Peço-lhe que preencha este breve formulário de preparação: ${input.prepareUrl}`
    : `Olá ${input.clientName}! Que bom voltar a recebê-la no dia ${input.formattedDate}. Peço-lhe que preencha este breve check-in aqui: ${input.prepareUrl}`;
}
```

- [ ] **Step 4: Fix session creation flow so anamnese is only sent when needed**

```ts
const shouldSendAnamnesis = completedSessions === 0;
```

```ts
const journey = deriveClientJourney({
  completedSessions,
  serviceType: service_type,
  referralSourceKnown: Boolean(existingReferralSource),
});
```

- [ ] **Step 5: Run targeted tests**

Run: `npm test -- src/lib/communications/templates.test.ts src/lib/communications/journey.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/communications/templates.ts src/lib/communications/templates.test.ts api/sessions/index.ts api/forms/index.ts src/components/admin/QuickBooking.tsx src/pages/admin/SessionCreate.tsx
git commit -m "feat: add contextual booking communication flow"
```

### Task 4: Reminder Foundation And Pre-Session Email Automation

**Files:**
- Create: `src/lib/communications/reminders.ts`
- Modify: `api/cron/index.ts`
- Modify: `src/lib/types/database.types.ts`
- Test: `src/lib/communications/reminders.test.ts`

- [ ] **Step 1: Write the failing test for reminder eligibility**

```ts
import { describe, expect, it } from "vitest";
import { shouldSendPreSessionReminder } from "./reminders";

describe("shouldSendPreSessionReminder", () => {
  it("sends a 24h email reminder when the session is upcoming and email is allowed", () => {
    const result = shouldSendPreSessionReminder({
      now: new Date("2026-04-01T10:00:00Z"),
      scheduledAt: new Date("2026-04-02T10:00:00Z"),
      preferredChannel: "email",
      serviceEmailAllowed: true,
      reminderStatus: "pending",
    });

    expect(result).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/communications/reminders.test.ts`
Expected: FAIL because `shouldSendPreSessionReminder` does not exist yet

- [ ] **Step 3: Implement reminder helper and add a new pre-session cron route**

```ts
export function shouldSendPreSessionReminder(input: {
  now: Date;
  scheduledAt: Date;
  preferredChannel: "email" | "sms" | "whatsapp";
  serviceEmailAllowed: boolean;
  reminderStatus: "pending" | "scheduled" | "sent" | "skipped";
}) {
  const diffMs = input.scheduledAt.getTime() - input.now.getTime();
  const hours = diffMs / (1000 * 60 * 60);

  return (
    input.reminderStatus !== "sent" &&
    input.preferredChannel === "email" &&
    input.serviceEmailAllowed &&
    hours <= 26 &&
    hours >= 22
  );
}
```

```ts
case "pre-session-reminder":
  return await handlePreSessionReminder(res);
```

- [ ] **Step 4: Update the cron handler to mark reminder metadata on the session**

```ts
UPDATE sessions
SET reminder_status = 'sent',
    last_reminder_sent_at = now()
WHERE id = $1
```

- [ ] **Step 5: Run targeted tests and full suite**

Run: `npm test -- src/lib/communications/reminders.test.ts && npm test`
Expected: PASS with all tests green

- [ ] **Step 6: Commit**

```bash
git add src/lib/communications/reminders.ts src/lib/communications/reminders.test.ts api/cron/index.ts src/lib/types/database.types.ts
git commit -m "feat: add pre-session reminder foundation"
```

## Self-Review

### Spec coverage

- Schema/runtime drift: covered by Task 1.
- Client language / gender / communication profile: covered by Task 2.
- New vs returning messaging and PT/EN branching: covered by Task 3.
- Reminder foundation and provider-agnostic future path: covered by Task 4.

### Placeholder scan

- No `TBD`, `TODO`, or “implement later” steps remain.
- Each task contains concrete files, commands, and minimum code examples.

### Type consistency

- Client language values are fixed as `pt | en`.
- Channel values are fixed as `email | sms | whatsapp`.
- Reminder status values are fixed as `pending | scheduled | sent | skipped`.
- Journey client kind values are fixed as `new | returning`.
