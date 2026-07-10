-- Add CASCADE delete on all foreign keys referencing users
-- Drop duplicate auto-generated constraints first, then ensure CASCADE

DO $$DECLARE
  rec RECORD;
BEGIN
  FOR rec IN (
    SELECT conname, conrelid::regclass AS tbl
    FROM pg_constraint
    WHERE confrelid = 'users'::regclass
      AND contype = 'f'
      AND confdeltype = 'a'
    ORDER BY tbl
  ) LOOP
    EXECUTE 'ALTER TABLE ' || rec.tbl || ' DROP CONSTRAINT IF EXISTS ' || rec.conname;
  END LOOP;
END$$;

-- Ensure existing named constraints have CASCADE (idempotent)
ALTER TABLE admin_login_otps         DROP CONSTRAINT IF EXISTS admin_login_otps_user_id_fkey;
ALTER TABLE admin_login_otps         ADD CONSTRAINT admin_login_otps_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE conversations            DROP CONSTRAINT IF EXISTS conversations_user_id_fkey;
ALTER TABLE conversations            ADD CONSTRAINT conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE conversations            DROP CONSTRAINT IF EXISTS conversations_participant_id_fkey;
ALTER TABLE conversations            ADD CONSTRAINT conversations_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE event_registrations      DROP CONSTRAINT IF EXISTS event_registrations_user_id_fkey;
ALTER TABLE event_registrations      ADD CONSTRAINT event_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE investments              DROP CONSTRAINT IF EXISTS investments_investor_id_fkey;
ALTER TABLE investments              ADD CONSTRAINT investments_investor_id_fkey FOREIGN KEY (investor_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE investor_matches         DROP CONSTRAINT IF EXISTS investor_matches_investor_id_fkey;
ALTER TABLE investor_matches         ADD CONSTRAINT investor_matches_investor_id_fkey FOREIGN KEY (investor_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE messages                 DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE messages                 ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE notifications            DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE notifications            ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE opportunity_applications DROP CONSTRAINT IF EXISTS opportunity_applications_user_id_fkey;
ALTER TABLE opportunity_applications ADD CONSTRAINT opportunity_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE password_reset_tokens    DROP CONSTRAINT IF EXISTS password_reset_tokens_user_id_fkey;
ALTER TABLE password_reset_tokens    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE startup_applications     DROP CONSTRAINT IF EXISTS startup_applications_founder_id_fkey;
ALTER TABLE startup_applications     ADD CONSTRAINT startup_applications_founder_id_fkey FOREIGN KEY (founder_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE startup_interests        DROP CONSTRAINT IF EXISTS startup_interests_investor_id_fkey;
ALTER TABLE startup_interests        ADD CONSTRAINT startup_interests_investor_id_fkey FOREIGN KEY (investor_id) REFERENCES users(id) ON DELETE CASCADE;
