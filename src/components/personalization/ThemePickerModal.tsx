import React from 'react';
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
import { APP_THEME_PACKS } from '../../api/personalization/personalizationEngine';
import { AppThemeId, AppThemePack } from '../../types/personalization';
import { borderRadius, shadows, theme } from '../../theme';

interface ThemePickerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ThemePickerModal: React.FC<ThemePickerModalProps> = ({ visible, onClose }) => {
  const { activeThemeId, setAppTheme, activeTheme } = useSettings();
  const { levelProgress } = useGamification();

  const allThemes: AppThemePack[] = Object.values(APP_THEME_PACKS);

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
                <Ionicons name="color-palette" size={20} color={activeTheme.colors.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>App Theme Packs</Text>
                <Text style={styles.headerSubtitle}>Customize palette across the entire app</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Themes Grid */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollList}
          >
            {allThemes.map((t) => {
              const isSelected = activeThemeId === t.id;
              const isLocked = !t.unlocked || levelProgress.currentLevel < t.requiredLevel;

              return (
                <TouchableOpacity
                  key={t.id}
                  activeOpacity={0.85}
                  disabled={isLocked}
                  onPress={() => setAppTheme(t.id)}
                  style={[
                    styles.themeCard,
                    {
                      backgroundColor: t.colors.card,
                      borderColor: isSelected ? t.colors.primary : t.colors.border,
                    },
                    isSelected && styles.themeCardSelected,
                    isLocked && styles.themeCardLocked,
                  ]}
                >
                  <View style={styles.themeCardTop}>
                    <View style={styles.themeTitleRow}>
                      <Ionicons
                        name={t.icon as any}
                        size={18}
                        color={t.colors.primary}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={[styles.themeName, { color: t.colors.textPrimary }]}>
                        {t.name}
                      </Text>
                      {isSelected && (
                        <View
                          style={[
                            styles.activeBadge,
                            { backgroundColor: t.colors.badgeBg, borderColor: t.colors.primary },
                          ]}
                        >
                          <Text style={[styles.activeBadgeText, { color: t.colors.primary }]}>
                            ACTIVE
                          </Text>
                        </View>
                      )}
                    </View>

                    {isLocked && (
                      <View style={styles.lockBadge}>
                        <Ionicons name="lock-closed" size={12} color="#F59E0B" />
                        <Text style={styles.lockText}>
                          LVL {t.requiredLevel} ({t.requiredRank?.replace('_', ' ')})
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={[styles.themeTagline, { color: t.colors.textSecondary }]}>
                    {t.tagline}
                  </Text>

                  {/* Swatch Previews */}
                  <View style={styles.swatchRow}>
                    <View style={[styles.swatch, { backgroundColor: t.colors.background }]}>
                      <Text style={styles.swatchLabel}>BG</Text>
                    </View>
                    <View style={[styles.swatch, { backgroundColor: t.colors.surface }]}>
                      <Text style={styles.swatchLabel}>SURF</Text>
                    </View>
                    <View style={[styles.swatch, { backgroundColor: t.colors.primary }]}>
                      <Text style={[styles.swatchLabel, { color: '#000' }]}>PRI</Text>
                    </View>
                    <View style={[styles.swatch, { backgroundColor: t.colors.secondary }]}>
                      <Text style={[styles.swatchLabel, { color: '#000' }]}>SEC</Text>
                    </View>
                    <View style={[styles.swatch, { backgroundColor: t.colors.accent }]}>
                      <Text style={[styles.swatchLabel, { color: '#FFF' }]}>ACC</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Done Button */}
          <TouchableOpacity
            style={[
              styles.doneBtn,
              { backgroundColor: activeTheme.colors.primary },
              shadows.neon,
            ]}
            onPress={onClose}
          >
            <Text style={styles.doneBtnText}>Apply & Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.82)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
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
    marginBottom: 16,
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
  scrollList: {
    gap: 12,
    paddingBottom: 16,
  },
  themeCard: {
    borderRadius: borderRadius.xl,
    padding: 14,
    borderWidth: 1.5,
  },
  themeCardSelected: {
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  themeCardLocked: {
    opacity: 0.5,
  },
  themeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  themeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeName: {
    fontSize: 15,
    fontWeight: '800',
  },
  activeBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  activeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  lockText: {
    fontSize: 10,
    color: '#F59E0B',
    fontWeight: '700',
  },
  themeTagline: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 6,
  },
  swatch: {
    flex: 1,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  swatchLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  doneBtn: {
    paddingVertical: 14,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginTop: 8,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
