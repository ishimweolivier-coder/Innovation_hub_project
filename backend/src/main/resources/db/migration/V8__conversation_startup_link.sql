ALTER TABLE conversations ADD COLUMN IF NOT EXISTS startup_id BIGINT REFERENCES startup_applications(id) ON DELETE SET NULL;
