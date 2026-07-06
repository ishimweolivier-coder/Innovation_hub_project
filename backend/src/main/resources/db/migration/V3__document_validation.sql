ALTER TABLE ai_assessments
    ADD COLUMN IF NOT EXISTS documents_valid BOOLEAN DEFAULT TRUE;

ALTER TABLE ai_assessments
    ADD COLUMN IF NOT EXISTS validation_issues TEXT;
