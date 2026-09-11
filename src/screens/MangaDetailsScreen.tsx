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
import { MangaItem, MangaVolume, MangaChapter } from '../types/manga';
import {
  resolveMangaFullDetails,
  resolveMangaChapterPages,
  AVAILABLE_MANGA_SOURCES,
} from '../api/manga/mangaResolver';
import { VolumeChapterList } from '../components/manga/VolumeChapterList';
import { SourceSwitcherModal } from '../components/manga/SourceSwitcherModal';
import { BulkDownloadModal } from '../components/manga/BulkDownloadModal';
import { CrossMediaConnections } from '../components/common/CrossMediaConnections';
import { useReadingProgress, ReadingStatus } from '../context/ReadingProgressContext';
import { colors, borderRadius, shadows, theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

interface MangaDetailsScreenProps {
  mangaId: string;
  onBack: () => void;
  onReadChapter: (manga: MangaItem, chapter: MangaChapter) => void;
  onSelectAnime?: (animeId: number) => void;
  onSelectNovel?: (novelId: string) => void;
}

const STATUS_LIST: { label: string; value: ReadingStatus }[] = [
  { label: 'Reading', value: 'READING' },
  { label: 'Plan to Read', value: 'PLAN_TO_READ' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Favorites', value: 'FAVORITE' },
  { label: 'On Hold', value: 'ON_HOLD' },
  { label: 'Dropped', value: 'DROPPED' },
];

export const MangaDetailsScreen: React.FC<MangaDetailsScreenProps> = ({
  mangaId,
  onBack,
  onReadChapter,
  onSelectAnime,
  onSelectNovel,
}) => {
  const [manga, setManga] = useState<MangaItem | null>(null);
  const [volumes, setVolumes] = useState<MangaVolume[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [showBulkDownloadModal, setShowBulkDownloadModal] = useState(false);
  const [activeSource, setActiveSource] = useState('MangaDex');

  const { mangaLibrary, setMangaStatus, mangaProgress, downloadMangaChapter } =
    useReadingProgress();

  const currentStatus = manga ? mangaLibrary[manga.id]?.status : null;
  const progress = manga ? mangaProgress[manga.id] : null;

  useEffect(() => {
    loadManga(activeSource);
  }, [mangaId, activeSource]);

  const loadManga = async (source = 'MangaDex') => {
    try {
      setLoading(true);
      const res = await resolveMangaFullDetails(mangaId, source);
      setManga(res.manga);
      setVolumes(res.volumes);
    } catch (e) {
      console.warn('Failed to load manga details:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !manga) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Volume-Aware Manga Structure...</Text>
      </View>
    );
  }

  const firstChapter = volumes[0]?.chapters[0];

  const handleDownload = async (chapter: MangaChapter) => {
    const pages = await resolveMangaChapterPages(chapter.id);
    await downloadMangaChapter(manga.id, manga.title, chapter.id, chapter.chapter, pages);
    alert(`Downloaded Chapter ${chapter.chapter} (${pages.length} pages) for offline reading!`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header Banner & Poster */}
      <View style={styles.bannerBox}>
        <Image source={{ uri: manga.coverUrl }} style={styles.bannerImage} />
        <View style={styles.bannerOverlay} />

        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹ Back</Text>
        </TouchableOpacity>
      </View>

      {/* Main Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.topInfoRow}>
          <Image source={{ uri: manga.coverUrl }} style={styles.poster} />
          <View style={styles.metaCol}>
            <Text numberOfLines={2} style={styles.mangaTitle}>
              {manga.title}
            </Text>
            <Text style={styles.authorText}>By {manga.author}</Text>
            <View style={styles.badgesRow}>
              <View style={styles.ratingBadge}>
                <Text style={styles.starText}>★</Text>
                <Text style={styles.ratingText}>{manga.rating || 9.0}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{manga.status}</Text>
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
              if (firstChapter) onReadChapter(manga, firstChapter);
            }}
            style={[styles.readBtn, shadows.neon]}
          >
            <Text style={styles.readBtnText}>
              {progress
                ? `Resume Ch ${progress.currentChapterNumber} (p.${progress.currentPageNumber})`
                : '📖 Start Reading'}
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

        {/* Secondary Actions: Bulk Download & Source Switcher */}
        <View style={styles.secondaryActionsRow}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => setShowBulkDownloadModal(true)}
          >
            <Ionicons name="cloud-download-outline" size={15} color={theme.colors.accent} />
            <Text style={styles.secondaryBtnText}>Bulk Download</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => setShowSourceModal(true)}
          >
            <Ionicons name="swap-horizontal-outline" size={15} color={theme.colors.textSecondary} />
            <Text style={[styles.secondaryBtnText, { color: theme.colors.textSecondary }]}>
              Switch Source
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status Dropdown */}
        {showStatusModal && (
          <View style={styles.dropdown}>
            {STATUS_LIST.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  setMangaStatus(manga, opt.value);
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
        <Text style={styles.synopsisText}>{manga.description}</Text>
      </View>

      {/* Cross-Media Ecosystem (Anime Adaptations & Light Novel Sources) */}
      <CrossMediaConnections
        currentMediaType="MANGA"
        currentId={manga.id}
        currentTitle={manga.title}
        onSelectAnime={onSelectAnime}
        onSelectManga={() => {}}
        onSelectNovel={onSelectNovel}
      />

      {/* Volume Chapters Accordion Section */}
      <Text style={styles.chaptersHeader}>Volume & Chapter Tree</Text>
      <VolumeChapterList
        volumes={volumes}
        manga={manga}
        currentChapterId={progress?.currentChapterId}
        onSelectChapter={(ch) => onReadChapter(manga, ch)}
        onDownloadChapter={handleDownload}
      />

      {/* Source Switcher Modal */}
      <SourceSwitcherModal
        visible={showSourceModal}
        onClose={() => setShowSourceModal(false)}
        sources={AVAILABLE_MANGA_SOURCES}
        currentSource={activeSource}
        onSelectSource={(src) => setActiveSource(src)}
        type="MANGA"
      />

      {/* Bulk Download Modal */}
      <BulkDownloadModal
        visible={showBulkDownloadModal}
        onClose={() => setShowBulkDownloadModal(false)}
        volumes={volumes}
        mangaTitle={manga.title}
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
  mangaTitle: {
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
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  sourceText: {
    color: '#67E8F9',
    fontSize: 10,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 14,
  },
  readBtn: {
    flex: 1.6,
    backgroundColor: colors.primary,
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
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    borderColor: colors.primary,
  },
  libraryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 9,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  secondaryBtnText: {
    color: theme.colors.accent,
    fontSize: 12,
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
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
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
    marginBottom: 6,
  },
});
