-- Run this once in Supabase: SQL Editor > New query > paste > Run.
-- After that, add restaurants in Table Editor > restaurants > Insert row.

create table if not exists public.restaurants (
  id         bigint generated always as identity primary key,
  name       text not null,
  cuisine    text not null,   -- one of: Italian, Mexican, Chinese, Thai, American, Indian
  budget     text not null check (budget in ('$', '$$', '$$$')),
  moods      text[] not null default '{}',  -- any of: Warm & comforting, Spicy & bold, Light & fresh, Rich & indulgent
  miles      numeric,         -- rough distance from campus
  address    text not null,
  doordash_url text,          -- link to the restaurant on DoorDash (optional)
  ubereats_url text,          -- link to the restaurant on Uber Eats (optional)
  created_at timestamptz not null default now()
);

-- Everyone can read the list. Only you (from the Supabase dashboard) can add or change rows.
alter table public.restaurants enable row level security;

create policy "anyone can read restaurants" on public.restaurants
  for select to anon, authenticated using (true);

-- The first restaurant, same as the one in restaurants.js
insert into public.restaurants (name, cuisine, budget, moods, miles, address)
values ('Punjabi Dhaba', 'Indian', '$', '{"Warm & comforting","Spicy & bold"}', 1,
        '225 Hampshire St, Cambridge, MA 02139');
