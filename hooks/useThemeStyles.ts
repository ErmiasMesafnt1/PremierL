import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';

export function useAuthStyles() {
  const { colors } = useTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
        keyboardView: { flex: 1, backgroundColor: colors.bg },
        scrollView: { flex: 1, backgroundColor: colors.bg },
        scrollContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: 24, paddingBottom: 32 },
        container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 0, paddingBottom: 24 },
        signUpContainer: { paddingBottom: 24 },
        logoContainer: { alignItems: 'center', marginBottom: 20 },
        logoBorder: {
          padding: 12,
          borderRadius: 20,
          borderWidth: 4,
          borderColor: colors.PL_FUCHSIA,
          backgroundColor: colors.card,
          alignItems: 'center',
          justifyContent: 'center',
        },
        logo: { width: 140, height: 180 },
        logoText: { fontSize: 42, fontWeight: '900', color: colors.PL_BRAND, letterSpacing: -1 },
        logoSubtext: { fontSize: 14, color: colors.PL_FUCHSIA, fontWeight: '700', marginTop: 4, letterSpacing: 2 },
        formCard: {
          backgroundColor: colors.card,
          borderRadius: 22,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          shadowColor: colors.PL_BRAND,
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 3,
          borderLeftWidth: 4,
          borderLeftColor: colors.PL_CYAN,
        },
        title: {
          fontSize: 26,
          fontWeight: '900',
          textAlign: 'center',
          marginBottom: 6,
          color: colors.textDark,
          letterSpacing: -0.2,
        },
        subtitle: {
          fontSize: 15,
          color: colors.muted,
          textAlign: 'center',
          marginBottom: 16,
          fontWeight: '600',
        },
        verticallySpaced: { paddingTop: 4, paddingBottom: 4, alignSelf: 'stretch' },
        mt20: { marginTop: 14 },
        linkText: { color: colors.PL_BRAND, textAlign: 'center', fontSize: 15, fontWeight: '700' },
        linkWrap: { marginTop: 14, alignItems: 'center' },
        inputContainer: { marginBottom: 4 },
        inputLabel: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 8 },
        input: {
          borderWidth: 2,
          borderColor: colors.inputBorder,
          borderRadius: 14,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 16,
          backgroundColor: colors.inputBg,
          color: colors.text,
        },
        inputFocused: { borderColor: colors.PL_CYAN },
        button: {
          borderRadius: 14,
          paddingVertical: 16,
          backgroundColor: colors.PL_BRAND,
          alignItems: 'center',
          justifyContent: 'center',
        },
        buttonDisabled: { opacity: 0.6 },
        buttonTitle: { fontWeight: '800', fontSize: 16, color: '#FFFFFF' },
        teamSectionTitle: {
          fontSize: 18,
          fontWeight: '800',
          color: colors.textDark,
          marginBottom: 16,
          marginTop: 8,
        },
        teamGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
        teamCard: {
          width: 72,
          alignItems: 'center',
          paddingVertical: 10,
          paddingHorizontal: 6,
          borderRadius: 14,
          borderWidth: 2,
          borderColor: colors.cardBorder,
          backgroundColor: colors.card,
        },
        teamCardSelected: {
          borderColor: colors.PL_BRAND,
          backgroundColor: colors.teamCardSelected,
        },
        teamBadge: { width: 48, height: 48, marginBottom: 6, borderRadius: 24 },
        teamName: { fontSize: 10, fontWeight: '700', color: colors.text, textAlign: 'center' },
      }),
    [colors]
  );
}
