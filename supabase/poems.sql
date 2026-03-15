-- River of Poem: poems table for the BF to add poems for the GF
CREATE TABLE IF NOT EXISTS poems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_poems_order ON poems(order_index);
CREATE INDEX IF NOT EXISTS idx_poems_visible ON poems(visible);

ALTER TABLE poems ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read visible poems" ON poems;
CREATE POLICY "Allow public read visible poems" ON poems
  FOR SELECT USING (visible = true);

DROP POLICY IF EXISTS "Allow public insert poems" ON poems;
CREATE POLICY "Allow public insert poems" ON poems
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update poems" ON poems;
CREATE POLICY "Allow public update poems" ON poems
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete poems" ON poems;
CREATE POLICY "Allow public delete poems" ON poems
  FOR DELETE USING (true);
