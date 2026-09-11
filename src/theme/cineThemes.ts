import { CineTheme, CineThemeId } from '../types/cineplayer';

export const CINE_THEMES: Record<CineThemeId, CineTheme> = {
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    accent: '#8B5CF6', // Neon Purple
    accentSecondary: '#06B6D4', // Electric Cyan
    glow: 'rgba(139, 92, 246, 0.45)',
    hudBackground: 'rgba(11, 13, 19, 0.88)',
    hudBorder: 'rgba(139, 92, 246, 0.35)',
    progressBarTrack: 'rgba(255, 255, 255, 0.2)',
    progressBarFill: '#8B5CF6',
    buttonActiveBg: 'rgba(139, 92, 246, 0.3)',
    buttonText: '#FFFFFF',
  },
  oled: {
    id: 'oled',
    name: 'OLED Pure Black',
    accent: '#FFFFFF',
    accentSecondary: '#A1A1AA',
    glow: 'rgba(255, 255, 255, 0.25)',
    hudBackground: 'rgba(0, 0, 0, 0.95)',
    hudBorder: 'rgba(255, 255, 255, 0.2)',
    progressBarTrack: 'rgba(255, 255, 255, 0.15)',
    progressBarFill: '#FFFFFF',
    buttonActiveBg: 'rgba(255, 255, 255, 0.2)',
    buttonText: '#000000',
  },
  crimson: {
    id: 'crimson',
    name: 'Crimson Titan',
    accent: '#F43F5E', // Vivid Crimson
    accentSecondary: '#F59E0B', // Amber Gold
    glow: 'rgba(244, 63, 94, 0.45)',
    hudBackground: 'rgba(18, 10, 14, 0.92)',
    hudBorder: 'rgba(244, 63, 94, 0.4)',
    progressBarTrack: 'rgba(244, 63, 94, 0.2)',
    progressBarFill: '#F43F5E',
    buttonActiveBg: 'rgba(244, 63, 94, 0.3)',
    buttonText: '#FFFFFF',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Sapphire',
    accent: '#3B82F6', // Royal Sapphire
    accentSecondary: '#38BDF8', // Sky Blue
    glow: 'rgba(59, 130, 246, 0.45)',
    hudBackground: 'rgba(8, 14, 28, 0.92)',
    hudBorder: 'rgba(59, 130, 246, 0.35)',
    progressBarTrack: 'rgba(59, 130, 246, 0.2)',
    progressBarFill: '#3B82F6',
    buttonActiveBg: 'rgba(59, 130, 246, 0.3)',
    buttonText: '#FFFFFF',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Otaku',
    accent: '#10B981', // Neon Emerald
    accentSecondary: '#34D399', // Mint Green
    glow: 'rgba(16, 185, 129, 0.45)',
    hudBackground: 'rgba(6, 20, 16, 0.92)',
    hudBorder: 'rgba(16, 185, 129, 0.35)',
    progressBarTrack: 'rgba(16, 185, 129, 0.2)',
    progressBarFill: '#10B981',
    buttonActiveBg: 'rgba(16, 185, 129, 0.3)',
    buttonText: '#FFFFFF',
  },
};

export const DEFAULT_CINE_THEME = CINE_THEMES.cyberpunk;
