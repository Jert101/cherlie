-- Migration: Add dynamic site_name and gf_name fields to existing site_settings table
-- Run this if you already have the site_settings table created

-- Add site_name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'site_settings' AND column_name = 'site_name'
    ) THEN
        ALTER TABLE site_settings ADD COLUMN site_name VARCHAR(255) DEFAULT 'SoLuna';
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
    END IF;
END $$;

-- Update existing row with default values if they are NULL
UPDATE site_settings 
SET 
    site_name = COALESCE(site_name, 'SoLuna'),
    gf_name = COALESCE(gf_name, 'baby')
WHERE id = '00000000-0000-0000-0000-000000000000';
