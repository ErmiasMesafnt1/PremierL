-- Fix Bournemouth badge (use Wikipedia AFC Bournemouth crest)
-- Run in Supabase SQL Editor
update public.teams
  set badge_url = 'https://upload.wikimedia.org/wikipedia/hif/5/53/AFC_Bournemouth_%282013%29.png'
  where name = 'Bournemouth';
