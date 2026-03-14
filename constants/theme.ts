/**
 * Premier League app theme colors for light and dark mode.
 */

const PL_BRAND = '#3D246C';
const PL_FUCHSIA = '#E91E8C';
const PL_CYAN = '#00D4FF';
const PL_MINT = '#00C9A7';
const PL_YELLOW = '#CCFF00';

export const ThemeColors = {
  light: {
    bg: '#F0F4FA',
    BG: '#F0F4FA', // alias for legacy BG constant
    card: '#FFFFFF',
    cardBorder: '#E8ECF4',
    text: '#1A1A2E',
    textDark: '#0D0D1A',
    muted: '#6B7280',
    inputBg: '#FFFFFF',
    inputBorder: '#E8ECF4',
    modalOverlay: 'rgba(0,0,0,0.5)',
    modalBg: '#FFFFFF',
    searchBg: '#F8FAFC',
    searchBorder: '#E2E8F0',
    rowBorder: '#F1F5F9',
    betterHighlight: '#CCF3FF', // Premier League cyan tint
    placeholder: '#CBD5E1',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E8ECF4',
    teamCardSelected: '#F5F0FA',
    signOutButton: '#DC2626',
    PL_BRAND,
    PL_FUCHSIA,
    PL_CYAN,
    PL_MINT,
    PL_YELLOW,
  },
  dark: {
    bg: '#0F0F14',
    BG: '#0F0F14', // alias for legacy BG constant
    card: '#1A1A24',
    cardBorder: '#2D2D3A',
    text: '#F0F0F5',
    textDark: '#FFFFFF',
    muted: '#9CA3AF',
    inputBg: '#1A1A24',
    inputBorder: '#2D2D3A',
    modalOverlay: 'rgba(0,0,0,0.7)',
    modalBg: '#1A1A24',
    searchBg: '#252532',
    searchBorder: '#2D2D3A',
    rowBorder: '#2D2D3A',
    betterHighlight: '#0D3D4D', // Premier League cyan tint
    placeholder: '#4B5563',
    tabBar: '#0F0F14',
    tabBarBorder: '#2D2D3A',
    teamCardSelected: '#2D2640',
    signOutButton: '#B91C1C',
    PL_BRAND,
    PL_FUCHSIA,
    PL_CYAN,
    PL_MINT,
    PL_YELLOW,
  },
};

export type ThemeMode = 'light' | 'dark' | 'system';

// Legacy export for use-theme-color and collapsible
export const Colors = {
  light: { text: '#11181C', background: '#fff', tint: '#0a7ea4', icon: '#687076', tabIconDefault: '#687076', tabIconSelected: '#0a7ea4' },
  dark: { text: '#ECEDEE', background: '#151718', tint: '#fff', icon: '#9BA1A6', tabIconDefault: '#9BA1A6', tabIconSelected: '#fff' },
};
