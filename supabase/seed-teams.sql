-- Seed Premier League 2025/26 teams into the teams table
-- Run this in Supabase SQL Editor: Dashboard > SQL Editor > New query

insert into public.teams (name, short_name, code, league, badge_url, season)
values
  ('Arsenal', 'Arsenal', 'ARS', 'Premier League', 'https://crests.football-data.org/57.png', '2025/26'),
  ('Aston Villa', 'Villa', 'AVL', 'Premier League', 'https://crests.football-data.org/58.png', '2025/26'),
  ('Bournemouth', 'Bournemouth', 'BOU', 'Premier League', 'https://upload.wikimedia.org/wikipedia/hif/5/53/AFC_Bournemouth_%282013%29.png', '2025/26'),
  ('Brentford', 'Brentford', 'BRE', 'Premier League', 'https://crests.football-data.org/402.png', '2025/26'),
  ('Brighton & Hove Albion', 'Brighton', 'BHA', 'Premier League', 'https://crests.football-data.org/397.png', '2025/26'),
  ('Burnley', 'Burnley', 'BUR', 'Premier League', 'https://crests.football-data.org/328.png', '2025/26'),
  ('Chelsea', 'Chelsea', 'CHE', 'Premier League', 'https://crests.football-data.org/61.png', '2025/26'),
  ('Crystal Palace', 'Palace', 'CRY', 'Premier League', 'https://crests.football-data.org/354.png', '2025/26'),
  ('Everton', 'Everton', 'EVE', 'Premier League', 'https://crests.football-data.org/62.png', '2025/26'),
  ('Fulham', 'Fulham', 'FUL', 'Premier League', 'https://crests.football-data.org/63.png', '2025/26'),
  ('Leeds United', 'Leeds', 'LEE', 'Premier League', 'https://crests.football-data.org/341.png', '2025/26'),
  ('Liverpool', 'Liverpool', 'LIV', 'Premier League', 'https://crests.football-data.org/64.png', '2025/26'),
  ('Manchester City', 'Man City', 'MCI', 'Premier League', 'https://crests.football-data.org/65.png', '2025/26'),
  ('Manchester United', 'Man United', 'MUN', 'Premier League', 'https://crests.football-data.org/66.png', '2025/26'),
  ('Newcastle United', 'Newcastle', 'NEW', 'Premier League', 'https://crests.football-data.org/67.png', '2025/26'),
  ('Nottingham Forest', 'Forest', 'NFO', 'Premier League', 'https://crests.football-data.org/351.png', '2025/26'),
  ('Sunderland', 'Sunderland', 'SUN', 'Premier League', 'https://crests.football-data.org/71.png', '2025/26'),
  ('Tottenham Hotspur', 'Spurs', 'TOT', 'Premier League', 'https://crests.football-data.org/73.png', '2025/26'),
  ('West Ham United', 'West Ham', 'WHU', 'Premier League', 'https://crests.football-data.org/563.png', '2025/26'),
  ('Wolverhampton Wanderers', 'Wolves', 'WOL', 'Premier League', 'https://crests.football-data.org/76.png', '2025/26')
on conflict (name) do nothing;
