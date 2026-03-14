import { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

import { supabase } from '@/lib/supabase';
import { authStyles } from '@/components/styles';

type Profile = {
  full_name: string | null;
  favorite_team_id: string | null;
  teams?: { name: string; badge_url: string | null } | null;
} | null;

const AuthContext = createContext<{
  session: Session | null;
  profile: Profile;
  refreshProfile: (optimisticProfile?: Profile) => Promise<void>;
}>({
  session: null,
  profile: null,
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setInitialized(true);
      })
      .catch(() => {
        setSession(null);
        setInitialized(true);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setProfileLoaded(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async (optimisticProfile?: Profile) => {
    if (optimisticProfile) {
      setProfile(optimisticProfile);
      setProfileLoaded(true);
    }
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (!currentSession?.user?.id) {
      setProfile(null);
      setProfileLoaded(true);
      return;
    }
    const userId = currentSession.user.id;
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, favorite_team_id')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Profile fetch error:', error);
      setProfile({ full_name: null, favorite_team_id: null, teams: null });
      setProfileLoaded(true);
      return;
    }

    if (!data) {
      const { error: insertErr } = await supabase.from('profiles').insert({
        id: userId,
        email: currentSession.user.email ?? null,
      });
      if (insertErr) console.error('Profile create error:', insertErr);
      setProfile({ full_name: null, favorite_team_id: null, teams: null });
    } else {
      let teams: { name: string; badge_url: string | null } | null = null;
      if (data.favorite_team_id) {
        const { data: teamData } = await supabase
          .from('teams')
          .select('name, badge_url')
          .eq('id', data.favorite_team_id)
          .single();
        if (teamData) teams = { name: teamData.name, badge_url: teamData.badge_url };
      }
      setProfile({
        full_name: data.full_name,
        favorite_team_id: data.favorite_team_id,
        teams,
      });
    }
    setProfileLoaded(true);
  };

  useEffect(() => {
    if (!session?.user?.id) {
      setProfile(null);
      setProfileLoaded(true);
      return;
    }
    setProfileLoaded(false);
    refreshProfile();
  }, [session?.user?.id]);

  useEffect(() => {
    if (!initialized || !profileLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inProfileSetup = segments.includes('profile-setup');

    if (!session) {
      if (!inAuthGroup) router.replace('/(auth)/sign-in');
      return;
    }

    if (inAuthGroup) {
      if (profile && profile.full_name && profile.favorite_team_id) {
        router.replace('/(tabs)');
      } else {
        router.replace('/profile-setup');
      }
    } else if (!inProfileSetup && profile && (!profile.full_name || !profile.favorite_team_id)) {
      router.replace('/profile-setup');
    } else if (profile?.full_name && profile?.favorite_team_id && inProfileSetup) {
      router.replace('/(tabs)');
    }
  }, [session, profile, profileLoaded, segments, initialized]);

  if (!initialized) {
    return (
      <View style={authStyles.loadingCenter}>
        <ActivityIndicator size="large" color="#3D246C" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ session, profile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
