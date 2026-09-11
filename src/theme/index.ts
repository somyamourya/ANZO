export const colors = {
  // Backgrounds (OLED True Dark)
  background: '#0B0D13',
  card: '#12151F',
  cardHover: '#181C2A',
  surface: '#1A1E2D',
  surfaceLight: '#23283B',
  
  // Neon Brand Accents
  primary: '#8B5CF6', // Vivid Purple
  primaryGradientStart: '#8B5CF6',
  primaryGradientEnd: '#EC4899',
  secondary: '#06B6D4', // Electric Cyan
  accent: '#F43F5E', // Crimson Rose
  accentOrange: '#F97316',
  
  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Text Hierarchy
  text: '#FFFFFF',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textSubtle: '#475569',
  cardBackground: '#12151F',

  // Borders and Glassmorphism
  border: '#1E293B',
  borderLight: '#334155',
  glass: 'rgba(18, 21, 31, 0.75)',
  glassCard: 'rgba(26, 30, 45, 0.65)',
  overlay: 'rgba(0, 0, 0, 0.85)',
};

export const typography = {
  fontFamily: {
    sans: 'System',
    heading: 'System',
    mono: 'monospace',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 34,
  },
  lineHeight: {
    xs: 14,
    sm: 18,
    base: 22,
    lg: 24,
    xl: 28,
    '2xl': 32,
    '3xl': 36,
    '4xl': 42,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  neon: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export default theme;
