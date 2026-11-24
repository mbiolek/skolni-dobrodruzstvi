
-- 50.8.78 – katalog učiva a popis připojených zařízení
create table if not exists public.sd_878_curriculum (
 id uuid primary key default gen_random_uuid(),
 family_id uuid not null references public.sd_families(id) on delete cascade,
 school_id text not null,
 grade integer not null check(grade between 1 and 9),
 subject text not null check(subject in ('math','czech','english','nature','geography','vocational')),
 kind text not null check(kind in ('vocabulary','quiz','lesson')),
 title text not null check(length(title) between 1 and 180),
 payload jsonb not null default '{}'::jsonb check(jsonb_typeof(payload)='object'),
 status text not null default 'draft' check(status in ('draft','published')),
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists sd_878_curriculum_family_lookup on public.sd_878_curriculum(family_id,school_id,grade,subject,status);
alter table public.sd_878_curriculum enable row level security;
grant select,insert,update,delete on public.sd_878_curriculum to authenticated;
revoke all on public.sd_878_curriculum from anon;
drop policy if exists sd878_catalog_select on public.sd_878_curriculum;
create policy sd878_catalog_select on public.sd_878_curriculum for select to authenticated
 using (
  sd_private.sd_is_parent(family_id)
  or (status='published' and exists (
   select 1 from public.sd_device_profile_access a
   where a.family_id=sd_878_curriculum.family_id and a.auth_user_id=(select auth.uid())
  ))
 );
drop policy if exists sd878_catalog_insert on public.sd_878_curriculum;
create policy sd878_catalog_insert on public.sd_878_curriculum for insert to authenticated
 with check (sd_private.sd_is_parent(family_id) and created_by=(select auth.uid()));
drop policy if exists sd878_catalog_update on public.sd_878_curriculum;
create policy sd878_catalog_update on public.sd_878_curriculum for update to authenticated
 using (sd_private.sd_is_parent(family_id))
 with check (sd_private.sd_is_parent(family_id) and created_by=(select auth.uid()));
drop policy if exists sd878_catalog_delete on public.sd_878_curriculum;
create policy sd878_catalog_delete on public.sd_878_curriculum for delete to authenticated
 using (sd_private.sd_is_parent(family_id));

alter table public.sd_child_accounts add column if not exists device_kind text;
alter table public.sd_child_accounts add column if not exists device_platform text;
alter table public.sd_child_accounts add column if not exists device_model text;
alter table public.sd_child_accounts add column if not exists device_browser text;
alter table public.sd_child_accounts add column if not exists device_reported_at timestamptz;

create or replace function public.sd_878_report_own_device(p_kind text,p_platform text,p_model text,p_browser text)
returns boolean language plpgsql security definer set search_path=''
as $f$
declare v_uid uuid := (select auth.uid());
begin
 if v_uid is null then return false;end if;
 update public.sd_child_accounts
 set device_kind=left(nullif(trim(coalesce(p_kind,'')),''),40),
     device_platform=left(nullif(trim(coalesce(p_platform,'')),''),90),
     device_model=left(nullif(trim(coalesce(p_model,'')),''),90),
     device_browser=left(nullif(trim(coalesce(p_browser,'')),''),90),
     device_reported_at=now()
 where auth_user_id=v_uid;
 return found;
end $f$;
revoke all on function public.sd_878_report_own_device(text,text,text,text) from PUBLIC,anon;
grant execute on function public.sd_878_report_own_device(text,text,text,text) to authenticated;

create or replace function public.sd_878_parent_devices()
returns jsonb language plpgsql stable security definer set search_path=''
as $f$
declare v_family uuid;v_out jsonb;
begin
 select id into v_family from public.sd_families where owner_id=(select auth.uid()) limit 1;
 if v_family is null then raise exception 'Pouze přihlášený rodič může číst informace o zařízeních';end if;
 select coalesce(jsonb_agg(jsonb_build_object(
  'auth_user_id',c.auth_user_id,
  'device_name',c.device_name,
  'kind',c.device_kind,
  'platform',c.device_platform,
  'model',c.device_model,
  'browser',c.device_browser,
  'reported_at',c.device_reported_at,
  'user_agent',sess.user_agent,
  'last_seen_at',sess.updated_at,
  'created_at',c.created_at,
  'profile_id',c.profile_id
 ) order by c.created_at asc),'[]'::jsonb)
 into v_out
 from public.sd_child_accounts c
 left join lateral (
  select s.user_agent,s.updated_at from auth.sessions s
  where s.user_id=c.auth_user_id
  order by s.updated_at desc limit 1
 ) sess on true
 where c.family_id=v_family;
 return v_out;
end $f$;
revoke all on function public.sd_878_parent_devices() from PUBLIC,anon;
grant execute on function public.sd_878_parent_devices() to authenticated;
