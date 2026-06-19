-- Add optional title field for internal descriptive names on quotations
-- This field is for in-house use only and is NOT included in PDF output
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS title TEXT;

COMMENT ON COLUMN quotations.title IS 'Internal descriptive name (e.g. "Jane''s Wedding 500pax"). Not shown on customer-facing PDFs.';
