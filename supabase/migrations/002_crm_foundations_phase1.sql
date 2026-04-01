BEGIN;

-- ============================================================
-- Daniela Alves CRM - Foundations Phase 1
-- Runtime/schema alignment + communication profile + reminders
-- ============================================================

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('female', 'male')),
  ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'pt'
    CHECK (preferred_language IN ('pt', 'en')),
  ADD COLUMN IF NOT EXISTS preferred_channel TEXT NOT NULL DEFAULT 'email'
    CHECK (preferred_channel IN ('email', 'sms', 'whatsapp'));

ALTER TABLE sessions
  DROP CONSTRAINT IF EXISTS sessions_service_type_check;

ALTER TABLE sessions
  ADD CONSTRAINT sessions_service_type_check
  CHECK (
    service_type IN (
      'healing_wellness',
      'pura_radiancia',
      'pure_earth_love',
      'home_harmony',
      'other'
    )
  );

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS prepare_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS prepare_token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS google_calendar_event_id TEXT,
  ADD COLUMN IF NOT EXISTS reminder_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (reminder_status IN ('pending', 'scheduled', 'sent', 'skipped')),
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

CREATE INDEX IF NOT EXISTS idx_returning_checkins_client
  ON returning_checkins(client_id);

CREATE INDEX IF NOT EXISTS idx_returning_checkins_session
  ON returning_checkins(session_id);

ALTER TABLE email_log
  DROP CONSTRAINT IF EXISTS email_log_email_type_check;

ALTER TABLE email_log
  ADD CONSTRAINT email_log_email_type_check
  CHECK (
    email_type IN (
      'anamnesis',
      'intake_healing',
      'intake_immersion',
      'satisfaction',
      'review_request',
      'reminder',
      'pre_session_reminder',
      'post_session_checkin',
      'rebooking',
      'reactivation'
    )
  );

COMMIT;
