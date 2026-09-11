import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useWatchProgress } from '../context/WatchProgressContext';
import { useCommunity } from '../context/CommunityContext';
import { USER_ROLE_CONFIG } from '../api/community/communityEngine';
import { UserProfileModal } from '../components/community/UserProfileModal';
import { colors, borderRadius, shadows, theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

import { RankProgressCard } from '../components/gamification/RankProgressCard';
import { DailyStreakCard } from '../components/gamification/DailyStreakCard';
import { QuestsList } from '../components/gamification/QuestsList';
import { CosmeticsWardrobeModal } from '../components/gamification/CosmeticsWardrobeModal';
import { ThemePickerModal } from '../components/personalization/ThemePickerModal';
import { TitleNameplateModal } from '../components/personalization/TitleNameplateModal';
import { PlayerCustomizationModal } from '../components/personalization/PlayerCustomizationModal';
import { useGamification } from '../context/GamificationContext';

export const ProfileScreen: React.FC = () => {
  const { user, loginWithAniListToken, logout } = useAuth();
  const {
    settings,
    updateSettings,
    updateSubtitleSettings,
    activeTheme,
    activeTitle,
    activeNameplate,
    activeProfileBanner,
    activeAvatarFrame,
    playerConfig,
  } = useSettings();
  const { clearHistory } = useWatchProgress();
  const { currentUser } = useCommunity();
  const { levelProgress } = useGamification();

  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showWardrobeModal, setShowWardrobeModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showTitleNameplateModal, setShowTitleNameplateModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [authError, setAuthError] = useState(false);

  const roleConfig = USER_ROLE_CONFIG[currentUser.role] || USER_ROLE_CONFIG.MEMBER;

  const handleAniListLogin = async () => {
    if (!tokenInput.trim()) return;
    const success = await loginWithAniListToken(tokenInput.trim());
    if (success) {
      setShowTokenModal(false);
      setTokenInput('');
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: activeTheme.colors.background }]} contentContainerStyle={styles.scrollContent}>
      {/* 1. Profile Banner & Avatar Card */}
      <View style={styles.profileHeaderCard}>
        <Image
          source={{ uri: activeProfileBanner.bannerUrl || currentUser.bannerUrl || user.banner }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.bannerOverlay} />

        <View style={styles.profileContent}>
          {/* Avatar with Equipped Avatar Decoration Frame */}
          <View
            style={[
              styles.avatarFrameWrapper,
              {
                borderColor: activeAvatarFrame.borderColor,
                shadowColor: activeAvatarFrame.glowColor,
              },
            ]}
          >
            <Image
              source={{ uri: currentUser.avatar || user.avatar }}
              style={styles.avatarImage}
            />
            {activeAvatarFrame.particleIcon && (
              <View style={styles.particleBadge}>
                <Text style={{ fontSize: 12 }}>{activeAvatarFrame.particleIcon}</Text>
              </View>
            )}
          </View>

          <View style={styles.profileMeta}>
            {/* Nameplate & User Title */}
            <View
              style={[
                styles.nameplateBadge,
                {
                  borderColor: activeNameplate.borderGlow,
                  backgroundColor: activeNameplate.bgGradient[0],
                },
              ]}
            >
              <Text style={{ fontSize: 12 }}>{activeNameplate.icon}</Text>
              <Text
                style={[
                  styles.username,
                  { color: activeNameplate.textColor },
                ]}
              >
                {currentUser.displayName || user.username}
              </Text>

              <View
                style={[
                  styles.communityRoleBadge,
                  { backgroundColor: roleConfig.bg, borderColor: roleConfig.border },
                ]}
              >
                <Text style={styles.communityRoleIcon}>{roleConfig.icon}</Text>
                <Text style={[styles.communityRoleText, { color: roleConfig.color }]}>
                  {roleConfig.label}
                </Text>
              </View>
            </View>

            {/* Equipped Hunter / Lore Title */}
            <View style={styles.titleRow}>
              <View
                style={[
                  styles.equippedTitleBadge,
                  {
                    borderColor: activeTitle.color,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                  },
                ]}
              >
                <Text style={styles.titleIconText}>{activeTitle.icon}</Text>
                <Text style={[styles.equippedTitleText, { color: activeTitle.color }]}>
                  {activeTitle.title}
                </Text>
              </View>
            </View>

            <Text style={styles.userHandle}>@{currentUser.username}</Text>

            {currentUser.customStatus && (
              <View style={styles.statusBubble}>
                <Ionicons name="chatbubble-ellipses-outline" size={12} color={activeTheme.colors.accent} />
                <Text style={[styles.statusText, { color: activeTheme.colors.accent }]}>
                  {currentUser.customStatus}
                </Text>
              </View>
            )}

            <View style={styles.badgeRow}>
              {user.isAniListAuthed ? (
                <View style={styles.authedBadge}>
                  <Text style={styles.authedBadgeText}>✓ AniList Synced</Text>
                </View>
              ) : (
                <View style={styles.guestBadge}>
                  <Text style={styles.guestBadgeText}>Local Guest Mode</Text>
                </View>
              )}
              <View
                style={[
                  styles.levelBadge,
                  { borderColor: levelProgress.rank.color },
                ]}
              >
                <Text style={[styles.levelText, { color: levelProgress.rank.color }]}>
                  {levelProgress.rank.label} LVL {levelProgress.currentLevel}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.profileActionBtns}>
            <TouchableOpacity
              style={[
                styles.wardrobeIconBtn,
                { borderColor: activeTheme.colors.primary, backgroundColor: activeTheme.colors.badgeBg },
              ]}
              onPress={() => setShowWardrobeModal(true)}
            >
              <Ionicons name="shirt-outline" size={17} color={activeTheme.colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.editProfileIconBtn}
              onPress={() => setShowEditProfileModal(true)}
            >
              <Ionicons name="create-outline" size={17} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 2. Personalization Hub Quick Bar */}
      <View style={styles.personalizationHub}>
        <TouchableOpacity
          style={[styles.hubTile, { backgroundColor: activeTheme.colors.card, borderColor: activeTheme.colors.border }]}
          onPress={() => setShowThemeModal(true)}
        >
          <Ionicons name="color-palette" size={18} color={activeTheme.colors.primary} />
          <Text style={[styles.hubTileTitle, { color: activeTheme.colors.textPrimary }]}>Theme</Text>
          <Text style={styles.hubTileSub}>{activeTheme.name}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.hubTile, { backgroundColor: activeTheme.colors.card, borderColor: activeTheme.colors.border }]}
          onPress={() => setShowTitleNameplateModal(true)}
        >
          <Ionicons name="ribbon" size={18} color={activeTitle.color} />
          <Text style={[styles.hubTileTitle, { color: activeTheme.colors.textPrimary }]}>Titles</Text>
          <Text numberOfLines={1} style={[styles.hubTileSub, { color: activeTitle.color }]}>
            {activeTitle.title}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.hubTile, { backgroundColor: activeTheme.colors.card, borderColor: activeTheme.colors.border }]}
          onPress={() => setShowWardrobeModal(true)}
        >
          <Ionicons name="sparkles" size={18} color="#FFD700" />
          <Text style={[styles.hubTileTitle, { color: activeTheme.colors.textPrimary }]}>Cosmetics</Text>
          <Text style={styles.hubTileSub}>Wardrobe</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.hubTile, { backgroundColor: activeTheme.colors.card, borderColor: activeTheme.colors.border }]}
          onPress={() => setShowPlayerModal(true)}
        >
          <Ionicons name="videocam" size={18} color={activeTheme.colors.secondary} />
          <Text style={[styles.hubTileTitle, { color: activeTheme.colors.textPrimary }]}>CinePlayer</Text>
          <Text style={styles.hubTileSub}>Customizer</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Gamification: Rank Progress Banner */}
      <View style={{ marginTop: 14 }}>
        <RankProgressCard onPressPerks={() => setShowWardrobeModal(true)} />
      </View>

      {/* 4. Gamification: Daily Streak Card */}
      <DailyStreakCard />

      {/* 5. Gamification: Quests List */}
      <QuestsList />

      {/* 6. User Stats Grid */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: activeTheme.colors.card, borderColor: activeTheme.colors.border }]}>
          <Text style={[styles.statNumber, { color: activeTheme.colors.primary }]}>{user.totalAnimeWatched}</Text>
          <Text style={styles.statLabel}>Anime</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: activeTheme.colors.card, borderColor: activeTheme.colors.border }]}>
          <Text style={[styles.statNumber, { color: activeTheme.colors.primary }]}>{user.totalEpisodesWatched}</Text>
          <Text style={styles.statLabel}>Episodes</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: activeTheme.colors.card, borderColor: activeTheme.colors.border }]}>
          <Text style={[styles.statNumber, { color: activeTheme.colors.primary }]}>{Math.floor(user.minutesWatched / 60)}h</Text>
          <Text style={styles.statLabel}>Hours Watched</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: activeTheme.colors.card, borderColor: activeTheme.colors.border }]}>
          <Text style={[styles.statNumber, { color: activeTheme.colors.primary }]}>{user.meanScore || '8.2'}</Text>
          <Text style={styles.statLabel}>Avg Score</Text>
        </View>
      </View>

      {/* 7. AniList Cloud Sync Section */}
      <View style={[styles.sectionCard, { backgroundColor: activeTheme.colors.card, borderColor: activeTheme.colors.border }]}>
        <Text style={styles.sectionTitle}>☁ Cloud Sync & Accounts</Text>
        <Text style={styles.sectionSubtitle}>
          Connect your AniList account to automatically synchronize watch progress and anime lists.
        </Text>

        {user.isAniListAuthed ? (
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutBtnText}>Disconnect AniList Account</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setShowTokenModal(true)}
            style={[styles.loginBtn, { backgroundColor: activeTheme.colors.primary }, shadows.neon]}
          >
            <Text style={styles.loginBtnText}>Connect with AniList</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 8. Player & Streaming Preferences */}
      <View style={[styles.sectionCard, { backgroundColor: activeTheme.colors.card, borderColor: activeTheme.colors.border }]}>
        <Text style={styles.sectionTitle}>🎬 Playback & Streaming</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Auto Skip Intro (OP)</Text>
            <Text style={styles.settingSub}>Uses AniSkip timestamps</Text>
          </View>
          <Switch
            value={settings.autoSkipIntro}
            onValueChange={(val) => updateSettings({ autoSkipIntro: val })}
            trackColor={{ false: colors.surface, true: activeTheme.colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Auto-Play Next Episode</Text>
            <Text style={styles.settingSub}>Seamless binge watching</Text>
          </View>
          <Switch
            value={settings.autoPlayNext}
            onValueChange={(val) => updateSettings({ autoPlayNext: val })}
            trackColor={{ false: colors.surface, true: activeTheme.colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Gesture Controls</Text>
            <Text style={styles.settingSub}>Swipe for volume & brightness</Text>
          </View>
          <Switch
            value={settings.gestureControls}
            onValueChange={(val) => updateSettings({ gestureControls: val })}
            trackColor={{ false: colors.surface, true: activeTheme.colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* 9. Subtitle Styling Customizer */}
      <View style={[styles.sectionCard, { backgroundColor: activeTheme.colors.card, borderColor: activeTheme.colors.border }]}>
        <Text style={styles.sectionTitle}>💬 Subtitle Customization</Text>
        <Text style={styles.sectionSubtitle}>
          Current size: {settings.subtitles.fontSize}px • Background:{' '}
          {Math.floor(settings.subtitles.backgroundOpacity * 100)}%
        </Text>

        <View style={styles.subPreviewSize}>
          <View
            style={[
              styles.subPreviewBox,
              {
                backgroundColor: `rgba(0,0,0,${settings.subtitles.backgroundOpacity})`,
              },
            ]}
          >
            <Text
              style={[
                styles.subPreviewText,
                {
                  fontSize: settings.subtitles.fontSize,
                  color: settings.subtitles.fontColor,
                },
              ]}
            >
              "Ore wa Kaizoku Ou ni naru Otoko da!"
            </Text>
          </View>
        </View>

        <View style={styles.subControlsRow}>
          <TouchableOpacity
            onPress={() =>
              updateSubtitleSettings({
                fontSize: Math.max(12, settings.subtitles.fontSize - 2),
              })
            }
            style={styles.subBtn}
          >
            <Text style={styles.subBtnText}>- Smaller Font</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              updateSubtitleSettings({
                fontSize: Math.min(28, settings.subtitles.fontSize + 2),
              })
            }
            style={styles.subBtn}
          >
            <Text style={styles.subBtnText}>+ Larger Font</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 10. Data & Cache */}
      <View style={[styles.sectionCard, { backgroundColor: activeTheme.colors.card, borderColor: activeTheme.colors.border }]}>
        <Text style={styles.sectionTitle}>⚙ Cache & Storage</Text>
        <TouchableOpacity onPress={clearHistory} style={styles.clearHistoryBtn}>
          <Text style={styles.clearHistoryBtnText}>Clear Watch History</Text>
        </TouchableOpacity>
      </View>

      {/* User Profile Editor Modal */}
      <UserProfileModal
        visible={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        user={currentUser}
        isCurrentUser={true}
      />

      {/* Cosmetics Wardrobe Modal */}
      <CosmeticsWardrobeModal
        visible={showWardrobeModal}
        onClose={() => setShowWardrobeModal(false)}
      />

      {/* Theme Picker Modal */}
      <ThemePickerModal
        visible={showThemeModal}
        onClose={() => setShowThemeModal(false)}
      />

      {/* Titles & Nameplates Modal */}
      <TitleNameplateModal
        visible={showTitleNameplateModal}
        onClose={() => setShowTitleNameplateModal(false)}
      />

      {/* CinePlayer Customization Modal */}
      <PlayerCustomizationModal
        visible={showPlayerModal}
        onClose={() => setShowPlayerModal(false)}
      />
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileHeaderCard: {
    width: '100%',
    height: 230,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 13, 19, 0.7)',
  },
  profileContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarFrameWrapper: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    position: 'relative',
  },
  particleBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#000000',
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  profileMeta: {
    marginLeft: 12,
    flex: 1,
  },
  nameplateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  equippedTitleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  titleIconText: {
    fontSize: 10,
  },
  equippedTitleText: {
    fontSize: 10,
    fontWeight: '800',
  },
  personalizationHub: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  hubTile: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubTileTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  hubTileSub: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 1,
    fontWeight: '600',
  },
  profileActionBtns: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  wardrobeIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    fontSize: 15,
    fontWeight: '800',
  },
  userHandle: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  communityRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  communityRoleIcon: {
    fontSize: 9,
  },
  communityRoleText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  statusBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusText: {
    fontSize: 11,
    color: theme.colors.accent,
    fontWeight: '500',
  },
  editProfileIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadge: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    marginLeft: 6,
  },
  levelText: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  authedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.success,
  },
  authedBadgeText: {
    color: '#6EE7B7',
    fontSize: 11,
    fontWeight: '700',
  },
  guestBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  guestBadgeText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 18,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: 6,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutBtnText: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  settingSub: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  subPreviewSize: {
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginVertical: 10,
  },
  subPreviewBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  subPreviewText: {
    fontWeight: '700',
  },
  subControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  subBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  clearHistoryBtn: {
    backgroundColor: colors.surface,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  clearHistoryBtnText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: borderRadius['2xl'],
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 14,
    lineHeight: 18,
  },
  tokenInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  authErrorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 6,
  },
  modalActionsRow: {
    flexDirection: 'row',
    marginTop: 18,
    justifyContent: 'flex-end',
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  modalCancelBtnText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: borderRadius.lg,
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
