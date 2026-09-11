import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { executeUniversalSearch } from '../api/universalSearch';
import { UniversalMediaResult, UniversalFilterType } from '../types/universalSearch';
import { MediaType } from '../types/crossMedia';
import { theme, borderRadius, shadows } from '../theme';
import { Ionicons } from '@expo/vector-icons';

const MEDIA_TYPE_TABS: { label: string; value: UniversalFilterType; icon: string }[] = [
  { label: 'All Media', value: 'ALL', icon: 'sparkles' },
  { label: 'Anime', value: 'ANIME', icon: 'play-circle' },
  { label: 'Manga', value: 'MANGA', icon: 'book' },
  { label: 'Light Novels', value: 'NOVEL', icon: 'document-text' },
];

const GENRES = [
  'All Genres',
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Isekai',
  'Romance',
  'Sci-Fi',
  'Supernatural',
  'Cultivation',
  'Shounen',
  'Mystery',
];

interface SearchScreenProps {
  onSelectAnime: (animeId: number) => void;
  onSelectManga?: (mangaId: string) => void;
  onSelectNovel?: (novelId: string) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  onSelectAnime,
  onSelectManga,
  onSelectNovel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMediaType, setSelectedMediaType] = useState<UniversalFilterType>('ALL');
  const [selectedGenre, setSelectedGenre] = useState<string>('All Genres');
  const [results, setResults] = useState<UniversalMediaResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      executeSearch();
    }, 350);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedMediaType, selectedGenre]);

  const executeSearch = async () => {
    try {
      setLoading(true);
      const genre = selectedGenre === 'All Genres' ? undefined : selectedGenre;
      const res = await executeUniversalSearch(searchQuery, selectedMediaType, genre);
      setResults(res);
    } catch (e) {
      console.warn('Universal search query failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePressItem = (item: UniversalMediaResult) => {
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
      {/* Search Bar Header */}
      <View style={styles.searchHeader}>
        <View style={styles.inputContainer}>
          <Ionicons name="search" size={18} color={theme.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Search anime, manga, light novels..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Media Type Filter Tabs */}
        <View style={styles.mediaTabsRow}>
          {MEDIA_TYPE_TABS.map((tab) => {
            const isSelected = selectedMediaType === tab.value;
            return (
              <TouchableOpacity
                key={tab.value}
                onPress={() => setSelectedMediaType(tab.value)}
                style={[styles.mediaTabChip, isSelected && styles.mediaTabChipActive]}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={12}
                  color={isSelected ? '#FFFFFF' : theme.colors.textSecondary}
                />
                <Text style={[styles.mediaTabChipText, isSelected && styles.mediaTabChipTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Genre Pills */}
        <View style={styles.genresRow}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={GENRES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const isSelected = selectedGenre === item;
              return (
                <TouchableOpacity
                  onPress={() => setSelectedGenre(item)}
                  style={[styles.genreChip, isSelected && styles.genreChipActive]}
                >
                  <Text style={[styles.genreChipText, isSelected && styles.genreChipTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>

      {/* Search Results Grid */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={styles.loadingText}>Searching Across Anime, Manga & Novels...</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>🎌</Text>
          <Text style={styles.emptyTitle}>No Media Found</Text>
          <Text style={styles.emptySubtitle}>Try searching with different keywords or format filters.</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.mediaType}_${item.id}`}
          numColumns={3}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.mediaCard, shadows.sm]}
              onPress={() => handlePressItem(item)}
            >
              <View style={styles.posterContainer}>
                <Image source={{ uri: item.coverUrl }} style={styles.poster} />
                <View style={[styles.typeBadge, { backgroundColor: getBadgeColor(item.mediaType) }]}>
                  <Text style={styles.typeBadgeText}>{item.mediaType}</Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingStar}>★</Text>
                  <Text style={styles.ratingValue}>{item.rating.toFixed(1)}</Text>
                </View>
              </View>

              <View style={styles.cardInfo}>
                <Text numberOfLines={2} style={styles.cardTitle}>
                  {item.title}
                </Text>
                <View style={styles.cardFooter}>
                  <Text numberOfLines={1} style={styles.providerText}>
                    {item.sourceProvider}
                  </Text>
                  {item.latestUnit && (
                    <Text style={styles.unitText}>{item.latestUnit}</Text>
                  )}
                </View>
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
  searchHeader: {
    paddingTop: Platform.OS === 'android' ? 24 : 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: 'rgba(18, 21, 31, 0.98)',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: borderRadius.xl,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  mediaTabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  mediaTabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: theme.colors.surface,
  },
  mediaTabChipActive: {
    backgroundColor: theme.colors.accent,
  },
  mediaTabChipText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  mediaTabChipTextActive: {
    color: '#FFFFFF',
  },
  genresRow: {
    marginTop: 8,
    marginBottom: 4,
  },
  genreChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 6,
  },
  genreChipActive: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  genreChipText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  genreChipTextActive: {
    color: theme.colors.accent,
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 90,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  mediaCard: {
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
    letterSpacing: 0.5,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  ratingStar: {
    color: '#FBBF24',
    fontSize: 9,
  },
  ratingValue: {
    color: '#FFFFFF',
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  providerText: {
    color: theme.colors.textMuted,
    fontSize: 9,
    flex: 1,
  },
  unitText: {
    color: theme.colors.accent,
    fontSize: 9,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
});
