# Full FPL-Core-Insights Import Guide

Import all 25/26 data from [ErmiasMesafnt1/FPL-Core-Insights](https://github.com/ErmiasMesafnt1/FPL-Core-Insights) into Supabase.

## Order of Operations

### 1. Run migrations (SQL Editor)

```sql
-- Add FPL mapping columns for players
-- Run: supabase/add-fpl-columns.sql
```

### 2. Seed teams (if not done)

```sql
-- Run: supabase/seed-teams.sql
```

### 3. RLS policies (if import fails with "No teams found")

```sql
-- Run: supabase/rls-policies.sql
```

### 4. Run the import

```bash
npm run import-fpl
```

## What Gets Imported

| FPL Data | Supabase Table |
|----------|----------------|
| matches.csv (By Tournament/Premier League) | `matches` |
| matches stats | `team_match_stats` |
| players.csv | `players` |
| playermatchstats.csv | `player_match_stats` |

## Tables Used (no new tables needed)

Your existing schema already supports this. The script maps:

- **teams** – FPL team codes → your `teams` (by code ARS, AVL, etc.)
- **matches** – FPL match_id → your `matches` (by home/away/kickoff)
- **players** – FPL players → your `players` (with `fpl_player_id` for mapping)
- **player_match_stats** – FPL playermatchstats → your `player_match_stats`

## If Players Import Fails

Run `add-fpl-columns.sql` first. It adds `fpl_player_id` to `players` so the script can map FPL player IDs.
