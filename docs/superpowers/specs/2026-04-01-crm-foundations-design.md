# Daniela Alves CRM Foundations Design

**Date:** 2026-04-01
**Branch:** `feature/crm-foundations`
**Scope:** Audit findings, target operating model, and implementation direction for the Daniela Alves CRM without degrading the current premium user experience.

## Goal

Stabilize the CRM around one coherent client journey so Daniela can manage bookings, preparation, session follow-up, reminders, consent, and communications inside the app with less manual work and fewer hidden failure modes.

The design must preserve the current look and feel and preserve existing questions and copy by default. Content changes are allowed only when logic, language, consent, or repeated-session context clearly require them.

## Non-Goals

- Rebrand the product or redesign the premium visual language from scratch.
- Replace the existing therapeutic forms with new questionnaires.
- Implement a fully bi-directional Google Calendar synchronization in the first iteration.
- Lock the app to a specific SMS or WhatsApp provider before the communication model is stable.

## Working Constraints

- Existing user-facing forms and brand tone should remain intact unless explicitly noted.
- PT and EN must be treated as first-class communication variants, not as a late translation layer.
- Gender-aware language should only be used when the profile supports it; otherwise neutral copy should be used.
- First-session and returning-session experiences must diverge where logically required.
- The app should become the operational source of truth for sessions and communications.

## Current State Summary

### Product and Flow Findings

- The product already supports admin clients, sessions, public forms, quick booking, follow-up emails, and Google Calendar event creation.
- The current operational model is fragmented: booking, messaging, forms, consent, and calendar sync are implemented separately instead of as one session journey.
- The app has good foundations for a premium back office and public form UX, but some cross-cutting logic is missing or inconsistent.

### Critical Technical Findings

- The runtime code uses fields and tables that are not present in the checked-in initial schema:
  - `clients.gender`
  - `clients.preferred_language` (not yet implemented, but required by this design)
  - `sessions.prepare_token`
  - `sessions.prepare_token_expires_at`
  - `sessions.google_calendar_event_id`
  - `returning_checkins`
  - `home_harmony` in session service type support
- This indicates drift between database reality and repository migrations. A clean environment cannot be trusted to reproduce production behavior.

### Flow Findings

- `new vs returning` logic is inconsistent across admin booking, quick booking, and form sending.
- Public clinical data collection happens before explicit channel/service consent is modeled correctly in the first public touchpoint.
- Google Calendar sync is one-way and only partial.
- Pre-session reminders are not modeled as a dedicated capability; the current reminder route behaves more like post-session follow-up.
- Communication delivery is email-centric and does not yet model per-channel consent or preference.

## Design Principles

1. One client, one profile, one communication profile.
2. One session record acts as the center of operational truth.
3. One journey engine decides what the client receives next.
4. Consent is granular, auditable, and easy to withdraw.
5. Forms are contextual: new client, returning client, service type, and language change the journey, not the overall tone.
6. External channels are pluggable adapters; product logic stays provider-agnostic.
7. The premium experience depends on clarity and calm, not on adding more screens.

## Target Operating Model

### 1. Client Profile

Each client should have a single profile with:

- identity and contact data
- normalized phone number
- preferred language
- optional gender / preferred treatment
- lifecycle status (`new`, `active`, `inactive`, `archived`)
- communication preferences
- consent state with timestamps and source

This profile becomes the reference for every template, reminder, and session flow.

### 2. Consent Model

Consent must be split into separate domains:

- therapeutic data processing
- health data processing
- service communication by email
- service communication by WhatsApp
- service communication by SMS
- marketing communication by email
- marketing communication by WhatsApp
- marketing communication by SMS

Each consent record should capture:

- granted / denied
- timestamp
- source (`admin`, `public_form`, `import`, `manual_override`)
- consent text version
- withdrawal timestamp where applicable

This is intentionally more granular than the current `consent_data_processing` and `consent_marketing` booleans.

### 3. Session Lifecycle

Sessions should explicitly support a lifecycle closer to operations:

- `scheduled`
- `confirmed`
- `rescheduled`
- `in_progress`
- `completed`
- `cancelled`
- `no_show`

Each session should also track:

- booking source
- communication status
- linked preparation token
- linked calendar event id
- latest reminder sent
- cancellation / reschedule reason
- whether client self-service is still allowed

### 4. Journey Engine

The app should determine the next client-facing step from session and client context.

Inputs:

- new vs returning client
- service type
- preferred language
- channel preferences and allowed channels
- whether required personal data is missing
- whether a previous answer already exists

Outputs:

- which form to send
- which message template to use
- when reminders should fire
- whether to ask onboarding questions or only deltas

## Public Form Strategy

### New Clients

New clients should receive:

- service-specific preparation flow
- missing personal data completion where needed
- explicit therapeutic / health-data consent before or at the first clinical data collection point

### Returning Clients

Returning clients should receive:

- a shorter check-in
- only questions needed to capture changes
- previous onboarding questions only if missing or stale

### Question Preservation Rule

Existing questions and copy stay by default.

They should only change when:

- the question is logically irrelevant for returning clients
- the wording must diverge for PT/EN quality
- the wording must diverge for gender-aware language
- explicit consent text must be added where health data is collected
- the session type requires a different intro or CTA

## Communication Strategy

### Template Dimensions

Templates should vary by:

- language: `pt`, `en`
- client type: `new`, `returning`
- service type
- occasion
- channel

### Supported Occasions

- first booking confirmation
- preparation request
- reminder 48h
- reminder 24h
- optional reminder 3h
- reschedule confirmation
- cancellation confirmation
- post-session check-in
- satisfaction request
- review request
- rebooking / reactivation

### Template Policy

- Preserve current tone and warmth.
- Keep existing body copy as the default seed wherever possible.
- Introduce variants only where logic requires them.
- Store template keys in the app, not only inline in route handlers.

## Reminder System

The target reminder capability is:

- `T-48h`: email reminder
- `T-24h`: preferred service channel reminder
- `T-3h`: optional fast-channel reminder
- send-on-reschedule: updated time and next steps
- send-on-cancel: cancellation confirmation

Fallback rules:

- if preferred channel is unavailable or lacks consent, fall back to the next allowed service channel
- if no fast channel is available, email remains the default

The system should be provider-agnostic through adapters:

- `sendEmail()`
- `sendSms()`
- `sendWhatsApp()`

## Calendar Strategy

### Phase 1

App to Google Calendar synchronization only:

- create event on booking
- update event on reschedule
- delete or mark event on cancellation / no-show

### Phase 2

Drift detection:

- surface when Google Calendar was changed outside the app
- prompt Daniela to accept the app value or the calendar value

This avoids early complexity from a true bi-directional sync engine.

## Back Office UX Direction

The premium back office should center on clarity and calm:

- session detail becomes the operational cockpit
- client detail becomes the relationship timeline
- one-click actions for resend, remind, confirm, reschedule, cancel
- communication history sits near the session and client, not in a detached log only
- reminders, pending forms, and missing consent should become visible operational alerts

## Data Model Direction

### New / Updated Client Fields

- `gender`
- `preferred_language`
- `preferred_channel`
- normalized phone storage
- consent fields or related consent table

### New / Updated Session Fields

- `prepare_token`
- `prepare_token_expires_at`
- `google_calendar_event_id`
- `reminder_status`
- `last_reminder_sent_at`
- `next_reminder_due_at`
- `reschedule_reason`
- `rescheduled_from_session_id` or revision history support

### New Tables

- `returning_checkins`
- `message_log` or extend current log to multi-channel
- `consent_events` or a similarly auditable consent store
- optionally `message_templates` if template editing is later desired in-app

## Planned Copy / Question Changes

### Must Add

- explicit consent text in the first public form that asks for health data
- channel consent for service communication when the client chooses or confirms contact preferences

### Must Suppress for Returning Clients

- “How did you hear about us?” if already answered
- onboarding-only context already known and still valid

### Must Split

- first message for new clients
- first message for returning clients
- PT templates
- EN templates

### Gender Handling

- use gender-aware text only when the profile supports it
- otherwise use neutral wording

## Risks

- Hidden migration drift could invalidate assumptions unless fixed first.
- Inline template strings spread across API routes will become harder to maintain if not centralized early.
- If consent remains modeled only as booleans, later channel logic will become brittle and legally ambiguous.
- A rushed bi-directional calendar sync would create operational inconsistency instead of reducing it.

## Testing Strategy

### Data / Schema

- migration tests for new columns and tables
- clean-database smoke checks

### Journey Logic

- tests for new vs returning client path
- tests for service-specific form selection
- tests for language and channel fallback
- tests for reschedule and cancellation side effects

### Communication

- template resolution tests
- reminder scheduling tests
- provider adapter contract tests

### UX / Integration

- admin flows for create, resend, reschedule, cancel
- public flows for first-session form and returning-session check-in
- regression checks to confirm premium styling remains intact

## Phased Delivery Recommendation

### Phase 1: Foundation

- align schema and runtime
- add communication profile fields
- stabilize session lifecycle and journey decisions

### Phase 2: Consent and Messaging

- add consent capture and auditability
- centralize templates
- add language-aware and client-type-aware first messages

### Phase 3: Reminders and Session Operations

- add automated reminders
- add app-based reschedule and cancel flows
- improve session detail actions

### Phase 4: Premium Operations

- timeline view
- channel delivery visibility
- self-service client link
- drift detection for external calendar changes

## Acceptance Criteria

- A clean environment can run the app with matching schema and runtime assumptions.
- Daniela can distinguish new and returning clients reliably.
- Daniela can communicate in PT or EN based on profile, not only page toggle.
- Daniela can reschedule and cancel sessions from the app without losing calendar integrity.
- Reminder capability exists in the product model and can be wired to email and SMS/WhatsApp providers later without redesign.
- Existing forms and tone remain substantially intact, with only targeted logic-driven changes.
