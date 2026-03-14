# Importing Matches into Supabase

Two ways to fill the `matches` table with real Premier League 2025/26 fixtures:

## Option A: CSV Import (fresh setup only)

1. Run `seed-teams-with-ids.sql` first (creates teams with fixed UUIDs)
2. In Supabase: **Table Editor** → **matches** → **Import data from CSV**
3. Upload `matches.csv` and map columns (they match the table)

## Option B: SQL Import (works with existing teams)

1. Ensure teams are seeded (`seed-teams.sql` or `seed-teams-with-ids.sql`)
2. Run `seed-matches.sql` in the SQL Editor

This resolves team IDs by name, so it works regardless of how teams were seeded.

---

**matches.csv** contains 100 fixtures from matchweeks 1–10 (real 2025/26 Premier League data).
**seed-matches.sql** currently includes matchweeks 1–2 (20 fixtures); extend it as needed.
