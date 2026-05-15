import { Platform } from 'react-native';

export const colors = {
  canvas: '#f5f6fa',
  surface: 'rgba(255,255,255,0.92)',
  surfaceSolid: '#ffffff',
  line: '#dde1ea',
  lineSoft: '#edf0f6',
  text: '#111827',
  textMuted: '#6b7280',
  textSubtle: '#9ca3af',
  blue: '#0a84ff',
  mint: '#30b78f',
  pink: '#ff6b8a',
  orange: '#ff9f0a',
  violet: '#7c6df2',
  danger: '#ff453a',
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
};

export const shadow = Platform.select({
  ios: {
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },
  android: {
    elevation: 3,
  },
  default: {},
});

export const softShadow = Platform.select({
  ios: {
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
  },
  android: {
    elevation: 1,
  },
  default: {},
});

export const layout = {
  maxWidth: 760,
  pagePadding: 18,
};
