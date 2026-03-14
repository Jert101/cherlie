-- Fix: Add missing site_name and gf_name columns to site_settings table
-- Run this in Supabase SQL Editor

-- Add site_name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'site_settings' AND column_name = 'site_name'
    ) THEN
        ALTER TABLE site_settings ADD COLUMN site_name VARCHAR(255) DEFAULT 'Our World';
        RAISE NOTICE 'Added site_name column';
    ELSE
        RAISE NOTICE 'site_name column already exists';
    END IF;
END $$;

-- Add gf_name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'site_settings' AND column_name = 'gf_name'
    ) THEN
        ALTER TABLE site_settings ADD COLUMN gf_name VARCHAR(255) DEFAULT 'baby';
        RAISE NOTICE 'Added gf_name column';
    ELSE
        RAISE NOTICE 'gf_name column already exists';
    END IF;
END $$;

-- Update existing row with default values if they are NULL
UPDATE site_settings 
SET 
    site_name = COALESCE(site_name, 'Our World'),
    gf_name = COALESCE(gf_name, 'baby')
WHERE id = '00000000-0000-0000-0000-000000000000';

-- Verify the columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'site_settings' 
ORDER BY ordinal_position;
