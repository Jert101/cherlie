-- Supabase Storage Setup for Image Uploads
-- Run this in Supabase SQL Editor to set up the storage bucket

-- Note: Storage buckets are created through the Supabase Dashboard UI, not SQL
-- But we can set up the policies here

-- After creating the bucket manually:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Name it "memories"
-- 4. Make it PUBLIC
-- 5. Then run the policies below

-- Storage policies for public access (read)
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'memories');

-- Storage policies for authenticated uploads (using anon key)
-- This allows the admin panel to upload images
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'memories');

-- Allow updates (in case we need to replace images)
CREATE POLICY "Allow public updates" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'memories');

-- Allow deletes (for removing old images)
CREATE POLICY "Allow public deletes" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'memories');
