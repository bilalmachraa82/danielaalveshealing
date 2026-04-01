BEGIN;

-- H-3: Add 'birthday' to email_log email_type constraint
ALTER TABLE email_log DROP CONSTRAINT IF EXISTS email_log_email_type_check;
ALTER TABLE email_log ADD CONSTRAINT email_log_email_type_check
  CHECK (email_type IN (
    'anamnesis', 'intake_healing', 'intake_immersion', 'satisfaction',
    'review_request', 'reminder', 'pre_session_reminder', 'post_session_checkin',
    'rebooking', 'reactivation', 'birthday'
  ));

-- L-4: Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
