-- Quick fix: Add UPDATE policy for site_settings
-- Run this in Supabase SQL Editor if you're getting "Error saving settings"

-- Allow updates to site_settings (admin operations)
DROP POLICY IF EXISTS "Allow public update site settings" ON site_settings;
CREATE POLICY "Allow public update site settings" ON site_settings
  FOR UPDATE USING (true);

-- Also add policies for other admin operations
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

-- Games policies
DROP POLICY IF EXISTS "Allow public update games" ON games;
CREATE POLICY "Allow public update games" ON games
  FOR UPDATE USING (true);
