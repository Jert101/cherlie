-- Supabase migration for wishes table
-- Run this in your Supabase SQL editor or migrations system

create table if not exists public.wishes (
  id uuid primary key default uuid_generate_v4(),
  message text not null,
  created_at timestamptz not null default now(),
  visible boolean not null default true
);

-- Basic row level security (RLS) setup
alter table public.wishes enable row level security;

-- For this private app we allow both anon and authenticated roles.

-- Allow anyone using the anon key to read visible wishes
create policy "Wishes are viewable when visible"
  on public.wishes
  for select
  using (visible = true);

-- Allow anyone using the anon key to insert wishes
create policy "Anyone can insert wishes"
  on public.wishes
  for insert
  with check (true);

-- Allow reading all wishes (for admin panel: BF can see every wish from Star Hill).
-- Star Hill still shows only visible wishes in the app via .eq('visible', true).
create policy "Allow read all wishes for admin"
  on public.wishes
  for select
  using (true);

