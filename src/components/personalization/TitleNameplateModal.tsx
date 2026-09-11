import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../context/SettingsContext';
import { useGamification } from '../../context/GamificationContext';
import {
  EQUIPABLE_TITLES,
  NAMEPLATE_EFFECTS,
} from '../../api/personalization/personalizationEngine';
import { EquipableTitle, NameplateEffect } from '../../types/personalization';
import { borderRadius, shadows, theme } from '../../theme';

interface TitleNameplateModalProps {
  visible: boolean;
  onClose: () => void;
}

export const TitleNameplateModal: React.FC<TitleNameplateModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    activeTitleId,
    setTitle,
    activeTitle,
    activeNameplateId,
    setNameplate,
    activeNameplate,
    activeTheme,
  } = useSettings();
  const { levelProgress } = useGamification();

  const [activeTab, setActiveTab] = useState<'titles' | 'nameplates'>('titles');

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
                <Ionicons name="ribbon" size={20} color={activeTheme.colors.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Titles & Nameplates</Text>
                <Text style={styles.headerSubtitle}>
                  Equip prestigious hunter titles and animated nameplates
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabSwitchRow}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'titles' && {
                  backgroundColor: activeTheme.colors.primary,
                },
              ]}
              onPress={() => setActiveTab('titles')}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'titles' && styles.tabBtnTextActive,
                ]}
              >
                🎖️ Equipable Titles ({EQUIPABLE_TITLES.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'nameplates' && {
                  backgroundColor: activeTheme.colors.primary,
                },
              ]}
              onPress={() => setActiveTab('nameplates')}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'nameplates' && styles.tabBtnTextActive,
                ]}
              >
                ✨ Nameplates ({NAMEPLATE_EFFECTS.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Live Equiped Preview Card */}
          <View style={styles.previewCard}>
            <Text style={styles.previewCardLabel}>CURRENTLY EQUIPPED PREVIEW</Text>
            <View
              style={[
                styles.nameplateBox,
                {
                  borderColor: activeNameplate.borderGlow,
                  backgroundColor: activeNameplate.bgGradient[0],
                },
              ]}
            >
              <Text style={styles.nameplateIcon}>{activeNameplate.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.nameplateName,
                    { color: activeNameplate.textColor },
                  ]}
                >
                  Sung Jinwoo
                </Text>
                <View style={styles.titleBadgeRow}>
                  <Text style={styles.titleBadgeIcon}>{activeTitle.icon}</Text>
                  <Text style={[styles.titleBadgeText, { color: activeTitle.color }]}>
                    {activeTitle.title}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Tab 1: Titles List */}
          {activeTab === 'titles' ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollList}
            >
              {EQUIPABLE_TITLES.map((item: EquipableTitle) => {
                const isEquipped = activeTitleId === item.id;
                const isLocked =
                  !item.unlocked || levelProgress.currentLevel < item.requiredLevel;

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.itemCard,
                      isEquipped && {
                        borderColor: item.color,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      },
                      isLocked && styles.itemCardLocked,
                    ]}
                  >
                    <View style={styles.itemHeader}>
                      <View style={styles.itemTitleRow}>
                        <Text style={styles.titleIcon}>{item.icon}</Text>
                        <View>
                          <Text style={[styles.itemTitle, { color: item.color }]}>
                            {item.title}
                          </Text>
                          <Text style={styles.itemLore}>{item.lore}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.itemFooterRow}>
                      <View style={styles.rarityBadge}>
                        <Text style={styles.rarityText}>{item.rarity}</Text>
                      </View>

                      {isLocked ? (
                        <View style={styles.lockBadge}>
                          <Ionicons name="lock-closed" size={12} color="#F59E0B" />
                          <Text style={styles.lockText}>
                            LVL {item.requiredLevel}{' '}
                            {item.requiredRank ? `(${item.requiredRank.replace('_', ' ')})` : ''}
                          </Text>
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
                          <Text style={styles.equipBtnText}>Equip Title</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            /* Tab 2: Nameplates List */
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollList}
            >
              {NAMEPLATE_EFFECTS.map((item: NameplateEffect) => {
                const isEquipped = activeNameplateId === item.id;
                const isLocked =
                  !item.unlocked || levelProgress.currentLevel < item.requiredLevel;

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.itemCard,
                      isEquipped && {
                        borderColor: item.borderGlow,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      },
                      isLocked && styles.itemCardLocked,
                    ]}
                  >
                    <View
                      style={[
                        styles.nameplatePreview,
                        {
                          borderColor: item.borderGlow,
                          backgroundColor: item.bgGradient[0],
                        },
                      ]}
                    >
                      <Text style={styles.nameplateIcon}>{item.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.nameplateTitle, { color: item.textColor }]}>
                          {item.name}
                        </Text>
                        <Text style={styles.nameplateDesc}>{item.description}</Text>
                      </View>
                    </View>

                    <View style={styles.itemFooterRow}>
                      <View style={styles.rarityBadge}>
                        <Text style={styles.rarityText}>{item.rarity}</Text>
                      </View>

                      {isLocked ? (
                        <View style={styles.lockBadge}>
                          <Ionicons name="lock-closed" size={12} color="#F59E0B" />
                          <Text style={styles.lockText}>
                            LVL {item.requiredLevel}{' '}
                            {item.requiredRank ? `(${item.requiredRank.replace('_', ' ')})` : ''}
                          </Text>
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
                            Equip Plate
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* Close Action */}
          <TouchableOpacity
            style={[
              styles.doneBtn,
              { backgroundColor: activeTheme.colors.primary },
              shadows.neon,
            ]}
            onPress={onClose}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
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
    height: '82%',
    backgroundColor: '#0E111A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
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
  tabSwitchRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  previewCard: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  previewCardLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  nameplateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 10,
  },
  nameplateIcon: {
    fontSize: 20,
  },
  nameplateName: {
    fontSize: 14,
    fontWeight: '800',
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  titleBadgeIcon: {
    fontSize: 11,
  },
  titleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scrollList: {
    gap: 10,
    paddingBottom: 16,
  },
  itemCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: borderRadius.xl,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  itemCardLocked: {
    opacity: 0.5,
  },
  itemHeader: {
    marginBottom: 8,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleIcon: {
    fontSize: 22,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  itemLore: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 15,
  },
  nameplatePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 10,
    marginBottom: 8,
  },
  nameplateTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  nameplateDesc: {
    fontSize: 10,
    color: '#CBD5E1',
    marginTop: 2,
  },
  itemFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rarityBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rarityText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lockText: {
    fontSize: 10,
    color: '#F59E0B',
    fontWeight: '700',
  },
  equippedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  equippedText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '800',
  },
  equipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  equipBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  doneBtn: {
    paddingVertical: 12,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginTop: 6,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
