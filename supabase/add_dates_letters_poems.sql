-- Add optional date to letters and poems (display date, e.g. when the letter/poem was written)
-- Run this on existing databases. New installs can use schema.sql + poems.sql with date column.

-- Letters: add date column, backfill from created_at (date part) if null
ALTER TABLE letters ADD COLUMN IF NOT EXISTS date DATE;
UPDATE letters SET date = (created_at AT TIME ZONE 'UTC')::date WHERE date IS NULL;

-- Poems: add date column, backfill from created_at (date part) if null
ALTER TABLE poems ADD COLUMN IF NOT EXISTS date DATE;
UPDATE poems SET date = (created_at AT TIME ZONE 'UTC')::date WHERE date IS NULL;
