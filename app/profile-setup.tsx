import { useState, useEffect } from 'react';
import {
  Alert,
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useAuthStyles } from '@/hooks/useThemeStyles';

export interface DbTeam {
  id: string;
  name: string;
  badge_url: string | null;
}

const TEAM_GAP = 12;

export default function ProfileSetup() {
  const { session, refreshProfile } = useAuth();
  const authStyles = useAuthStyles();
  const [fullName, setFullName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<DbTeam[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('teams')
      .select('id, name, badge_url')
      .eq('season', '2025/26')
      .eq('league', 'Premier League')
      .order('name')
      .then(({ data, error }) => {
        setTeamsLoading(false);
        if (error) {
          console.error('Failed to fetch teams:', error);
          return;
        }
        setTeams(data ?? []);
      });
  }, []);

  const handleComplete = async () => {
    if (!fullName.trim()) {
      Alert.alert('Name Required', 'Please enter your name.');
      return;
    }
    if (!selectedTeamId) {
      Alert.alert('Team Required', 'Please select your favorite club.');
      return;
    }

    if (!session?.user?.id) {
      Alert.alert('Error', 'Session expired. Please sign in again.');
      router.replace('/(auth)/sign-in');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('profiles').upsert(
      {
        id: session.user.id,
        email: session.user.email ?? null,
        full_name: fullName.trim(),
        favorite_team_id: selectedTeamId,
      },
      { onConflict: 'id' }
    );

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    // Set profile optimistically so AuthProvider's redirect logic sees complete profile before navigation
    await refreshProfile({
      full_name: fullName.trim(),
      favorite_team_id: selectedTeamId,
      teams: null,
    });
    router.replace('/(tabs)');
  };

  if (teamsLoading) {
    return (
      <SafeAreaView style={[authStyles.container, styles.centerContent]} edges={['top', 'left', 'right']}>
        <ActivityIndicator size="large" color="#3D246C" />
        <Text style={styles.loadingText}>Loading teams...</Text>
      </SafeAreaView>
    );
  }

  if (teams.length === 0) {
    return (
      <SafeAreaView style={authStyles.container} edges={['top', 'left', 'right']}>
        <View style={authStyles.formCard}>
          <Text style={authStyles.title}>Setup Required</Text>
          <Text style={authStyles.subtitle}>
            Please run the teams seed in Supabase first. Go to SQL Editor and run the contents of supabase/seed-teams.sql
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={authStyles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[authStyles.scrollContent, styles.setupScroll]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={authStyles.formCard}>
          <Text style={authStyles.title}>Complete your profile</Text>
          <Text style={authStyles.subtitle}>Tell us your name and favorite club</Text>

          <View style={[authStyles.verticallySpaced, authStyles.mt20]}>
            <Text style={authStyles.inputLabel}>Your name</Text>
            <TextInput
              style={authStyles.input}
              onChangeText={setFullName}
              value={fullName}
              placeholder="e.g. John Smith"
              placeholderTextColor="#9AA0A6"
              autoCapitalize="words"
              autoComplete="name"
            />
          </View>

          <View style={[authStyles.verticallySpaced, authStyles.mt20]}>
            <Text style={styles.clubLabel}>Please select your club</Text>
            <Text style={styles.pickHint}>Tap to select your team</Text>
            <View style={styles.teamsGrid}>
              {teams.map((team) => {
                const isSelected = selectedTeamId === team.id;
                return (
                  <TouchableOpacity
                    key={team.id}
                    style={[styles.teamCard, isSelected && styles.teamCardSelected]}
                    onPress={() => setSelectedTeamId(team.id)}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={{ uri: team.badge_url || 'https://via.placeholder.com/64' }}
                      style={styles.badge}
                      contentFit="contain"
                    />
                    <Text style={styles.teamName} numberOfLines={2}>
                      {team.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={[authStyles.verticallySpaced, authStyles.mt20]}>
            <Pressable
              onPress={handleComplete}
              disabled={loading}
              style={[authStyles.button, loading && authStyles.buttonDisabled]}
            >
              <Text style={authStyles.buttonTitle}>
                {loading ? 'Saving...' : 'Continue'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  setupScroll: {
    paddingBottom: 40,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
  },
  clubLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 8,
    textAlign: 'center',
  },
  pickHint: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  teamsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TEAM_GAP,
    justifyContent: 'space-between',
  },
  teamCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E8ECF4',
    backgroundColor: '#FFFFFF',
  },
  teamCardSelected: {
    borderColor: '#3D246C',
    backgroundColor: '#F3EEFC',
  },
  badge: {
    width: 64,
    height: 64,
    marginBottom: 6,
  },
  teamName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A1A2E',
    textAlign: 'center',
  },
});
