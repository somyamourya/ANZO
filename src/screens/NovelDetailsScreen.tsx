import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { NovelItem, NovelChapter } from '../types/novel';
import {
  resolveNovelDetails,
  resolveNovelChapterText,
  AVAILABLE_NOVEL_SOURCES,
} from '../api/novel/novelResolver';
import { SourceSwitcherModal } from '../components/manga/SourceSwitcherModal';
import { CrossMediaConnections } from '../components/common/CrossMediaConnections';
import { useReadingProgress, ReadingStatus } from '../context/ReadingProgressContext';
import { colors, borderRadius, shadows, theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

interface NovelDetailsScreenProps {
  novelId: string;
  onBack: () => void;
  onReadChapter: (novel: NovelItem, chapter: NovelChapter, text: string) => void;
  onSelectAnime?: (animeId: number) => void;
  onSelectManga?: (mangaId: string) => void;
}

const STATUS_OPTIONS: { label: string; value: ReadingStatus }[] = [
  { label: 'Reading', value: 'READING' },
  { label: 'Plan to Read', value: 'PLAN_TO_READ' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Favorites', value: 'FAVORITE' },
  { label: 'On Hold', value: 'ON_HOLD' },
  { label: 'Dropped', value: 'DROPPED' },
];

export const NovelDetailsScreen: React.FC<NovelDetailsScreenProps> = ({
  novelId,
  onBack,
  onReadChapter,
  onSelectAnime,
  onSelectManga,
}) => {
  const [novel, setNovel] = useState<NovelItem | null>(null);
  const [chapters, setChapters] = useState<NovelChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [activeSource, setActiveSource] = useState('NovelFull');

  const { novelLibrary, setNovelStatus, novelProgress, downloadNovelChapter } =
    useReadingProgress();

  const currentStatus = novel ? novelLibrary[novel.id]?.status : null;
  const progress = novel ? novelProgress[novel.id] : null;

  useEffect(() => {
    loadNovel(activeSource);
  }, [novelId, activeSource]);

  const loadNovel = async (source = 'NovelFull') => {
    try {
      setLoading(true);
      const res = await resolveNovelDetails(novelId, source);
      setNovel(res.novel);
      setChapters(res.chapters);
    } catch (e) {
      console.warn('Failed to load novel details:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !novel) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Light Novel Details...</Text>
      </View>
    );
  }

  const handleStartRead = async (ch: NovelChapter) => {
    const text = await resolveNovelChapterText(novel.id, ch.chapterNumber);
    onReadChapter(novel, ch, text);
  };

  const handleDownloadChapter = async (ch: NovelChapter) => {
    const text = await resolveNovelChapterText(novel.id, ch.chapterNumber);
    await downloadNovelChapter(novel.id, ch.id, ch.chapterNumber, ch.title, text);
    alert(`Downloaded Chapter ${ch.chapterNumber} for offline reading!`);
  };

  const firstChapter = chapters[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Banner */}
      <View style={styles.bannerBox}>
        <Image source={{ uri: novel.coverUrl }} style={styles.bannerImage} />
        <View style={styles.bannerOverlay} />

        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹ Back</Text>
        </TouchableOpacity>
      </View>

      {/* Main Info */}
      <View style={styles.infoCard}>
        <View style={styles.topInfoRow}>
          <Image source={{ uri: novel.coverUrl }} style={styles.poster} />
          <View style={styles.metaCol}>
            <Text numberOfLines={2} style={styles.novelTitle}>
              {novel.title}
            </Text>
            <Text style={styles.authorText}>Author: {novel.author}</Text>
            <View style={styles.badgesRow}>
              <View style={styles.ratingBadge}>
                <Text style={styles.starText}>★</Text>
                <Text style={styles.ratingText}>{novel.rating || 9.5}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{novel.status}</Text>
              </View>
              <TouchableOpacity
                style={styles.sourceBadge}
                onPress={() => setShowSourceModal(true)}
              >
                <Ionicons name="server-outline" size={11} color={theme.colors.accent} />
                <Text style={styles.sourceText}>{activeSource}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              if (firstChapter) handleStartRead(firstChapter);
            }}
            style={[styles.readBtn, shadows.neon]}
          >
            <Text style={styles.readBtnText}>
              {progress
                ? `Resume Chapter ${progress.currentChapterNumber} (${progress.scrollPercentage}%)`
                : '📖 Read Chapter 1'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowStatusModal(!showStatusModal)}
            style={[styles.libraryBtn, currentStatus && styles.libraryBtnActive]}
          >
            <Text style={styles.libraryBtnText}>
              {currentStatus ? `✓ ${currentStatus}` : '+ Library'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status Dropdown */}
        {showStatusModal && (
          <View style={styles.dropdown}>
            {STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  setNovelStatus(novel, opt.value);
                  setShowStatusModal(false);
                }}
                style={[
                  styles.dropdownOption,
                  currentStatus === opt.value && styles.dropdownOptionSelected,
                ]}
              >
                <Text style={styles.dropdownOptionText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Synopsis */}
        <Text style={styles.synopsisHeader}>Synopsis</Text>
        <Text style={styles.synopsisText}>{novel.description}</Text>
      </View>

      {/* Cross-Media Ecosystem (Anime & Manga Adaptations) */}
      <CrossMediaConnections
        currentMediaType="NOVEL"
        currentId={novel.id}
        currentTitle={novel.title}
        onSelectAnime={onSelectAnime}
        onSelectManga={onSelectManga}
        onSelectNovel={() => {}}
      />

      {/* Chapter List */}
      <Text style={styles.chaptersHeader}>
        Chapters ({novel.totalChapters} Total)
      </Text>
      <View style={styles.chapterList}>
        {chapters.map((ch) => {
          const isCurrent = progress?.currentChapterId === ch.id;
          return (
            <TouchableOpacity
              key={ch.id}
              activeOpacity={0.7}
              onPress={() => handleStartRead(ch)}
              style={[
                styles.chapterRow,
                isCurrent && styles.chapterRowActive,
              ]}
            >
              <View style={styles.chapterInfo}>
                <Text
                  style={[
                    styles.chapterTitle,
                    isCurrent && styles.chapterTitleActive,
                  ]}
                >
                  {ch.title}
                </Text>
                <Text style={styles.chapterDate}>{ch.releaseDate || 'Recent'}</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleDownloadChapter(ch)}
                style={styles.downloadBtn}
              >
                <Text style={styles.downloadBtnText}>📥</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </View>

      <SourceSwitcherModal
        visible={showSourceModal}
        sources={AVAILABLE_NOVEL_SOURCES}
        currentSource={activeSource}
        onSelectSource={(source) => {
          setActiveSource(source);
          setShowSourceModal(false);
        }}
        onClose={() => setShowSourceModal(false)}
        type="NOVEL"
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
    paddingBottom: 90,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 12,
  },
  bannerBox: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 13, 19, 0.75)',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 28 : 16,
    left: 16,
    backgroundColor: 'rgba(11, 13, 19, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  infoCard: {
    padding: 16,
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    marginTop: -20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  topInfoRow: {
    flexDirection: 'row',
  },
  poster: {
    width: 95,
    height: 140,
    borderRadius: borderRadius.md,
  },
  metaCol: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  novelTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },
  authorText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginRight: 6,
  },
  starText: {
    color: '#FBBF24',
    fontSize: 11,
    marginRight: 2,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginRight: 6,
  },
  statusText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '700',
  },
  sourceBadge: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  sourceText: {
    color: '#FDA4AF',
    fontSize: 10,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 14,
  },
  readBtn: {
    flex: 1.6,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  readBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  libraryBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  libraryBtnActive: {
    backgroundColor: 'rgba(244, 63, 94, 0.25)',
    borderColor: colors.accent,
  },
  libraryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  dropdown: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 6,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
  },
  dropdownOptionSelected: {
    backgroundColor: 'rgba(244, 63, 94, 0.3)',
  },
  dropdownOptionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  synopsisHeader: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 6,
  },
  synopsisText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  chaptersHeader: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
  },
  chapterList: {
    paddingHorizontal: 16,
  },
  chapterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chapterRowActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  chapterTitleActive: {
    color: '#FDA4AF',
    fontWeight: '700',
  },
  chapterDate: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  downloadBtn: {
    padding: 6,
  },
  downloadBtnText: {
    fontSize: 14,
  },
});
