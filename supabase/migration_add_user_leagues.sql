-- Add user_leagues table so users can follow leagues (not just teams).
-- Run this in Supabase Dashboard → SQL Editor.

create table if not exists public.user_leagues (
  user_id   uuid references public.profiles(id) on delete cascade,
  league_id text not null,
  primary key (user_id, league_id)
);

alter table public.user_leagues enable row level security;

create policy "user_leagues_read"   on public.user_leagues for select to authenticated using (true);
create policy "user_leagues_insert" on public.user_leagues for insert to authenticated with check (auth.uid() = user_id);
create policy "user_leagues_delete" on public.user_leagues for delete to authenticated using (auth.uid() = user_id);
