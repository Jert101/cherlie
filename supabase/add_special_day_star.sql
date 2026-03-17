-- Add Special Day Star fields to site_settings
-- Run this in Supabase SQL Editor

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'special_star_enabled'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN special_star_enabled BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'special_star_date'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN special_star_date DATE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'special_star_message'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN special_star_message TEXT;
  END IF;
END $$;

-- Optional: backfill defaults for the singleton row
UPDATE site_settings
SET
  special_star_enabled = COALESCE(special_star_enabled, false),
  special_star_message = COALESCE(special_star_message, '')
WHERE id = '00000000-0000-0000-0000-000000000000';

