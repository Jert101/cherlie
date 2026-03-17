-- HARDEN_SECURITY.sql
-- Goal: prevent attackers (anon key / public internet) from modifying your database.
-- This removes permissive RLS policies and makes tables read-only for public users.
--
-- IMPORTANT:
-- - After running this, your current app (which writes directly from the browser using anon)
--   will NOT be able to create/update/delete content from the UI/admin panel.
-- - This is intentional: it is the only way to stop “anyone can write” attacks without real auth.
--
-- Next step after hardening:
-- - Move all writes to server-side routes (service role) OR implement Supabase Auth + strict RLS.

-- Helper: enable RLS everywhere we care about
alter table if exists public.site_settings enable row level security;
alter table if exists public.memories enable row level security;
alter table if exists public.letters enable row level security;
alter table if exists public.poems enable row level security;
alter table if exists public.surprises enable row level security;
alter table if exists public.daily_messages enable row level security;
alter table if exists public.wishes enable row level security;
alter table if exists public.prayers enable row level security;
alter table if exists public.chat_portal enable row level security;
alter table if exists public.chat_messages enable row level security;
alter table if exists public.visit_stats enable row level security;

-- =========
-- site_settings (read-only)
-- =========
drop policy if exists "Allow public read site settings" on public.site_settings;
create policy "Allow public read site settings"
  on public.site_settings
  for select
  using (true);

drop policy if exists "Allow public update site settings" on public.site_settings;
-- No UPDATE/INSERT/DELETE policies => public cannot change codes/locks/messages.

-- =========
-- Content tables (public can READ visible only)
-- =========
drop policy if exists "Allow public read visible memories" on public.memories;
create policy "Public read visible memories"
  on public.memories for select
  using (visible = true);

drop policy if exists "Allow public read visible letters" on public.letters;
create policy "Public read visible letters"
  on public.letters for select
  using (visible = true);

drop policy if exists "Allow public read visible surprises" on public.surprises;
create policy "Public read visible surprises"
  on public.surprises for select
  using (visible = true);

drop policy if exists "Allow public read visible poems" on public.poems;
create policy "Public read visible poems"
  on public.poems for select
  using (visible = true);

drop policy if exists "Daily messages are viewable when visible" on public.daily_messages;
create policy "Public read visible daily messages"
  on public.daily_messages for select
  using (visible = true);

drop policy if exists "Wishes are viewable when visible" on public.wishes;
create policy "Public read visible wishes"
  on public.wishes for select
  using (visible = true);

drop policy if exists "Prayers are viewable when visible" on public.prayers;
create policy "Public read visible prayers"
  on public.prayers for select
  using (visible = true);

-- =========
-- Remove ALL public write policies (INSERT/UPDATE/DELETE) on content tables
-- (these were the primary “hacker can modify DB” vectors)
-- =========
-- memories
drop policy if exists "Allow public insert memories" on public.memories;
drop policy if exists "Allow public update memories" on public.memories;
drop policy if exists "Allow public delete memories" on public.memories;

-- letters
drop policy if exists "Allow public insert letters" on public.letters;
drop policy if exists "Allow public update letters" on public.letters;
drop policy if exists "Allow public delete letters" on public.letters;

-- poems
drop policy if exists "Allow public insert poems" on public.poems;
drop policy if exists "Allow public update poems" on public.poems;
drop policy if exists "Allow public delete poems" on public.poems;
drop policy if exists "Allow public read all poems" on public.poems;

-- surprises
drop policy if exists "Allow public insert surprises" on public.surprises;
drop policy if exists "Allow public update surprises" on public.surprises;
drop policy if exists "Allow public delete surprises" on public.surprises;
drop policy if exists "Allow public read all surprises" on public.surprises;

-- daily_messages
drop policy if exists "Allow public read all daily messages" on public.daily_messages;
drop policy if exists "Allow public insert daily messages" on public.daily_messages;
drop policy if exists "Allow public update daily messages" on public.daily_messages;

-- wishes
drop policy if exists "Anyone can insert wishes" on public.wishes;
drop policy if exists "Allow read all wishes for admin" on public.wishes;

-- prayers
drop policy if exists "Anyone can insert prayers" on public.prayers;
drop policy if exists "Allow read all prayers for admin" on public.prayers;
drop policy if exists "Allow public update prayers" on public.prayers;
drop policy if exists "Allow public delete prayers" on public.prayers;

-- chat portal/messages (read-only to public; no write)
drop policy if exists "Allow read chat portal" on public.chat_portal;
create policy "Public read chat portal"
  on public.chat_portal for select using (true);
drop policy if exists "Allow insert chat portal" on public.chat_portal;
drop policy if exists "Allow update chat portal" on public.chat_portal;
drop policy if exists "Allow delete chat portal" on public.chat_portal;

drop policy if exists "Allow read chat messages" on public.chat_messages;
create policy "Public read chat messages"
  on public.chat_messages for select using (true);
drop policy if exists "Allow insert chat messages" on public.chat_messages;

-- visit_stats (stop public tampering)
drop policy if exists "Visit stats are readable" on public.visit_stats;
drop policy if exists "Visit stats can be inserted" on public.visit_stats;
drop policy if exists "Visit stats can be updated" on public.visit_stats;

-- =========
-- Storage (strongly recommended): remove public write policies
-- =========
-- NOTE: storage.objects is a special table. These policy names come from your storage_setup.sql.
drop policy if exists "Allow public uploads" on storage.objects;
drop policy if exists "Allow public updates" on storage.objects;
drop policy if exists "Allow public deletes" on storage.objects;
-- Keep/replace read policy depending on whether your bucket is public or private.

