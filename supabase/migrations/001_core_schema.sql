-- ================================================================
-- AT30 METAVERSE MUSEUM & TELEMETRY ENGINE: CORE DATABASE SCHEMA
-- Migration: 001_core_schema.sql
-- ================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. ADMIN USERS & ROLES
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  role text not null default 'superadmin' check (role in ('superadmin', 'curator', 'analyst', 'sponsor_viewer')),
  assigned_brand_key text,
  created_at timestamptz default now()
);

-- 2. BRANDS (Wing Owners)
create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null,
  tagline text not null,
  wing_name text not null,
  theme_color text not null default '#00F0FF',
  banner_gradient text not null default 'linear-gradient(135deg, #0052D4 0%, #4364F7 100%)',
  logo_url text,
  website_url text not null,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 3. EXHIBITS (Pedestals, Screens, Crystals, Wall Art)
create table if not exists exhibits (
  id text primary key,
  brand_key text not null references brands(key) on update cascade on delete cascade,
  brand_name text not null,
  brand_tagline text not null,
  title text not null,
  wing text not null,
  position_x numeric not null,
  position_y numeric not null,
  position_z numeric not null,
  rotation_y numeric not null default 0,
  type text not null check (type in ('screen', 'painting', 'pedestal', 'kiosk', 'crystal')),
  description text not null,
  detailed_story text not null,
  clue_hint text not null,
  puzzle_type text not null default 'inspect_uv',
  coupon_code text not null,
  coupon_discount text not null,
  redeem_url text not null,
  features text[] default '{}',
  banner_gradient text not null,
  theme_color text not null,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 4. REWARD COUPONS
create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  brand_key text not null references brands(key) on update cascade on delete cascade,
  code text not null,
  discount_text text not null,
  redeem_url text not null,
  max_claims int default 10000,
  current_claims int default 0,
  is_active boolean default true,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- 5. MASTERPIECE ARTWORKS (Hallways)
create table if not exists artworks (
  id text primary key,
  title text not null,
  artist text not null,
  year text not null,
  medium text not null,
  location text not null,
  image_url text not null,
  description text not null,
  position_index int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 6. GLOBAL MUSEUM CONFIG & LIVE OPS
create table if not exists museum_config (
  id int primary key default 1,
  museum_name text default 'AT30 Digital Museum',
  tagline text default 'The Future, Curated.',
  maintenance_mode boolean default false,
  maintenance_message text default 'The museum is currently undergoing an exhibition curation update. Please check back shortly.',
  global_announcement text default '',
  announcement_active boolean default false,
  spawn_x numeric default 0,
  spawn_y numeric default 0,
  spawn_z numeric default 8.5,
  spawn_rotation numeric default 3.14159,
  fog_color text default '#0C0E14',
  fog_density numeric default 0.012,
  ambient_light_intensity numeric default 0.45,
  max_concurrent_players int default 50,
  updated_at timestamptz default now()
);

-- 7. VISITOR SESSIONS (Per visitor visit)
create table if not exists visitor_sessions (
  id uuid primary key default gen_random_uuid(),
  visitor_name text not null,
  avatar_color text not null,
  device_type text default 'desktop',
  input_mode text default 'keyboard_mouse',
  browser text,
  os text,
  screen_resolution text,
  gpu_renderer text,
  avg_fps numeric default 60,
  session_duration_seconds int default 0,
  wings_visited text[] default '{}',
  exhibits_inspected text[] default '{}',
  coupons_claimed text[] default '{}',
  completed_quest boolean default false,
  exited_via_portal boolean default false,
  started_at timestamptz default now(),
  ended_at timestamptz
);

-- 8. TELEMETRY EVENTS (High-Volume Stream)
create table if not exists telemetry_events (
  id bigint generated always as identity primary key,
  session_id uuid references visitor_sessions(id) on delete cascade,
  event_type text not null,
  brand_key text,
  exhibit_id text,
  payload jsonb default '{}'::jsonb,
  timestamp timestamptz default now()
);

create index if not exists idx_telemetry_event_type on telemetry_events(event_type, timestamp desc);
create index if not exists idx_telemetry_session on telemetry_events(session_id);
create index if not exists idx_telemetry_brand on telemetry_events(brand_key, event_type);
create index if not exists idx_sessions_started_at on visitor_sessions(started_at desc);

-- 9. SPATIAL SAMPLES (Movement & Dwell Tracking)
create table if not exists spatial_samples (
  id bigint generated always as identity primary key,
  session_id uuid references visitor_sessions(id) on delete cascade,
  room_id text not null,
  pos_x numeric(6,2) not null,
  pos_z numeric(6,2) not null,
  timestamp timestamptz default now()
);

create index if not exists idx_spatial_room on spatial_samples(room_id, timestamp desc);

-- 10. AUDIT & MODERATION LOG
create table if not exists admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null,
  action text not null,
  entity_type text not null,
  entity_id text,
  previous_state jsonb,
  new_state jsonb,
  created_at timestamptz default now()
);

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================
alter table brands enable row level security;
alter table exhibits enable row level security;
alter table coupons enable row level security;
alter table artworks enable row level security;
alter table museum_config enable row level security;
alter table visitor_sessions enable row level security;
alter table telemetry_events enable row level security;
alter table spatial_samples enable row level security;
alter table admin_users enable row level security;
alter table admin_audit_log enable row level security;

-- Public Anonymous Visitors can read active contents
create policy "Public can read active brands" on brands for select using (is_active = true);
create policy "Public can read active exhibits" on exhibits for select using (is_active = true);
create policy "Public can read active coupons" on coupons for select using (is_active = true);
create policy "Public can read active artworks" on artworks for select using (is_active = true);
create policy "Public can read museum config" on museum_config for select using (true);

-- Public Anonymous Visitors can insert their sessions and telemetry
create policy "Public can insert visitor sessions" on visitor_sessions for insert with check (true);
create policy "Public can update their visitor session" on visitor_sessions for update using (true);
create policy "Public can insert telemetry events" on telemetry_events for insert with check (true);
create policy "Public can insert spatial samples" on spatial_samples for insert with check (true);

-- Authenticated Admin Full Access (service_role or authenticated admins)
create policy "Admins full access to brands" on brands for all using (true);
create policy "Admins full access to exhibits" on exhibits for all using (true);
create policy "Admins full access to coupons" on coupons for all using (true);
create policy "Admins full access to artworks" on artworks for all using (true);
create policy "Admins full access to museum_config" on museum_config for all using (true);
create policy "Admins full access to visitor_sessions" on visitor_sessions for all using (true);
create policy "Admins full access to telemetry_events" on telemetry_events for all using (true);
create policy "Admins full access to spatial_samples" on spatial_samples for all using (true);
create policy "Admins full access to admin_users" on admin_users for all using (true);
create policy "Admins full access to admin_audit_log" on admin_audit_log for all using (true);
