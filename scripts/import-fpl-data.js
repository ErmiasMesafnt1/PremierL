#!/usr/bin/env node
/**
 * Import FPL-Core-Insights 25/26 data into Supabase
 * Fetches from https://github.com/ErmiasMesafnt1/FPL-Core-Insights
 *
 * Usage: node scripts/import-fpl-data.js
 * Requires: SUPABASE_URL and SUPABASE_ANON_KEY in .env
 */

const fs = require('fs');
const path = require('path');
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch {
  // dotenv optional
}

const FPL_REPO = 'ErmiasMesafnt1/FPL-Core-Insights';
const SEASON = '2025-2026';
const BASE_URL = `https://raw.githubusercontent.com/${FPL_REPO}/main/data/${SEASON}`;

// Map FPL match_id team slugs to Supabase team names
const TEAM_SLUG_TO_NAME = {
  arsenal: 'Arsenal',
  'aston-villa': 'Aston Villa',
  'afc-bournemouth': 'Bournemouth',
  bournemouth: 'Bournemouth',
  brentford: 'Brentford',
  'brighton-hove-albion': 'Brighton & Hove Albion',
  brighton: 'Brighton & Hove Albion',
  burnley: 'Burnley',
  chelsea: 'Chelsea',
  'crystal-palace': 'Crystal Palace',
  everton: 'Everton',
  fulham: 'Fulham',
  'leeds-united': 'Leeds United',
  leeds: 'Leeds United',
  liverpool: 'Liverpool',
  'manchester-city': 'Manchester City',
  'man-city': 'Manchester City',
  'manchester-united': 'Manchester United',
  'manchester utd': 'Manchester United',
  'man-utd': 'Manchester United',
  'newcastle-united': 'Newcastle United',
  newcastle: 'Newcastle United',
  'nottm-forest': 'Nottingham Forest',
  'nottingham-forest': 'Nottingham Forest',
  'nott\'m-forest': 'Nottingham Forest',
  sunderland: 'Sunderland',
  'tottenham-hotspur': 'Tottenham Hotspur',
  spurs: 'Tottenham Hotspur',
  'west-ham-united': 'West Ham United',
  'west-ham': 'West Ham United',
  'wolverhampton-wanderers': 'Wolverhampton Wanderers',
  wolves: 'Wolverhampton Wanderers',
};

function slugToTeamName(slug) {
  const normalized = slug.toLowerCase().replace(/\s+/g, '-');
  return TEAM_SLUG_TO_NAME[normalized] || slug.replace(/-/g, ' ');
}

function parseMatchId(matchId) {
  // Format: "25-26-prem-wolverhampton-wanderers-vs-manchester-city" or "25-26-prem-manchester-united-vs-arsenal"
  const parts = matchId.split('-vs-');
  if (parts.length !== 2) return null;
  const prefix = parts[0]; // "25-26-prem-wolverhampton-wanderers"
  const awaySlug = parts[1].split('/')[0]; // remove any trailing path
  const homeSlug = prefix.replace(/^\d+-\d+-prem-/, '');
  return {
    home: slugToTeamName(homeSlug),
    away: slugToTeamName(awaySlug),
  };
}

async function fetchCsv(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.text();
}

function parseCsv(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') inQuotes = !inQuotes;
      else if ((c === ',' && !inQuotes) || c === '\n') {
        values.push(current.trim());
        current = '';
        if (c === '\n') break;
      } else current += c;
    }
    values.push(current.trim());
    const row = {};
    headers.forEach((h, i) => (row[h.trim()] = values[i] ?? ''));
    return row;
  });
}

async function main() {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
    process.exit(1);
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey);

  let teamsByCode = {};
  let teamsByName = {};

  try {
    const teamsRes = await supabase.from('teams').select('id, name, code').eq('season', '2025/26');
    if (teamsRes.error) throw teamsRes.error;
    for (const t of teamsRes.data || []) {
      teamsByCode[t.code] = t.id;
      teamsByName[t.name] = t.id;
    }
    if (Object.keys(teamsByName).length === 0) {
      console.error('No teams found in Supabase.');
      console.error('1. Run seed-teams.sql in the SQL Editor');
      console.error('2. Add an RLS policy on the TEAMS table: Policy for SELECT with using(true)');
      process.exit(1);
    }
    console.log(`Loaded ${Object.keys(teamsByName).length} teams from Supabase`);
  } catch (e) {
    console.error('Failed to fetch teams:', e.message);
    console.error('Make sure you have run seed-teams.sql and RLS allows reading the teams table.');
    process.exit(1);
  }

  const resolveTeamId = (nameOrSlug) => {
    const name = typeof nameOrSlug === 'string' && nameOrSlug.includes('-')
      ? slugToTeamName(nameOrSlug)
      : nameOrSlug;
    return teamsByName[name] || teamsByCode[name];
  };

  const allMatches = [];
  const seenMatchIds = new Set();

  for (let gw = 1; gw <= 38; gw++) {
    const gwStr = gw < 10 ? `GW${gw}` : `GW${gw}`;
    const url = `${BASE_URL}/By%20Tournament/Premier%20League/${gwStr}/matches.csv`;
    try {
      const csv = await fetchCsv(url);
      const rows = parseCsv(csv);
      for (const row of rows) {
        const matchId = row.match_id;
        if (!matchId || seenMatchIds.has(matchId)) continue;
        seenMatchIds.add(matchId);

        const teams = parseMatchId(matchId);
        if (!teams) continue;

        const homeId = resolveTeamId(teams.home);
        const awayId = resolveTeamId(teams.away);
        if (!homeId || !awayId) {
          console.warn(`Skipping ${matchId}: unknown team(s) ${teams.home} / ${teams.away}`);
          continue;
        }

        const kickoff = (row.kickoff_time || '').trim();
        if (!kickoff) continue; // skip matches without a kickoff time
        const homeScore = row.home_score ? parseInt(row.home_score, 10) : null;
        const awayScore = row.away_score ? parseInt(row.away_score, 10) : null;
        const finished = row.finished === 'True' || row.finished === 'true';

        allMatches.push({
          season: '2025/26',
          competition: 'Premier League',
          matchweek: parseInt(row.gameweek, 10) || gw,
          home_team_id: homeId,
          away_team_id: awayId,
          kickoff_at: kickoff,
          home_score: homeScore,
          away_score: awayScore,
          status: finished ? 'finished' : 'scheduled',
          fpl_match_id: matchId,
          home_possession: row.home_possession ? parseFloat(row.home_possession) : null,
          away_possession: row.away_possession ? parseFloat(row.away_possession) : null,
          home_xg: row.home_expected_goals_xg ? parseFloat(row.home_expected_goals_xg) : null,
          away_xg: row.away_expected_goals_xg ? parseFloat(row.away_expected_goals_xg) : null,
          home_shots: row.home_total_shots ? parseInt(row.home_total_shots, 10) : null,
          away_shots: row.away_total_shots ? parseInt(row.away_total_shots, 10) : null,
          home_shots_on_target: row.home_shots_on_target ? parseInt(row.home_shots_on_target, 10) : null,
          away_shots_on_target: row.away_shots_on_target ? parseInt(row.away_shots_on_target, 10) : null,
          home_corners: row.home_corners ? parseInt(row.home_corners, 10) : null,
          away_corners: row.away_corners ? parseInt(row.away_corners, 10) : null,
          home_passes: row.home_accurate_passes ? parseInt(row.home_accurate_passes, 10) : null,
          away_passes: row.away_accurate_passes ? parseInt(row.away_accurate_passes, 10) : null,
          home_pass_pct: row.home_accurate_passes_pct ? parseFloat(row.home_accurate_passes_pct) : null,
          away_pass_pct: row.away_accurate_passes_pct ? parseFloat(row.away_accurate_passes_pct) : null,
          home_fouls: row.home_fouls_committed ? parseInt(row.home_fouls_committed, 10) : null,
          away_fouls: row.away_fouls_committed ? parseInt(row.away_fouls_committed, 10) : null,
          home_yellow: row.home_yellow_cards ? parseInt(row.home_yellow_cards, 10) : null,
          away_yellow: row.away_yellow_cards ? parseInt(row.away_yellow_cards, 10) : null,
          home_red: row.home_red_cards ? parseInt(row.home_red_cards, 10) : null,
          away_red: row.away_red_cards ? parseInt(row.away_red_cards, 10) : null,
          home_saves: row.home_keeper_saves ? parseInt(row.home_keeper_saves, 10) : null,
          away_saves: row.away_keeper_saves ? parseInt(row.away_keeper_saves, 10) : null,
          home_xg_set_play: row.home_xg_set_play ? parseFloat(row.home_xg_set_play) : null,
          away_xg_set_play: row.away_xg_set_play ? parseFloat(row.away_xg_set_play) : null,
        });
      }
    } catch (e) {
      if (e.message?.includes('404')) break;
      console.warn(`GW${gw}: ${e.message}`);
    }
  }

  console.log(`Found ${allMatches.length} matches from FPL-Core-Insights`);

  if (allMatches.length === 0) {
    console.log('No matches to import.');
    return;
  }

  const matchesTable = allMatches.map((m) => ({
    season: m.season,
    competition: m.competition,
    matchweek: m.matchweek,
    home_team_id: m.home_team_id,
    away_team_id: m.away_team_id,
    kickoff_at: m.kickoff_at,
    home_score: m.home_score,
    away_score: m.away_score,
    status: m.status,
  }));

  const { data: existingMatches } = await supabase
    .from('matches')
    .select('home_team_id, away_team_id, kickoff_at')
    .eq('season', '2025/26');
  const existingSet = new Set(
    (existingMatches || []).map((m) => `${m.home_team_id}|${m.away_team_id}|${m.kickoff_at}`)
  );
  const toInsert = matchesTable.filter(
    (m) => m.kickoff_at && !existingSet.has(`${m.home_team_id}|${m.away_team_id}|${m.kickoff_at}`)
  );

  if (toInsert.length === 0) {
    console.log('All matches already exist in Supabase. Skipping insert.');
  } else {
    const { error } = await supabase.from('matches').insert(toInsert);

    if (error) {
      console.error('Matches insert error:', error.message);
    } else {
      console.log(`Imported ${toInsert.length} matches (${matchesTable.length - toInsert.length} already existed).`);
    }
  }

  const { data: dbMatches } = await supabase
    .from('matches')
    .select('id, home_team_id, away_team_id, matchweek')
    .eq('season', '2025/26');

  // Use matchweek instead of kickoff_at (timestamp format can differ between CSV and DB)
  const matchKey = (m) => `${m.home_team_id}|${m.away_team_id}|${m.matchweek}`;
  const dbMatchMap = new Map((dbMatches || []).map((d) => [matchKey(d), d]));
  const fplMatchToDbId = new Map();
  for (const m of allMatches) {
    const db = dbMatchMap.get(matchKey(m));
    if (db && m.fpl_match_id) fplMatchToDbId.set(m.fpl_match_id, db.id);
  }

  // Always import/upsert team_match_stats (matches team_match_stats table columns)
  if (allMatches.length > 0 && dbMatches?.length) {
    const stats = [];
    for (const m of allMatches) {
      const dbMatch = dbMatchMap.get(matchKey(m));
      if (!dbMatch) continue;
      if (m.home_possession != null || m.home_xg != null || m.home_shots != null) {
        stats.push({
          match_id: dbMatch.id,
          team_id: m.home_team_id,
          possession_percent: m.home_possession ?? null,
          xg: m.home_xg ?? null,
          xga: m.away_xg ?? null,
          xg_set_play: m.home_xg_set_play ?? null,
          shots: m.home_shots ?? 0,
          shots_on_target: m.home_shots_on_target ?? 0,
          corners_taken: m.home_corners ?? 0,
          corners_conceded: m.away_corners ?? 0,
          saves: m.home_saves ?? 0,
          fouls: m.home_fouls ?? 0,
          yellow_cards: m.home_yellow ?? 0,
          red_cards: m.home_red ?? 0,
          passes_completed: m.home_passes ?? 0,
          pass_accuracy: m.home_pass_pct ?? null,
        });
      }
      if (m.away_possession != null || m.away_xg != null || m.away_shots != null) {
        stats.push({
          match_id: dbMatch.id,
          team_id: m.away_team_id,
          possession_percent: m.away_possession ?? null,
          xg: m.away_xg ?? null,
          xga: m.home_xg ?? null,
          xg_set_play: m.away_xg_set_play ?? null,
          shots: m.away_shots ?? 0,
          shots_on_target: m.away_shots_on_target ?? 0,
          corners_taken: m.away_corners ?? 0,
          corners_conceded: m.home_corners ?? 0,
          saves: m.away_saves ?? 0,
          fouls: m.away_fouls ?? 0,
          yellow_cards: m.away_yellow ?? 0,
          red_cards: m.away_red ?? 0,
          passes_completed: m.away_passes ?? 0,
          pass_accuracy: m.away_pass_pct ?? null,
        });
      }
    }
    if (stats.length > 0) {
      const { error: statsErr } = await supabase.from('team_match_stats').upsert(stats, {
        onConflict: 'match_id,team_id',
        ignoreDuplicates: false,
      });
      if (statsErr) console.warn('team_match_stats:', statsErr.message);
      else console.log(`Imported/updated ${stats.length} team_match_stats rows.`);
    } else {
      const matched = allMatches.filter((m) => dbMatchMap.has(matchKey(m))).length;
      console.warn(`team_match_stats: 0 rows. Matched ${matched}/${allMatches.length} matches to DB.`);
    }
  }

  // --- Import players from FPL ---
  const fplTeamsCsv = await fetchCsv(`${BASE_URL}/teams.csv`).catch(() => '');
  const fplTeamCodeToOurCode = {};
  if (fplTeamsCsv) {
    const fplTeams = parseCsv(fplTeamsCsv);
    for (const row of fplTeams) {
      const fplCode = String(row.code || row.id || '').trim();
      const shortName = (row.short_name || row.name || '').trim();
      if (fplCode && shortName) fplTeamCodeToOurCode[fplCode] = shortName;
    }
  }

  const playersCsv = await fetchCsv(`${BASE_URL}/players.csv`).catch(() => '');
  if (playersCsv) {
    const rows = parseCsv(playersCsv);
    const toInsertPlayers = [];
    for (const row of rows) {
      const teamCode = fplTeamCodeToOurCode[row.team_code] || row.team_code;
      const teamId = teamsByCode[teamCode];
      if (!teamId) continue;
      const fullName = [row.first_name, row.second_name].filter(Boolean).join(' ') || row.web_name;
      if (!fullName) continue;
      toInsertPlayers.push({
        team_id: teamId,
        full_name: fullName,
        short_name: row.web_name || null,
        position: row.position || 'Midfielder',
        fpl_player_id: parseInt(row.player_id, 10) || null,
        opta_id: row.player_code ? String(row.player_code).trim() : null,
        active: true,
      });
    }
    if (toInsertPlayers.length > 0) {
      const { error: playersErr } = await supabase.from('players').upsert(toInsertPlayers, {
        onConflict: 'fpl_player_id',
        ignoreDuplicates: false,
      });
      if (playersErr) {
        if (playersErr.message?.includes('fpl_player_id')) {
          console.warn('Players: Run add-fpl-columns.sql first. Skipping players import.');
        } else console.warn('Players:', playersErr.message);
      } else console.log(`Imported ${toInsertPlayers.length} players.`);
    }
  }

  // --- Import player_match_stats from playermatchstats ---
  const playersByFplId = {};
  const { data: dbPlayers } = await supabase.from('players').select('id, fpl_player_id, team_id').not('fpl_player_id', 'is', null);
  for (const p of dbPlayers || []) {
    playersByFplId[String(p.fpl_player_id)] = p;
  }

  let totalPms = 0;
  for (let gw = 1; gw <= 38; gw++) {
    const gwStr = `GW${gw}`;
    try {
      const pmsCsv = await fetchCsv(`${BASE_URL}/By%20Tournament/Premier%20League/${gwStr}/playermatchstats.csv`);
      const rows = parseCsv(pmsCsv);
      const batch = [];
      for (const row of rows) {
        const matchUuid = fplMatchToDbId.get(row.match_id);
        const player = playersByFplId[String(row.player_id)];
        if (!matchUuid || !player) continue;
        const mins = parseInt(row.minutes_played, 10) || 0;
        const goals = parseInt(row.goals, 10) || 0;
        const assists = parseInt(row.assists, 10) || 0;
        const shots = parseInt(row.total_shots, 10) || 0;
        const shotsOnTarget = parseInt(row.shots_on_target, 10) || 0;
        const passes = parseInt(row.accurate_passes, 10) || 0;
        const passPct = row.accurate_passes_percent ? parseFloat(row.accurate_passes_percent) : null;
        const tackles = parseInt(row.tackles_won, 10) || 0;
        const interceptions = parseInt(row.interceptions, 10) || 0;
        const clearances = parseInt(row.clearances, 10) || 0;
        const blocks = parseInt(row.blocks, 10) || 0;
        const aerialWon = parseInt(row.aerial_duels_won, 10) || 0;
        const saves = parseInt(row.saves, 10) || 0;
        const startMin = parseInt(row.start_min, 10);
        const finishMin = parseInt(row.finish_min, 10);
        batch.push({
          match_id: matchUuid,
          player_id: player.id,
          team_id: player.team_id,
          minutes_played: mins,
          goals,
          assists,
          shots,
          shots_on_target: shotsOnTarget,
          passes_completed: passes,
          pass_accuracy: passPct,
          tackles,
          interceptions,
          clearances,
          blocks,
          aerial_duels_won: aerialWon,
          saves,
          was_subbed_on: mins > 0 && startMin > 0,
          was_subbed_off: mins > 0 && finishMin < 90 && finishMin > 0,
        });
      }
      if (batch.length > 0) {
        const { error: pmsErr } = await supabase.from('player_match_stats').upsert(batch, {
          onConflict: 'match_id,player_id',
          ignoreDuplicates: true,
        });
        if (!pmsErr) totalPms += batch.length;
      }
    } catch (e) {
      if (!e.message?.includes('404')) console.warn(`GW${gw} playermatchstats:`, e.message);
    }
  }
  if (totalPms > 0) console.log(`Imported ${totalPms} player_match_stats rows.`);

  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
