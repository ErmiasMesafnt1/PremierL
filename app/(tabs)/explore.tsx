import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useAuthStyles } from '@/hooks/useThemeStyles';
import { useTheme } from '@/providers/ThemeProvider';

function useExploreStyles(colors: (typeof import('@/constants/theme').ThemeColors)['light'], isDark: boolean) {
  const wordColor = isDark ? '#FFFFFF' : colors.text;
  const labelColor = isDark ? '#FFFFFF' : colors.muted;
  const buttonTextColor = isDark ? '#FFFFFF' : colors.PL_BRAND;
  const accentColor = isDark ? colors.PL_FUCHSIA : colors.PL_BRAND;
  const statValueColor = isDark ? colors.PL_FUCHSIA : colors.text;

  return useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.bg },
        centerContent: { justifyContent: 'center', alignItems: 'center' },
        loadingText: { marginTop: 12, fontSize: 15, color: colors.muted },
        scroll: { flex: 1 },
        scrollContent: { padding: 20, paddingBottom: 40 },
        header: { alignItems: 'center', marginBottom: 24, paddingVertical: 20 },
        badge: { width: 96, height: 96, marginBottom: 12 },
        teamName: { fontSize: 22, fontWeight: '800', color: wordColor, textAlign: 'center' },
        seasonText: { fontSize: 14, color: labelColor, marginTop: 4 },
        statCard: {
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          borderLeftWidth: 4,
          borderLeftColor: colors.PL_CYAN,
        },
        statCardTitle: { fontSize: 16, fontWeight: '800', color: wordColor, marginBottom: 16 },
        statRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: colors.rowBorder,
        },
        statLabel: { fontSize: 15, color: labelColor },
        statValueWrap: { alignItems: 'flex-end' },
        statValue: { fontSize: 15, fontWeight: '700', color: statValueColor },
        statSubValue: { fontSize: 12, color: labelColor, marginTop: 2 },
        selectButton: { marginTop: 20 },
        changeTeamLink: { alignSelf: 'center', paddingVertical: 16, paddingHorizontal: 24 },
        changeTeamText: { fontSize: 15, fontWeight: '600', color: buttonTextColor },
        compareButton: {
          marginTop: 16,
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: accentColor,
          alignSelf: 'center',
        },
        compareButtonText: { fontSize: 15, fontWeight: '600', color: buttonTextColor },
        comparisonSection: { marginBottom: 24 },
        comparisonTitle: { fontSize: 18, fontWeight: '800', color: wordColor, marginBottom: 16, textAlign: 'center' },
        comparisonHeader: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20, paddingVertical: 12 },
        comparisonTeamCol: { alignItems: 'center', flex: 1 },
        comparisonBadge: { width: 48, height: 48, marginBottom: 6 },
        comparisonTeamName: { fontSize: 13, fontWeight: '700', color: wordColor, textAlign: 'center' },
        compareRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: colors.rowBorder,
        },
        compareLabel: { fontSize: 14, color: labelColor, flex: 1 },
        compareValues: { flexDirection: 'row', alignItems: 'center', gap: 12 },
        compareCell: { minWidth: 48, alignItems: 'center', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
        compareBetter: { backgroundColor: colors.betterHighlight },
        compareVs: { fontSize: 12, color: labelColor, fontWeight: '600' },
        compareValue: { fontSize: 14, fontWeight: '700', color: statValueColor },
        clearCompareButton: {
          alignSelf: 'center',
          paddingVertical: 12,
          paddingHorizontal: 24,
          marginTop: 8,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: accentColor,
        },
        clearCompareText: { fontSize: 15, fontWeight: '600', color: buttonTextColor },
        modalOverlay: { flex: 1, backgroundColor: colors.modalOverlay, justifyContent: 'flex-end' },
        modalContent: {
          backgroundColor: colors.modalBg,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 24,
          maxHeight: '80%',
        },
        modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 20 },
        modalLoader: { marginVertical: 40 },
        teamsScroll: { maxHeight: 400 },
        teamsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
        teamCard: {
          width: '48%',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 8,
          borderRadius: 14,
          borderWidth: 2,
          borderColor: colors.cardBorder,
          backgroundColor: colors.card,
        },
        teamBadge: { width: 56, height: 56, marginBottom: 6 },
        teamCardName: { fontSize: 12, fontWeight: '700', color: colors.text, textAlign: 'center' },
        modalCloseButton: { marginTop: 20, paddingVertical: 14, alignItems: 'center' },
        modalCloseText: { fontSize: 16, fontWeight: '600', color: colors.muted },
      }),
    [colors, isDark]
  );
}

interface TeamInsight {
  teamId: string;
  teamName: string;
  badgeUrl: string | null;
  matchesPlayed: number;
  goals: number;
  goalsConceded: number;
  xg: number;
  xga: number;
  xgSetPlay: number;
  setPiecePct: number;
  openPlayPct: number;
  cornersTaken: number;
  cornersConceded: number;
  shots: number;
  shotsOnTarget: number;
  possession: number;
  passesCompleted: number;
  passAccuracy: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  saves: number;
}

interface DbTeam {
  id: string;
  name: string;
  badge_url: string | null;
}

async function fetchTeamInsight(teamId: string): Promise<TeamInsight | null> {
  const { data: stats, error: statsErr } = await supabase
    .from('team_match_stats')
    .select(
      'team_id, corners_taken, corners_conceded, xg, xga, xg_set_play, possession_percent, shots, shots_on_target, passes_completed, pass_accuracy, fouls, yellow_cards, red_cards, saves'
    )
    .eq('team_id', teamId);

  if (statsErr || !stats?.length) return null;

  const { data: matches } = await supabase
    .from('matches')
    .select('home_team_id, away_team_id, matchweek, home_score, away_score')
    .eq('season', '2025/26')
    .eq('status', 'finished');

  const matchKey = (m: { home_team_id: string; away_team_id: string; matchweek?: number | null }) =>
    `${m.home_team_id}|${m.away_team_id}|${m.matchweek ?? ''}`;
  const seenKeys = new Set<string>();
  const uniqueMatches = (matches || []).filter((m) => {
    const key = matchKey(m);
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });

  let goals = 0;
  let goalsConceded = 0;
  for (const m of uniqueMatches) {
    if (m.home_team_id === teamId) {
      goals += m.home_score || 0;
      goalsConceded += m.away_score || 0;
    } else if (m.away_team_id === teamId) {
      goals += m.away_score || 0;
      goalsConceded += m.home_score || 0;
    }
  }

  const matchesPlayed = stats.length;
  const corners = stats.reduce((a, s) => a + (s.corners_taken || 0), 0);
  const cornersConceded = stats.reduce((a, s) => a + (s.corners_conceded || 0), 0);
  const xg = stats.reduce((a, s) => a + (s.xg || 0), 0);
  const xga = stats.reduce((a, s) => a + (s.xga || 0), 0);
  const xgSet = stats.reduce((a, s) => a + (s.xg_set_play || 0), 0);
  const shots = stats.reduce((a, s) => a + (s.shots || 0), 0);
  const shotsOnTarget = stats.reduce((a, s) => a + (s.shots_on_target || 0), 0);
  const passes = stats.reduce((a, s) => a + (s.passes_completed || 0), 0);
  const fouls = stats.reduce((a, s) => a + (s.fouls || 0), 0);
  const yellow = stats.reduce((a, s) => a + (s.yellow_cards || 0), 0);
  const red = stats.reduce((a, s) => a + (s.red_cards || 0), 0);
  const saves = stats.reduce((a, s) => a + (s.saves || 0), 0);
  const possArr = stats.map((s) => s.possession_percent).filter((p): p is number => p != null);
  const passArr = stats.map((s) => s.pass_accuracy).filter((p): p is number => p != null);
  const avgPoss = possArr.length ? possArr.reduce((a, b) => a + b, 0) / possArr.length : 0;
  const avgPass = passArr.length ? passArr.reduce((a, b) => a + b, 0) / passArr.length : 0;

  const setPiecePct = xg > 0 ? (xgSet / xg) * 100 : 0;
  const openPlayPct = xg > 0 ? 100 - setPiecePct : 0;

  const { data: team } = await supabase
    .from('teams')
    .select('id, name, badge_url')
    .eq('id', teamId)
    .single();

  if (!team) return null;

  return {
    teamId: team.id,
    teamName: team.name,
    badgeUrl: team.badge_url,
    matchesPlayed,
    goals,
    goalsConceded,
    xg,
    xga,
    xgSetPlay: xgSet,
    setPiecePct: Math.round(setPiecePct * 10) / 10,
    openPlayPct: Math.round(openPlayPct * 10) / 10,
    cornersTaken: corners,
    cornersConceded,
    shots,
    shotsOnTarget,
    possession: Math.round(avgPoss * 10) / 10,
    passesCompleted: passes,
    passAccuracy: Math.round(avgPass * 10) / 10,
    fouls,
    yellowCards: yellow,
    redCards: red,
    saves,
  };
}

function StatCard({
  title,
  children,
  s,
}: {
  title: string;
  children: React.ReactNode;
  s: { statCard: object; statCardTitle: object };
}) {
  return (
    <View style={s.statCard}>
      <Text style={s.statCardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function StatRow({
  label,
  value,
  subValue,
  s,
}: {
  label: string;
  value: string;
  subValue?: string;
  s: { statRow: object; statLabel: object; statValueWrap: object; statValue: object; statSubValue: object };
}) {
  return (
    <View style={s.statRow}>
      <Text style={s.statLabel}>{label}</Text>
      <View style={s.statValueWrap}>
        <Text style={s.statValue}>{value}</Text>
        {subValue && <Text style={s.statSubValue}>{subValue}</Text>}
      </View>
    </View>
  );
}

function CompareRow({
  label,
  myValue,
  otherValue,
  higherBetter = true,
  s,
}: {
  label: string;
  myValue: string | number;
  otherValue: string | number;
  higherBetter?: boolean;
  s: { compareRow: object; compareLabel: object; compareValues: object; compareCell: object; compareBetter: object; compareVs: object; compareValue: object };
}) {
  const myNum = typeof myValue === 'number' ? myValue : parseFloat(String(myValue).replace(/[^0-9.-]/g, ''));
  const otherNum = typeof otherValue === 'number' ? otherValue : parseFloat(String(otherValue).replace(/[^0-9.-]/g, ''));
  const myStr = typeof myValue === 'number' ? String(myValue) : myValue;
  const otherStr = typeof otherValue === 'number' ? String(otherValue) : otherValue;
  const canCompare = !Number.isNaN(myNum) && !Number.isNaN(otherNum);
  const myBetter = canCompare && (higherBetter ? myNum > otherNum : myNum < otherNum);
  const otherBetter = canCompare && (higherBetter ? myNum < otherNum : myNum > otherNum);

  return (
    <View style={s.compareRow}>
      <Text style={s.compareLabel}>{label}</Text>
      <View style={s.compareValues}>
        <View style={[s.compareCell, myBetter && s.compareBetter]}>
          <Text style={s.compareValue}>{myStr}</Text>
        </View>
        <Text style={s.compareVs}>vs</Text>
        <View style={[s.compareCell, otherBetter && s.compareBetter]}>
          <Text style={s.compareValue}>{otherStr}</Text>
        </View>
      </View>
    </View>
  );
}

export default function ExploreScreen() {
  const { profile } = useAuth();
  const { colors, isDark } = useTheme();
  const authStyles = useAuthStyles();
  const styles = useExploreStyles(colors, isDark);
  const [insight, setInsight] = useState<TeamInsight | null>(null);
  const [compareInsight, setCompareInsight] = useState<TeamInsight | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [teams, setTeams] = useState<DbTeam[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadMyTeam = useCallback(async () => {
    const teamId = profile?.favorite_team_id;
    if (!teamId) {
      setLoading(false);
      setInsight(null);
      return;
    }
    const data = await fetchTeamInsight(teamId);
    setInsight(data);
    setLoading(false);
  }, [profile?.favorite_team_id]);

  useEffect(() => {
    loadMyTeam();
  }, [loadMyTeam]);

  useEffect(() => {
    if (showCompareModal && teams.length === 0) {
      setTeamsLoading(true);
      supabase
        .from('teams')
        .select('id, name, badge_url')
        .eq('season', '2025/26')
        .eq('league', 'Premier League')
        .order('name')
        .then(({ data, error }) => {
          setTeamsLoading(false);
          if (!error) setTeams(data ?? []);
        });
    }
  }, [showCompareModal]);

  const handleSelectCompareTeam = async (teamId: string) => {
    if (teamId === profile?.favorite_team_id) {
      setCompareInsight(null);
      setShowCompareModal(false);
      return;
    }
    const data = await fetchTeamInsight(teamId);
    if (data) {
      setCompareInsight(data);
      setShowCompareModal(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.PL_BRAND} />
        <Text style={styles.loadingText}>Loading your team...</Text>
      </SafeAreaView>
    );
  }

  if (!profile?.favorite_team_id || !insight) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={authStyles.formCard}>
          <Text style={authStyles.title}>My Team</Text>
          <Text style={authStyles.subtitle}>
            Select your favorite team to see personalized insights
          </Text>
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            style={[authStyles.button, styles.selectButton]}
          >
            <Text style={authStyles.buttonTitle}>Go to Profile</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const mp = insight.matchesPlayed || 1;
  const goalsPerMatch = (insight.goals / mp).toFixed(1);
  const xgPerMatch = (insight.xg / mp).toFixed(1);
  const shotsPerMatch = (insight.shots / mp).toFixed(1);
  const cornersPerMatch = (insight.cornersTaken / mp).toFixed(1);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image
            source={{ uri: insight.badgeUrl || 'https://via.placeholder.com/96' }}
            style={styles.badge}
            contentFit="contain"
          />
          <Text style={styles.teamName}>{insight.teamName}</Text>
          <Text style={styles.seasonText}>2025/26 Season • {insight.matchesPlayed} matches</Text>
          <Pressable
            onPress={() => setShowCompareModal(true)}
            style={styles.compareButton}
          >
            <Text style={styles.compareButtonText}>
              {compareInsight ? `vs ${compareInsight.teamName}` : 'Compare with another team'}
            </Text>
          </Pressable>
        </View>

        {compareInsight && (
          <View style={styles.comparisonSection}>
            <Text style={styles.comparisonTitle}>Team comparison</Text>
            <View style={styles.comparisonHeader}>
              <View style={styles.comparisonTeamCol}>
                <Image
                  source={{ uri: insight.badgeUrl || 'https://via.placeholder.com/48' }}
                  style={styles.comparisonBadge}
                  contentFit="contain"
                />
                <Text style={styles.comparisonTeamName} numberOfLines={1}>{insight.teamName}</Text>
              </View>
              <View style={styles.comparisonTeamCol}>
                <Image
                  source={{ uri: compareInsight.badgeUrl || 'https://via.placeholder.com/48' }}
                  style={styles.comparisonBadge}
                  contentFit="contain"
                />
                <Text style={styles.comparisonTeamName} numberOfLines={1}>{compareInsight.teamName}</Text>
              </View>
            </View>

            <StatCard title="Attacking" s={styles}>
              <CompareRow label="Goals" myValue={insight.goals} otherValue={compareInsight.goals} s={styles} />
              <CompareRow label="xG" myValue={insight.xg.toFixed(1)} otherValue={compareInsight.xg.toFixed(1)} s={styles} />
              <CompareRow label="Shots" myValue={insight.shots} otherValue={compareInsight.shots} s={styles} />
              <CompareRow label="Shots on target" myValue={insight.shotsOnTarget} otherValue={compareInsight.shotsOnTarget} s={styles} />
              <CompareRow label="~% open play" myValue={`${insight.openPlayPct}%`} otherValue={`${compareInsight.openPlayPct}%`} s={styles} />
            </StatCard>

            <StatCard title="Defending" s={styles}>
              <CompareRow label="Goals conceded" myValue={insight.goalsConceded} otherValue={compareInsight.goalsConceded} higherBetter={false} s={styles} />
              <CompareRow label="xGA" myValue={insight.xga.toFixed(1)} otherValue={compareInsight.xga.toFixed(1)} higherBetter={false} s={styles} />
              <CompareRow label="Saves" myValue={insight.saves} otherValue={compareInsight.saves} s={styles} />
            </StatCard>

            <StatCard title="Set Pieces" s={styles}>
              <CompareRow label="Corners taken" myValue={insight.cornersTaken} otherValue={compareInsight.cornersTaken} s={styles} />
              <CompareRow label="Corners conceded" myValue={insight.cornersConceded} otherValue={compareInsight.cornersConceded} higherBetter={false} s={styles} />
              <CompareRow label="~% set pieces" myValue={`${insight.setPiecePct}%`} otherValue={`${compareInsight.setPiecePct}%`} s={styles} />
            </StatCard>

            <StatCard title="Possession & Passing" s={styles}>
              <CompareRow label="Possession %" myValue={insight.possession > 0 ? `${insight.possession}%` : '—'} otherValue={compareInsight.possession > 0 ? `${compareInsight.possession}%` : '—'} s={styles} />
              <CompareRow label="Passes" myValue={insight.passesCompleted} otherValue={compareInsight.passesCompleted} s={styles} />
              <CompareRow label="Pass accuracy %" myValue={insight.passAccuracy > 0 ? `${insight.passAccuracy}%` : '—'} otherValue={compareInsight.passAccuracy > 0 ? `${compareInsight.passAccuracy}%` : '—'} s={styles} />
            </StatCard>

            <StatCard title="Discipline" s={styles}>
              <CompareRow label="Fouls" myValue={insight.fouls} otherValue={compareInsight.fouls} higherBetter={false} s={styles} />
              <CompareRow label="Yellow cards" myValue={insight.yellowCards} otherValue={compareInsight.yellowCards} higherBetter={false} s={styles} />
              <CompareRow label="Red cards" myValue={insight.redCards} otherValue={compareInsight.redCards} higherBetter={false} s={styles} />
            </StatCard>

            <Pressable onPress={() => setCompareInsight(null)} style={styles.clearCompareButton}>
              <Text style={styles.clearCompareText}>Clear comparison</Text>
            </Pressable>
          </View>
        )}

        {!compareInsight && (
          <>
        <StatCard title="Attacking" s={styles}>
          <StatRow label="Goals" value={String(insight.goals)} subValue={`${goalsPerMatch}/match`} s={styles} />
          <StatRow label="Expected goals (xG)" value={insight.xg.toFixed(1)} subValue={`${xgPerMatch}/match`} s={styles} />
          <StatRow label="Shots" value={String(insight.shots)} subValue={`${shotsPerMatch}/match`} s={styles} />
          <StatRow label="Shots on target" value={String(insight.shotsOnTarget)} s={styles} />
          <StatRow label="~% from open play" value={`${insight.openPlayPct}%`} s={styles} />
        </StatCard>

        <StatCard title="Defending" s={styles}>
          <StatRow label="Goals conceded" value={String(insight.goalsConceded)} s={styles} />
          <StatRow label="Expected goals against (xGA)" value={insight.xga.toFixed(1)} s={styles} />
          <StatRow label="Saves" value={String(insight.saves)} s={styles} />
        </StatCard>

        <StatCard title="Set Pieces" s={styles}>
          <StatRow label="Corners taken" value={String(insight.cornersTaken)} subValue={`${cornersPerMatch}/match`} s={styles} />
          <StatRow label="Corners conceded" value={String(insight.cornersConceded)} s={styles} />
          <StatRow label="~% goals from set pieces" value={`${insight.setPiecePct}%`} s={styles} />
        </StatCard>

        <StatCard title="Possession & Passing" s={styles}>
          <StatRow label="Possession (avg)" value={insight.possession > 0 ? `${insight.possession}%` : '—'} s={styles} />
          <StatRow label="Passes completed" value={insight.passesCompleted.toLocaleString()} s={styles} />
          <StatRow label="Pass accuracy" value={insight.passAccuracy > 0 ? `${insight.passAccuracy}%` : '—'} s={styles} />
        </StatCard>

        <StatCard title="Discipline" s={styles}>
          <StatRow label="Fouls" value={String(insight.fouls)} s={styles} />
          <StatRow label="Yellow cards" value={String(insight.yellowCards)} s={styles} />
          <StatRow label="Red cards" value={String(insight.redCards)} s={styles} />
        </StatCard>
          </>
        )}

        <Pressable
          onPress={() => router.push('/(tabs)/profile')}
          style={styles.changeTeamLink}
        >
          <Text style={styles.changeTeamText}>Change favorite team</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={showCompareModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCompareModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Compare with</Text>
            {teamsLoading ? (
              <ActivityIndicator size="large" color={colors.PL_BRAND} style={styles.modalLoader} />
            ) : (
              <ScrollView style={styles.teamsScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.teamsGrid}>
                  {teams
                    .filter((t) => t.id !== profile?.favorite_team_id)
                    .map((t) => (
                      <TouchableOpacity
                        key={t.id}
                        style={styles.teamCard}
                        onPress={() => handleSelectCompareTeam(t.id)}
                      >
                        <Image
                          source={{ uri: t.badge_url || 'https://via.placeholder.com/56' }}
                          style={styles.teamBadge}
                          contentFit="contain"
                        />
                        <Text style={styles.teamCardName} numberOfLines={2}>{t.name}</Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </ScrollView>
            )}
            <Pressable onPress={() => setShowCompareModal(false)} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

