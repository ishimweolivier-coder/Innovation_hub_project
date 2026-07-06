CREATE TABLE IF NOT EXISTS startup_interests (
    id BIGSERIAL PRIMARY KEY,
    startup_id BIGINT NOT NULL REFERENCES startup_applications(id) ON DELETE CASCADE,
    investor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(startup_id, investor_id)
);

ALTER TABLE conversations ADD COLUMN IF NOT EXISTS participant_unread INT NOT NULL DEFAULT 0;
