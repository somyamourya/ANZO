import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGamification } from '../../context/GamificationContext';
import { useSettings } from '../../context/SettingsContext';
import {
  AVATAR_DECORATIONS,
  PROFILE_BACKGROUNDS,
  EQUIPABLE_TITLES,
  NAMEPLATE_EFFECTS,
  APP_THEME_PACKS,
} from '../../api/personalization/personalizationEngine';
import { borderRadius, shadows } from '../../theme';

interface CosmeticsWardrobeModalProps {
  visible: boolean;
  onClose: () => void;
}

type PersonalizationCategory =
  | 'AVATAR_FRAME'
  | 'PROFILE_BANNER'
  | 'HUNTER_TITLE'
  | 'NAMEPLATE'
  | 'APP_THEME';

const CATEGORIES: Array<{ key: PersonalizationCategory; label: string; icon: string }> = [
  { key: 'AVATAR_FRAME', label: 'Frames', icon: 'scan-outline' },
  { key: 'PROFILE_BANNER', label: 'Banners', icon: 'image-outline' },
  { key: 'HUNTER_TITLE', label: 'Titles', icon: 'ribbon-outline' },
  { key: 'NAMEPLATE', label: 'Nameplates', icon: 'sparkles-outline' },
  { key: 'APP_THEME', label: 'Themes', icon: 'color-palette-outline' },
];

export const CosmeticsWardrobeModal: React.FC<CosmeticsWardrobeModalProps> = ({
  visible,
  onClose,
}) => {
  const { levelProgress } = useGamification();
  const {
    activeTheme,
    activeThemeId,
    setAppTheme,
    activeTitleId,
    setTitle,
    activeNameplateId,
    setNameplate,
    activeProfileBannerId,
    setProfileBanner,
    activeAvatarFrameId,
    setAvatarFrame,
  } = useSettings();

  const [selectedCategory, setSelectedCategory] =
    useState<PersonalizationCategory>('AVATAR_FRAME');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { borderColor: activeTheme.colors.border }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.headerIconBox,
                  { backgroundColor: activeTheme.colors.badgeBg },
                ]}
              >
                <Ionicons name="shirt-outline" size={20} color={activeTheme.colors.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Cosmetics & Personalization</Text>
                <Text style={styles.headerSubtitle}>
                  Equip prestige rewards & unlockable cosmetics
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={activeTheme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryTabsContainer}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.tabItem,
                    isSelected && {
                      backgroundColor: activeTheme.colors.primary,
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat.key)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={14}
                    color={isSelected ? '#FFFFFF' : activeTheme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      {
                        color: isSelected
                          ? '#FFFFFF'
                          : activeTheme.colors.textSecondary,
                      },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Content List by Category */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridContent}
          >
            {/* Category 1: Avatar Frames */}
            {selectedCategory === 'AVATAR_FRAME' &&
              AVATAR_DECORATIONS.map((item) => {
                const isEquipped = activeAvatarFrameId === item.id;
                const isLocked =
                  !item.unlocked || levelProgress.currentLevel < item.requiredLevel;

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.cosmeticCard,
                      { borderColor: activeTheme.colors.border },
                      isEquipped && {
                        borderColor: item.borderColor,
                        backgroundColor: 'rgba(255,255,255,0.05)',
                      },
                      isLocked && styles.cosmeticCardLocked,
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <View
                        style={[
                          styles.avatarFramePreview,
                          {
                            borderColor: item.borderColor,
                            shadowColor: item.glowColor,
                          },
                        ]}
                      >
                        <Image
                          source={{
                            uri: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&auto=format&fit=crop&q=80',
                          }}
                          style={styles.innerAvatar}
                        />
                      </View>

                      <View style={styles.itemMeta}>
                        <View style={styles.titleRow}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          {item.particleIcon && (
                            <Text style={{ fontSize: 13, marginLeft: 4 }}>
                              {item.particleIcon}
                            </Text>
                          )}
                        </View>
                        <Text style={styles.itemDesc}>{item.description}</Text>
                        <Text style={styles.rarityLabel}>Rarity: {item.rarity}</Text>
                      </View>
                    </View>

                    {isLocked ? (
                      <View style={styles.lockedBadge}>
                        <Ionicons name="lock-closed" size={12} color="#F59E0B" />
                        <Text style={styles.lockedText}>LVL {item.requiredLevel}</Text>
                      </View>
                    ) : isEquipped ? (
                      <View style={styles.equippedBadge}>
                        <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                        <Text style={styles.equippedText}>Equipped</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.equipBtn, { backgroundColor: item.borderColor }]}
                        onPress={() => setAvatarFrame(item.id)}
                      >
                        <Text style={[styles.equipBtnText, { color: '#000000' }]}>
                          Equip
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}

            {/* Category 2: Profile Banners */}
            {selectedCategory === 'PROFILE_BANNER' &&
              PROFILE_BACKGROUNDS.map((item) => {
                const isEquipped = activeProfileBannerId === item.id;
                const isLocked =
                  !item.unlocked || levelProgress.currentLevel < item.requiredLevel;

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.cosmeticCard,
                      { borderColor: activeTheme.colors.border },
                      isEquipped && {
                        borderColor: item.themeAccent,
                        backgroundColor: 'rgba(255,255,255,0.05)',
                      },
                      isLocked && styles.cosmeticCardLocked,
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <Image
                        source={{ uri: item.bannerUrl }}
                        style={styles.bannerThumb}
                        resizeMode="cover"
                      />

                      <View style={styles.itemMeta}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemDesc}>{item.description}</Text>
                        <Text style={styles.rarityLabel}>Rarity: {item.rarity}</Text>
                      </View>
                    </View>

                    {isLocked ? (
                      <View style={styles.lockedBadge}>
                        <Ionicons name="lock-closed" size={12} color="#F59E0B" />
                        <Text style={styles.lockedText}>LVL {item.requiredLevel}</Text>
                      </View>
                    ) : isEquipped ? (
                      <View style={styles.equippedBadge}>
                        <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                        <Text style={styles.equippedText}>Equipped</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.equipBtn, { backgroundColor: item.themeAccent }]}
                        onPress={() => setProfileBanner(item.id)}
                      >
                        <Text style={[styles.equipBtnText, { color: '#000000' }]}>
                          Equip
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}

            {/* Category 3: Hunter & Lore Titles */}
            {selectedCategory === 'HUNTER_TITLE' &&
              EQUIPABLE_TITLES.map((item) => {
                const isEquipped = activeTitleId === item.id;
                const isLocked =
                  !item.unlocked || levelProgress.currentLevel < item.requiredLevel;

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.cosmeticCard,
                      { borderColor: activeTheme.colors.border },
                      isEquipped && {
                        borderColor: item.color,
                        backgroundColor: 'rgba(255,255,255,0.05)',
                      },
                      isLocked && styles.cosmeticCardLocked,
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={styles.titleIconLarge}>{item.icon}</Text>
                      <View style={styles.itemMeta}>
                        <Text style={[styles.itemName, { color: item.color }]}>
                          {item.title}
                        </Text>
                        <Text style={styles.itemDesc}>{item.lore}</Text>
                      </View>
                    </View>

                    {isLocked ? (
                      <View style={styles.lockedBadge}>
                        <Ionicons name="lock-closed" size={12} color="#F59E0B" />
                        <Text style={styles.lockedText}>LVL {item.requiredLevel}</Text>
                      </View>
                    ) : isEquipped ? (
                      <View style={styles.equippedBadge}>
                        <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                        <Text style={styles.equippedText}>Equipped</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.equipBtn, { backgroundColor: item.color }]}
                        onPress={() => setTitle(item.id)}
                      >
                        <Text style={[styles.equipBtnText, { color: '#000000' }]}>
                          Equip
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}

            {/* Category 4: Animated Nameplates */}
            {selectedCategory === 'NAMEPLATE' &&
              NAMEPLATE_EFFECTS.map((item) => {
                const isEquipped = activeNameplateId === item.id;
                const isLocked =
                  !item.unlocked || levelProgress.currentLevel < item.requiredLevel;

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.cosmeticCard,
                      { borderColor: activeTheme.colors.border },
                      isEquipped && {
                        borderColor: item.borderGlow,
                        backgroundColor: 'rgba(255,255,255,0.05)',
                      },
                      isLocked && styles.cosmeticCardLocked,
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={styles.titleIconLarge}>{item.icon}</Text>
                      <View style={styles.itemMeta}>
                        <Text style={[styles.itemName, { color: item.textColor }]}>
                          {item.name}
                        </Text>
                        <Text style={styles.itemDesc}>{item.description}</Text>
                      </View>
                    </View>

                    {isLocked ? (
                      <View style={styles.lockedBadge}>
                        <Ionicons name="lock-closed" size={12} color="#F59E0B" />
                        <Text style={styles.lockedText}>LVL {item.requiredLevel}</Text>
                      </View>
                    ) : isEquipped ? (
                      <View style={styles.equippedBadge}>
                        <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                        <Text style={styles.equippedText}>Equipped</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.equipBtn, { backgroundColor: item.borderGlow }]}
                        onPress={() => setNameplate(item.id)}
                      >
                        <Text style={[styles.equipBtnText, { color: '#000000' }]}>
                          Equip
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}

            {/* Category 5: App Theme Packs */}
            {selectedCategory === 'APP_THEME' &&
              Object.values(APP_THEME_PACKS).map((item) => {
                const isEquipped = activeThemeId === item.id;
                const isLocked =
                  !item.unlocked || levelProgress.currentLevel < item.requiredLevel;

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.cosmeticCard,
                      { borderColor: activeTheme.colors.border },
                      isEquipped && {
                        borderColor: item.colors.primary,
                        backgroundColor: 'rgba(255,255,255,0.05)',
                      },
                      isLocked && styles.cosmeticCardLocked,
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <View
                        style={[
                          styles.themeSwatchPreview,
                          { backgroundColor: item.colors.primary },
                        ]}
                      >
                        <Ionicons name={item.icon as any} size={18} color="#000000" />
                      </View>
                      <View style={styles.itemMeta}>
                        <Text
                          style={[styles.itemName, { color: item.colors.textPrimary }]}
                        >
                          {item.name}
                        </Text>
                        <Text style={styles.itemDesc}>{item.tagline}</Text>
                      </View>
                    </View>

                    {isLocked ? (
                      <View style={styles.lockedBadge}>
                        <Ionicons name="lock-closed" size={12} color="#F59E0B" />
                        <Text style={styles.lockedText}>LVL {item.requiredLevel}</Text>
                      </View>
                    ) : isEquipped ? (
                      <View style={styles.equippedBadge}>
                        <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                        <Text style={styles.equippedText}>Active</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.equipBtn,
                          { backgroundColor: item.colors.primary },
                        ]}
                        onPress={() => setAppTheme(item.id)}
                      >
                        <Text style={[styles.equipBtnText, { color: '#000000' }]}>
                          Apply
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    backgroundColor: '#0E111A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTabsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 6,
    marginBottom: 10,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  gridContent: {
    gap: 10,
    paddingBottom: 30,
  },
  cosmeticCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cosmeticCardLocked: {
    opacity: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarFramePreview: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  innerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  bannerThumb: {
    width: 60,
    height: 40,
    borderRadius: 8,
  },
  themeSwatchPreview: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleIconLarge: {
    fontSize: 24,
  },
  itemMeta: {
    flex: 1,
    marginLeft: 4,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  itemDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  rarityLabel: {
    fontSize: 9,
    color: '#CBD5E1',
    fontWeight: '700',
    marginTop: 2,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  lockedText: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '700',
  },
  equippedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  equippedText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '800',
  },
  equipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  equipBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
});

