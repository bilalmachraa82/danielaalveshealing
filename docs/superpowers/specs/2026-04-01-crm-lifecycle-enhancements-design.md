# CRM Lifecycle Enhancements Design

**Date:** 2026-04-01
**Branch:** `feature/crm-foundations`
**Status:** Approved for implementation after baseline audit

## Baseline Audit

The Phase 1 foundations already implemented on this branch are coherent:

- shared communication helpers are wired across admin, API, and cron
- `preferred_language` and `preferred_channel` are persisted
- new vs returning logic is centralized in the backend
- pre-session email reminders exist as a provider-agnostic foundation
- `npm test` and `npm run build` both pass on the audited branch

This means the next wave can build on the current branch without refactoring the Phase 1 work.

## Goal

Complete the therapist lifecycle gaps identified in the audit without breaking the premium feel or changing existing questionnaire logic unless the new lifecycle rules require it.

The remaining work will make the app operationally complete for Daniela across:

- consent and channel governance
- reschedule/cancel flows inside the app
- stronger app-to-calendar orchestration
- first public touchpoint consent capture
- premium client timeline and communication history

## Product Rules

- Preserve existing public questions and copy by default.
- Only change copy or questions when required by:
  - PT/EN branching
  - gender-aware phrasing
  - first-time vs returning logic
  - consent/compliance capture
  - reschedule/cancel lifecycle actions
- Any explicit copy/question changes must be called out in implementation notes.
- Keep the current premium visual language. New UI should extend current admin/public patterns instead of introducing a different design system.

## Scope

### 1. Consent And Communication Governance

Add a real communication-consent model to the client record:

- service communication consent by channel: `email`, `sms`, `whatsapp`
- marketing consent by channel: `email`, `sms`, `whatsapp`
- explicit health-data consent capture metadata
- consent version, source, and timestamp

This model is used for:

- deciding which reminder channel is eligible
- deciding whether WhatsApp/SMS is allowed when a provider is added later
- showing Daniela a clean communication profile in admin
- capturing GDPR-sensitive consent at the first public questionnaire touchpoint instead of only in back office

### 2. Session Self-Service And Calendar Orchestration

Sessions need a durable public management link. Each future session gets:

- `manage_token`
- `manage_token_expires_at`

That token powers a public session-management page where a client can:

- confirm the session
- reschedule within policy
- cancel within policy

The session-management flow updates the app first, then synchronizes Google Calendar from the app. The app remains the source of truth. Calendar event descriptions should include:

- CRM session link
- session-management link
- client-facing context

When a session changes:

- `scheduled_at`, `status`, `reschedule_reason`, and `cancellation_reason` update in the app
- reminder metadata resets when appropriate
- Google Calendar updates or deletes the event accordingly
- the change is logged in a session history table

### 3. Context-Aware Public Flows

The public forms should respect first-time vs returning logic more consistently:

- `PreparePage` stays the quick-path flow and continues to branch between new and returning
- returning clients should not see onboarding questions that are already known, especially referral-source questions
- `AnamnesisPage` becomes the first-touch consent surface for the classic emailed flow
- `PreparePage` becomes the first-touch consent surface for the quick-booking flow

The goal is not to rewrite questionnaires. The goal is to place consent and conditional logic in the right place.

### 4. Premium Timeline And Communication History

Daniela needs a single timeline on the client page that shows:

- session created / confirmed / rescheduled / cancelled
- public forms sent / completed
- communications sent
- consent captured or updated

This requires lightweight event logging tables instead of reconstructing everything from ad hoc queries every time.

The client detail page should gain:

- a communication profile card
- a consent summary card
- a timeline/history card

## Data Model

### Client additions

- `consent_health_data`
- `consent_health_data_at`
- `consent_health_data_source`
- `service_consent_email`
- `service_consent_sms`
- `service_consent_whatsapp`
- `marketing_consent_email`
- `marketing_consent_sms`
- `marketing_consent_whatsapp`
- `consent_version`
- `consent_updated_at`

### Session additions

- `manage_token`
- `manage_token_expires_at`
- `client_confirmed_at`
- `calendar_sync_status`
- `calendar_last_synced_at`

### New tables

- `communication_log`
  - stores channel, template key, provider placeholder id, status, metadata
- `session_change_log`
  - stores session lifecycle actions such as create, confirm, reschedule, cancel

## API Design

### Session APIs

- extend session create/quick-create to issue `manage_token`
- extend session update to:
  - accept `reschedule_reason`
  - accept `cancellation_reason`
  - reset reminder state when date changes
  - log lifecycle actions
- add public management endpoint:
  - `GET /api/sessions/manage/:token`
  - `POST /api/sessions/manage/:token`

### Consent Capture APIs

- extend client create/update to accept granular consent fields
- extend `POST /api/forms/prepare/:token`
  - capture service-channel consent
  - capture health-data consent when the quick path is the first public touchpoint
- extend anamnesis submit flow
  - capture health-data consent metadata for the classic flow

### Timeline APIs

- add `GET /api/clients/:id/timeline`
  - returns normalized events for sessions, forms, communications, consent updates

## UI Design

### Admin

- `ClientCreate` and `ClientEdit`
  - keep current layout
  - add grouped service/marketing channel consents
  - surface preferred channel and language together
- `SessionDetail`
  - add reschedule form
  - add cancellation reason field
  - add manage-link copy action
  - show reminder/calendar sync metadata
- `ClientDetail`
  - add communication profile card
  - add consent summary card
  - add premium timeline card
- `Settings`
  - update communication labels for new email/message types

### Public

- new session management page with premium but lightweight presentation
- `PreparePage`
  - add consent step/section for new quick-booking flow
  - hide referral source if already known or not relevant
- `AnamnesisPage`
  - add consent capture before health data submission

## Calendar Strategy

The realistic scope for this implementation is strong app-to-calendar sync, not full Google-to-app reverse sync.

This wave will implement:

- richer create/update/delete event handling
- attendee email support when client email exists
- manage-link context inside the event description
- sync status metadata in the app

This wave will not implement Google webhook ingestion for true reverse sync because that requires extra external setup and a separate operational design.

## Copy And Question Changes

The following changes are intentional and required:

1. Add consent copy on the first public questionnaire touchpoint.
2. Add session-management copy in reminders and manage links.
3. Hide referral-source questions for returning clients or when already known.
4. Keep new vs returning communication text differentiated.

No broader rewrite of clinical questions is planned.

## Non-Goals

- real SMS provider integration
- real WhatsApp provider integration
- delivery/open/read webhooks from external providers
- Google Calendar reverse webhook sync
- data retention / anonymization project

These stay provider- or policy-dependent. The code in this wave will prepare the interfaces and data model for them.

## Acceptance Criteria

- Daniela can set channel permissions and see them clearly in admin.
- The first public questionnaire shown to a client captures the right consent.
- A future session can be confirmed, rescheduled, or cancelled from a public app link.
- Reschedule/cancel actions update the session and sync Google Calendar from the app.
- The client page shows a coherent timeline of sessions, forms, consent, and communications.
- Tests and build remain green after the changes.
