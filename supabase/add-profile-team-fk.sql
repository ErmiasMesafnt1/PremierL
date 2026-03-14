-- Add foreign key from profiles.favorite_team_id to teams.id
-- Run this in Supabase SQL Editor if the join in AuthProvider doesn't work

alter table public.profiles
  add constraint profiles_favorite_team_id_fkey
  foreign key (favorite_team_id) references public.teams(id) on delete set null;
