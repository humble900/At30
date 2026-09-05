-- Canopy Run: authoritative competition schema, prize tiers, atomic claim allocation & security
-- Migration: 004_canopy_run_competition.sql

create table if not exists public.competition_seasons (
  id uuid primary key default gen_random_uuid(),
  experience_key text not null default 'canopy_run',
  title text not null default 'Touch Grass: Canopy Run Season 1',
  sponsor text not null default 'FiledCrews',
  status text not null default 'live' check (status in ('draft','scheduled','live','review','complete','archived')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null default (now() + interval '30 days'),
  rules_version text not null default '2026-01-v1',
  claim_window_minutes integer not null default 15,
  created_at timestamptz not null default now()
);

create table if not exists public.competition_prize_tiers (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.competition_seasons(id) on delete cascade,
  position smallint not null check (position between 1 and 3),
  amount_usd integer not null check (amount_usd > 0),
  label text not null,
  sponsor_product text not null default 'FiledCrews Credit',
  state text not null default 'available' check (state in ('available','held','pending_review','approved','rejected','delivered')),
  claimed_at timestamptz,
  held_until timestamptz,
  unique(season_id, position)
);

create table if not exists public.competition_runs (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references public.competition_seasons(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 24),
  mode text not null default 'free_play' check (mode in ('practice','prize_race','free_play')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_ms integer check (duration_ms is null or duration_ms > 0),
  recoveries_count smallint not null default 0 check (recoveries_count >= 0),
  route_choice text not null default 'safe' check (route_choice in ('safe','shortcut','mixed')),
  avatar_color text not null default '#d97706',
  has_glasses boolean not null default true,
  status text not null default 'started' check (status in ('started','validated','flagged','disqualified')),
  idempotency_key uuid,
  validation_trace jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_comp_runs_leaderboard on public.competition_runs(season_id, duration_ms asc) where status = 'validated';
create index if not exists idx_comp_runs_user on public.competition_runs(user_id, created_at desc);

create table if not exists public.prize_claims (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.competition_seasons(id) on delete cascade,
  run_id uuid not null unique references public.competition_runs(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  prize_position smallint not null check (prize_position between 1 and 3),
  prize_amount_usd integer not null,
  email_ciphertext text not null,
  email_lookup_hash text not null,
  consent_given boolean not null default true,
  consented_at timestamptz not null default now(),
  status text not null default 'pending_review' check (status in ('held','pending_review','approved','rejected','expired','disqualified','delivered')),
  review_reason text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  submitted_at timestamptz not null default now()
);

create table if not exists public.competition_audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table public.competition_seasons enable row level security;
alter table public.competition_prize_tiers enable row level security;
alter table public.competition_runs enable row level security;
alter table public.prize_claims enable row level security;
alter table public.competition_audit_log enable row level security;

-- Public Read Policies
create policy "Public reads active competition seasons" on public.competition_seasons for select using (status in ('live','closed','review','complete'));
create policy "Public reads prize tier overview" on public.competition_prize_tiers for select using (exists (select 1 from public.competition_seasons s where s.id=season_id and s.status in ('live','closed','review','complete')));
create policy "Players read own competition runs" on public.competition_runs for select using (auth.uid() = user_id);
create policy "Players read own prize claims" on public.prize_claims for select using (auth.uid() = user_id);

-- Admin Full Access Policies
create policy "Admins manage competition seasons" on public.competition_seasons for all using (public.is_museum_admin(null));
create policy "Admins manage competition prize tiers" on public.competition_prize_tiers for all using (public.is_museum_admin(null));
create policy "Admins manage competition runs" on public.competition_runs for all using (public.is_museum_admin(null));
create policy "Admins manage prize claims" on public.prize_claims for all using (public.is_museum_admin(null));
create policy "Admins read competition audit log" on public.competition_audit_log for select using (public.is_museum_admin(null));

-- Public Safe Leaderboard View
create or replace view public.canopy_leaderboard_view as
select 
  r.id as run_id,
  r.season_id,
  r.display_name,
  r.duration_ms,
  r.recoveries_count,
  r.route_choice,
  r.avatar_color,
  r.has_glasses,
  r.finished_at,
  r.created_at,
  dense_rank() over (partition by r.season_id order by r.duration_ms asc) as rank
from public.competition_runs r
where r.status = 'validated' and r.duration_ms is not null;

grant select on public.canopy_leaderboard_view to anon, authenticated;

-- Seed default Live Season and Prize Ladder ($1,000, $700, $300 FiledCrews credits)
insert into public.competition_seasons (id, experience_key, title, sponsor, status)
values ('c0000000-0000-0000-0000-000000000001', 'canopy_run', 'Touch Grass: Canopy Run — Inaugural Season', 'FiledCrews', 'live')
on conflict (id) do update set status = 'live';

insert into public.competition_prize_tiers (season_id, position, amount_usd, label, sponsor_product, state)
values 
  ('c0000000-0000-0000-0000-000000000001', 1, 1000, 'First Place Winner', '$1,000 FiledCrews Credit', 'available'),
  ('c0000000-0000-0000-0000-000000000001', 2, 700, 'Second Place Winner', '$700 FiledCrews Credit', 'available'),
  ('c0000000-0000-0000-0000-000000000001', 3, 300, 'Third Place Winner', '$300 FiledCrews Credit', 'available')
on conflict (season_id, position) do nothing;
