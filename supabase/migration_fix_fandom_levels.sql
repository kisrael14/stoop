-- Fix fandom_level constraint to match app values.
-- Run this in Supabase Dashboard → SQL Editor if you already created the user_teams table.

ALTER TABLE public.user_teams
  DROP CONSTRAINT IF EXISTS user_teams_fandom_level_check;

ALTER TABLE public.user_teams
  ADD CONSTRAINT user_teams_fandom_level_check
  CHECK (fandom_level IN ('casual', 'supporter', 'fair-weather', 'diehard'));
