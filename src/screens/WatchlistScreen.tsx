import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  Image,
} from 'react-native';
import { useWatchProgress } from '../context/WatchProgressContext';
import { useReadingProgress } from '../context/ReadingProgressContext';
import { calculateStorageUsage, StorageBreakdown } from '../utils/offlineStorageEngine';
import { MediaType } from '../types/crossMedia';
import { theme, borderRadius, shadows } from '../theme';
import { Ionicons } from '@expo/vector-icons';

export interface UnifiedLibraryItem {
  id: string | number;
  mediaType: MediaType;
  title: string;
  coverUrl: string;
  status: string;
  rating?: number;
  progressLabel: string;
  updatedAt: number;
}

type LibraryFilterType = 'ALL' | 'ANIME' | 'MANGA' | 'NOVEL';
type StatusFilterType = 'ALL' | 'IN_PROGRESS' | 'PLANNING' | 'COMPLETED' | 'FAVORITE' | 'ON_HOLD' | 'DROPPED';

const STATUS_TABS: { label: string; value: StatusFilterType }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Plan to Exp', value: 'PLANNING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Favorites', value: 'FAVORITE' },
  { label: 'On Hold', value: 'ON_HOLD' },
  { label: 'Dropped', value: 'DROPPED' },
];

interface WatchlistScreenProps {
  onSelectAnime: (animeId: number) => void;
  onSelectManga?: (mangaId: string) => void;
  onSelectNovel?: (novelId: string) => void;
}

export const WatchlistScreen: React.FC<WatchlistScreenProps> = ({
  onSelectAnime,
  onSelectManga,
  onSelectNovel,
}) => {
  const { watchlist, progressList } = useWatchProgress();
  const { mangaLibrary, mangaProgress, novelLibrary, novelProgress } = useReadingProgress();

  const [selectedMediaType, setSelectedMediaType] = useState<LibraryFilterType>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [storageInfo, setStorageInfo] = useState<StorageBreakdown | null>(null);

  useEffect(() => {
    calculateStorageUsage().then(setStorageInfo).catch(() => {});
  }, []);

  // Aggregate all items into a unified collection
  const allLibraryItems: UnifiedLibraryItem[] = [];

  // 1. Anime
  for (const entry of Object.values(watchlist)) {
    const prog = progressList[entry.anime.id];
    allLibraryItems.push({
      id: entry.anime.id,
      mediaType: 'ANIME',
      title: entry.anime.title.english || entry.anime.title.romaji || entry.anime.title.userPreferred || 'Anime',
      coverUrl: entry.anime.coverImage?.large || entry.anime.coverImage?.medium || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      status: entry.status === 'WATCHING' ? 'IN_PROGRESS' : entry.status,
      rating: (entry.anime.averageScore || 80) / 10,
      progressLabel: prog ? `Ep ${prog.currentEpisode}` : 'Not Started',
      updatedAt: prog?.updatedAt || entry.addedAt || Date.now() - 3600000,
    });
  }

  // 2. Manga
  for (const [mangaId, entry] of Object.entries(mangaLibrary)) {
    const prog = mangaProgress[mangaId];
    allLibraryItems.push({
      id: mangaId,
      mediaType: 'MANGA',
      title: entry.manga.title,
      coverUrl: entry.manga.coverUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      status: entry.status === 'READING' ? 'IN_PROGRESS' : entry.status === 'PLAN_TO_READ' ? 'PLANNING' : entry.status,
      rating: entry.manga.rating || 9.0,
      progressLabel: prog ? `Ch ${prog.currentChapterNumber}` : 'Saved',
      updatedAt: prog?.updatedAt || entry.addedAt || Date.now() - 7200000,
    });
  }

  // 3. Light Novels
  for (const [novelId, entry] of Object.entries(novelLibrary)) {
    const prog = novelProgress[novelId];
    allLibraryItems.push({
      id: novelId,
      mediaType: 'NOVEL',
      title: entry.novel.title,
      coverUrl: entry.novel.coverUrl || 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600&auto=format&fit=crop&q=80',
      status: entry.status === 'READING' ? 'IN_PROGRESS' : entry.status === 'PLAN_TO_READ' ? 'PLANNING' : entry.status,
      rating: entry.novel.rating || 9.2,
      progressLabel: prog ? `Ch ${prog.currentChapterNumber}` : 'Saved',
      updatedAt: prog?.updatedAt || entry.addedAt || Date.now() - 14400000,
    });
  }

  // Calculate counts
  const animeCount = allLibraryItems.filter((i) => i.mediaType === 'ANIME').length;
  const mangaCount = allLibraryItems.filter((i) => i.mediaType === 'MANGA').length;
  const novelCount = allLibraryItems.filter((i) => i.mediaType === 'NOVEL').length;

  // Filter items
  const filteredItems = allLibraryItems.filter((item) => {
    const matchesType = selectedMediaType === 'ALL' || item.mediaType === selectedMediaType;
    const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesType && matchesStatus && matchesSearch;
  });

  const handlePressItem = (item: UnifiedLibraryItem) => {
    if (item.mediaType === 'ANIME') {
      onSelectAnime(Number(item.id));
    } else if (item.mediaType === 'MANGA' && onSelectManga) {
      onSelectManga(String(item.id));
    } else if (item.mediaType === 'NOVEL' && onSelectNovel) {
      onSelectNovel(String(item.id));
    }
  };

  const getBadgeColor = (type: MediaType) => {
    switch (type) {
      case 'ANIME':
        return '#3B82F6';
      case 'MANGA':
        return '#8B5CF6';
      case 'NOVEL':
        return '#F59E0B';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header & Stats */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.headerTitle}>Unified Library</Text>
            <Text style={styles.headerSubtitle}>
              {allLibraryItems.length} total media saved across all formats
            </Text>
          </View>
          {storageInfo && (
            <View style={styles.storagePill}>
              <Ionicons name="cloud-done" size={12} color="#10B981" />
              <Text style={styles.storageText}>{storageInfo.totalMbFormatted}</Text>
            </View>
          )}
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={theme.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Search across your unified library..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Media Format Filter Pills */}
        <View style={styles.mediaTypeRow}>
          <TouchableOpacity
            onPress={() => setSelectedMediaType('ALL')}
            style={[styles.typePill, selectedMediaType === 'ALL' && styles.typePillActive]}
          >
            <Text style={[styles.typePillText, selectedMediaType === 'ALL' && styles.typePillTextActive]}>
              All ({allLibraryItems.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedMediaType('ANIME')}
            style={[styles.typePill, selectedMediaType === 'ANIME' && styles.typePillActive]}
          >
            <Text style={[styles.typePillText, selectedMediaType === 'ANIME' && styles.typePillTextActive]}>
              🎬 Anime ({animeCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedMediaType('MANGA')}
            style={[styles.typePill, selectedMediaType === 'MANGA' && styles.typePillActive]}
          >
            <Text style={[styles.typePillText, selectedMediaType === 'MANGA' && styles.typePillTextActive]}>
              📖 Manga ({mangaCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedMediaType('NOVEL')}
            style={[styles.typePill, selectedMediaType === 'NOVEL' && styles.typePillActive]}
          >
            <Text style={[styles.typePillText, selectedMediaType === 'NOVEL' && styles.typePillTextActive]}>
              📜 Novels ({novelCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status Tabs */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_TABS}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.statusTabsPadding}
          renderItem={({ item }) => {
            const isActive = selectedStatus === item.value;
            return (
              <TouchableOpacity
                onPress={() => setSelectedStatus(item.value)}
                style={[styles.statusChip, isActive && styles.statusChipActive]}
              >
                <Text style={[styles.statusChipText, isActive && styles.statusChipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Grid Content */}
      {filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyTitle}>No Media in this Category</Text>
          <Text style={styles.emptySubtitle}>
            Save Anime, Manga, or Light Novels to track your unified progress.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => `${item.mediaType}_${item.id}`}
          numColumns={3}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.card, shadows.sm]}
              onPress={() => handlePressItem(item)}
            >
              <View style={styles.posterContainer}>
                <Image source={{ uri: item.coverUrl }} style={styles.poster} />
                <View style={[styles.typeBadge, { backgroundColor: getBadgeColor(item.mediaType) }]}>
                  <Text style={styles.typeBadgeText}>{item.mediaType}</Text>
                </View>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>{item.progressLabel}</Text>
                </View>
              </View>

              <View style={styles.cardInfo}>
                <Text numberOfLines={2} style={styles.cardTitle}>
                  {item.title}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 28 : 16,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: 'rgba(18, 21, 31, 0.98)',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  storagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  storageText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  mediaTypeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  typePillActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  typePillText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  typePillTextActive: {
    color: '#FFFFFF',
  },
  statusTabsPadding: {
    paddingVertical: 2,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 6,
  },
  statusChipActive: {
    backgroundColor: 'rgba(244, 63, 94, 0.25)',
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  statusChipText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  statusChipTextActive: {
    color: theme.colors.accent,
    fontWeight: '700',
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 90,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    width: 108,
    backgroundColor: theme.colors.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  posterContainer: {
    position: 'relative',
    width: '100%',
    height: 148,
    backgroundColor: theme.colors.surface,
  },
  poster: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  typeBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  statusPill: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  statusPillText: {
    color: '#60A5FA',
    fontSize: 9,
    fontWeight: '700',
  },
  cardInfo: {
    padding: 6,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    height: 28,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
});
