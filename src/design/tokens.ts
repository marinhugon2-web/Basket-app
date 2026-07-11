import { Platform } from 'react-native';

export const colors = {
  abyss: '#090A0C',
  courtBlack: '#0D0F12',
  surface1: '#12151A',
  surface2: '#181C22',
  surface3: '#20252D',
  surface4: '#292F39',
  borderSubtle: '#292E36',
  borderStrong: '#3A424E',
  volt: '#C7FF2F',
  voltPressed: '#A8DC20',
  voltDeep: '#6D8F13',
  voltWash: '#C7FF2F1A',
  voltGlow: '#C7FF2F40',
  textPrimary: '#F4F7FA',
  textSecondary: '#ABB3BF',
  textMuted: '#747E8C',
  textDisabled: '#4D5561',
  textOnVolt: '#101208',
  success: '#3CE58A',
  verified: '#2CE0C1',
  warning: '#FFB547',
  danger: '#FF5F6D',
  information: '#A78BFA',
  pending: '#D5A6FF',
  overlay: '#090A0CEB',
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

export const radii = {
  small: 8,
  medium: 12,
  large: 18,
  xl: 24,
  pill: 999,
} as const;

export const fonts = {
  displaySemiBold: 'BarlowCondensed_600SemiBold',
  displayBold: 'BarlowCondensed_700Bold',
  bodyRegular: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  monoMedium: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',
  fallback: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'system-ui',
  }),
} as const;

export const typography = {
  displayXXL: {
    fontFamily: fonts.displayBold,
    fontSize: 64,
    lineHeight: 64,
  },
  displayXL: {
    fontFamily: fonts.displayBold,
    fontSize: 48,
    lineHeight: 48,
  },
  h1: {
    fontFamily: fonts.displayBold,
    fontSize: 40,
    lineHeight: 44,
  },
  h2: {
    fontFamily: fonts.displayBold,
    fontSize: 32,
    lineHeight: 36,
  },
  h3: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 26,
    lineHeight: 30,
  },
  titleLarge: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 22,
    lineHeight: 28,
  },
  title: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  bodyLarge: {
    fontFamily: fonts.bodyRegular,
    fontSize: 18,
    lineHeight: 28,
  },
  body: {
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 18,
  },
  caption: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
  },
  micro: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    lineHeight: 12,
  },
  scoreHero: {
    fontFamily: fonts.monoBold,
    fontSize: 56,
    lineHeight: 56,
  },
  metricLarge: {
    fontFamily: fonts.monoBold,
    fontSize: 30,
    lineHeight: 34,
  },
  metric: {
    fontFamily: fonts.monoMedium,
    fontSize: 20,
    lineHeight: 24,
  },
  metricSmall: {
    fontFamily: fonts.monoMedium,
    fontSize: 13,
    lineHeight: 18,
  },
} as const;

export const motion = {
  micro: 130,
  standard: 210,
  panel: 280,
  context: 360,
  xpGain: 820,
  forgeBreak: 1100,
} as const;
