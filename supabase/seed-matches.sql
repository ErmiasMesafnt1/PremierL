-- Seed Premier League 2025/26 matches into the matches table
-- Run this in Supabase SQL Editor after teams are seeded
-- Works with seed-teams.sql (resolves team IDs by name)

-- Matchweek 1
insert into public.matches (season, competition, matchweek, home_team_id, away_team_id, kickoff_at, status)
select '2025/26','Premier League',1,h.id,a.id,'2025-08-15 20:00:00+01'::timestamptz,'scheduled'
from (select id from teams where name='Liverpool' limit 1)h,(select id from teams where name='Bournemouth' limit 1)a
union all select '2025/26','Premier League',1,h.id,a.id,'2025-08-16 12:30:00+01'::timestamptz,'scheduled'
from (select id from teams where name='Aston Villa' limit 1)h,(select id from teams where name='Newcastle United' limit 1)a
union all select '2025/26','Premier League',1,h.id,a.id,'2025-08-16 15:00:00+01'::timestamptz,'scheduled'
from (select id from teams where name='Brighton & Hove Albion' limit 1)h,(select id from teams where name='Fulham' limit 1)a
union all select '2025/26','Premier League',1,h.id,a.id,'2025-08-16 15:00:00+01'::timestamptz,'scheduled'
from (select id from teams where name='Sunderland' limit 1)h,(select id from teams where name='West Ham United' limit 1)a
union all select '2025/26','Premier League',1,h.id,a.id,'2025-08-16 15:00:00+01'::timestamptz,'scheduled'
from (select id from teams where name='Tottenham Hotspur' limit 1)h,(select id from teams where name='Burnley' limit 1)a
union all select '2025/26','Premier League',1,h.id,a.id,'2025-08-16 17:30:00+01'::timestamptz,'scheduled'
from (select id from teams where name='Wolverhampton Wanderers' limit 1)h,(select id from teams where name='Manchester City' limit 1)a
union all select '2025/26','Premier League',1,h.id,a.id,'2025-08-17 14:00:00+01'::timestamptz,'scheduled'
from (select id from teams where name='Chelsea' limit 1)h,(select id from teams where name='Crystal Palace' limit 1)a
union all select '2025/26','Premier League',1,h.id,a.id,'2025-08-17 14:00:00+01'::timestamptz,'scheduled'
from (select id from teams where name='Nottingham Forest' limit 1)h,(select id from teams where name='Brentford' limit 1)a
union all select '2025/26','Premier League',1,h.id,a.id,'2025-08-17 16:30:00+01'::timestamptz,'scheduled'
from (select id from teams where name='Manchester United' limit 1)h,(select id from teams where name='Arsenal' limit 1)a
union all select '2025/26','Premier League',1,h.id,a.id,'2025-08-18 20:00:00+01'::timestamptz,'scheduled'
from (select id from teams where name='Leeds United' limit 1)h,(select id from teams where name='Everton' limit 1)a;

-- Matchweek 2
insert into public.matches (season, competition, matchweek, home_team_id, away_team_id, kickoff_at, status)
select '2025/26','Premier League',2,h.id,a.id,'2025-08-22 20:00:00+01'::timestamptz,'scheduled'
from (select id from teams where name='West Ham United' limit 1)h,(select id from teams where name='Chelsea' limit 1)a
union all select '2025/26','Premier League',2,h.id,a.id,'2025-08-23 12:30:00+01'::timestamptz,'scheduled'
from (select id from teams where name='Manchester City' limit 1)h,(select id from teams where name='Tottenham Hotspur' limit 1)a
union all select '2025/26','Premier League',2,h.id,a.id,'2025-08-23 15:00:00+01'::timestamptz,'scheduled'
from (select id from teams where name='Bournemouth' limit 1)h,(select id from teams where name='Wolverhampton Wanderers' limit 1)a
union all select '2025/26','Premier League',2,h.id,a.id,'2025-08-23 15:00:00+01'::timestamptz,'scheduled'
from (select id from teams where name='Brentford' limit 1)h,(select id from teams where name='Aston Villa' limit 1)a
union all select '2025/26','Premier League',2,h.id,a.id,'2025-08-23 15:00:00+01'::timestamptz,'scheduled'
from (select id from teams where name='Burnley' limit 1)h,(select id from teams where name='Sunderland' limit 1)a
union all select '2025/26','Premier League',2,h.id,a.id,'2025-08-23 17:30:00+01'::timestamptz,'scheduled'
from (select id from teams where name='Arsenal' limit 1)h,(select id from teams where name='Leeds United' limit 1)a
union all select '2025/26','Premier League',2,h.id,a.id,'2025-08-24 14:00:00+01'::timestamptz,'scheduled'
from (select id from teams where name='Crystal Palace' limit 1)h,(select id from teams where name='Nottingham Forest' limit 1)a
union all select '2025/26','Premier League',2,h.id,a.id,'2025-08-24 14:00:00+01'::timestamptz,'scheduled'
from (select id from teams where name='Everton' limit 1)h,(select id from teams where name='Brighton & Hove Albion' limit 1)a
union all select '2025/26','Premier League',2,h.id,a.id,'2025-08-24 16:30:00+01'::timestamptz,'scheduled'
from (select id from teams where name='Fulham' limit 1)h,(select id from teams where name='Manchester United' limit 1)a
union all select '2025/26','Premier League',2,h.id,a.id,'2025-08-25 20:00:00+01'::timestamptz,'scheduled'
from (select id from teams where name='Newcastle United' limit 1)h,(select id from teams where name='Liverpool' limit 1)a;
