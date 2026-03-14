-- RLS policies for profiles, teams, matches, team_match_stats, players, player_match_stats
-- Run this in Supabase SQL Editor. Safe to run multiple times (drops before create).

-- Profiles: users can only read/write their own profile (id = auth.uid())
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

drop policy if exists "teams_select_public" on public.teams;
create policy "teams_select_public" on public.teams for select using (true);

drop policy if exists "matches_select_public" on public.matches;
create policy "matches_select_public" on public.matches for select using (true);

drop policy if exists "matches_insert_public" on public.matches;
create policy "matches_insert_public" on public.matches for insert with check (true);

drop policy if exists "team_match_stats_select_public" on public.team_match_stats;
create policy "team_match_stats_select_public" on public.team_match_stats for select using (true);

drop policy if exists "team_match_stats_insert_public" on public.team_match_stats;
create policy "team_match_stats_insert_public" on public.team_match_stats for insert with check (true);

drop policy if exists "team_match_stats_update_public" on public.team_match_stats;
create policy "team_match_stats_update_public" on public.team_match_stats for update using (true) with check (true);

drop policy if exists "players_select_public" on public.players;
create policy "players_select_public" on public.players for select using (true);

drop policy if exists "players_insert_public" on public.players;
create policy "players_insert_public" on public.players for insert with check (true);

drop policy if exists "players_update_public" on public.players;
create policy "players_update_public" on public.players for update using (true) with check (true);

drop policy if exists "player_match_stats_select_public" on public.player_match_stats;
create policy "player_match_stats_select_public" on public.player_match_stats for select using (true);

drop policy if exists "player_match_stats_insert_public" on public.player_match_stats;
create policy "player_match_stats_insert_public" on public.player_match_stats for insert with check (true);

drop policy if exists "player_match_stats_update_public" on public.player_match_stats;
create policy "player_match_stats_update_public" on public.player_match_stats for update using (true) with check (true);
