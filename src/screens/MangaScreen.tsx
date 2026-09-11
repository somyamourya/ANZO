import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MangaItem } from '../types/manga';
import { resolveTrendingManga, resolveMangaSearch } from '../api/manga/mangaResolver';
import { MangaCard } from '../components/manga/MangaCard';
import { colors, borderRadius, shadows } from '../theme';

interface MangaScreenProps {
  onSelectManga: (mangaId: string) => void;
}

const MANGA_GENRES = ['Action', 'Fantasy', 'Romance', 'Comedy', 'Isekai', 'Sci-Fi', 'Horror', 'Mystery'];

export const MangaScreen: React.FC<MangaScreenProps> = ({ onSelectManga }) => {
  const [trending, setTrending] = useState<MangaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MangaItem[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    try {
      setLoading(true);
      const data = await resolveTrendingManga();
      setTrending(data);
    } catch (e) {
      console.warn('Failed to load manga trending:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim() && !selectedGenre) {
      setSearchResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);
      const res = await resolveMangaSearch(searchQuery || selectedGenre || '');
      setSearchResults(res);
      setLoading(false);
    }, 350);

    return () => clearTimeout(delay);
  }, [searchQuery, selectedGenre]);

  const displayList = searchResults.length > 0 ? searchResults : trending;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header & Search */}
      <View style={styles.header}>
        <Text style={styles.title}>Manga Hub</Text>
        <Text style={styles.subtitle}>
          MangaDex & WeebCentral Integration • Volume-Aware
        </Text>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search manga, manhwa, webtoons..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Genre Chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={MANGA_GENRES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.genreList}
          renderItem={({ item }) => {
            const isSelected = selectedGenre === item;
            return (
              <TouchableOpacity
                onPress={() => setSelectedGenre(isSelected ? undefined : item)}
                style={[styles.genreChip, isSelected && styles.genreChipActive]}
              >
                <Text
                  style={[
                    styles.genreText,
                    isSelected && styles.genreTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Main Manga Feed */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching MangaDex & WeebCentral...</Text>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchQuery || selectedGenre ? 'Search Results' : '🔥 Popular & Trending Manga'}
          </Text>

          <FlatList
            data={displayList}
            keyExtractor={(item) => item.id}
            numColumns={3}
            scrollEnabled={false}
            columnWrapperStyle={styles.gridRow}
            renderItem={({ item }) => (
              <MangaCard
                manga={item}
                width={108}
                onPress={() => onSelectManga(item.id)}
              />
            )}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 90,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 28 : 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(18, 21, 31, 0.98)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 10,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  clearIcon: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  genreList: {
    paddingVertical: 2,
  },
  genreChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    marginRight: 6,
  },
  genreChipActive: {
    backgroundColor: colors.secondary,
  },
  genreText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  genreTextActive: {
    color: '#0B0D13',
    fontWeight: '800',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 12,
  },
});
