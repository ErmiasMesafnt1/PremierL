import { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { useAuthStyles } from '@/hooks/useThemeStyles';
import { useTheme } from '@/providers/ThemeProvider';

function usePlayersStyles(colors: (typeof import('@/constants/theme').ThemeColors)['light'], isDark: boolean) {
  const wordColor = isDark ? '#FFFFFF' : colors.text;
  const labelColor = isDark ? '#FFFFFF' : colors.muted;
  const statValueColor = isDark ? colors.PL_FUCHSIA : colors.text;
  const accentColor = isDark ? colors.PL_FUCHSIA : colors.PL_BRAND;
  const buttonTextColor = isDark ? '#FFFFFF' : colors.PL_BRAND;

  return useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.bg },
        scroll: { flex: 1 },
        scrollContent: { padding: 20, paddingBottom: 40 },
        playerSlots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 24, gap: 12 },
        playerSlot: {
          flex: 1,
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          minHeight: 140,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: colors.PL_CYAN,
          gap: 8,
        },
        playerName: { fontSize: 14, fontWeight: '800', color: wordColor, textAlign: 'center' },
        playerMeta: { fontSize: 12, color: labelColor, marginTop: 4, textAlign: 'center' },
        playerStats: { fontSize: 11, color: labelColor, marginTop: 2, textAlign: 'center' },
        placeholderText: { fontSize: 14, color: labelColor, fontWeight: '600' },
        vsText: { fontSize: 16, fontWeight: '800', color: wordColor },
        comparisonSection: { marginTop: 8 },
        statCard: {
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          borderLeftWidth: 4,
          borderLeftColor: colors.PL_CYAN,
        },
        statCardTitle: { fontSize: 16, fontWeight: '800', color: wordColor, marginBottom: 16 },
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
          marginTop: 24,
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: accentColor,
          alignSelf: 'center',
        },
        clearCompareText: { fontSize: 15, fontWeight: '600', color: buttonTextColor },
        hintText: { fontSize: 14, color: labelColor, textAlign: 'center', marginTop: 20 },
        modalOverlay: { flex: 1, backgroundColor: colors.modalOverlay, justifyContent: 'flex-end' },
        modalContent: {
          backgroundColor: colors.modalBg,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 24,
          maxHeight: '80%',
        },
        modalTitle: { fontSize: 18, fontWeight: '800', color: wordColor, textAlign: 'center', marginBottom: 16 },
        searchInput: {
          backgroundColor: colors.searchBg,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          fontSize: 16,
          color: wordColor,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: colors.searchBorder,
        },
        noResultsText: { fontSize: 15, color: labelColor, textAlign: 'center', paddingVertical: 24 },
        modalLoader: { marginVertical: 40 },
        playersScroll: { maxHeight: 400 },
        playerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 14,
          paddingHorizontal: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.rowBorder,
        },
        avatar: { overflow: 'hidden', backgroundColor: colors.placeholder },
        avatarPlaceholder: {
          backgroundColor: colors.PL_CYAN,
          justifyContent: 'center',
          alignItems: 'center',
        },
        avatarInitials: { color: '#FFFFFF', fontWeight: '700' },
        playerRowInfo: { flex: 1 },
        playerRowName: { fontSize: 16, fontWeight: '700', color: wordColor },
        playerRowMeta: { fontSize: 13, color: labelColor, marginTop: 2 },
        modalCloseButton: { marginTop: 20, paddingVertical: 14, alignItems: 'center' },
        modalCloseText: { fontSize: 16, fontWeight: '600', color: labelColor },
      }),
    [colors, isDark]
  );
}

interface PlayerInsight {
  playerId: string;
  playerName: string;
  photoUrl: string | null;
  teamName: string;
  position: string;
  matchesPlayed: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  passesCompleted: number;
  passAccuracy: number;
  tackles: number;
  interceptions: number;
  clearances: number;
  blocks: number;
  aerialDuelsWon: number;
  saves: number;
}

interface DbPlayer {
  id: string;
  full_name: string;
  short_name: string | null;
  position: string;
  team_id: string;
  fpl_player_id: number | null;
  opta_id: string | null;
  teams?: { name: string } | null;
}

// Premier League CDN uses Opta ID (player_code) for photos - 110x140 for quality
const getPlayerPhotoUrl = (optaId: string | null, fplPlayerId: number | null) => {
  if (optaId) return `https://resources.premierleague.com/premierleague/photos/players/110x140/${optaId}.png`;
  if (fplPlayerId) return `https://resources.premierleague.com/premierleague/photos/players/110x140/p${fplPlayerId}.png`;
  return null;
};

function PlayerAvatar({
  uri,
  name,
  size = 44,
  s,
}: {
  uri: string | null;
  name?: string;
  size?: number;
  s: { avatar: object; avatarPlaceholder: object; avatarInitials: object };
}) {
  const [error, setError] = useState(false);
  const showImage = uri && !error;
  const initials = name
    ? name
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';
  return (
    <View style={[s.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      {showImage ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          onError={() => setError(true)}
        />
      ) : (
        <View style={[s.avatarPlaceholder, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={[s.avatarInitials, { fontSize: size * 0.35 }]}>{initials}</Text>
        </View>
      )}
    </View>
  );
}

async function fetchPlayerInsight(playerId: string): Promise<PlayerInsight | null> {
  const { data: stats, error: statsErr } = await supabase
    .from('player_match_stats')
    .select('minutes_played, goals, assists, shots, shots_on_target, passes_completed, pass_accuracy, tackles, interceptions, clearances, blocks, aerial_duels_won, saves')
    .eq('player_id', playerId);

  if (statsErr || !stats?.length) return null;

  const matchesPlayed = stats.length;
  const minutesPlayed = stats.reduce((a, s) => a + (s.minutes_played || 0), 0);
  const goals = stats.reduce((a, s) => a + (s.goals || 0), 0);
  const assists = stats.reduce((a, s) => a + (s.assists || 0), 0);
  const shots = stats.reduce((a, s) => a + (s.shots || 0), 0);
  const shotsOnTarget = stats.reduce((a, s) => a + (s.shots_on_target || 0), 0);
  const passesCompleted = stats.reduce((a, s) => a + (s.passes_completed || 0), 0);
  const passArr = stats.map((s) => s.pass_accuracy).filter((p): p is number => p != null && p > 0);
  const passAccuracy = passArr.length ? passArr.reduce((a, b) => a + b, 0) / passArr.length : 0;
  const tackles = stats.reduce((a, s) => a + (s.tackles || 0), 0);
  const interceptions = stats.reduce((a, s) => a + (s.interceptions || 0), 0);
  const clearances = stats.reduce((a, s) => a + (s.clearances || 0), 0);
  const blocks = stats.reduce((a, s) => a + (s.blocks || 0), 0);
  const aerialDuelsWon = stats.reduce((a, s) => a + (s.aerial_duels_won || 0), 0);
  const saves = stats.reduce((a, s) => a + (s.saves || 0), 0);

  const { data: player, error: playerErr } = await supabase
    .from('players')
    .select('id, full_name, short_name, position, team_id, fpl_player_id, opta_id')
    .eq('id', playerId)
    .single();

  if (playerErr || !player) return null;

  let teamName = 'Unknown';
  if (player.team_id) {
    const { data: team } = await supabase.from('teams').select('name').eq('id', player.team_id).single();
    if (team) teamName = team.name;
  }

  return {
    playerId: player.id,
    playerName: player.full_name || player.short_name || 'Unknown',
    photoUrl: getPlayerPhotoUrl(player.opta_id ?? null, player.fpl_player_id ?? null),
    teamName,
    position: player.position || '—',
    matchesPlayed,
    minutesPlayed,
    goals,
    assists,
    shots,
    shotsOnTarget,
    passesCompleted,
    passAccuracy: Math.round(passAccuracy * 10) / 10,
    tackles,
    interceptions,
    clearances,
    blocks,
    aerialDuelsWon,
    saves,
  };
}

function CompareRow({
  label,
  player1Value,
  player2Value,
  higherBetter = true,
  s,
}: {
  label: string;
  player1Value: string | number;
  player2Value: string | number;
  higherBetter?: boolean;
  s: Record<string, object>;
}) {
  const p1 = typeof player1Value === 'number' ? player1Value : parseFloat(String(player1Value).replace(/[^0-9.-]/g, ''));
  const p2 = typeof player2Value === 'number' ? player2Value : parseFloat(String(player2Value).replace(/[^0-9.-]/g, ''));
  const p1Str = typeof player1Value === 'number' ? String(player1Value) : player1Value;
  const p2Str = typeof player2Value === 'number' ? String(player2Value) : player2Value;
  const canCompare = !Number.isNaN(p1) && !Number.isNaN(p2);
  const p1Better = canCompare && (higherBetter ? p1 > p2 : p1 < p2);
  const p2Better = canCompare && (higherBetter ? p1 < p2 : p1 > p2);

  return (
    <View style={s.compareRow}>
      <Text style={s.compareLabel}>{label}</Text>
      <View style={s.compareValues}>
        <View style={[s.compareCell, p1Better && s.compareBetter]}>
          <Text style={s.compareValue}>{p1Str}</Text>
        </View>
        <Text style={s.compareVs}>vs</Text>
        <View style={[s.compareCell, p2Better && s.compareBetter]}>
          <Text style={s.compareValue}>{p2Str}</Text>
        </View>
      </View>
    </View>
  );
}

export default function PlayersScreen() {
  const { colors, isDark } = useTheme();
  const authStyles = useAuthStyles();
  const styles = usePlayersStyles(colors, isDark);
  const [player1, setPlayer1] = useState<PlayerInsight | null>(null);
  const [player2, setPlayer2] = useState<PlayerInsight | null>(null);
  const [showPicker, setShowPicker] = useState<'player1' | 'player2' | null>(null);
  const [players, setPlayers] = useState<DbPlayer[]>([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (showPicker && players.length === 0) {
      setPlayersLoading(true);
      supabase
        .from('players')
        .select('id, full_name, short_name, position, team_id, fpl_player_id, opta_id')
        .order('full_name')
        .then(async ({ data: playersData, error }) => {
          if (error) {
            setPlayersLoading(false);
            return;
          }
          const list = playersData ?? [];
          const teamIds = [...new Set(list.map((p) => p.team_id).filter(Boolean))];
          const { data: teamsData } = teamIds.length
            ? await supabase.from('teams').select('id, name').in('id', teamIds)
            : { data: [] };
          const teamMap = new Map((teamsData ?? []).map((t) => [t.id, t.name]));
          setPlayers(
            list.map((p) => ({
              ...p,
              teams: p.team_id ? { name: teamMap.get(p.team_id) ?? '—' } : null,
            }))
          );
          setPlayersLoading(false);
        });
    }
  }, [showPicker]);

  const handleSelectPlayer = async (playerId: string, slot: 'player1' | 'player2') => {
    setLoading(slot);
    const insight = await fetchPlayerInsight(playerId);
    setLoading(null);
    setShowPicker(null);
    setSearchQuery('');
    if (insight) {
      if (slot === 'player1') setPlayer1(insight);
      else setPlayer2(insight);
    }
  };

  const filteredPlayers = searchQuery.trim()
    ? players.filter((p) => {
        const q = searchQuery.toLowerCase().trim();
        const name = (p.full_name || '').toLowerCase();
        const team = ((p.teams as { name: string } | null)?.name ?? '').toLowerCase();
        const position = (p.position || '').toLowerCase();
        const shortName = (p.short_name || '').toLowerCase();
        return name.includes(q) || team.includes(q) || position.includes(q) || shortName.includes(q);
      })
    : players;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={authStyles.title}>Player Comparison</Text>
        <Text style={authStyles.subtitle}>
          Select two players to compare their 2025/26 stats
        </Text>

        <View style={styles.playerSlots}>
          <Pressable
            style={styles.playerSlot}
            onPress={() => setShowPicker('player1')}
          >
            {loading === 'player1' ? (
              <ActivityIndicator size="small" color={colors.PL_BRAND} />
            ) : player1 ? (
              <>
                <PlayerAvatar uri={player1.photoUrl} name={player1.playerName} size={64} s={styles} />
                <Text style={styles.playerName} numberOfLines={2}>{player1.playerName}</Text>
                <Text style={styles.playerMeta}>{player1.teamName} • {player1.position}</Text>
                <Text style={styles.playerStats}>{player1.matchesPlayed} apps • {player1.goals}G {player1.assists}A</Text>
              </>
            ) : (
              <Text style={styles.placeholderText}>Select player 1</Text>
            )}
          </Pressable>

          <Text style={styles.vsText}>vs</Text>

          <Pressable
            style={styles.playerSlot}
            onPress={() => setShowPicker('player2')}
          >
            {loading === 'player2' ? (
              <ActivityIndicator size="small" color={colors.PL_BRAND} />
            ) : player2 ? (
              <>
                <PlayerAvatar uri={player2.photoUrl} name={player2.playerName} size={64} s={styles} />
                <Text style={styles.playerName} numberOfLines={2}>{player2.playerName}</Text>
                <Text style={styles.playerMeta}>{player2.teamName} • {player2.position}</Text>
                <Text style={styles.playerStats}>{player2.matchesPlayed} apps • {player2.goals}G {player2.assists}A</Text>
              </>
            ) : (
              <Text style={styles.placeholderText}>Select player 2</Text>
            )}
          </Pressable>
        </View>

        {player1 && player2 && (
          <View style={styles.comparisonSection}>
            <View style={styles.statCard}>
              <Text style={styles.statCardTitle}>Attacking</Text>
              <CompareRow label="Goals" player1Value={player1.goals} player2Value={player2.goals} s={styles} />
              <CompareRow label="Assists" player1Value={player1.assists} player2Value={player2.assists} s={styles} />
              <CompareRow label="Shots" player1Value={player1.shots} player2Value={player2.shots} s={styles} />
              <CompareRow label="Shots on target" player1Value={player1.shotsOnTarget} player2Value={player2.shotsOnTarget} s={styles} />
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statCardTitle}>Passing</Text>
              <CompareRow label="Passes completed" player1Value={player1.passesCompleted} player2Value={player2.passesCompleted} s={styles} />
              <CompareRow label="Pass accuracy %" player1Value={player1.passAccuracy > 0 ? `${player1.passAccuracy}%` : '—'} player2Value={player2.passAccuracy > 0 ? `${player2.passAccuracy}%` : '—'} s={styles} />
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statCardTitle}>Defensive</Text>
              <CompareRow label="Tackles" player1Value={player1.tackles} player2Value={player2.tackles} s={styles} />
              <CompareRow label="Interceptions" player1Value={player1.interceptions} player2Value={player2.interceptions} s={styles} />
              <CompareRow label="Clearances" player1Value={player1.clearances} player2Value={player2.clearances} s={styles} />
              <CompareRow label="Blocks" player1Value={player1.blocks} player2Value={player2.blocks} s={styles} />
              <CompareRow label="Aerial duels won" player1Value={player1.aerialDuelsWon} player2Value={player2.aerialDuelsWon} s={styles} />
              <CompareRow label="Saves" player1Value={player1.saves} player2Value={player2.saves} s={styles} />
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statCardTitle}>Minutes</Text>
              <CompareRow label="Matches" player1Value={player1.matchesPlayed} player2Value={player2.matchesPlayed} s={styles} />
              <CompareRow label="Minutes played" player1Value={player1.minutesPlayed} player2Value={player2.minutesPlayed} s={styles} />
            </View>

            <Pressable
              onPress={() => {
                setPlayer1(null);
                setPlayer2(null);
              }}
              style={styles.clearCompareButton}
            >
              <Text style={styles.clearCompareText}>Clear comparison</Text>
            </Pressable>
          </View>
        )}

        {(!player1 || !player2) && (
          <Text style={styles.hintText}>
            Tap a slot above to select a player. Run the FPL import to load player data.
          </Text>
        )}
      </ScrollView>

      <Modal
        visible={showPicker != null}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {showPicker === 'player1' ? 'Select player 1' : 'Select player 2'}
            </Text>
            {!playersLoading && (
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, team, or position..."
                placeholderTextColor={colors.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
            {playersLoading ? (
              <ActivityIndicator size="large" color={colors.PL_BRAND} style={styles.modalLoader} />
            ) : (
              <ScrollView style={styles.playersScroll} showsVerticalScrollIndicator={false}>
                {filteredPlayers.length === 0 ? (
                  <Text style={styles.noResultsText}>
                    {searchQuery.trim() ? 'No players match your search' : 'No players found'}
                  </Text>
                ) : (
                filteredPlayers.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.playerRow}
                    onPress={() => showPicker && handleSelectPlayer(p.id, showPicker)}
                  >
                    <PlayerAvatar uri={getPlayerPhotoUrl(p.opta_id ?? null, p.fpl_player_id ?? null)} name={p.full_name} size={44} s={styles} />
                    <View style={styles.playerRowInfo}>
                      <Text style={styles.playerRowName}>{p.full_name}</Text>
                      <Text style={styles.playerRowMeta}>
                        {(p.teams as { name: string } | null)?.name ?? '—'} • {p.position}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
                )}
              </ScrollView>
            )}
            <Pressable
              onPress={() => { setShowPicker(null); setSearchQuery(''); }}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

