-- Add xG from set pieces (corners + free kicks) to team_match_stats
-- Run in Supabase SQL Editor, then re-run: npm run import-fpl

alter table public.team_match_stats
  add column if not exists xg_set_play numeric(6,2);

-- Optional: backfill existing rows so NULL shows as 0 until you re-import
update public.team_match_stats
  set xg_set_play = 0
  where xg_set_play is null;
