ALTER TABLE opportunity_applications
    ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'Pending';

ALTER TABLE opportunity_applications
    ADD COLUMN IF NOT EXISTS review_notes TEXT;

ALTER TABLE opportunity_applications
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;
