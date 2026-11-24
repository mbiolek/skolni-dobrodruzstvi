
create table if not exists public.sd_876_invites (
 id uuid primary key default gen_random_uuid(),
 family_id uuid not null references public.sd_families(id) on delete cascade,
 secret_digest text not null unique,
 created_at timestamptz not null default now(),
 expires_at timestamptz not null,
 uses integer not null default 0 check(uses >= 0),
 max_uses integer not null default 8 check(max_uses between 1 and 12)
);
create table if not exists public.sd_876_requests (
 id uuid primary key default gen_random_uuid(),
 auth_user_id uuid not null references auth.users(id) on delete cascade,
 family_id uuid references public.sd_families(id) on delete cascade,
 secret_digest text not null unique,
 short_code char(6) not null,
 device_name text not null,
 created_at timestamptz not null default now(),
 expires_at timestamptz not null,
 approved_at timestamptz,
 rejected_at timestamptz,
 profile_id uuid references public.sd_profiles(id),
 constraint sd876_code_chars check(short_code ~ '^[0-9]{6}$'),
 constraint sd876_one_outcome check(approved_at is null or rejected_at is null),
 constraint sd876_name_length check(char_length(device_name) between 1 and 60)
);
create unique index if not exists sd876_short_unique on public.sd_876_requests(short_code);
create index if not exists sd876_request_family_pending on public.sd_876_requests(family_id,expires_at) where approved_at is null and rejected_at is null;
create index if not exists sd876_request_user_recent on public.sd_876_requests(auth_user_id,created_at);
create table if not exists public.sd_876_attempts(
 id bigint generated always as identity primary key,
 actor_id uuid not null,
 attempted_at timestamptz not null default now()
);
create index if not exists sd876_attempts_actor on public.sd_876_attempts(actor_id,attempted_at);
alter table public.sd_876_invites enable row level security;
alter table public.sd_876_requests enable row level security;
alter table public.sd_876_attempts enable row level security;
revoke all on public.sd_876_invites, public.sd_876_requests, public.sd_876_attempts from anon, authenticated, public;
revoke all on sequence public.sd_876_attempts_id_seq from anon, authenticated, public;
