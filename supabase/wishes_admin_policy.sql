-- Allow reading all wishes (for admin panel). Public Star Hill still filters by visible in the app.
-- Run once in Supabase SQL Editor if the admin panel should show hidden wishes too.
DROP POLICY IF EXISTS "Allow read all wishes for admin" ON public.wishes;
CREATE POLICY "Allow read all wishes for admin"
  ON public.wishes
  FOR SELECT
  USING (true);
