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
import { NovelItem } from '../types/novel';
import { resolveTrendingNovels, resolveNovelSearch } from '../api/novel/novelResolver';
import { NovelCard } from '../components/novel/NovelCard';
import { colors, borderRadius, shadows } from '../theme';

interface NovelScreenProps {
  onSelectNovel: (novelId: string) => void;
}

const NOVEL_TAGS = ['Fantasy', 'Cultivation', 'Progression', 'Isekai', 'Dark', 'System', 'Steampunk'];

export const NovelScreen: React.FC<NovelScreenProps> = ({ onSelectNovel }) => {
  const [novels, setNovels] = useState<NovelItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NovelItem[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNovels();
  }, []);

  const loadNovels = async () => {
    try {
      setLoading(true);
      const data = await resolveTrendingNovels();
      setNovels(data);
    } catch (e) {
      console.warn('Failed to load novels:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim() && !selectedTag) {
      setSearchResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);
      const res = await resolveNovelSearch(searchQuery || selectedTag || '');
      setSearchResults(res);
      setLoading(false);
    }, 350);

    return () => clearTimeout(delay);
  }, [searchQuery, selectedTag]);

  const displayList = searchResults.length > 0 ? searchResults : novels;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header & Search */}
      <View style={styles.header}>
        <Text style={styles.title}>Light Novel Hub</Text>
        <Text style={styles.subtitle}>
          NovelFull • NovelFire • FreeWebNovel • WuxiaWorld
        </Text>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search web novels, authors, cultivation..."
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

        {/* Tag Pills */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={NOVEL_TAGS}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.tagsPadding}
          renderItem={({ item }) => {
            const isSelected = selectedTag === item;
            return (
              <TouchableOpacity
                onPress={() => setSelectedTag(isSelected ? undefined : item)}
                style={[styles.tagChip, isSelected && styles.tagChipActive]}
              >
                <Text
                  style={[
                    styles.tagText,
                    isSelected && styles.tagTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Main Novel Grid */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching Curated Web Novels...</Text>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchQuery || selectedTag ? 'Search Results' : '📖 Top Ranked Light Novels'}
          </Text>

          <FlatList
            data={displayList}
            keyExtractor={(item) => item.id}
            numColumns={3}
            scrollEnabled={false}
            columnWrapperStyle={styles.gridRow}
            renderItem={({ item }) => (
              <NovelCard
                novel={item}
                width={108}
                onPress={() => onSelectNovel(item.id)}
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
  tagsPadding: {
    paddingVertical: 2,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    marginRight: 6,
  },
  tagChipActive: {
    backgroundColor: colors.accent,
  },
  tagText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  tagTextActive: {
    color: '#FFFFFF',
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
