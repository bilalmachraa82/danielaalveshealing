BEGIN;

CREATE INDEX IF NOT EXISTS idx_returning_checkins_client_completed
  ON returning_checkins(client_id, completed_at DESC);

COMMIT;
