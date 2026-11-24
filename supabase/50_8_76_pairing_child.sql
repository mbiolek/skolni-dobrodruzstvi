
create or replace function public.sd_876_make_invite()
returns jsonb language plpgsql security definer set search_path=''
as $fn$
declare v_family uuid; v_token text; v_exp timestamptz;
begin
 select f.id into v_family from public.sd_families f where f.owner_id=(select auth.uid()) limit 1;
 if v_family is null then raise exception 'Rodinnou pozvánku může vytvořit jen přihlášený rodič';end if;
 delete from public.sd_876_invites where family_id=v_family and expires_at<now()-interval '1 day';
 v_token=encode(extensions.gen_random_bytes(24),'hex');
 v_exp=now()+interval '15 minutes';
 insert into public.sd_876_invites(family_id,secret_digest,expires_at)
 values(v_family,encode(extensions.digest(v_token,'sha256'),'hex'),v_exp);
 return jsonb_build_object('invite',v_token,'expires_at',v_exp);
end $fn$;

create or replace function public.sd_876_begin_request(p_device_name text, p_invite text default null)
returns jsonb language plpgsql security definer set search_path=''
as $fn$
declare v_uid uuid;v_name text;v_family uuid;v_token text;v_code text;v_random bytea;v_num bigint;v_try int;v_id uuid;v_exp timestamptz;
begin
 v_uid=(select auth.uid());
 if v_uid is null then raise exception 'Pro párování se nejprve připoj k aplikaci';end if;
 if exists(select 1 from public.sd_families where owner_id=v_uid) then raise exception 'Rodič nemůže spárovat vlastní účet jako dětské zařízení';end if;
 if exists(select 1 from public.sd_child_accounts where auth_user_id=v_uid) then raise exception 'Zařízení je již přiřazeno k rodině';end if;
 v_name=left(trim(coalesce(p_device_name,'')),60);
 if char_length(v_name)<2 then v_name='Nové zařízení';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(v_uid::text));
 if (select count(*) from public.sd_876_requests where auth_user_id=v_uid and created_at>now()-interval '1 hour')>=5
 then raise exception 'Příliš mnoho žádostí. Zkus to později.';end if;
 if p_invite is not null and p_invite<>'' then
  if p_invite !~ '^[0-9a-f]{48}$' then raise exception 'Neplatná rodinná pozvánka';end if;
  select i.family_id into v_family from public.sd_876_invites i
  where i.secret_digest=encode(extensions.digest(p_invite,'sha256'),'hex') and i.expires_at>now() and i.uses<i.max_uses for update;
  if v_family is null then raise exception 'Rodinný QR kód vypršel. Požádej rodiče o nový.';end if;
  update public.sd_876_invites set uses=uses+1 where secret_digest=encode(extensions.digest(p_invite,'sha256'),'hex');
 end if;
 -- Only replace a pending request owned by this same anonymous identity.
 update public.sd_876_requests set expires_at=now()
 where auth_user_id=v_uid and approved_at is null and rejected_at is null and expires_at>now();
 delete from public.sd_876_requests where expires_at<now()-interval '1 day';
 v_token=encode(extensions.gen_random_bytes(24),'hex');
 v_exp=now()+interval '15 minutes';
 for v_try in 1..20 loop
  v_random=extensions.gen_random_bytes(4);
  v_num=((get_byte(v_random,0)::bigint*16777216)+(get_byte(v_random,1)::bigint*65536)+(get_byte(v_random,2)::bigint*256)+get_byte(v_random,3)::bigint)%1000000;
  v_code=lpad(v_num::text,6,'0');
  if not exists(select 1 from public.sd_876_requests where short_code=v_code) then exit;end if;
 end loop;
 if v_try>20 then raise exception 'Kód nelze vytvořit. Zkus to znovu.';end if;
 insert into public.sd_876_requests(auth_user_id,family_id,secret_digest,short_code,device_name,expires_at)
 values(v_uid,v_family,encode(extensions.digest(v_token,'sha256'),'hex'),v_code,v_name,v_exp)
 returning id into v_id;
 return jsonb_build_object('secret',v_token,'short_code',v_code,'expires_at',v_exp,'family_request',v_family is not null,'request_id',v_id);
end $fn$;

create or replace function public.sd_876_request_status(p_secret text)
returns jsonb language plpgsql security definer set search_path=''
as $fn$
declare v_row public.sd_876_requests%rowtype; v_state text;
begin
 if p_secret is null or p_secret !~ '^[0-9a-f]{48}$' then raise exception 'Neplatná žádost';end if;
 select * into v_row from public.sd_876_requests where secret_digest=encode(extensions.digest(p_secret,'sha256'),'hex') and auth_user_id=(select auth.uid());
 if not found then raise exception 'Žádost pro toto zařízení neexistuje';end if;
 v_state=case
 when v_row.rejected_at is not null then 'rejected'
 when v_row.approved_at is not null and exists(select 1 from public.sd_child_accounts where auth_user_id=v_row.auth_user_id) then 'approved'
 when v_row.approved_at is not null then 'disconnected'
 when v_row.expires_at<=now() then 'expired'
 else 'pending' end;
 return jsonb_build_object('status',v_state,'expires_at',v_row.expires_at);
end $fn$;
revoke all on function public.sd_876_make_invite() from public,anon;
revoke all on function public.sd_876_begin_request(text,text) from public,anon;
revoke all on function public.sd_876_request_status(text) from public,anon;
grant execute on function public.sd_876_make_invite() to authenticated;
grant execute on function public.sd_876_begin_request(text,text) to authenticated;
grant execute on function public.sd_876_request_status(text) to authenticated;
