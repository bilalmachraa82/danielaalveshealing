BEGIN;

-- H-3: Add 'birthday' to email_log type constraint
ALTER TABLE email_log DROP CONSTRAINT IF EXISTS email_log_email_type_check;
ALTER TABLE email_log ADD CONSTRAINT email_log_email_type_check
  CHECK (email_type IN (
    'anamnesis', 'intake_healing', 'intake_immersion', 'satisfaction',
    'review_request', 'reminder', 'pre_session_reminder', 'post_session_checkin',
    'rebooking', 'reactivation', 'birthday'
  ));

COMMIT;
