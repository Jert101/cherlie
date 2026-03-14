-- Add bf_code to site_settings for boyfriend access
-- Run once in Supabase SQL editor

alter table public.site_settings
  add column if not exists bf_code text;

