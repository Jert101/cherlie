-- Fix: Hide/Visible buttons not working in admin panel
-- Admin panels need to READ ALL rows (including hidden) so Hide/Show keeps items in the list with a badge.
-- Run this once in Supabase → SQL Editor.

-- ========== DAILY MESSAGES ==========
DROP POLICY IF EXISTS "Allow public read all daily messages" ON public.daily_messages;
CREATE POLICY "Allow public read all daily messages"
  ON public.daily_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert daily messages" ON public.daily_messages;
CREATE POLICY "Allow public insert daily messages"
  ON public.daily_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update daily messages" ON public.daily_messages;
CREATE POLICY "Allow public update daily messages"
  ON public.daily_messages FOR UPDATE USING (true) WITH CHECK (true);

-- ========== MEMORIES ==========
DROP POLICY IF EXISTS "Allow public read all memories" ON public.memories;
CREATE POLICY "Allow public read all memories" ON public.memories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public update memories" ON public.memories;
CREATE POLICY "Allow public update memories" ON public.memories
  FOR UPDATE USING (true) WITH CHECK (true);

-- ========== LETTERS ==========
DROP POLICY IF EXISTS "Allow public read all letters" ON public.letters;
CREATE POLICY "Allow public read all letters" ON public.letters FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public update letters" ON public.letters;
CREATE POLICY "Allow public update letters" ON public.letters
  FOR UPDATE USING (true) WITH CHECK (true);

-- ========== POEMS (River of Poem) ==========
DROP POLICY IF EXISTS "Allow public read all poems" ON public.poems;
CREATE POLICY "Allow public read all poems" ON public.poems FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public update poems" ON public.poems;
CREATE POLICY "Allow public update poems" ON public.poems
  FOR UPDATE USING (true) WITH CHECK (true);

-- ========== SURPRISES ==========
DROP POLICY IF EXISTS "Allow public read all surprises" ON public.surprises;
CREATE POLICY "Allow public read all surprises" ON public.surprises FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public update surprises" ON public.surprises;
CREATE POLICY "Allow public update surprises" ON public.surprises
  FOR UPDATE USING (true) WITH CHECK (true);
