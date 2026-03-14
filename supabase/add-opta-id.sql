-- Add Opta ID for Premier League player photos (run in Supabase SQL Editor, then: npm run import-fpl)
alter table public.players
  add column if not exists opta_id text;

create index if not exists idx_players_opta_id on public.players(opta_id);
