-- Fix: River of Poem admin panel — Hide button not working
-- Run this in Supabase → SQL Editor.

-- 1) Let admin load ALL poems (including hidden), so the list shows them with "(Hidden)" badge
DROP POLICY IF EXISTS "Allow public read all poems" ON public.poems;
CREATE POLICY "Allow public read all poems" ON public.poems
  FOR SELECT USING (true);

-- 2) Let admin update poems (visibility toggle, edit, reorder)
DROP POLICY IF EXISTS "Allow public update poems" ON public.poems;
CREATE POLICY "Allow public update poems" ON public.poems
  FOR UPDATE USING (true) WITH CHECK (true);
