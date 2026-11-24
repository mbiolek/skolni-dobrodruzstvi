
create or replace function public.sd_876_pending_requests()
returns jsonb language plpgsql stable security definer set search_path=''
as $fn$
declare v_family uuid;v_rows jsonb;
begin
 select id into v_family from public.sd_families where owner_id=(select auth.uid()) limit 1;
 if v_family is null then raise exception 'Přihlas rodiče ke cloudu';end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'device_name',r.device_name,'created_at',r.created_at,'expires_at',r.expires_at) order by r.created_at desc),'[]'::jsonb)
 into v_rows from public.sd_876_requests r
 where r.family_id=v_family and r.expires_at>now() and r.approved_at is null and r.rejected_at is null;
 return v_rows;
end $fn$;

create or replace function public.sd_876_preview_request(p_secret text)
returns jsonb language plpgsql stable security definer set search_path=''
as $fn$
declare v_family uuid;v_row public.sd_876_requests%rowtype;
begin
 select id into v_family from public.sd_families where owner_id=(select auth.uid()) limit 1;
 if v_family is null then raise exception 'Žádost smí zobrazit pouze přihlášený rodič';end if;
 if p_secret is null or p_secret !~ '^[0-9a-f]{48}$' then raise exception 'Neplatný odkaz';end if;
 select * into v_row from public.sd_876_requests where secret_digest=encode(extensions.digest(p_secret,'sha256'),'hex');
 if not found or (v_row.family_id is not null and v_row.family_id<>v_family) then raise exception 'Žádost neexistuje nebo patří jiné rodině';end if;
 if v_row.expires_at<=now() or v_row.approved_at is not null or v_row.rejected_at is not null then raise exception 'Žádost už není platná';end if;
 return jsonb_build_object('id',v_row.id,'device_name',v_row.device_name,'expires_at',v_row.expires_at);
end $fn$;

create or replace function public.sd_876_approve_request(
 p_profile_id uuid, p_request_id uuid default null, p_secret text default null, p_code text default null
)
returns boolean language plpgsql security definer set search_path=''
as $fn$
declare v_parent uuid;v_family uuid;v_row public.sd_876_requests%rowtype;v_attempts int;
begin
 v_parent=(select auth.uid());
 if v_parent is null then raise exception 'Rodič není přihlášen';end if;
 select p.family_id into v_family from public.sd_profiles p
 join public.sd_families f on f.id=p.family_id and f.owner_id=v_parent
 where p.id=p_profile_id and p.deleted_at is null;
 if v_family is null then raise exception 'Profil není součástí rodičovy rodiny';end if;
 if (case when p_request_id is not null then 1 else 0 end)+
    (case when p_secret is not null then 1 else 0 end)+
    (case when p_code is not null then 1 else 0 end)<>1
 then raise exception 'Urči právě jednu žádost';end if;
 if p_request_id is not null then
  select * into v_row from public.sd_876_requests
  where id=p_request_id and family_id=v_family for update;
 elsif p_secret is not null then
  if p_secret !~ '^[0-9a-f]{48}$' then raise exception 'Neplatný odkaz';end if;
  select * into v_row from public.sd_876_requests where secret_digest=encode(extensions.digest(p_secret,'sha256'),'hex') for update;
 else
  -- Six-digit codes are a limited fallback. Only 5 attempts per 15-minute window per parent.
  if p_code !~ '^[0-9]{6}$' then raise exception 'Zadej šest číslic';end if;
  insert into public.sd_876_attempts(actor_id) values(v_parent);
  select count(*) into v_attempts from public.sd_876_attempts
  where actor_id=v_parent and attempted_at>now()-interval '15 minutes';
  if v_attempts>5 then return false;end if;
  select * into v_row from public.sd_876_requests where short_code=p_code for update;
 end if;
 if not found or v_row.id is null then if p_code is not null then return false;end if;raise exception 'Žádost neexistuje';end if;
 if v_row.family_id is not null and v_row.family_id<>v_family then if p_code is not null then return false;end if;raise exception 'Žádost patří jiné rodině';end if;
 if v_row.expires_at<=now() or v_row.approved_at is not null or v_row.rejected_at is not null then if p_code is not null then return false;end if;raise exception 'Žádost vypršela nebo již byla vyřízena';end if;
 if exists(select 1 from public.sd_child_accounts where auth_user_id=v_row.auth_user_id) then raise exception 'Zařízení už je spárované';end if;
 if v_row.auth_user_id=v_parent then raise exception 'Rodičovský účet nelze spárovat jako dětský';end if;
 insert into public.sd_child_accounts(auth_user_id,family_id,profile_id,device_name)
 values(v_row.auth_user_id,v_family,p_profile_id,v_row.device_name);
 update public.sd_876_requests set family_id=v_family,profile_id=p_profile_id,approved_at=now() where id=v_row.id;
 return true;
end $fn$;

create or replace function public.sd_876_reject_request(p_request_id uuid default null,p_secret text default null)
returns boolean language plpgsql security definer set search_path=''
as $fn$
declare v_family uuid;v_row public.sd_876_requests%rowtype;
begin
 select id into v_family from public.sd_families where owner_id=(select auth.uid()) limit 1;
 if v_family is null then raise exception 'Přihlas rodiče';end if;
 if (p_request_id is null)=(p_secret is null) then raise exception 'Urči žádost';end if;
 if p_request_id is not null then
  select * into v_row from public.sd_876_requests where id=p_request_id and family_id=v_family for update;
 else
  if p_secret !~ '^[0-9a-f]{48}$' then raise exception 'Neplatný odkaz';end if;
  select * into v_row from public.sd_876_requests where secret_digest=encode(extensions.digest(p_secret,'sha256'),'hex') for update;
 end if;
 if not found or v_row.id is null then raise exception 'Žádost nenalezena';end if;
 if v_row.family_id is not null and v_row.family_id<>v_family then raise exception 'Žádost patří jiné rodině';end if;
 if v_row.approved_at is not null then raise exception 'Zařízení už je schválené – odeber ho ve správě zařízení';end if;
 update public.sd_876_requests set rejected_at=now(),family_id=v_family where id=v_row.id;
 return true;
end $fn$;

revoke all on function public.sd_876_pending_requests() from public,anon;
revoke all on function public.sd_876_preview_request(text) from public,anon;
revoke all on function public.sd_876_approve_request(uuid,uuid,text,text) from public,anon;
revoke all on function public.sd_876_reject_request(uuid,text) from public,anon;
grant execute on function public.sd_876_pending_requests() to authenticated;
grant execute on function public.sd_876_preview_request(text) to authenticated;
grant execute on function public.sd_876_approve_request(uuid,uuid,text,text) to authenticated;
grant execute on function public.sd_876_reject_request(uuid,text) to authenticated;
