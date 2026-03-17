-- Supabase migration for Prayer Wall (prayers table)
-- Run this in your Supabase SQL editor or migrations system

create table if not exists public.prayers (
  id uuid primary key default uuid_generate_v4(),
  message text not null,
  author_role text not null default 'gf',
  created_at timestamptz not null default now(),
  visible boolean not null default true
);

-- Basic row level security (RLS) setup
alter table public.prayers enable row level security;

-- Allow anyone using the anon key to read visible prayers (WorldMap filters visible too)
drop policy if exists "Prayers are viewable when visible" on public.prayers;
create policy "Prayers are viewable when visible"
  on public.prayers
  for select
  using (visible = true);

-- Allow insert prayers (the app UI restricts to gf/bf, but DB is permissive for this private app)
drop policy if exists "Anyone can insert prayers" on public.prayers;
create policy "Anyone can insert prayers"
  on public.prayers
  for insert
  with check (true);

-- Allow reading all prayers (for admin panel)
drop policy if exists "Allow read all prayers for admin" on public.prayers;
create policy "Allow read all prayers for admin"
  on public.prayers
  for select
  using (true);

-- Allow admin operations (toggle visibility, edit, delete)
drop policy if exists "Allow public update prayers" on public.prayers;
create policy "Allow public update prayers"
  on public.prayers
  for update
  using (true);

drop policy if exists "Allow public delete prayers" on public.prayers;
create policy "Allow public delete prayers"
  on public.prayers
  for delete
  using (true);

