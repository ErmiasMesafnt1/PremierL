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

export default function SignIn() {
  const styles = useAuthStyles();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
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

  async function signInWithEmail() {
    if (!isSupabaseConfigured) {
      Alert.alert(
        'Setup Required',
        'Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your environment. Create a .env file or add them to app.config.js.'
      );
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Sign In Error', error.message);
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
          contentContainerStyle={styles.scrollContent}
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
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to follow the action</Text>
            <View style={[styles.verticallySpaced, styles.mt20]}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.input, emailFocused && styles.inputFocused]}
                onChangeText={setEmail}
                value={email}
                onFocus={() => {
                  setEmailFocused(true);
                  handleAuthFieldFocus();
                }}
                onBlur={() => setEmailFocused(false)}
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
                style={[styles.input, passwordFocused && styles.inputFocused]}
                onChangeText={setPassword}
                value={password}
                onFocus={() => {
                  setPasswordFocused(true);
                  handleAuthFieldFocus();
                }}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry
                placeholder="Password"
                placeholderTextColor="#9AA0A6"
                autoCapitalize="none"
                autoComplete="password"
              />
            </View>
            <View style={[styles.verticallySpaced, styles.mt20]}>
              <Pressable
                onPress={signInWithEmail}
                disabled={loading}
                style={[styles.button, loading && styles.buttonDisabled]}
              >
                <Text style={styles.buttonTitle}>{loading ? 'Signing in...' : 'Sign in'}</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.linkWrap}>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
              <Text style={styles.linkText}>Don&apos;t have an account? Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
