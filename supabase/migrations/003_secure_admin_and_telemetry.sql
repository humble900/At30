-- Lock the admin portal to explicitly linked Supabase Auth users and make visitor telemetry owner-scoped.
alter table public.admin_users add column if not exists auth_user_id uuid unique references auth.users(id) on delete set null;
alter table public.visitor_sessions add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists idx_admin_users_auth_user on public.admin_users(auth_user_id);
create index if not exists idx_visitor_sessions_user on public.visitor_sessions(user_id, started_at desc);
create index if not exists idx_telemetry_timestamp on public.telemetry_events(timestamp desc);
create index if not exists idx_spatial_session on public.spatial_samples(session_id, timestamp desc);

-- Safely link a seeded admin record when an Auth user with the same verified email already exists.
update public.admin_users a set auth_user_id=u.id from auth.users u
where a.auth_user_id is null and lower(a.email)=lower(u.email) and u.email_confirmed_at is not null;

do $$ declare r record; begin
  for r in select schemaname, tablename, policyname from pg_policies
    where schemaname='public' and policyname like 'Admins full access%'
  loop execute format('drop policy if exists %I on %I.%I',r.policyname,r.schemaname,r.tablename); end loop;
end $$;
drop policy if exists "Public can update their visitor session" on public.visitor_sessions;
drop policy if exists "Public can insert visitor sessions" on public.visitor_sessions;
drop policy if exists "Public can insert telemetry events" on public.telemetry_events;
drop policy if exists "Public can insert spatial samples" on public.spatial_samples;

create or replace function public.is_museum_admin(required_roles text[] default null)
returns boolean language sql stable security definer set search_path=''
as $$ select exists(select 1 from public.admin_users a where a.auth_user_id=(select auth.uid()) and (required_roles is null or a.role=any(required_roles))) $$;
revoke all on function public.is_museum_admin(text[]) from public, anon;
grant execute on function public.is_museum_admin(text[]) to authenticated;

-- Admins may read their own authorization record. All administrative data access uses the role function.
create policy "Admin can read own profile" on public.admin_users for select to authenticated using (auth_user_id=(select auth.uid()));
create policy "Superadmin manages admins" on public.admin_users for all to authenticated using (public.is_museum_admin(array['superadmin'])) with check (public.is_museum_admin(array['superadmin']));

do $$ declare t text; begin
  foreach t in array array['brands','exhibits','coupons','artworks','museum_config','visitor_sessions','telemetry_events','spatial_samples','admin_audit_log']
  loop execute format('create policy "Authorized admins manage %s" on public.%I for all to authenticated using (public.is_museum_admin(null)) with check (public.is_museum_admin(null))',t,t); end loop;
end $$;

-- A signed-in anonymous museum visitor owns exactly their visit and may only append events to it.
create policy "Visitor creates own session" on public.visitor_sessions for insert to authenticated with check (user_id=(select auth.uid()));
create policy "Visitor reads own session" on public.visitor_sessions for select to authenticated using (user_id=(select auth.uid()));
create policy "Visitor updates own session" on public.visitor_sessions for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy "Visitor creates own telemetry" on public.telemetry_events for insert to authenticated with check (exists(select 1 from public.visitor_sessions s where s.id=session_id and s.user_id=(select auth.uid())));
create policy "Visitor creates own spatial sample" on public.spatial_samples for insert to authenticated with check (exists(select 1 from public.visitor_sessions s where s.id=session_id and s.user_id=(select auth.uid())));

-- Keep callable/readable objects explicit as new projects no longer auto-expose tables to the Data API.
grant usage on schema public to anon, authenticated;
grant select on public.brands, public.exhibits, public.coupons, public.artworks, public.museum_config to anon, authenticated;
grant select, insert, update on public.visitor_sessions to authenticated;
grant insert on public.telemetry_events, public.spatial_samples to authenticated;
grant select, insert, update, delete on public.brands, public.exhibits, public.coupons, public.artworks, public.museum_config to authenticated;
grant select on public.telemetry_events, public.spatial_samples, public.admin_users, public.admin_audit_log to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- Audit content changes without trusting client-supplied administrator identity.
create or replace function public.audit_admin_change() returns trigger language plpgsql security definer set search_path=''
as $$ begin
  if public.is_museum_admin(null) then insert into public.admin_audit_log(admin_email,action,entity_type,entity_id,previous_state,new_state)
  select coalesce(a.email,'unknown'),tg_op,tg_table_name,coalesce(new.id::text,old.id::text),case when tg_op='INSERT' then null else to_jsonb(old) end,case when tg_op='DELETE' then null else to_jsonb(new) end
  from public.admin_users a where a.auth_user_id=(select auth.uid()); end if; return coalesce(new,old); end $$;
revoke all on function public.audit_admin_change() from public, anon, authenticated;
do $$ declare t text; begin foreach t in array array['brands','exhibits','coupons','artworks','museum_config'] loop
  execute format('drop trigger if exists audit_%I on public.%I',t,t);
  execute format('create trigger audit_%I after insert or update or delete on public.%I for each row execute function public.audit_admin_change()',t,t);
end loop; end $$;
