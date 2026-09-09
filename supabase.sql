-- CCP CONFESSION DATABASE
-- Run this entire file in Supabase SQL Editor.
-- Then create your admin user in Supabase Authentication > Users.

create extension if not exists pgcrypto;

create table if not exists public.confessions (
  id uuid primary key default gen_random_uuid(),
  message text not null check (char_length(message) between 3 and 2000),
  category text not null default 'Other',
  nickname text not null default 'Anonymous',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  pinned boolean not null default false,
  heart integer not null default 0,
  laugh integer not null default 0,
  sad integer not null default 0,
  eyes integer not null default 0,
  skull integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.confessions enable row level security;

-- Public users can submit pending confessions.
drop policy if exists "public can submit pending" on public.confessions;
create policy "public can submit pending"
on public.confessions for insert
to anon, authenticated
with check (status = 'pending');

-- Public users can only read approved confessions.
drop policy if exists "public can read approved" on public.confessions;
create policy "public can read approved"
on public.confessions for select
to anon, authenticated
using (status = 'approved');

-- Admin identification: add the UUID of your admin auth user here.
-- Replace YOUR_ADMIN_USER_UUID with the real auth.users id.
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.admins enable row level security;

drop policy if exists "admins can read themselves" on public.admins;
create policy "admins can read themselves"
on public.admins for select
to authenticated
using (auth.uid() = user_id);

-- Admins can read all confessions.
drop policy if exists "admins can read all" on public.confessions;
create policy "admins can read all"
on public.confessions for select
to authenticated
using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Admins can update moderation/pin status.
drop policy if exists "admins can update" on public.confessions;
create policy "admins can update"
on public.confessions for update
to authenticated
using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Reaction RPC. This avoids giving public users direct UPDATE permission.
create or replace function public.add_reaction(confession_id uuid, reaction_type text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if reaction_type = 'heart' then
    update public.confessions set heart = heart + 1 where id = confession_id and status = 'approved';
  elsif reaction_type = 'laugh' then
    update public.confessions set laugh = laugh + 1 where id = confession_id and status = 'approved';
  elsif reaction_type = 'sad' then
    update public.confessions set sad = sad + 1 where id = confession_id and status = 'approved';
  elsif reaction_type = 'eyes' then
    update public.confessions set eyes = eyes + 1 where id = confession_id and status = 'approved';
  elsif reaction_type = 'skull' then
    update public.confessions set skull = skull + 1 where id = confession_id and status = 'approved';
  else
    raise exception 'Invalid reaction type';
  end if;
end;
$$;

grant execute on function public.add_reaction(uuid,text) to anon, authenticated;

-- IMPORTANT:
-- After creating your admin user, run:
-- insert into public.admins (user_id) values ('YOUR_ADMIN_USER_UUID');
