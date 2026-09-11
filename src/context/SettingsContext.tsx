import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlayerSettings } from '../types/anime';
import { storage } from '../utils/storage';
import {
  AppThemeId,
  AppThemePack,
  AdvancedPlayerConfig,
  EquipableTitle,
  NameplateEffect,
  ProfileBackground,
  AvatarDecoration,
} from '../types/personalization';
import {
  APP_THEME_PACKS,
  EQUIPABLE_TITLES,
  NAMEPLATE_EFFECTS,
  PROFILE_BACKGROUNDS,
  AVATAR_DECORATIONS,
  DEFAULT_ADVANCED_PLAYER_CONFIG,
} from '../api/personalization/personalizationEngine';

const DEFAULT_SETTINGS: PlayerSettings = {
  defaultQuality: 'auto',
  autoPlayNext: true,
  autoSkipIntro: true,
  autoSkipOutro: true,
  preferredAudio: 'sub',
  preferredServer: 'Auto',
  gestureControls: true,
  doubleTapSeekSeconds: 10,
  resizeMode: 'contain',
  subtitles: {
    fontSize: 18,
    fontColor: '#FFFFFF',
    backgroundColor: '#000000',
    backgroundOpacity: 0.65,
    textOutline: true,
    bottomOffset: 24,
  },
};

interface SettingsContextType {
  settings: PlayerSettings;
  updateSettings: (newSettings: Partial<PlayerSettings>) => Promise<void>;
  updateSubtitleSettings: (subSettings: Partial<PlayerSettings['subtitles']>) => Promise<void>;
  resetSettings: () => Promise<void>;

  // Personalization States & Getters
  activeThemeId: AppThemeId;
  activeTheme: AppThemePack;
  setAppTheme: (themeId: AppThemeId) => Promise<void>;

  activeTitleId: string;
  activeTitle: EquipableTitle;
  setTitle: (titleId: string) => Promise<void>;

  activeNameplateId: string;
  activeNameplate: NameplateEffect;
  setNameplate: (nameplateId: string) => Promise<void>;

  activeProfileBannerId: string;
  activeProfileBanner: ProfileBackground;
  setProfileBanner: (bannerId: string) => Promise<void>;

  activeAvatarFrameId: string;
  activeAvatarFrame: AvatarDecoration;
  setAvatarFrame: (frameId: string) => Promise<void>;

  playerConfig: AdvancedPlayerConfig;
  updatePlayerConfig: (config: Partial<AdvancedPlayerConfig>) => Promise<void>;
}

const SETTINGS_STORAGE_KEY = '@animenext_player_settings';
const THEME_STORAGE_KEY = '@animenext_app_theme';
const TITLE_STORAGE_KEY = '@animenext_user_title';
const NAMEPLATE_STORAGE_KEY = '@animenext_user_nameplate';
const BANNER_STORAGE_KEY = '@animenext_profile_banner';
const FRAME_STORAGE_KEY = '@animenext_avatar_frame';
const PLAYER_CONFIG_KEY = '@animenext_advanced_player_config';

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  updateSettings: async () => {},
  updateSubtitleSettings: async () => {},
  resetSettings: async () => {},

  activeThemeId: 'dark_synth',
  activeTheme: APP_THEME_PACKS.dark_synth,
  setAppTheme: async () => {},

  activeTitleId: 'title_shadow_monarch',
  activeTitle: EQUIPABLE_TITLES[0],
  setTitle: async () => {},

  activeNameplateId: 'plate_ethereal_amethyst',
  activeNameplate: NAMEPLATE_EFFECTS[2],
  setNameplate: async () => {},

  activeProfileBannerId: 'bg_shadow_gates',
  activeProfileBanner: PROFILE_BACKGROUNDS[0],
  setProfileBanner: async () => {},

  activeAvatarFrameId: 'frame_shadow_aura',
  activeAvatarFrame: AVATAR_DECORATIONS[0],
  setAvatarFrame: async () => {},

  playerConfig: DEFAULT_ADVANCED_PLAYER_CONFIG,
  updatePlayerConfig: async () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PlayerSettings>(DEFAULT_SETTINGS);
  const [activeThemeId, setActiveThemeIdState] = useState<AppThemeId>('dark_synth');
  const [activeTitleId, setActiveTitleIdState] = useState<string>('title_shadow_monarch');
  const [activeNameplateId, setActiveNameplateIdState] = useState<string>('plate_ethereal_amethyst');
  const [activeProfileBannerId, setActiveProfileBannerIdState] = useState<string>('bg_shadow_gates');
  const [activeAvatarFrameId, setActiveAvatarFrameIdState] = useState<string>('frame_shadow_aura');
  const [playerConfig, setPlayerConfig] = useState<AdvancedPlayerConfig>(DEFAULT_ADVANCED_PLAYER_CONFIG);

  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    try {
      const savedSettings = await storage.get<PlayerSettings>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);
      setSettings(savedSettings);

      const savedTheme = await storage.get<AppThemeId>(THEME_STORAGE_KEY, 'dark_synth');
      if (APP_THEME_PACKS[savedTheme]) {
        setActiveThemeIdState(savedTheme);
      }

      const savedTitle = await storage.get<string>(TITLE_STORAGE_KEY, 'title_shadow_monarch');
      setActiveTitleIdState(savedTitle);

      const savedNameplate = await storage.get<string>(NAMEPLATE_STORAGE_KEY, 'plate_ethereal_amethyst');
      setActiveNameplateIdState(savedNameplate);

      const savedBanner = await storage.get<string>(BANNER_STORAGE_KEY, 'bg_shadow_gates');
      setActiveProfileBannerIdState(savedBanner);

      const savedFrame = await storage.get<string>(FRAME_STORAGE_KEY, 'frame_shadow_aura');
      setActiveAvatarFrameIdState(savedFrame);

      const savedPlayerConfig = await storage.get<AdvancedPlayerConfig>(
        PLAYER_CONFIG_KEY,
        DEFAULT_ADVANCED_PLAYER_CONFIG
      );
      setPlayerConfig(savedPlayerConfig);
    } catch (e) {
      console.warn('Failed to load personalization settings:', e);
    }
  };

  const updateSettings = async (newSettings: Partial<PlayerSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await storage.set(SETTINGS_STORAGE_KEY, updated);
  };

  const updateSubtitleSettings = async (subSettings: Partial<PlayerSettings['subtitles']>) => {
    const updated: PlayerSettings = {
      ...settings,
      subtitles: { ...settings.subtitles, ...subSettings },
    };
    setSettings(updated);
    await storage.set(SETTINGS_STORAGE_KEY, updated);
  };

  const resetSettings = async () => {
    setSettings(DEFAULT_SETTINGS);
    await storage.set(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);
  };

  const setAppTheme = async (themeId: AppThemeId) => {
    if (APP_THEME_PACKS[themeId]) {
      setActiveThemeIdState(themeId);
      await storage.set(THEME_STORAGE_KEY, themeId);
    }
  };

  const setTitle = async (titleId: string) => {
    setActiveTitleIdState(titleId);
    await storage.set(TITLE_STORAGE_KEY, titleId);
  };

  const setNameplate = async (nameplateId: string) => {
    setActiveNameplateIdState(nameplateId);
    await storage.set(NAMEPLATE_STORAGE_KEY, nameplateId);
  };

  const setProfileBanner = async (bannerId: string) => {
    setActiveProfileBannerIdState(bannerId);
    await storage.set(BANNER_STORAGE_KEY, bannerId);
  };

  const setAvatarFrame = async (frameId: string) => {
    setActiveAvatarFrameIdState(frameId);
    await storage.set(FRAME_STORAGE_KEY, frameId);
  };

  const updatePlayerConfig = async (config: Partial<AdvancedPlayerConfig>) => {
    const updated = { ...playerConfig, ...config };
    setPlayerConfig(updated);
    await storage.set(PLAYER_CONFIG_KEY, updated);
  };

  const activeTheme = APP_THEME_PACKS[activeThemeId] || APP_THEME_PACKS.dark_synth;
  const activeTitle =
    EQUIPABLE_TITLES.find((t) => t.id === activeTitleId) || EQUIPABLE_TITLES[0];
  const activeNameplate =
    NAMEPLATE_EFFECTS.find((p) => p.id === activeNameplateId) || NAMEPLATE_EFFECTS[0];
  const activeProfileBanner =
    PROFILE_BACKGROUNDS.find((b) => b.id === activeProfileBannerId) || PROFILE_BACKGROUNDS[0];
  const activeAvatarFrame =
    AVATAR_DECORATIONS.find((f) => f.id === activeAvatarFrameId) || AVATAR_DECORATIONS[0];

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateSubtitleSettings,
        resetSettings,
        activeThemeId,
        activeTheme,
        setAppTheme,
        activeTitleId,
        activeTitle,
        setTitle,
        activeNameplateId,
        activeNameplate,
        setNameplate,
        activeProfileBannerId,
        activeProfileBanner,
        setProfileBanner,
        activeAvatarFrameId,
        activeAvatarFrame,
        setAvatarFrame,
        playerConfig,
        updatePlayerConfig,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

