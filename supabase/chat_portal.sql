-- Supabase migration for Portal Chat (ephemeral chat)
-- Behavior:
-- - Conversation is deleted when BOTH GF and BF close the portal.
-- - If only one closes, a delete_at timestamp is set (30 minutes) and the conversation
--   is deleted when either side next loads the portal after that time.

create table if not exists public.chat_portal (
  id uuid primary key,
  closed_by_gf boolean not null default false,
  closed_by_bf boolean not null default false,
  delete_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  portal_id uuid not null references public.chat_portal(id) on delete cascade,
  sender_role text not null check (sender_role in ('gf','bf')),
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_messages_portal_created on public.chat_messages(portal_id, created_at);

alter table public.chat_portal enable row level security;
alter table public.chat_messages enable row level security;

-- Read portal + messages
drop policy if exists "Allow read chat portal" on public.chat_portal;
create policy "Allow read chat portal"
  on public.chat_portal
  for select
  using (true);

drop policy if exists "Allow read chat messages" on public.chat_messages;
create policy "Allow read chat messages"
  on public.chat_messages
  for select
  using (true);

-- Insert messages
drop policy if exists "Allow insert chat messages" on public.chat_messages;
create policy "Allow insert chat messages"
  on public.chat_messages
  for insert
  with check (true);

-- Insert portal row (needed so message FK works)
drop policy if exists "Allow insert chat portal" on public.chat_portal;
create policy "Allow insert chat portal"
  on public.chat_portal
  for insert
  with check (true);

-- Update portal (close flags / delete_at) and delete portal
drop policy if exists "Allow update chat portal" on public.chat_portal;
create policy "Allow update chat portal"
  on public.chat_portal
  for update
  using (true);

drop policy if exists "Allow delete chat portal" on public.chat_portal;
create policy "Allow delete chat portal"
  on public.chat_portal
  for delete
  using (true);

-- Ensure anon can use these tables via PostgREST
grant usage on schema public to anon;
grant select, insert, update, delete on public.chat_portal to anon;
grant select, insert, update, delete on public.chat_messages to anon;

