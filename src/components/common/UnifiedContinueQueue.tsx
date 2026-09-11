import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWatchProgress } from '../../context/WatchProgressContext';
import { useReadingProgress } from '../../context/ReadingProgressContext';
import { theme, borderRadius, shadows } from '../../theme';
import { MediaType } from '../../types/crossMedia';

export interface UnifiedContinueItem {
  id: string | number;
  mediaType: MediaType;
  title: string;
  coverUrl: string;
  progressText: string;
  percentage: number;
  updatedAt: number;
  onPressResume: () => void;
}

interface UnifiedContinueQueueProps {
  onSelectAnime?: (animeId: number) => void;
  onSelectManga?: (mangaId: string) => void;
  onSelectNovel?: (novelId: string) => void;
  onQuickWatchAnime?: (animeId: number, episode: number) => void;
}

export const UnifiedContinueQueue: React.FC<UnifiedContinueQueueProps> = ({
  onSelectAnime,
  onSelectManga,
  onSelectNovel,
}) => {
  const { continueWatching } = useWatchProgress();
  const { mangaProgress, mangaLibrary, novelProgress, novelLibrary } = useReadingProgress();

  const queueItems: UnifiedContinueItem[] = [];

  // 1. In-progress Anime
  for (const item of continueWatching) {
    const title = item.animeTitle || 'Anime';
    const percent = Math.min(100, Math.round(item.percentage || ((item.currentTime / Math.max(1, item.duration)) * 100)));
    queueItems.push({
      id: item.animeId,
      mediaType: 'ANIME',
      title,
      coverUrl: item.animeCover,
      progressText: `EP ${item.currentEpisode} • ${percent}%`,
      percentage: percent,
      updatedAt: item.updatedAt || Date.now(),
      onPressResume: () => {
        if (onSelectAnime) onSelectAnime(item.animeId);
      },
    });
  }

  // 2. In-progress Manga
  for (const [mangaId, prog] of Object.entries(mangaProgress)) {
    const meta = mangaLibrary[mangaId]?.manga;
    const title = meta?.title || `Manga #${mangaId}`;
    const coverUrl = meta?.coverUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80';
    queueItems.push({
      id: mangaId,
      mediaType: 'MANGA',
      title,
      coverUrl,
      progressText: `CH ${prog.currentChapterNumber} • Pg ${prog.currentPageNumber}/${prog.totalPages || 1}`,
      percentage: Math.min(100, Math.round((prog.currentPageNumber / Math.max(1, prog.totalPages || 1)) * 100)),
      updatedAt: prog.updatedAt || Date.now() - 3600000,
      onPressResume: () => {
        if (onSelectManga) onSelectManga(mangaId);
      },
    });
  }

  // 3. In-progress Light Novels
  for (const [novelId, prog] of Object.entries(novelProgress)) {
    const meta = novelLibrary[novelId]?.novel;
    const title = meta?.title || `Novel #${novelId}`;
    const coverUrl = meta?.coverUrl || 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600&auto=format&fit=crop&q=80';
    queueItems.push({
      id: novelId,
      mediaType: 'NOVEL',
      title,
      coverUrl,
      progressText: `CH ${prog.currentChapterNumber} • ${prog.scrollPercentage}% Read`,
      percentage: prog.scrollPercentage || 50,
      updatedAt: prog.updatedAt || Date.now() - 7200000,
      onPressResume: () => {
        if (onSelectNovel) onSelectNovel(novelId);
      },
    });
  }

  // Sort by most recently interacted
  queueItems.sort((a, b) => b.updatedAt - a.updatedAt);

  if (queueItems.length === 0) {
    return null;
  }

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

  const getTypeIcon = (type: MediaType) => {
    switch (type) {
      case 'ANIME':
        return 'play';
      case 'MANGA':
        return 'book-open';
      case 'NOVEL':
        return 'document-text';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.boltIcon}>⚡</Text>
          <Text style={styles.sectionTitle}>Continue Experiencing</Text>
        </View>
        <Text style={styles.activeCount}>{queueItems.length} active in queue</Text>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={queueItems}
        keyExtractor={(item) => `${item.mediaType}_${item.id}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.queueCard, shadows.neon]}
            onPress={item.onPressResume}
          >
            <View style={styles.posterWrap}>
              <Image source={{ uri: item.coverUrl }} style={styles.poster} />
              <View style={[styles.typeBadge, { backgroundColor: getBadgeColor(item.mediaType) }]}>
                <Text style={styles.typeBadgeText}>{item.mediaType}</Text>
              </View>

              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${item.percentage}%`,
                      backgroundColor: getBadgeColor(item.mediaType),
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.metaWrap}>
              <Text numberOfLines={1} style={styles.itemTitle}>
                {item.title}
              </Text>
              <Text style={styles.progressText}>{item.progressText}</Text>
              <View style={styles.resumeBtn}>
                <Ionicons name="play-circle" size={14} color="#FFFFFF" />
                <Text style={styles.resumeBtnText}>Resume</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  boltIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  activeCount: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  queueCard: {
    width: 200,
    backgroundColor: theme.colors.card,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  posterWrap: {
    position: 'relative',
    height: 110,
    width: '100%',
    backgroundColor: theme.colors.surface,
  },
  poster: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  typeBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  progressBarBg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  progressBarFill: {
    height: '100%',
  },
  metaWrap: {
    padding: 10,
  },
  itemTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  progressText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 5,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  resumeBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
