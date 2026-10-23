-- Run this once in Supabase: SQL Editor > New query > paste > Run.

-- One row per user per saved item (taste profile, history, ratings, journal...).
-- The value column holds the same JSON the site keeps in localStorage.
create table if not exists public.user_data (
  user_id    uuid not null references auth.users(id) on delete cascade,
  key        text not null,
  value      jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

-- Row level security: people can only see and change their own rows.
alter table public.user_data enable row level security;

create policy "read own data" on public.user_data
  for select to authenticated using (auth.uid() = user_id);

create policy "add own data" on public.user_data
  for insert to authenticated with check (auth.uid() = user_id);

create policy "change own data" on public.user_data
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delete own data" on public.user_data
  for delete to authenticated using (auth.uid() = user_id);


-- Feedback from the feedback page. Anyone can send it, nobody can read it from the site.
create table if not exists public.feedback (
  id              bigint generated always as identity primary key,
  user_id         uuid references auth.users(id) on delete set null,
  rating          int check (rating between 1 and 5),
  recommendations text,
  improve         text,
  created_at      timestamptz not null default now()
);

alter table public.feedback enable row level security;

create policy "anyone can send feedback" on public.feedback
  for insert to anon, authenticated
  with check (user_id is null or auth.uid() = user_id);
