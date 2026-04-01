BEGIN;

CREATE TABLE IF NOT EXISTS calendar_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_event_id TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  attendee_email TEXT,
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
