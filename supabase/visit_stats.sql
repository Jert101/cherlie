-- Supabase migration for global visit stats (GF world visits)
-- Run this in your Supabase SQL editor or migrations system

create table if not exists public.visit_stats (
  id text primary key,
  visit_count integer not null default 0,
  last_visit timestamptz not null default now()
);

alter table public.visit_stats enable row level security;

-- Allow anon/auth clients to read and write visit stats
create policy "Visit stats are readable"
  on public.visit_stats
  for select
  using (true);

create policy "Visit stats can be inserted"
  on public.visit_stats
  for insert
  with check (true);

create policy "Visit stats can be updated"
  on public.visit_stats
  for update
  using (true)
  with check (true);

