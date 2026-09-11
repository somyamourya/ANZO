import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../context/SettingsContext';
import { CINE_THEMES } from '../../theme/cineThemes';
import { CineThemeId } from '../../types/cineplayer';
import { borderRadius, shadows, theme } from '../../theme';

interface PlayerCustomizationModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PlayerCustomizationModal: React.FC<PlayerCustomizationModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    playerConfig,
    updatePlayerConfig,
    activeTheme,
    settings,
    updateSubtitleSettings,
  } = useSettings();

  const cineThemesList = Object.values(CINE_THEMES);

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
                <Ionicons name="videocam" size={20} color={activeTheme.colors.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>CinePlayer Customization</Text>
                <Text style={styles.headerSubtitle}>
                  HUD themes, audio boost & scrubber controls
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollList}
          >
            {/* Section 1: CinePlayer HUD Theme */}
            <Text style={styles.sectionHeading}>CINEPLAYER HUD THEME</Text>
            <View style={styles.hudThemesRow}>
              {cineThemesList.map((t) => {
                const isSelected = playerConfig.hudTheme === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => updatePlayerConfig({ hudTheme: t.id })}
                    style={[
                      styles.hudThemeCard,
                      {
                        backgroundColor: t.hudBackground,
                        borderColor: isSelected ? t.accent : 'rgba(255,255,255,0.1)',
                      },
                      isSelected && { borderWidth: 2 },
                    ]}
                  >
                    <View style={styles.themeDotRow}>
                      <View style={[styles.themeDot, { backgroundColor: t.accent }]} />
                      <View
                        style={[
                          styles.themeDot,
                          { backgroundColor: t.accentSecondary },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.hudThemeName,
                        isSelected && { color: t.accent, fontWeight: '800' },
                      ]}
                    >
                      {t.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Section 2: Equalizer Audio Gain Boost */}
            <Text style={styles.sectionHeading}>
              🔊 AUDIO EQUALIZER BOOST ({Math.round(playerConfig.audioEqualizerBoost * 100)}%)
            </Text>
            <View style={styles.boostRow}>
              {[1.0, 1.25, 1.5, 1.75, 2.0].map((boost) => {
                const isSelected = playerConfig.audioEqualizerBoost === boost;
                return (
                  <TouchableOpacity
                    key={boost}
                    style={[
                      styles.boostChip,
                      isSelected && {
                        backgroundColor: activeTheme.colors.primary,
                      },
                    ]}
                    onPress={() => updatePlayerConfig({ audioEqualizerBoost: boost })}
                  >
                    <Text
                      style={[
                        styles.boostChipText,
                        isSelected && { color: '#FFFFFF', fontWeight: '800' },
                      ]}
                    >
                      {Math.round(boost * 100)}%
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Section 3: Scrubber Glow & Precision */}
            <Text style={styles.sectionHeading}>SCRUBBER & TIMELINE</Text>
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingTitle}>Neon Progress Bar Glow</Text>
                  <Text style={styles.settingDesc}>
                    Dynamic radiant lighting on playback scrubber
                  </Text>
                </View>
                <Switch
                  value={playerConfig.progressBarGlow}
                  onValueChange={(val) => updatePlayerConfig({ progressBarGlow: val })}
                  trackColor={{ false: '#334155', true: activeTheme.colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingTitle}>High Precision Scrubbing</Text>
                  <Text style={styles.settingDesc}>
                    Smooth 60fps frame scrubbing preview
                  </Text>
                </View>
                <Switch
                  value={playerConfig.highPrecisionScrubbing}
                  onValueChange={(val) =>
                    updatePlayerConfig({ highPrecisionScrubbing: val })
                  }
                  trackColor={{ false: '#334155', true: activeTheme.colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Section 4: Advanced Subtitle Typography */}
            <Text style={styles.sectionHeading}>SUBTITLE STYLING & SHADOWS</Text>
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingTitle}>Ambient Subtitle Drop Shadow</Text>
                  <Text style={styles.settingDesc}>
                    Enhanced legibility against high-contrast anime action scenes
                  </Text>
                </View>
                <Switch
                  value={playerConfig.subtitleTextShadow}
                  onValueChange={(val) =>
                    updatePlayerConfig({ subtitleTextShadow: val })
                  }
                  trackColor={{ false: '#334155', true: activeTheme.colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.subColorRow}>
                <Text style={styles.settingTitle}>Subtitle Font Color:</Text>
                <View style={styles.colorPalette}>
                  {['#FFFFFF', '#FFE600', '#00F0FF', '#6EE7B7', '#FFAAA6'].map(
                    (col) => (
                      <TouchableOpacity
                        key={col}
                        onPress={() => updateSubtitleSettings({ fontColor: col })}
                        style={[
                          styles.colorCircle,
                          { backgroundColor: col },
                          settings.subtitles.fontColor === col && styles.colorCircleActive,
                        ]}
                      />
                    )
                  )}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.doneBtn,
              { backgroundColor: activeTheme.colors.primary },
              shadows.neon,
            ]}
            onPress={onClose}
          >
            <Text style={styles.doneBtnText}>Save Settings</Text>
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
    marginBottom: 14,
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
    gap: 14,
    paddingBottom: 16,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  hudThemesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hudThemeCard: {
    width: '48%',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  themeDotRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  themeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  hudThemeName: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  boostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 4,
    borderRadius: 12,
  },
  boostChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  boostChipText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  settingCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  subColorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 8,
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  colorCircleActive: {
    borderColor: '#FFFFFF',
    borderWidth: 2.5,
    transform: [{ scale: 1.15 }],
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
