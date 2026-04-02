-- 007_premium_hardening.sql
-- Adds 'processing' to the reminder_status constraint so the cron claim step
-- does not violate the DB check constraint.
BEGIN;

ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_reminder_status_check;

ALTER TABLE sessions
  ADD CONSTRAINT sessions_reminder_status_check
  CHECK (reminder_status IN ('pending', 'scheduled', 'processing', 'sent', 'skipped'));

COMMIT;
