ALTER TABLE conversations ADD COLUMN IF NOT EXISTS communication_status VARCHAR(80);
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS journey_status_comment TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS ai_communication_summary TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS decision_detected BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_analyzed_at TIMESTAMP;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS analyzed_message_count INT NOT NULL DEFAULT 0;
