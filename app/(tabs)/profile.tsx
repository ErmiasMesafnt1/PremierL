import { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useAuthStyles } from '@/hooks/useThemeStyles';
import { useTheme } from '@/providers/ThemeProvider';

interface TeamInfo {
  id: string;
  name: string;
  badge_url: string | null;
}

function useProfileStyles(colors: (typeof import('@/constants/theme').ThemeColors)['light']) {
  return useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 24 },
        teamSection: { alignItems: 'center', marginVertical: 20 },
        badge: { width: 96, height: 96, marginBottom: 12 },
        clubText: { fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 12 },
        changeTeamButton: {
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: colors.PL_BRAND,
          alignSelf: 'center',
        },
        changeTeamText: { fontSize: 15, fontWeight: '600', color: colors.PL_BRAND },
        emailText: { fontSize: 14, color: colors.muted, textAlign: 'center', marginBottom: 24 },
        themeSection: { marginTop: 24 },
        themeLabel: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 12 },
        dropdownTrigger: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: colors.cardBorder,
          backgroundColor: colors.card,
        },
        dropdownTriggerText: { fontSize: 15, fontWeight: '600', color: colors.text },
        dropdownChevron: { fontSize: 14, color: colors.muted },
        dropdownMenu: {
          marginTop: 4,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: colors.cardBorder,
          backgroundColor: colors.card,
          overflow: 'hidden',
        },
        dropdownOption: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.rowBorder,
        },
        dropdownOptionLast: { borderBottomWidth: 0 },
        dropdownOptionSelected: { backgroundColor: colors.teamCardSelected },
        dropdownOptionText: { fontSize: 15, fontWeight: '600', color: colors.text },
        dropdownOptionTextSelected: { color: colors.PL_BRAND },
        signOutButton: { marginTop: 8, backgroundColor: colors.signOutButton },
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
        teamCardSelected: { borderColor: colors.PL_BRAND, backgroundColor: colors.teamCardSelected },
        teamBadge: { width: 56, height: 56, marginBottom: 6 },
        teamName: { fontSize: 12, fontWeight: '700', color: colors.text, textAlign: 'center' },
        modalCloseButton: { marginTop: 20, paddingVertical: 14, alignItems: 'center' },
        modalCloseText: { fontSize: 16, fontWeight: '600', color: colors.muted },
      }),
    [colors]
  );
}

export default function ProfileScreen() {
  const { session, profile, refreshProfile } = useAuth();
  const { colors, themeMode, setThemeMode } = useTheme();
  const authStyles = useAuthStyles();
  const styles = useProfileStyles(colors);
  const [team, setTeam] = useState<TeamInfo | null>(null);
  const [showChangeTeam, setShowChangeTeam] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const themeLabels: Record<string, string> = { light: 'Light', dark: 'Dark', system: 'System' };

  useEffect(() => {
    const fromProfile = profile?.teams;
    if (fromProfile && profile?.favorite_team_id) {
      setTeam({
        id: profile.favorite_team_id,
        name: fromProfile.name,
        badge_url: fromProfile.badge_url ?? null,
      });
      return;
    }
    if (profile?.favorite_team_id) {
      supabase
        .from('teams')
        .select('id, name, badge_url')
        .eq('id', profile.favorite_team_id)
        .single()
        .then(({ data }) => {
          if (data) setTeam({ id: data.id, name: data.name, badge_url: data.badge_url ?? null });
          else setTeam(null);
        });
    } else {
      setTeam(null);
    }
  }, [profile?.favorite_team_id, profile?.teams]);

  useEffect(() => {
    if (showChangeTeam && teams.length === 0) {
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
  }, [showChangeTeam]);

  const handleChangeTeam = async (teamId: string) => {
    if (!session?.user?.id) return;
    const selected = teams.find((t) => t.id === teamId);
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ favorite_team_id: teamId })
      .eq('id', session.user.id);
    setSaving(false);
    if (error) return;
    setTeam(selected);
    await refreshProfile({
      ...profile!,
      favorite_team_id: teamId,
      teams: { name: selected.name, badge_url: selected.badge_url },
    });
    setShowChangeTeam(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={authStyles.formCard}>
        <Text style={authStyles.title}>Profile</Text>
        <Text style={authStyles.subtitle}>
          {profile?.full_name || 'No name set'}
        </Text>

        {team ? (
          <View style={styles.teamSection}>
            <Image
              source={{ uri: team.badge_url || 'https://via.placeholder.com/96' }}
              style={styles.badge}
              contentFit="contain"
            />
            <Text style={styles.clubText}>{team.name}</Text>
            <Pressable
              onPress={() => setShowChangeTeam(true)}
              style={styles.changeTeamButton}
            >
              <Text style={styles.changeTeamText}>Change team</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => setShowChangeTeam(true)}
            style={styles.changeTeamButton}
          >
            <Text style={styles.changeTeamText}>Select favorite team</Text>
          </Pressable>
        )}

        {session?.user?.email && (
          <Text style={styles.emailText}>{session.user.email}</Text>
        )}

        <View style={styles.themeSection}>
          <Text style={styles.themeLabel}>Appearance</Text>
          <Pressable
            onPress={() => setShowThemeDropdown((v) => !v)}
            style={styles.dropdownTrigger}
          >
            <Text style={styles.dropdownTriggerText}>{themeLabels[themeMode]}</Text>
            <Text style={styles.dropdownChevron}>{showThemeDropdown ? '▲' : '▼'}</Text>
          </Pressable>
          {showThemeDropdown && (
            <View style={styles.dropdownMenu}>
              {(['light', 'dark', 'system'] as const).map((mode, i) => (
                <Pressable
                  key={mode}
                  onPress={() => {
                    setThemeMode(mode);
                    setShowThemeDropdown(false);
                  }}
                  style={[
                    styles.dropdownOption,
                    i === 2 && styles.dropdownOptionLast,
                    themeMode === mode && styles.dropdownOptionSelected,
                  ]}
                >
                  <Text style={[styles.dropdownOptionText, themeMode === mode && styles.dropdownOptionTextSelected]}>
                    {themeLabels[mode]}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <Pressable
          onPress={handleSignOut}
          style={[authStyles.button, styles.signOutButton]}
        >
          <Text style={authStyles.buttonTitle}>Sign out</Text>
        </Pressable>
      </View>

      <Modal
        visible={showChangeTeam}
        transparent
        animationType="slide"
        onRequestClose={() => setShowChangeTeam(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change favorite team</Text>
            {teamsLoading ? (
              <ActivityIndicator size="large" color={colors.PL_BRAND} style={styles.modalLoader} />
            ) : (
              <ScrollView style={styles.teamsScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.teamsGrid}>
                  {teams.map((t) => (
                    <TouchableOpacity
                      key={t.id}
                      style={[styles.teamCard, team?.id === t.id && styles.teamCardSelected]}
                      onPress={() => handleChangeTeam(t.id)}
                      disabled={saving}
                    >
                      <Image
                        source={{ uri: t.badge_url || 'https://via.placeholder.com/64' }}
                        style={styles.teamBadge}
                        contentFit="contain"
                      />
                      <Text style={styles.teamName} numberOfLines={2}>
                        {t.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
            <Pressable
              onPress={() => setShowChangeTeam(false)}
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

