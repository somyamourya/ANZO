import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import {
  NovelItem,
  NovelChapter,
  NovelReaderThemeId,
  NovelFontFamily,
} from '../../types/novel';
import { useReadingProgress } from '../../context/ReadingProgressContext';
import { TTSAudioBar } from './TTSAudioBar';
import { borderRadius, shadows } from '../../theme';

interface NovelReaderProps {
  novel: NovelItem;
  chapter: NovelChapter;
  chapterText: string;
  onClose: () => void;
  onNextChapter?: () => void;
  onPreviousChapter?: () => void;
}

const THEME_STYLES: Record<
  NovelReaderThemeId,
  { bg: string; text: string; subText: string; hudBg: string; border: string }
> = {
  oled: {
    bg: '#000000',
    text: '#E4E4E7',
    subText: '#A1A1AA',
    hudBg: 'rgba(18, 21, 31, 0.95)',
    border: 'rgba(255, 255, 255, 0.1)',
  },
  sepia: {
    bg: '#FBF0D9',
    text: '#5F4B32',
    subText: '#8C7355',
    hudBg: '#EFE2C7',
    border: '#DCC8A5',
  },
  parchment: {
    bg: '#F4ECD8',
    text: '#3C2F1F',
    subText: '#6A563D',
    hudBg: '#E8DCBF',
    border: '#D3C29F',
  },
  solarized: {
    bg: '#002B36',
    text: '#93A1A1',
    subText: '#586E75',
    hudBg: 'rgba(7, 54, 66, 0.95)',
    border: '#268BD2',
  },
  cream: {
    bg: '#FAF8F5',
    text: '#27272A',
    subText: '#71717A',
    hudBg: '#FFFFFF',
    border: '#E4E4E7',
  },
  dark: {
    bg: '#0B0D13',
    text: '#F4F4F5',
    subText: '#94A3B8',
    hudBg: 'rgba(26, 30, 45, 0.95)',
    border: '#1E293B',
  },
  dracula: {
    bg: '#1E1F29',
    text: '#F8F8F2',
    subText: '#6272A4',
    hudBg: 'rgba(40, 42, 54, 0.95)',
    border: '#BD93F9',
  },
  cyberpunk: {
    bg: '#050A0E',
    text: '#00F0FF',
    subText: '#00838F',
    hudBg: 'rgba(11, 19, 43, 0.95)',
    border: '#00F0FF44',
  },
  forest: {
    bg: '#0D1A14',
    text: '#D1FAE5',
    subText: '#6EE7B7',
    hudBg: 'rgba(6, 32, 22, 0.95)',
    border: '#065F46',
  },
};

export const NovelReader: React.FC<NovelReaderProps> = ({
  novel,
  chapter,
  chapterText,
  onClose,
  onNextChapter,
  onPreviousChapter,
}) => {
  const { novelSettings, updateNovelSettings, updateNovelProgress } =
    useReadingProgress();

  const [showHUD, setShowHUD] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showTTS, setShowTTS] = useState(false);

  const themeConfig = THEME_STYLES[novelSettings.theme] || THEME_STYLES.oled;

  const toggleHUD = () => {
    setShowHUD(!showHUD);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeConfig.bg }]}>
      {/* Main Reading Canvas */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={(e) => {
          const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
          const scrollPct =
            contentSize.height > layoutMeasurement.height
              ? (contentOffset.y /
                  (contentSize.height - layoutMeasurement.height)) *
                100
              : 0;
          updateNovelProgress(novel, chapter.id, chapter.chapterNumber, scrollPct);
        }}
        scrollEventThrottle={32}
      >
        <TouchableOpacity activeOpacity={1} onPress={toggleHUD}>
          {/* Chapter Title */}
          <Text
            style={[
              styles.chapterHeader,
              {
                color: themeConfig.text,
                fontSize: novelSettings.fontSize + 6,
                lineHeight: (novelSettings.fontSize + 6) * 1.3,
              },
            ]}
          >
            {chapter.title}
          </Text>

          <Text
            style={[
              styles.novelMetaSub,
              { color: themeConfig.subText, marginBottom: novelSettings.paragraphSpacing * 1.5 },
            ]}
          >
            {novel.title} • By {novel.author}
          </Text>

          {/* Chapter Body Text */}
          <Text
            style={[
              styles.bodyText,
              {
                color: themeConfig.text,
                fontSize: novelSettings.fontSize,
                lineHeight: novelSettings.fontSize * novelSettings.lineHeight,
                textAlign: novelSettings.textAlignment,
                fontFamily:
                  novelSettings.fontFamily === 'Merriweather'
                    ? 'Georgia'
                    : novelSettings.fontFamily === 'Monospace'
                    ? 'monospace'
                    : 'System',
              },
            ]}
          >
            {chapterText}
          </Text>

          {/* End of Chapter Footer */}
          <View style={styles.footerRow}>
            {onPreviousChapter && (
              <TouchableOpacity
                onPress={onPreviousChapter}
                style={[styles.footerBtn, { backgroundColor: themeConfig.hudBg, borderColor: themeConfig.border }]}
              >
                <Text style={[styles.footerBtnText, { color: themeConfig.text }]}>
                  ‹ Previous Chapter
                </Text>
              </TouchableOpacity>
            )}

            {onNextChapter && (
              <TouchableOpacity
                onPress={onNextChapter}
                style={[styles.footerBtnPrimary, shadows.neon]}
              >
                <Text style={styles.footerBtnPrimaryText}>
                  Next Chapter ›
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* TTS Narration Bar */}
      {showTTS && (
        <TTSAudioBar
          textToSpeak={chapterText}
          chapterTitle={chapter.title}
          onClose={() => setShowTTS(false)}
        />
      )}

      {/* Reading HUD Overlay */}
      {showHUD && (
        <View style={styles.hudOverlay}>
          {/* Top Bar */}
          <View
            style={[
              styles.topBar,
              {
                backgroundColor: themeConfig.hudBg,
                borderColor: themeConfig.border,
              },
            ]}
          >
            <TouchableOpacity onPress={onClose} style={styles.topBackBtn}>
              <Text style={[styles.topBackText, { color: themeConfig.text }]}>
                ‹ Back
              </Text>
            </TouchableOpacity>

            <View style={styles.topTitleCol}>
              <Text
                numberOfLines={1}
                style={[styles.topNovelTitle, { color: themeConfig.text }]}
              >
                {novel.title}
              </Text>
              <Text
                style={[styles.topChapterTitle, { color: themeConfig.subText }]}
              >
                Chapter {chapter.chapterNumber}
              </Text>
            </View>

            <View style={styles.topActionGroup}>
              <TouchableOpacity
                onPress={() => setShowTTS(!showTTS)}
                style={styles.iconBtn}
              >
                <Text style={styles.iconText}>🎧 TTS</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowSettingsModal(true)}
                style={styles.iconBtn}
              >
                <Text style={styles.iconText}>Aa</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Bar */}
          <View
            style={[
              styles.bottomBar,
              {
                backgroundColor: themeConfig.hudBg,
                borderColor: themeConfig.border,
              },
            ]}
          >
            <View style={styles.bottomButtonsRow}>
              {onPreviousChapter && (
                <TouchableOpacity
                  onPress={onPreviousChapter}
                  style={styles.bottomNavBtn}
                >
                  <Text
                    style={[styles.bottomNavText, { color: themeConfig.text }]}
                  >
                    ⏮ Prev
                  </Text>
                </TouchableOpacity>
              )}

              <Text
                style={[styles.bottomChapterLabel, { color: themeConfig.subText }]}
              >
                Chapter {chapter.chapterNumber} / {novel.totalChapters}
              </Text>

              {onNextChapter && (
                <TouchableOpacity
                  onPress={onNextChapter}
                  style={styles.bottomNavBtn}
                >
                  <Text
                    style={[styles.bottomNavText, { color: themeConfig.text }]}
                  >
                    Next ⏭
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Typography & Theme Settings Modal */}
      <Modal
        visible={showSettingsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novel Reader Typography</Text>

            {/* Reading Theme Palette */}
            <Text style={styles.settingLabel}>Reader Color Theme</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themeChipsRow}>
              {(
                [
                  'oled',
                  'sepia',
                  'parchment',
                  'solarized',
                  'cream',
                  'dark',
                  'dracula',
                  'cyberpunk',
                  'forest',
                ] as NovelReaderThemeId[]
              ).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => updateNovelSettings({ theme: t })}
                  style={[
                    styles.themeChip,
                    { backgroundColor: THEME_STYLES[t].bg },
                    novelSettings.theme === t && styles.themeChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.themeChipText,
                      { color: THEME_STYLES[t].text },
                    ]}
                  >
                    {t.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Font Size Selector */}
            <Text style={styles.settingLabel}>
              Font Size: {novelSettings.fontSize}px
            </Text>
            <View style={styles.fontSizeRow}>
              <TouchableOpacity
                onPress={() =>
                  updateNovelSettings({
                    fontSize: Math.max(14, novelSettings.fontSize - 2),
                  })
                }
                style={styles.fontBtn}
              >
                <Text style={styles.fontBtnText}>A- Smaller</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  updateNovelSettings({
                    fontSize: Math.min(32, novelSettings.fontSize + 2),
                  })
                }
                style={styles.fontBtn}
              >
                <Text style={styles.fontBtnText}>A+ Larger</Text>
              </TouchableOpacity>
            </View>

            {/* Line Height Selector */}
            <Text style={styles.settingLabel}>
              Line Spacing: {novelSettings.lineHeight.toFixed(1)}x
            </Text>
            <View style={styles.fontSizeRow}>
              <TouchableOpacity
                onPress={() =>
                  updateNovelSettings({
                    lineHeight: Math.max(1.2, novelSettings.lineHeight - 0.2),
                  })
                }
                style={styles.fontBtn}
              >
                <Text style={styles.fontBtnText}>Compact</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  updateNovelSettings({
                    lineHeight: Math.min(2.4, novelSettings.lineHeight + 0.2),
                  })
                }
                style={styles.fontBtn}
              >
                <Text style={styles.fontBtnText}>Relaxed</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setShowSettingsModal(false)}
              style={styles.modalDoneBtn}
            >
              <Text style={styles.modalDoneBtnText}>Save & Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 85,
    paddingBottom: 110,
  },
  chapterHeader: {
    fontWeight: '800',
    marginBottom: 6,
  },
  novelMetaSub: {
    fontSize: 12,
    fontWeight: '600',
  },
  bodyText: {
    letterSpacing: 0.2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 20,
  },
  footerBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  footerBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  footerBtnPrimary: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: borderRadius.lg,
  },
  footerBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  hudOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 16,
    pointerEvents: 'box-none',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 24 : 8,
    padding: 12,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  topBackBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  topBackText: {
    fontSize: 14,
    fontWeight: '700',
  },
  topTitleCol: {
    flex: 1,
    marginHorizontal: 8,
  },
  topNovelTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  topChapterTitle: {
    fontSize: 11,
    marginTop: 1,
  },
  topActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    marginLeft: 6,
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomBar: {
    padding: 12,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: Platform.OS === 'android' ? 16 : 8,
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomNavBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bottomNavText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bottomChapterLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#12151F',
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  settingLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
  },
  themeChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#334155',
  },
  themeChipActive: {
    borderColor: '#8B5CF6',
    borderWidth: 2,
  },
  themeChipText: {
    fontSize: 11,
    fontWeight: '800',
  },
  fontSizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fontBtn: {
    flex: 1,
    backgroundColor: '#1A1E2D',
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  fontBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  modalDoneBtn: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginTop: 20,
  },
  modalDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
