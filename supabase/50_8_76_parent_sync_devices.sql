
alter table sd_private.sd_sync_devices
 add column if not exists device_name text not null default 'Rodičovské zařízení';

create or replace function public.sd_876_parent_sync_devices()
returns jsonb language plpgsql stable security definer set search_path=''
as $fn$
declare v_family uuid;v_devices jsonb;
begin
 select id into v_family from public.sd_families where owner_id=(select auth.uid()) limit 1;
 if v_family is null then raise exception 'Zařízení spravuje pouze přihlášený rodič';end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',d.id,'device_name',d.device_name,'created_at',d.created_at) order by d.created_at),'[]'::jsonb)
 into v_devices from sd_private.sd_sync_devices d where d.family_id=v_family and d.revoked_at is null;
 return v_devices;
end $fn$;

create or replace function public.sd_876_rename_parent_device(p_device_id uuid,p_device_name text)
returns boolean language plpgsql security definer set search_path=''
as $fn$
declare v_family uuid;v_name text;
begin
 select id into v_family from public.sd_families where owner_id=(select auth.uid()) limit 1;
 if v_family is null then raise exception 'Zařízení smí přejmenovat jen rodič';end if;
 v_name=left(trim(coalesce(p_device_name,'')),60);
 if char_length(v_name)<2 then raise exception 'Zadej název zařízení';end if;
 update sd_private.sd_sync_devices set device_name=v_name
 where id=p_device_id and family_id=v_family and revoked_at is null;
 return found;
end $fn$;

revoke all on function public.sd_876_parent_sync_devices() from public,anon;
revoke all on function public.sd_876_rename_parent_device(uuid,text) from public,anon;
grant execute on function public.sd_876_parent_sync_devices() to authenticated;
grant execute on function public.sd_876_rename_parent_device(uuid,text) to authenticated;
