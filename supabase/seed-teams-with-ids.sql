-- Seed Premier League 2025/26 teams with FIXED UUIDs for CSV import compatibility
-- Run this BEFORE importing matches.csv if you need deterministic team IDs
--
-- IMPORTANT: Use this ONLY for a fresh database where teams table is empty.
-- If you already ran seed-teams.sql, use seed-matches.sql instead (it resolves IDs by team name).

insert into public.teams (id, name, short_name, code, league, badge_url, season)
values
  ('a0000001-0000-4000-8000-000000000001', 'Arsenal', 'Arsenal', 'ARS', 'Premier League', 'https://crests.football-data.org/57.png', '2025/26'),
  ('a0000001-0000-4000-8000-000000000002', 'Aston Villa', 'Villa', 'AVL', 'Premier League', 'https://crests.football-data.org/58.png', '2025/26'),
  ('a0000001-0000-4000-8000-000000000003', 'Bournemouth', 'Bournemouth', 'BOU', 'Premier League', 'https://upload.wikimedia.org/wikipedia/hif/5/53/AFC_Bournemouth_%282013%29.png', '2025/26'),
  ('a0000001-0000-4000-8000-000000000004', 'Brentford', 'Brentford', 'BRE', 'Premier League', 'https://crests.football-data.org/402.png', '2025/26'),
  ('a0000001-0000-4000-8000-000000000005', 'Brighton & Hove Albion', 'Brighton', 'BHA', 'Premier League', 'https://crests.football-data.org/397.png', '2025/26'),
  ('a0000001-0000-4000-8000-000000000006', 'Burnley', 'Burnley', 'BUR', 'Premier League', 'https://crests.football-data.org/328.png', '2025/26'),
  ('a0000001-0000-4000-8000-000000000007', 'Chelsea', 'Chelsea', 'CHE', 'Premier League', 'https://crests.football-data.org/61.png', '2025/26'),
  ('a0000001-0000-4000-8000-000000000008', 'Crystal Palace', 'Palace', 'CRY', 'Premier League', 'https://crests.football-data.org/354.png', '2025/26'),
  ('a0000001-0000-4000-8000-000000000009', 'Everton', 'Everton', 'EVE', 'Premier League', 'https://crests.football-data.org/62.png', '2025/26'),
  ('a0000001-0000-4000-8000-00000000000a', 'Fulham', 'Fulham', 'FUL', 'Premier League', 'https://crests.football-data.org/63.png', '2025/26'),
  ('a0000001-0000-4000-8000-00000000000b', 'Leeds United', 'Leeds', 'LEE', 'Premier League', 'https://crests.football-data.org/341.png', '2025/26'),
  ('a0000001-0000-4000-8000-00000000000c', 'Liverpool', 'Liverpool', 'LIV', 'Premier League', 'https://crests.football-data.org/64.png', '2025/26'),
  ('a0000001-0000-4000-8000-00000000000d', 'Manchester City', 'Man City', 'MCI', 'Premier League', 'https://crests.football-data.org/65.png', '2025/26'),
  ('a0000001-0000-4000-8000-00000000000e', 'Manchester United', 'Man United', 'MUN', 'Premier League', 'https://crests.football-data.org/66.png', '2025/26'),
  ('a0000001-0000-4000-8000-00000000000f', 'Newcastle United', 'Newcastle', 'NEW', 'Premier League', 'https://crests.football-data.org/67.png', '2025/26'),
  ('a0000001-0000-4000-8000-000000000010', 'Nottingham Forest', 'Forest', 'NFO', 'Premier League', 'https://crests.football-data.org/351.png', '2025/26'),
  ('a0000001-0000-4000-8000-000000000011', 'Sunderland', 'Sunderland', 'SUN', 'Premier League', 'https://crests.football-data.org/71.png', '2025/26'),
  ('a0000001-0000-4000-8000-000000000012', 'Tottenham Hotspur', 'Spurs', 'TOT', 'Premier League', 'https://crests.football-data.org/73.png', '2025/26'),
  ('a0000001-0000-4000-8000-000000000013', 'West Ham United', 'West Ham', 'WHU', 'Premier League', 'https://crests.football-data.org/563.png', '2025/26'),
  ('a0000001-0000-4000-8000-000000000014', 'Wolverhampton Wanderers', 'Wolves', 'WOL', 'Premier League', 'https://crests.football-data.org/76.png', '2025/26')
on conflict (name) do nothing;
