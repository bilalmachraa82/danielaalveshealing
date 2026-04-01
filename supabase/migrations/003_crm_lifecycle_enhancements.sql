BEGIN;

-- ============================================================
-- CRM lifecycle enhancements
-- Consent governance, session self-service, and timeline logging
-- ============================================================

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS consent_health_data BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_health_data_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_health_data_source TEXT,
  ADD COLUMN IF NOT EXISTS service_consent_email BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS service_consent_sms BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS service_consent_whatsapp BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_consent_email BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_consent_sms BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_consent_whatsapp BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_version TEXT NOT NULL DEFAULT '2026-04',
  ADD COLUMN IF NOT EXISTS consent_updated_at TIMESTAMPTZ;

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS manage_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS manage_token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS client_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS calendar_sync_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (calendar_sync_status IN ('pending', 'synced', 'failed', 'not_configured')),
  ADD COLUMN IF NOT EXISTS calendar_last_synced_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_sessions_manage_token
  ON sessions(manage_token);

CREATE TABLE IF NOT EXISTS communication_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  channel TEXT NOT NULL
    CHECK (channel IN ('email', 'sms', 'whatsapp')),
  template_key TEXT NOT NULL,
  provider_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'sent'
    CHECK (status IN ('queued', 'sent', 'delivered', 'opened', 'failed', 'cancelled')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_communication_log_client
  ON communication_log(client_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_communication_log_session
  ON communication_log(session_id, sent_at DESC);

CREATE TABLE IF NOT EXISTS session_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  action TEXT NOT NULL
    CHECK (action IN ('created', 'confirmed', 'rescheduled', 'cancelled', 'completed', 'no_show', 'reminder_reset')),
  previous_status TEXT,
  new_status TEXT,
  previous_scheduled_at TIMESTAMPTZ,
  new_scheduled_at TIMESTAMPTZ,
  reason TEXT,
  actor TEXT NOT NULL DEFAULT 'system'
    CHECK (actor IN ('admin', 'client', 'system')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_change_log_session
  ON session_change_log(session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_session_change_log_client
  ON session_change_log(client_id, created_at DESC);

COMMIT;
