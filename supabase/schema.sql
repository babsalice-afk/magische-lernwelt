-- Magische Lernwelt – minimale Cloud-Synchronisation
-- In Supabase: SQL Editor > New query > komplett einfügen > Run

create table if not exists public.app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

drop policy if exists "Users read own state" on public.app_state;
create policy "Users read own state"
on public.app_state for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users insert own state" on public.app_state;
create policy "Users insert own state"
on public.app_state for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users update own state" on public.app_state;
create policy "Users update own state"
on public.app_state for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

revoke all on table public.app_state from anon;
grant select, insert, update on table public.app_state to authenticated;
