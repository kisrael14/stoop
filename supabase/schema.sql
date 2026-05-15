-- ═══════════════════════════════════════════════════════════════════════════
-- Stoop Sports — Database Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Profiles (extends auth.users) ────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid references auth.users on delete cascade primary key,
  username     text unique not null,
  display_name text not null,
  avatar       text not null default '🏈',
  bio          text,
  phone        text unique,
  created_at   timestamptz default now()
);

-- ── User teams (teams a user follows) ────────────────────────────────────────
create table if not exists public.user_teams (
  user_id      uuid references public.profiles(id) on delete cascade,
  team_id      text not null,
  fandom_level text check (fandom_level in ('casual', 'supporter', 'fair-weather', 'diehard')),
  primary key (user_id, team_id)
);

-- ── Follows ───────────────────────────────────────────────────────────────────
create table if not exists public.follows (
  follower_id  uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at   timestamptz default now(),
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);

-- ── Neighborhoods (chat groups) ───────────────────────────────────────────────
create table if not exists public.neighborhoods (
  id         uuid default gen_random_uuid() primary key,
  name       text not null,
  emoji      text not null default '🏘️',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.neighborhood_members (
  neighborhood_id uuid references public.neighborhoods(id) on delete cascade,
  user_id         uuid references public.profiles(id) on delete cascade,
  joined_at       timestamptz default now(),
  primary key (neighborhood_id, user_id)
);

-- ── Messages ──────────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id              uuid default gen_random_uuid() primary key,
  neighborhood_id uuid references public.neighborhoods(id) on delete cascade not null,
  user_id         uuid references public.profiles(id) on delete set null,
  content         text not null,
  tag             text check (tag in ('hot-take', 'debate', 'bet', 'analysis')),
  created_at      timestamptz default now()
);

-- ── Hot Takes ─────────────────────────────────────────────────────────────────
create table if not exists public.hot_takes (
  id                uuid default gen_random_uuid() primary key,
  content           text not null check (char_length(content) <= 280),
  author_id         uuid references public.profiles(id) on delete cascade not null,
  neighborhood_id   uuid references public.neighborhoods(id) on delete set null,
  neighborhood_name text,
  is_public         boolean default false,
  team_ids          text[] default '{}',
  created_at        timestamptz default now()
);

create table if not exists public.hot_take_reactions (
  hot_take_id uuid references public.hot_takes(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete cascade,
  emoji       text not null check (emoji in ('🔥', '❄️')),
  created_at  timestamptz default now(),
  primary key (hot_take_id, user_id)
);

create table if not exists public.hot_take_comments (
  id          uuid default gen_random_uuid() primary key,
  hot_take_id uuid references public.hot_takes(id) on delete cascade not null,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  content     text not null,
  created_at  timestamptz default now()
);

-- ── Debates ───────────────────────────────────────────────────────────────────
create table if not exists public.debates (
  id                uuid default gen_random_uuid() primary key,
  claim             text not null,
  side1_label       text,
  side2_label       text,
  author_id         uuid references public.profiles(id) on delete cascade not null,
  neighborhood_id   uuid references public.neighborhoods(id) on delete set null,
  neighborhood_name text,
  is_public         boolean default false,
  status            text check (status in ('open', 'resolved')) default 'open',
  resolution        text check (resolution in ('side1', 'side2', 'draw')),
  team_ids          text[] default '{}',
  created_at        timestamptz default now()
);

create table if not exists public.debate_sides (
  debate_id uuid references public.debates(id) on delete cascade,
  user_id   uuid references public.profiles(id) on delete cascade,
  side      text check (side in ('side1', 'side2')) not null,
  primary key (debate_id, user_id)
);

create table if not exists public.debate_votes (
  debate_id  uuid references public.debates(id) on delete cascade,
  user_id    uuid references public.profiles(id) on delete cascade,
  choice     text check (choice in ('side1', 'side2', 'draw')) not null,
  created_at timestamptz default now(),
  primary key (debate_id, user_id)
);

create table if not exists public.debate_arguments (
  id         uuid default gen_random_uuid() primary key,
  debate_id  uuid references public.debates(id) on delete cascade not null,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  side       text check (side in ('side1', 'side2')) not null,
  content    text not null,
  created_at timestamptz default now()
);

-- ── Bets ──────────────────────────────────────────────────────────────────────
create table if not exists public.bets (
  id                uuid default gen_random_uuid() primary key,
  claim             text not null,
  author_id         uuid references public.profiles(id) on delete cascade not null,
  neighborhood_id   uuid references public.neighborhoods(id) on delete set null,
  neighborhood_name text,
  stakes            text,
  status            text check (status in ('open', 'pending', 'resolved')) default 'open',
  winner_id         uuid references public.profiles(id) on delete set null,
  is_push           boolean default false,
  is_public         boolean default false,
  side1_label       text,
  side2_label       text,
  team_ids          text[] default '{}',
  created_at        timestamptz default now()
);

create table if not exists public.bet_participants (
  bet_id  uuid references public.bets(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  side    text check (side in ('side1', 'side2')),
  primary key (bet_id, user_id)
);

-- ── Analyses ──────────────────────────────────────────────────────────────────
create table if not exists public.analyses (
  id                uuid default gen_random_uuid() primary key,
  title             text not null,
  content           text not null,
  author_id         uuid references public.profiles(id) on delete cascade not null,
  neighborhood_id   uuid references public.neighborhoods(id) on delete set null,
  neighborhood_name text,
  is_public         boolean default false,
  team_ids          text[] default '{}',
  created_at        timestamptz default now()
);

create table if not exists public.analysis_comments (
  id          uuid default gen_random_uuid() primary key,
  analysis_id uuid references public.analyses(id) on delete cascade not null,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  content     text not null,
  created_at  timestamptz default now()
);

-- ── Badge Scores ──────────────────────────────────────────────────────────────
-- Stores computed badge level + score per user per badge type.
-- Recomputed periodically (e.g. nightly) from activity in the prior 6 months.
create table if not exists public.badge_scores (
  user_id     uuid references public.profiles(id) on delete cascade,
  badge_type  text not null check (badge_type in ('debater','analyst','chatter','gambler','troll','homer','tailgater')),
  score       integer not null default 0,
  level       integer not null default 1 check (level between 1 and 5),
  computed_at timestamptz default now(),
  primary key (user_id, badge_type)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- Row Level Security
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.profiles             enable row level security;
alter table public.user_teams           enable row level security;
alter table public.follows              enable row level security;
alter table public.neighborhoods        enable row level security;
alter table public.neighborhood_members enable row level security;
alter table public.messages             enable row level security;
alter table public.hot_takes            enable row level security;
alter table public.hot_take_reactions   enable row level security;
alter table public.hot_take_comments    enable row level security;
alter table public.debates              enable row level security;
alter table public.debate_sides         enable row level security;
alter table public.debate_votes         enable row level security;
alter table public.debate_arguments     enable row level security;
alter table public.bets                 enable row level security;
alter table public.bet_participants     enable row level security;
alter table public.analyses             enable row level security;
alter table public.analysis_comments    enable row level security;
alter table public.badge_scores         enable row level security;

-- Profiles: readable by all auth users, writable by owner
create policy "profiles_read"   on public.profiles for select to authenticated using (true);
create policy "profiles_insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update to authenticated using (auth.uid() = id);

-- User teams
create policy "user_teams_read"   on public.user_teams for select to authenticated using (true);
create policy "user_teams_insert" on public.user_teams for insert to authenticated with check (auth.uid() = user_id);
create policy "user_teams_update" on public.user_teams for update to authenticated using (auth.uid() = user_id);
create policy "user_teams_delete" on public.user_teams for delete to authenticated using (auth.uid() = user_id);

-- Follows
create policy "follows_read"   on public.follows for select to authenticated using (true);
create policy "follows_insert" on public.follows for insert to authenticated with check (auth.uid() = follower_id);
create policy "follows_delete" on public.follows for delete to authenticated using (auth.uid() = follower_id);

-- Neighborhoods: all auth users can read; creator can update
create policy "neighborhoods_read"   on public.neighborhoods for select to authenticated using (true);
create policy "neighborhoods_insert" on public.neighborhoods for insert to authenticated with check (auth.uid() = created_by);
create policy "neighborhoods_update" on public.neighborhoods for update to authenticated using (auth.uid() = created_by);

-- Neighborhood members
create policy "nbr_members_read"   on public.neighborhood_members for select to authenticated using (true);
create policy "nbr_members_insert" on public.neighborhood_members for insert to authenticated with check (auth.uid() = user_id);
create policy "nbr_members_delete" on public.neighborhood_members for delete to authenticated using (auth.uid() = user_id);

-- Messages: visible to neighborhood members
create policy "messages_read" on public.messages for select to authenticated
  using (exists (select 1 from public.neighborhood_members nm where nm.neighborhood_id = messages.neighborhood_id and nm.user_id = auth.uid()));
create policy "messages_insert" on public.messages for insert to authenticated
  with check (auth.uid() = user_id and exists (select 1 from public.neighborhood_members nm where nm.neighborhood_id = messages.neighborhood_id and nm.user_id = auth.uid()));

-- Hot takes: public ones visible to all; private ones to neighborhood members
create policy "hot_takes_read" on public.hot_takes for select to authenticated
  using (is_public = true or author_id = auth.uid() or (neighborhood_id is not null and exists (select 1 from public.neighborhood_members nm where nm.neighborhood_id = hot_takes.neighborhood_id and nm.user_id = auth.uid())));
create policy "hot_takes_insert" on public.hot_takes for insert to authenticated with check (auth.uid() = author_id);
create policy "hot_takes_update" on public.hot_takes for update to authenticated using (auth.uid() = author_id);
create policy "hot_takes_delete" on public.hot_takes for delete to authenticated using (auth.uid() = author_id);

create policy "ht_reactions_read"   on public.hot_take_reactions for select to authenticated using (true);
create policy "ht_reactions_insert" on public.hot_take_reactions for insert to authenticated with check (auth.uid() = user_id);
create policy "ht_reactions_delete" on public.hot_take_reactions for delete to authenticated using (auth.uid() = user_id);

create policy "ht_comments_read"   on public.hot_take_comments for select to authenticated using (true);
create policy "ht_comments_insert" on public.hot_take_comments for insert to authenticated with check (auth.uid() = user_id);

-- Debates (same visibility rules as hot takes)
create policy "debates_read" on public.debates for select to authenticated
  using (is_public = true or author_id = auth.uid() or (neighborhood_id is not null and exists (select 1 from public.neighborhood_members nm where nm.neighborhood_id = debates.neighborhood_id and nm.user_id = auth.uid())));
create policy "debates_insert" on public.debates for insert to authenticated with check (auth.uid() = author_id);
create policy "debates_update" on public.debates for update to authenticated using (auth.uid() = author_id);

create policy "debate_sides_read"   on public.debate_sides for select to authenticated using (true);
create policy "debate_sides_insert" on public.debate_sides for insert to authenticated with check (auth.uid() = user_id);

create policy "debate_votes_read"   on public.debate_votes for select to authenticated using (true);
create policy "debate_votes_insert" on public.debate_votes for insert to authenticated with check (auth.uid() = user_id);
create policy "debate_votes_update" on public.debate_votes for update to authenticated using (auth.uid() = user_id);
create policy "debate_votes_delete" on public.debate_votes for delete to authenticated using (auth.uid() = user_id);

create policy "debate_args_read"   on public.debate_arguments for select to authenticated using (true);
create policy "debate_args_insert" on public.debate_arguments for insert to authenticated with check (auth.uid() = user_id);

-- Bets
create policy "bets_read" on public.bets for select to authenticated
  using (is_public = true or author_id = auth.uid() or (neighborhood_id is not null and exists (select 1 from public.neighborhood_members nm where nm.neighborhood_id = bets.neighborhood_id and nm.user_id = auth.uid())));
create policy "bets_insert" on public.bets for insert to authenticated with check (auth.uid() = author_id);
create policy "bets_update" on public.bets for update to authenticated using (auth.uid() = author_id);

create policy "bet_participants_read"   on public.bet_participants for select to authenticated using (true);
create policy "bet_participants_insert" on public.bet_participants for insert to authenticated with check (auth.uid() = user_id);

-- Analyses
create policy "analyses_read" on public.analyses for select to authenticated
  using (is_public = true or author_id = auth.uid() or (neighborhood_id is not null and exists (select 1 from public.neighborhood_members nm where nm.neighborhood_id = analyses.neighborhood_id and nm.user_id = auth.uid())));
create policy "analyses_insert" on public.analyses for insert to authenticated with check (auth.uid() = author_id);
create policy "analyses_update" on public.analyses for update to authenticated using (auth.uid() = author_id);

create policy "analysis_comments_read"   on public.analysis_comments for select to authenticated using (true);
create policy "analysis_comments_insert" on public.analysis_comments for insert to authenticated with check (auth.uid() = user_id);

-- Badge scores: readable by all; only system/service role can write (computed server-side)
create policy "badge_scores_read" on public.badge_scores for select to authenticated using (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- Helper Functions
-- ═══════════════════════════════════════════════════════════════════════════

-- Lookup user id by username (used for username+password sign-in)
create or replace function public.get_user_id_by_username(p_username text)
returns text
language sql security definer
as $$
  select id::text from public.profiles where lower(username) = lower(p_username) limit 1;
$$;

-- Auto-create profile row when a new auth user signs up via OAuth
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
as $$
begin
  -- Only create a profile if one doesn't already exist (onboarding creates it for email signup)
  insert into public.profiles (id, username, display_name, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', '🏈')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
