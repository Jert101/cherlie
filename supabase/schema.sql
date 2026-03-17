-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Memories table
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  date DATE NOT NULL,
  location VARCHAR(255),
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Letters table
CREATE TABLE IF NOT EXISTS letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  date DATE,
  order_index INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Surprises table
CREATE TABLE IF NOT EXISTS surprises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('message', 'audio', 'image')),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  position VARCHAR(100) DEFAULT 'star-hill',
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prayers table (Prayer Wall)
CREATE TABLE IF NOT EXISTS prayers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  author_role TEXT NOT NULL DEFAULT 'gf',
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_name VARCHAR(100) NOT NULL UNIQUE,
  success_message TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site settings table (single row)
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name VARCHAR(255) DEFAULT 'SoLuna',
  gf_name VARCHAR(255) DEFAULT 'baby',
  gf_code VARCHAR(100) DEFAULT 'love2024',
  admin_code VARCHAR(100) DEFAULT 'admin2024',
  special_star_enabled BOOLEAN DEFAULT false,
  special_star_date DATE,
  special_star_message TEXT,
  time_lock_enabled BOOLEAN DEFAULT false,
  unlock_date TIMESTAMP WITH TIME ZONE,
  music_url TEXT,
  rocket_delay INTEGER DEFAULT 2000,
  planet_rotation_speed DECIMAL(3,2) DEFAULT 0.5,
  final_message TEXT DEFAULT 'Will you be mine forever?',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default site settings if not exists
-- NOTE: Change these codes immediately after first login for security!
-- This handles both old and new table structures
DO $$
BEGIN
    -- Check if row exists
    IF NOT EXISTS (SELECT 1 FROM site_settings WHERE id = '00000000-0000-0000-0000-000000000000') THEN
        -- Check if new columns exist
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'site_settings' AND column_name = 'site_name'
        ) THEN
            -- New structure with site_name and gf_name
            INSERT INTO site_settings (id, site_name, gf_name, gf_code, admin_code)
            VALUES ('00000000-0000-0000-0000-000000000000', 'SoLuna', 'baby', 'love2024', 'admin2024');
        ELSE
            -- Old structure without site_name and gf_name
            INSERT INTO site_settings (id, gf_code, admin_code)
            VALUES ('00000000-0000-0000-0000-000000000000', 'love2024', 'admin2024');
        END IF;
    END IF;
END $$;

-- Insert default games
INSERT INTO games (game_name, success_message, enabled) VALUES
  ('memory-puzzle', 'You solved it! Just like you solve my heart every day ❤️', true),
  ('heart-catcher', 'You caught my heart! It was always yours anyway 💕', true),
  ('timeline-runner', 'You made it through our timeline! Here''s to many more chapters together 🌟', true)
ON CONFLICT (game_name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_memories_visible ON memories(visible);
CREATE INDEX IF NOT EXISTS idx_letters_order ON letters(order_index);
CREATE INDEX IF NOT EXISTS idx_letters_visible ON letters(visible);
CREATE INDEX IF NOT EXISTS idx_surprises_visible ON surprises(visible);
CREATE INDEX IF NOT EXISTS idx_games_enabled ON games(enabled);
CREATE INDEX IF NOT EXISTS idx_prayers_created_at ON prayers(created_at);
CREATE INDEX IF NOT EXISTS idx_prayers_visible ON prayers(visible);

-- Enable Row Level Security (RLS)
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE surprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read access to visible content
-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Allow public read visible memories" ON memories;
CREATE POLICY "Allow public read visible memories" ON memories
  FOR SELECT USING (visible = true);

DROP POLICY IF EXISTS "Allow public read visible letters" ON letters;
CREATE POLICY "Allow public read visible letters" ON letters
  FOR SELECT USING (visible = true);

DROP POLICY IF EXISTS "Allow public read visible surprises" ON surprises;
CREATE POLICY "Allow public read visible surprises" ON surprises
  FOR SELECT USING (visible = true);

DROP POLICY IF EXISTS "Allow public read enabled games" ON games;
CREATE POLICY "Allow public read enabled games" ON games
  FOR SELECT USING (enabled = true);

DROP POLICY IF EXISTS "Prayers are viewable when visible" ON prayers;
CREATE POLICY "Prayers are viewable when visible" ON prayers
  FOR SELECT USING (visible = true);

DROP POLICY IF EXISTS "Allow read all prayers for admin" ON prayers;
CREATE POLICY "Allow read all prayers for admin" ON prayers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read site settings" ON site_settings;
CREATE POLICY "Allow public read site settings" ON site_settings
  FOR SELECT USING (true);

-- Allow updates to site_settings (admin operations)
-- Note: In production, consider using service role key or authenticated users for better security
DROP POLICY IF EXISTS "Allow public update site settings" ON site_settings;
CREATE POLICY "Allow public update site settings" ON site_settings
  FOR UPDATE USING (true);

-- Admin operations: Allow INSERT, UPDATE, DELETE for all content tables
-- Memories policies
DROP POLICY IF EXISTS "Allow public insert memories" ON memories;
CREATE POLICY "Allow public insert memories" ON memories
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update memories" ON memories;
CREATE POLICY "Allow public update memories" ON memories
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete memories" ON memories;
CREATE POLICY "Allow public delete memories" ON memories
  FOR DELETE USING (true);

-- Letters policies
DROP POLICY IF EXISTS "Allow public insert letters" ON letters;
CREATE POLICY "Allow public insert letters" ON letters
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update letters" ON letters;
CREATE POLICY "Allow public update letters" ON letters
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete letters" ON letters;
CREATE POLICY "Allow public delete letters" ON letters
  FOR DELETE USING (true);

-- Surprises policies
DROP POLICY IF EXISTS "Allow public insert surprises" ON surprises;
CREATE POLICY "Allow public insert surprises" ON surprises
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update surprises" ON surprises;
CREATE POLICY "Allow public update surprises" ON surprises
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete surprises" ON surprises;
CREATE POLICY "Allow public delete surprises" ON surprises
  FOR DELETE USING (true);

-- Prayers policies
DROP POLICY IF EXISTS "Anyone can insert prayers" ON prayers;
CREATE POLICY "Anyone can insert prayers" ON prayers
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update prayers" ON prayers;
CREATE POLICY "Allow public update prayers" ON prayers
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete prayers" ON prayers;
CREATE POLICY "Allow public delete prayers" ON prayers
  FOR DELETE USING (true);

-- Games policies
DROP POLICY IF EXISTS "Allow public update games" ON games;
CREATE POLICY "Allow public update games" ON games
  FOR UPDATE USING (true);

-- Note: For more secure admin operations, you can:
-- 1. Use service role key on the server-side
-- 2. Set up authenticated users with specific roles
-- 3. Add additional checks in the policies (e.g., check for admin code)
