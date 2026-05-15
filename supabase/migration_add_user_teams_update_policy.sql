-- Add missing UPDATE policy for user_teams so upserts can update fandom_level.
-- Run this in Supabase Dashboard → SQL Editor.

CREATE POLICY "user_teams_update"
  ON public.user_teams
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
