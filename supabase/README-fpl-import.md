# Import FPL-Core-Insights 25/26 Data to Supabase

This imports match data from your [ErmiasMesafnt1/FPL-Core-Insights](https://github.com/ErmiasMesafnt1/FPL-Core-Insights) repo into Supabase.

## Prerequisites

1. **Seed teams first** – Run `seed-teams.sql` (or `seed-teams-with-ids.sql`) in the Supabase SQL Editor so the `teams` table has 2025/26 Premier League teams.

2. **RLS policies** – Ensure the `teams` and `matches` tables allow read/write for your anon key (or service role) if you use RLS.

## Run the import

```bash
npm run import-fpl
```

This will:

- Fetch match data from `ErmiasMesafnt1/FPL-Core-Insights` (By Tournament → Premier League → GW1–38)
- Map team names to your Supabase `teams` table
- Insert into `matches` (season, competition, matchweek, home/away teams, kickoff, scores, status)
- Insert into `team_match_stats` (possession, xG, shots, corners, passes, fouls, cards) for finished matches

## What gets imported

- **matches**: All Premier League 25/26 fixtures with scores and status
- **team_match_stats**: Possession, xG, shots, corners, passes, fouls, yellow/red cards (for matches with stats)

## Troubleshooting

- **"No teams found"** – Run `seed-teams.sql` in Supabase SQL Editor.
- **"unknown team(s)"** – Team names from FPL don’t match your `teams` table; ensure seed uses the same names (e.g. "Brighton & Hove Albion", "Wolverhampton Wanderers").
- **RLS errors** – Add policies to allow `SELECT` on `teams` and `INSERT` on `matches` / `team_match_stats` for your auth setup.
