import { useMemo } from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { useAuthStyles } from '@/hooks/useThemeStyles';
import { useTheme } from '@/providers/ThemeProvider';

function useHomeStyles(colors: (typeof import('@/constants/theme').ThemeColors)['light'], isDark: boolean) {
  const wordColor = isDark ? '#FFFFFF' : colors.text;
  const labelColor = isDark ? '#FFFFFF' : colors.muted;
  const statValueColor = isDark ? colors.PL_FUCHSIA : colors.text;

  return useMemo(
    () =>
      StyleSheet.create({
        loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        container: { flex: 1, backgroundColor: colors.bg },
        secondCard: { marginTop: 20 },
        scroll: { flex: 1 },
        scrollContent: { padding: 20, paddingBottom: 32 },
        logoContainer: { alignItems: 'center', marginBottom: 20 },
        loadingLogoContainer: { paddingTop: 20 },
        logoBorder: {
          padding: 12,
          borderRadius: 20,
          borderWidth: 4,
          borderColor: colors.PL_FUCHSIA,
          backgroundColor: colors.card,
          alignItems: 'center',
          justifyContent: 'center',
        },
        logo: { width: 120, height: 120 },
        loadingText: { marginTop: 12, fontSize: 15, color: colors.muted },
        emptyText: { fontSize: 15, color: colors.muted, textAlign: 'center', paddingVertical: 24 },
        rankList: { marginTop: 8, gap: 4 },
        rankRow: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 12,
          borderRadius: 12,
          backgroundColor: colors.searchBg,
          marginBottom: 6,
          borderLeftWidth: 4,
          borderLeftColor: colors.PL_CYAN,
        },
        rankNum: {
          width: 28,
          fontSize: 18,
          fontWeight: '800',
          color: colors.PL_BRAND,
          textAlign: 'center',
        },
        badge: { width: 36, height: 36, marginRight: 12, borderRadius: 18 },
        badgePlaceholder: { backgroundColor: colors.cardBorder },
        rankInfo: { flex: 1 },
        teamName: { fontSize: 16, fontWeight: '700', color: colors.text },
        statText: { fontSize: 13, color: colors.muted, marginTop: 2 },
        modalOverlay: {
          flex: 1,
          backgroundColor: colors.modalOverlay,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        },
        modalContent: {
          backgroundColor: colors.modalBg,
          borderRadius: 16,
          width: '100%',
          maxWidth: 360,
          maxHeight: '85%',
          overflow: 'hidden',
        },
        modalHeader: {
          alignItems: 'center',
          paddingVertical: 24,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: colors.cardBorder,
        },
        modalBadge: { width: 64, height: 64, marginBottom: 12, borderRadius: 32 },
        modalTitle: { fontSize: 20, fontWeight: '800', color: wordColor, textAlign: 'center' },
        modalSubtitle: { fontSize: 14, color: labelColor, marginTop: 4 },
        modalStats: { maxHeight: 320, paddingHorizontal: 20, paddingVertical: 16 },
        statRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: colors.rowBorder,
        },
        statLabel: { fontSize: 15, color: labelColor },
        statValue: { fontSize: 15, fontWeight: '700', color: statValueColor },
        closeButton: {
          margin: 20,
          paddingVertical: 14,
          backgroundColor: colors.PL_BRAND,
          borderRadius: 12,
          alignItems: 'center',
        },
        closeButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
      }),
    [colors, isDark]
  );
}

interface TeamRanking {
  rank: number;
  teamId: string;
  teamName: string;
  badgeUrl: string | null;
  cornersTaken: number;
  cornersConceded: number;
  totalGoals: number;
  xgSetPlay: number;
  totalXg: number;
  totalXga: number;
  setPieceGoalsPct: number;
  openPlayGoalsPct: number;
  matchesPlayed: number;
  possession: number;
  shots: number;
  shotsOnTarget: number;
  passesCompleted: number;
  passAccuracy: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  saves: number;
}

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const authStyles = useAuthStyles();
  const styles = useHomeStyles(colors, isDark);
  const [openPlayRankings, setOpenPlayRankings] = useState<TeamRanking[]>([]);
  const [setPieceRankings, setSetPieceRankings] = useState<TeamRanking[]>([]);
  const [cornersRankings, setCornersRankings] = useState<TeamRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<TeamRanking | null>(null);

  useEffect(() => {
    async function fetchRankings() {
      const { data: stats, error: statsErr } = await supabase
        .from('team_match_stats')
        .select(
          'team_id, corners_taken, corners_conceded, xg, xga, xg_set_play, possession_percent, shots, shots_on_target, passes_completed, pass_accuracy, fouls, yellow_cards, red_cards, saves'
        )
        .not('corners_taken', 'is', null);

      if (statsErr) {
        console.error('team_match_stats:', statsErr);
        setLoading(false);
        return;
      }

      const { data: matches, error: matchesErr } = await supabase
        .from('matches')
        .select('home_team_id, away_team_id, matchweek, home_score, away_score')
        .eq('season', '2025/26')
        .eq('status', 'finished');

      if (matchesErr) {
        console.error('matches:', matchesErr);
      }

      // Deduplicate by (home, away, matchweek) — same fixture can appear multiple times if import ran repeatedly
      const matchKey = (m: { home_team_id: string; away_team_id: string; matchweek?: number | null }) =>
        `${m.home_team_id}|${m.away_team_id}|${m.matchweek ?? ''}`;
      const seenKeys = new Set<string>();
      const uniqueMatches = (matches || []).filter((m) => {
        const key = matchKey(m);
        if (seenKeys.has(key)) return false;
        seenKeys.add(key);
        return true;
      });

      const teamIds = [...new Set((stats || []).map((s) => s.team_id))];
      if (teamIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: teams, error: teamsErr } = await supabase
        .from('teams')
        .select('id, name, badge_url')
        .in('id', teamIds);

      if (teamsErr || !teams?.length) {
        setLoading(false);
        return;
      }

      const teamMap = new Map(teams.map((t) => [t.id, t]));

      const cornersByTeam = new Map<string, number>();
      const cornersConcededByTeam = new Map<string, number>();
      const xgByTeam = new Map<string, number>();
      const xgaByTeam = new Map<string, number>();
      const xgSetPlayByTeam = new Map<string, number>();
      const goalsByTeam = new Map<string, number>();
      const possessionByTeam = new Map<string, number[]>();
      const shotsByTeam = new Map<string, number>();
      const shotsOnTargetByTeam = new Map<string, number>();
      const passesByTeam = new Map<string, number>();
      const passAccuracyByTeam = new Map<string, number[]>();
      const foulsByTeam = new Map<string, number>();
      const yellowByTeam = new Map<string, number>();
      const redByTeam = new Map<string, number>();
      const savesByTeam = new Map<string, number>();
      const matchesByTeam = new Map<string, number>();

      for (const s of stats || []) {
        const tid = s.team_id;
        cornersByTeam.set(tid, (cornersByTeam.get(tid) || 0) + (s.corners_taken || 0));
        cornersConcededByTeam.set(tid, (cornersConcededByTeam.get(tid) || 0) + (s.corners_conceded || 0));
        xgByTeam.set(tid, (xgByTeam.get(tid) || 0) + (s.xg || 0));
        xgaByTeam.set(tid, (xgaByTeam.get(tid) || 0) + (s.xga || 0));
        xgSetPlayByTeam.set(tid, (xgSetPlayByTeam.get(tid) || 0) + (s.xg_set_play || 0));
        shotsByTeam.set(tid, (shotsByTeam.get(tid) || 0) + (s.shots || 0));
        shotsOnTargetByTeam.set(tid, (shotsOnTargetByTeam.get(tid) || 0) + (s.shots_on_target || 0));
        passesByTeam.set(tid, (passesByTeam.get(tid) || 0) + (s.passes_completed || 0));
        foulsByTeam.set(tid, (foulsByTeam.get(tid) || 0) + (s.fouls || 0));
        yellowByTeam.set(tid, (yellowByTeam.get(tid) || 0) + (s.yellow_cards || 0));
        redByTeam.set(tid, (redByTeam.get(tid) || 0) + (s.red_cards || 0));
        savesByTeam.set(tid, (savesByTeam.get(tid) || 0) + (s.saves || 0));
        matchesByTeam.set(tid, (matchesByTeam.get(tid) || 0) + 1);
        if (s.possession_percent != null) {
          const arr = possessionByTeam.get(tid) || [];
          arr.push(s.possession_percent);
          possessionByTeam.set(tid, arr);
        }
        if (s.pass_accuracy != null) {
          const arr = passAccuracyByTeam.get(tid) || [];
          arr.push(s.pass_accuracy);
          passAccuracyByTeam.set(tid, arr);
        }
      }

      for (const m of uniqueMatches) {
        const h = m.home_team_id;
        const a = m.away_team_id;
        goalsByTeam.set(h, (goalsByTeam.get(h) || 0) + (m.home_score || 0));
        goalsByTeam.set(a, (goalsByTeam.get(a) || 0) + (m.away_score || 0));
      }

      const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

      const all: TeamRanking[] = teamIds
        .map((tid) => {
          const team = teamMap.get(tid);
          if (!team) return null;
          const corners = cornersByTeam.get(tid) || 0;
          const cornersConceded = cornersConcededByTeam.get(tid) || 0;
          const xg = xgByTeam.get(tid) || 0;
          const xga = xgaByTeam.get(tid) || 0;
          const xgSet = xgSetPlayByTeam.get(tid) || 0;
          const goals = goalsByTeam.get(tid) || 0;
          const matchesPlayed = matchesByTeam.get(tid) || 0;
          const setPiecePct = xg > 0 ? (xgSet / xg) * 100 : 0;
          const openPlayPct = xg > 0 ? 100 - setPiecePct : 0;
          return {
            rank: 0,
            teamId: tid,
            teamName: team.name,
            badgeUrl: team.badge_url,
            cornersTaken: corners,
            cornersConceded,
            totalGoals: goals,
            xgSetPlay: xgSet,
            totalXg: xg,
            totalXga: xga,
            setPieceGoalsPct: Math.round(setPiecePct * 10) / 10,
            openPlayGoalsPct: Math.round(openPlayPct * 10) / 10,
            matchesPlayed,
            possession: Math.round(avg(possessionByTeam.get(tid) || []) * 10) / 10,
            shots: shotsByTeam.get(tid) || 0,
            shotsOnTarget: shotsOnTargetByTeam.get(tid) || 0,
            passesCompleted: passesByTeam.get(tid) || 0,
            passAccuracy: Math.round(avg(passAccuracyByTeam.get(tid) || []) * 10) / 10,
            fouls: foulsByTeam.get(tid) || 0,
            yellowCards: yellowByTeam.get(tid) || 0,
            redCards: redByTeam.get(tid) || 0,
            saves: savesByTeam.get(tid) || 0,
          };
        })
        .filter((r): r is TeamRanking => r != null);

      const byOpenPlay = [...all]
        .filter((r) => r.totalXg > 0)
        .sort((a, b) => b.openPlayGoalsPct - a.openPlayGoalsPct)
        .slice(0, 10)
        .map((r, i) => ({ ...r, rank: i + 1 }));

      const bySetPiece = [...all]
        .filter((r) => r.totalXg > 0)
        .sort((a, b) => b.setPieceGoalsPct - a.setPieceGoalsPct)
        .slice(0, 10)
        .map((r, i) => ({ ...r, rank: i + 1 }));

      const byCorners = [...all]
        .sort((a, b) => b.cornersTaken - a.cornersTaken)
        .slice(0, 10)
        .map((r, i) => ({ ...r, rank: i + 1 }));

      setOpenPlayRankings(byOpenPlay);
      setSetPieceRankings(bySetPiece);
      setCornersRankings(byCorners);
      setLoading(false);
    }

    fetchRankings();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={[styles.logoContainer, styles.loadingLogoContainer]}>
          <View style={styles.logoBorder}>
            <ExpoImage
              source={require('@/assets/images/totw-logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
        </View>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.PL_BRAND} />
          <Text style={styles.loadingText}>Loading rankings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const teamLookup = new Map<string, TeamRanking>();
  [...openPlayRankings, ...setPieceRankings, ...cornersRankings].forEach((r) => teamLookup.set(r.teamId, r));

  const RankRow = ({
    r,
    primaryStat,
    secondaryStat,
    onPress,
  }: {
    r: TeamRanking;
    primaryStat: string;
    secondaryStat: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity key={r.teamId} style={styles.rankRow} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.rankNum}>{r.rank}</Text>
      {r.badgeUrl ? (
        <Image source={{ uri: r.badgeUrl }} style={styles.badge} />
      ) : (
        <View style={[styles.badge, styles.badgePlaceholder]} />
      )}
      <View style={styles.rankInfo}>
        <Text style={styles.teamName}>{r.teamName}</Text>
        <Text style={styles.statText}>
          {primaryStat} • {secondaryStat}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBorder}>
            <ExpoImage
              source={require('@/assets/images/totw-logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
        </View>
        <View style={authStyles.formCard}>
          <Text style={authStyles.title}>Goals from Open Play</Text>
          <Text style={authStyles.subtitle}>
            Top 10 by % of goals from open play (est.) • 2025/26
          </Text>

          {openPlayRankings.length === 0 ? (
            <Text style={styles.emptyText}>
              No data yet. Run the FPL import and add team_match_stats.
            </Text>
          ) : (
            <View style={styles.rankList}>
              {openPlayRankings.map((r) => (
                <RankRow
                  key={r.teamId}
                  r={r}
                  primaryStat={`~${r.openPlayGoalsPct}% goals from open play`}
                  secondaryStat={`${r.totalGoals} goals • ${r.cornersTaken} corners`}
                  onPress={() => setSelectedTeam(teamLookup.get(r.teamId) ?? r)}
                />
              ))}
            </View>
          )}
        </View>

        <View style={[authStyles.formCard, styles.secondCard]}>
          <Text style={authStyles.title}>Goals from Set Pieces</Text>
          <Text style={authStyles.subtitle}>
            Top 10 by % of goals from set pieces (est.) • 2025/26
          </Text>

          {setPieceRankings.length === 0 ? (
            <Text style={styles.emptyText}>
              No data yet. Run the FPL import and add team_match_stats.
            </Text>
          ) : (
            <View style={styles.rankList}>
              {setPieceRankings.map((r) => (
                <RankRow
                  key={r.teamId}
                  r={r}
                  primaryStat={`~${r.setPieceGoalsPct}% goals from set pieces`}
                  secondaryStat={`${r.totalGoals} goals • ${r.cornersTaken} corners`}
                  onPress={() => setSelectedTeam(teamLookup.get(r.teamId) ?? r)}
                />
              ))}
            </View>
          )}
        </View>

        <View style={[authStyles.formCard, styles.secondCard]}>
          <Text style={authStyles.title}>Corner Rankings</Text>
          <Text style={authStyles.subtitle}>
            Top 10 teams by corners taken • 2025/26
          </Text>

          {cornersRankings.length === 0 ? (
            <Text style={styles.emptyText}>
              No data yet. Run the FPL import and add team_match_stats.
            </Text>
          ) : (
            <View style={styles.rankList}>
              {cornersRankings.map((r) => (
                <RankRow
                  key={r.teamId}
                  r={r}
                  primaryStat={`${r.cornersTaken} corners`}
                  secondaryStat={`~${r.setPieceGoalsPct}% goals from set pieces`}
                  onPress={() => setSelectedTeam(teamLookup.get(r.teamId) ?? r)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={selectedTeam != null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedTeam(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedTeam(null)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {selectedTeam && (
              <>
                <View style={styles.modalHeader}>
                  {selectedTeam.badgeUrl ? (
                    <Image source={{ uri: selectedTeam.badgeUrl }} style={styles.modalBadge} />
                  ) : (
                    <View style={[styles.modalBadge, styles.badgePlaceholder]} />
                  )}
                  <Text style={styles.modalTitle}>{selectedTeam.teamName}</Text>
                  <Text style={styles.modalSubtitle}>2025/26 Season • {selectedTeam.matchesPlayed} matches</Text>
                </View>

                <ScrollView style={styles.modalStats} showsVerticalScrollIndicator={false}>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Goals</Text>
                    <Text style={styles.statValue}>{selectedTeam.totalGoals}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>xG</Text>
                    <Text style={styles.statValue}>{selectedTeam.totalXg.toFixed(1)}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>xGA</Text>
                    <Text style={styles.statValue}>{selectedTeam.totalXga.toFixed(1)}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>~% goals from set pieces</Text>
                    <Text style={styles.statValue}>{selectedTeam.setPieceGoalsPct}%</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>~% goals from open play</Text>
                    <Text style={styles.statValue}>{selectedTeam.openPlayGoalsPct}%</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Corners taken</Text>
                    <Text style={styles.statValue}>{selectedTeam.cornersTaken}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Corners conceded</Text>
                    <Text style={styles.statValue}>{selectedTeam.cornersConceded}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Shots</Text>
                    <Text style={styles.statValue}>{selectedTeam.shots}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Shots on target</Text>
                    <Text style={styles.statValue}>{selectedTeam.shotsOnTarget}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Passes completed</Text>
                    <Text style={styles.statValue}>{selectedTeam.passesCompleted.toLocaleString()}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Pass accuracy</Text>
                    <Text style={styles.statValue}>{selectedTeam.passAccuracy > 0 ? `${selectedTeam.passAccuracy}%` : '—'}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Possession (avg)</Text>
                    <Text style={styles.statValue}>{selectedTeam.possession > 0 ? `${selectedTeam.possession}%` : '—'}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Fouls</Text>
                    <Text style={styles.statValue}>{selectedTeam.fouls}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Yellow cards</Text>
                    <Text style={styles.statValue}>{selectedTeam.yellowCards}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Red cards</Text>
                    <Text style={styles.statValue}>{selectedTeam.redCards}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Saves</Text>
                    <Text style={styles.statValue}>{selectedTeam.saves}</Text>
                  </View>
                </ScrollView>

                <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedTeam(null)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

