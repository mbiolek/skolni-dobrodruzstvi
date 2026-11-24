
-- 50.8.78: Bez přeposílání kódu - žádost je přidělena rodině podle rodičova e-mailu.
-- Autorizace dítěte: samostatná anonymní Supabase identita; schválení výhradně vlastníkem rodiny.
create or replace function public.sd_878_begin_direct_request(p_device_name text,p_parent_email text)
returns jsonb language plpgsql security definer set search_path=''
as $fn$
declare
 v_uid uuid := (select auth.uid());
 v_email text := lower(trim(coalesce(p_parent_email,'')));
 v_family uuid;
 v_pending integer := 0;
 v_hour integer := 0;
 v_result jsonb;
begin
 if v_uid is null then raise exception 'Zařízení ještě není přihlášené';end if;
 if char_length(v_email)>254 or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
 then raise exception 'Zadej platný e-mail rodiče';end if;
 if exists(select 1 from public.sd_families where owner_id=v_uid)
 then raise exception 'Rodičovský účet není dětské zařízení';end if;
 if exists(select 1 from public.sd_child_accounts where auth_user_id=v_uid)
 then raise exception 'Toto zařízení už je spárované';end if;
 select f.id into v_family
 from public.sd_families f join auth.users u on u.id=f.owner_id
 where lower(u.email)=v_email limit 1;
 if v_family is not null then
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(v_family::text));
  select count(*) into v_pending from public.sd_876_requests
  where family_id=v_family and expires_at>now() and approved_at is null and rejected_at is null;
  select count(*) into v_hour from public.sd_876_requests
  where family_id=v_family and created_at>now()-interval '1 hour';
  if v_pending>=8 or v_hour>=24 then
   -- Žádný rozdíl v odpovědi pro neexistující a přetíženou rodinu.
   v_family=null;
  end if;
 end if;
 v_result:=public.sd_876_begin_request(p_device_name,null);
 if v_family is not null then
  update public.sd_876_requests
  set family_id=v_family
  where id=(v_result->>'request_id')::uuid and auth_user_id=v_uid and approved_at is null;
 end if;
 -- Úspěch ani neúspěch nesmí prozradit, zda daný rodičovský e-mail existuje.
 return jsonb_build_object(
  'secret',v_result->>'secret',
  'expires_at',v_result->>'expires_at',
  'request_id',v_result->>'request_id',
  'status','pending'
 );
end $fn$;
revoke all on function public.sd_878_begin_direct_request(text,text) from public,anon;
grant execute on function public.sd_878_begin_direct_request(text,text) to authenticated;
