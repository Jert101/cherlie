-- Portal Chat upgrades: reactions + unsend
-- Run AFTER supabase/chat_portal.sql

-- 1) Add soft-unsend fields to messages
alter table if exists public.chat_messages
  add column if not exists is_unsent boolean not null default false,
  add column if not exists unsent_at timestamptz,
  add column if not exists unsent_by text;

-- 2) Reactions table (per-message emoji)
create table if not exists public.chat_reactions (
  id uuid primary key default uuid_generate_v4(),
  portal_id uuid not null references public.chat_portal(id) on delete cascade,
  message_id uuid not null references public.chat_messages(id) on delete cascade,
  reactor_role text not null check (reactor_role in ('gf','bf')),
  emoji text not null,
  created_at timestamptz not null default now(),
  unique (message_id, reactor_role, emoji)
);

create index if not exists idx_chat_reactions_portal_created on public.chat_reactions(portal_id, created_at);
create index if not exists idx_chat_reactions_message on public.chat_reactions(message_id);

alter table public.chat_reactions enable row level security;

-- Policies
drop policy if exists "Allow read chat reactions" on public.chat_reactions;
create policy "Allow read chat reactions"
  on public.chat_reactions
  for select
  using (true);

drop policy if exists "Allow insert chat reactions" on public.chat_reactions;
create policy "Allow insert chat reactions"
  on public.chat_reactions
  for insert
  with check (true);

drop policy if exists "Allow delete chat reactions" on public.chat_reactions;
create policy "Allow delete chat reactions"
  on public.chat_reactions
  for delete
  using (true);

-- Allow unsend (update message row)
drop policy if exists "Allow update chat messages" on public.chat_messages;
create policy "Allow update chat messages"
  on public.chat_messages
  for update
  using (true);

-- Grants for anon
grant usage on schema public to anon;
grant select, insert, update, delete on public.chat_reactions to anon;

