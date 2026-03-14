import { useState, useRef, useEffect } from 'react';
import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TextInput,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStyles } from '@/hooks/useThemeStyles';

export default function SignUp() {
  const styles = useAuthStyles();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const keyboardVisibleRef = useRef(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => {
      keyboardVisibleRef.current = true;
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardVisibleRef.current = false;
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleAuthFieldFocus = () => {
    if (!keyboardVisibleRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  };

  async function signUpWithEmail() {
    if (!isSupabaseConfigured) {
      Alert.alert(
        'Setup Required',
        'Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your environment.'
      );
      return;
    }
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Information', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      Alert.alert('Sign Up Error', error.message);
      setLoading(false);
      return;
    }

    if (!session) {
      Alert.alert(
        'Verification Required',
        'Please check your inbox for email verification!'
      );
    }
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.scrollContent, styles.signUpContainer]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoBorder}>
              <Image
                source={require('@/assets/images/totw-logo.png')}
                style={styles.logo}
                contentFit="contain"
              />
            </View>
          </View>
          <View style={styles.formCard}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join CornerGuard to follow the Premier League</Text>
            <View style={[styles.verticallySpaced, styles.mt20]}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                onChangeText={setEmail}
                value={email}
                onFocus={handleAuthFieldFocus}
                placeholder="email@address.com"
                placeholderTextColor="#9AA0A6"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>
            <View style={styles.verticallySpaced}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                onChangeText={setPassword}
                value={password}
                onFocus={handleAuthFieldFocus}
                secureTextEntry
                placeholder="Password"
                placeholderTextColor="#9AA0A6"
                autoCapitalize="none"
                autoComplete="new-password"
              />
            </View>
            <View style={[styles.verticallySpaced, styles.mt20]}>
              <Pressable
                onPress={signUpWithEmail}
                disabled={loading}
                style={[styles.button, loading && styles.buttonDisabled]}
              >
                <Text style={styles.buttonTitle}>
                  {loading ? 'Creating Account...' : 'Sign up'}
                </Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.linkWrap}>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
              <Text style={styles.linkText}>Already have an account? Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
