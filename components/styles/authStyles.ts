import { StyleSheet } from 'react-native';

// Premier League theme colors from branding
const PL_BRAND = '#3D246C'; // Dark purple/indigo - primary brand
const PL_FUCHSIA = '#E91E8C'; // Hot pink accent
const PL_CYAN = '#00D4FF'; // Sky blue accent
const PL_MINT = '#00C9A7'; // Mint/teal accent
const PL_YELLOW = '#CCFF00'; // Neon yellow accent
const BG = '#F0F4FA'; // Light background
const BORDER = '#E8ECF4';
const MUTED = '#6B7280';
const TEXT_PRIMARY = '#1A1A2E';
const TEXT_DARK = '#0D0D1A';

const styles = StyleSheet.create({
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG,
  },
  keyboardView: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollView: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
    paddingBottom: 32,
  },
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 24,
  },
  signUpContainer: {
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 140,
    height: 180,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    color: PL_BRAND,
    letterSpacing: -1,
  },
  logoSubtext: {
    fontSize: 14,
    color: PL_FUCHSIA,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 2,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: PL_BRAND,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: PL_CYAN,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
    color: TEXT_DARK,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 15,
    color: MUTED,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 14,
  },
  linkText: {
    color: PL_BRAND,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
  },
  linkWrap: {
    marginTop: 14,
    alignItems: 'center',
  },
  inputContainer: {
    marginBottom: 4,
  },
  inputLabel: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: BORDER,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: TEXT_PRIMARY,
  },
  inputFocused: {
    borderColor: PL_CYAN,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 16,
    backgroundColor: PL_BRAND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonTitle: {
    fontWeight: '800',
    fontSize: 16,
    color: '#FFFFFF',
  },
  // Profile setup
  teamSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: TEXT_DARK,
    marginBottom: 16,
    marginTop: 8,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  teamCard: {
    width: 72,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
  },
  teamCardSelected: {
    borderColor: PL_BRAND,
    backgroundColor: '#F5F0FA',
  },
  teamBadge: {
    width: 48,
    height: 48,
    marginBottom: 6,
    borderRadius: 24,
  },
  teamName: {
    fontSize: 10,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    textAlign: 'center',
  },
});

export default styles;
export { PL_BRAND, PL_FUCHSIA, PL_CYAN, PL_MINT, PL_YELLOW, BG, BORDER, MUTED, TEXT_PRIMARY };
