/**
 * IQON Health Design System
 * Light flat/neumorphic theme with geometric pill styling and shades of grey accents.
 */

import { Platform, ViewStyle, TextStyle } from 'react-native';

const tintColorLight = '#2A2A2A';

export const Colors = {
  // Legacy support
  light: {
    text: '#2A2A2A',
    background: '#EAECEF',
    tint: tintColorLight,
    icon: '#71767C',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorLight,
  },
  dark: { // We will force light mode globally, but keep this to avoid crashes
    text: '#2A2A2A',
    background: '#EAECEF',
    tint: tintColorLight,
    icon: '#71767C',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorLight,
  },

// App-wide colors (Premium Liquid Glass Metal palette)
  bgPrimary: '#E8ECEF', // Soft, reflective silver background
  bgSecondary: '#DFE4E8', 
  panelBg: 'rgba(255, 255, 255, 0.65)', // Glassy effect
  
  cardDark: '#2B2D31', // Deep brushed metal
  cardDarkAlt: '#1E1F22', 

  accent: '#8E949A', // Soft metallic accent
  accentLight: '#F0F3F5', // Chrome highlight
  accentDark: '#4A4E53', // Darker metal

  textPrimary: '#1E2429', // Crisp dark grey
  textSecondary: '#6B7075', // Muted metal text
  textInverse: '#F8F9FA', // For text on dark metal
  textInverseSec: '#A5ABB0',

  danger: '#FF3B30', // Kept vibrant red for alerts as requested ("circle with the red")
  success: '#34C759',
  warning: '#FF9500',

  // Useful simple greys
  grey100: 'rgba(255, 255, 255, 0.4)', // Glassy light grey
  grey200: 'rgba(200, 205, 210, 0.4)', // Glassy border color
  grey300: '#D1D5DB',
  grey400: '#9CA3AF',
  grey500: '#6B7280',
  grey600: '#4B5563',
  grey800: '#1F2937',

  // Dashboard Aesthetic Colors
  vibrantBlue: '#2B2D31', // Changed to dark metal for buttons
  pastelBlueLight: '#FFFFFF', // Refined highlighting
  pastelBlueDark: '#EAECEE',
  softRed: '#FF3B30', // Keep red accent 
  blackBtn: '#1A1C1E', // Very dark metal

  white05: 'rgba(255,255,255,0.05)',
  white10: 'rgba(255,255,255,0.1)',
  white20: 'rgba(255,255,255,0.2)',
  white30: 'rgba(255,255,255,0.3)',
  white40: 'rgba(255,255,255,0.4)',
  white50: 'rgba(255,255,255,0.5)',
  white80: 'rgba(255,255,255,0.8)',

  glassBg: 'rgba(255, 255, 255, 0.6)',
  glassBorder: 'rgba(255, 255, 255, 0.8)',
};

// Significantly increased radius spacing to emulate geometric/pill look
export const Radius = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  full: 999,
};

export const Spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

export const Typography = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 18,
  xl: 22,
  '2xl': 28,
  '3xl': 36,
  '4xl': 44,
  '5xl': 52,
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  } as ViewStyle,
  layered: {
    shadowColor: '#000',
    shadowOffset: { width: 8, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  } as ViewStyle,
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  } as ViewStyle,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal', // Usually defaults to Roboto on Android
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "Inter, 'Outfit', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
