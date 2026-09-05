-- ================================================================
-- Any30: PUBLIC PLATFORM STATS & GAME PLAYS COUNTER
-- Migration: 005_public_visitor_and_game_stats.sql
-- ================================================================

create table if not exists public.platform_stats (
  metric_key text primary key,
  metric_name text not null,
  value bigint not null default 0,
  updated_at timestamptz not null default now()
);

-- Seed baseline metrics starting at 10 so it is not empty
insert into public.platform_stats (metric_key, metric_name, value)
values
  ('total_site_visits', 'Total Platform Visitors', 10),
  ('total_game_plays', 'Total Game Plays', 10),
  ('museum_game_plays', 'Digital Museum Plays', 10),
  ('canopy_game_plays', 'Canopy Run Plays', 0)
on conflict (metric_key) do update
  set value = case when platform_stats.value > 500 then 10 else platform_stats.value end;


-- Enable RLS
alter table public.platform_stats enable row level security;

-- Public read access for landing page & museum HUD
drop policy if exists "Public can read platform stats" on public.platform_stats;
create policy "Public can read platform stats"
  on public.platform_stats
  for select
  to anon, authenticated
  using (true);

-- Atomic increment function for website visits
create or replace function public.record_public_visit()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  new_visits bigint;
  new_plays bigint;
begin
  update public.platform_stats
  set value = value + 1, updated_at = now()
  where metric_key = 'total_site_visits'
  returning value into new_visits;

  select value into new_plays
  from public.platform_stats
  where metric_key = 'total_game_plays';

  return jsonb_build_object(
    'total_site_visits', coalesce(new_visits, 0),
    'total_game_plays', coalesce(new_plays, 0)
  );
end;
$$;

-- Atomic increment function for game plays (Museum or Canopy)
create or replace function public.record_game_play(experience_key text default 'museum')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  new_total bigint;
  new_exp bigint;
begin
  -- Increment overall game plays
  update public.platform_stats
  set value = value + 1, updated_at = now()
  where metric_key = 'total_game_plays'
  returning value into new_total;

  -- Increment experience-specific counter
  if experience_key = 'canopy' or experience_key = 'canopy_run' then
    update public.platform_stats
    set value = value + 1, updated_at = now()
    where metric_key = 'canopy_game_plays'
    returning value into new_exp;
  else
    update public.platform_stats
    set value = value + 1, updated_at = now()
    where metric_key = 'museum_game_plays'
    returning value into new_exp;
  end if;

  return jsonb_build_object(
    'total_game_plays', coalesce(new_total, 0),
    'experience_plays', coalesce(new_exp, 0)
  );
end;
$$;

-- Grant execution permissions to anon and authenticated visitors
grant usage on schema public to anon, authenticated;
grant select on public.platform_stats to anon, authenticated;
grant execute on function public.record_public_visit() to anon, authenticated;
grant execute on function public.record_game_play(text) to anon, authenticated;
