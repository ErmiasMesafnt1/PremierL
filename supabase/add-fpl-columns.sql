-- Add FPL IDs for mapping GitHub data to Supabase tables
-- Run this in Supabase SQL Editor before importing players and player_match_stats

alter table public.matches
  add column if not exists fpl_match_id text unique;

alter table public.players
  add column if not exists fpl_player_id integer;

-- Unique constraint for upsert (PostgreSQL allows multiple NULLs)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'players_fpl_player_id_key') then
    alter table public.players add constraint players_fpl_player_id_key unique (fpl_player_id);
  end if;
end $$;

-- Create index for faster lookups
create index if not exists idx_matches_fpl_match_id on public.matches(fpl_match_id);
create index if not exists idx_players_fpl_player_id on public.players(fpl_player_id);
