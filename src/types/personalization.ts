import { RankTier } from './gamification';
import { CineThemeId } from './cineplayer';

export type AppThemeId =
  | 'dark_synth'
  | 'cyberpunk'
  | 'oled_pitch'
  | 'crimson_blood'
  | 'emerald_matrix'
  | 'midnight_violet'
  | 'sunset_gold'
  | 'sakura_bloom';

export interface AppThemeColors {
  background: string;
  card: string;
  cardHover: string;
  surface: string;
  surfaceLight: string;
  primary: string;
  secondary: string;
  accent: string;
  accentOrange: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  glow: string;
  glass: string;
  badgeBg: string;
}

export interface AppThemePack {
  id: AppThemeId;
  name: string;
  tagline: string;
  description: string;
  colors: AppThemeColors;
  primaryGradient: [string, string];
  cardGradient: [string, string];
  unlocked: boolean;
  requiredLevel: number;
  requiredRank?: RankTier;
  icon: string;
}

export type CosmeticRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';

export interface AvatarDecoration {
  id: string;
  name: string;
  rarity: CosmeticRarity;
  borderColor: string;
  glowColor: string;
  accentColor?: string;
  particleIcon?: string;
  description: string;
  unlocked: boolean;
  requiredLevel: number;
  requiredRank?: RankTier;
  previewAvatar?: string;
}

export interface ProfileBackground {
  id: string;
  name: string;
  bannerUrl: string;
  rarity: CosmeticRarity;
  overlayGradient: [string, string];
  themeAccent: string;
  description: string;
  unlocked: boolean;
  requiredLevel: number;
  requiredRank?: RankTier;
}

export interface EquipableTitle {
  id: string;
  title: string;
  lore: string;
  rarity: CosmeticRarity;
  color: string;
  glowColor: string;
  icon: string;
  unlocked: boolean;
  requiredLevel: number;
  requiredRank?: RankTier;
}

export type NameplateStyle =
  | 'holographic'
  | 'flaming_ember'
  | 'ethereal_amethyst'
  | 'golden_sovereign'
  | 'cyber_glitch'
  | 'cosmic_stardust';

export interface NameplateEffect {
  id: string;
  name: string;
  style: NameplateStyle;
  rarity: CosmeticRarity;
  bgGradient: [string, string];
  borderGlow: string;
  textColor: string;
  icon: string;
  description: string;
  unlocked: boolean;
  requiredLevel: number;
  requiredRank?: RankTier;
}

export type ExpandedReaderThemeId =
  | 'oled'
  | 'sepia'
  | 'solarized'
  | 'cream'
  | 'dark'
  | 'parchment'
  | 'dracula'
  | 'cyberpunk'
  | 'forest';

export interface ReaderThemePack {
  id: ExpandedReaderThemeId;
  name: string;
  bg: string;
  text: string;
  subText: string;
  hudBg: string;
  border: string;
  accentColor: string;
}

export interface AdvancedPlayerConfig {
  hudTheme: CineThemeId;
  audioEqualizerBoost: number; // 1.0 (100%) to 2.0 (200%)
  progressBarGlow: boolean;
  progressBarGlowColor: string;
  subtitleFontFamily: 'System' | 'Roboto' | 'Cinzel' | 'Monospace';
  subtitleTextShadow: boolean;
  subtitleStrokeWidth: number;
  smoothVolumeGestures: boolean;
  highPrecisionScrubbing: boolean;
}
