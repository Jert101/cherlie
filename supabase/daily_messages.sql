-- Supabase migration for daily love messages
-- Run this in your Supabase SQL editor or migrations system

create table if not exists public.daily_messages (
  id uuid primary key default uuid_generate_v4(),
  message text not null,
  order_index integer not null default 0,
  visible boolean not null default true
);

alter table public.daily_messages enable row level security;

-- Allow anon/auth clients to read visible messages
create policy "Daily messages are viewable when visible"
  on public.daily_messages
  for select
  using (visible = true);

