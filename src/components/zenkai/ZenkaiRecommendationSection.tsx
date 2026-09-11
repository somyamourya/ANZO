import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ZenkaiRecommendationSection as SectionType, ZenkaiRecommendationItem } from '../../types/zenkai';
import { borderRadius, shadows, theme } from '../../theme';
import { useSettings } from '../../context/SettingsContext';

interface ZenkaiRecommendationSectionProps {
  section: SectionType;
  onSelectItem: (item: ZenkaiRecommendationItem) => void;
}

export const ZenkaiRecommendationSection: React.FC<ZenkaiRecommendationSectionProps> = ({
  section,
  onSelectItem,
}) => {
  const { activeTheme } = useSettings();

  const getMediaBadgeColor = (type: 'ANIME' | 'MANGA' | 'NOVEL') => {
    switch (type) {
      case 'ANIME':
        return '#8B5CF6';
      case 'MANGA':
        return '#06B6D4';
      case 'NOVEL':
        return '#10B981';
      default:
        return activeTheme.colors.primary;
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: section.accentColor + '20' },
            ]}
          >
            <Ionicons
              name={section.icon as any}
              size={18}
              color={section.accentColor}
            />
          </View>
          <View>
            <Text style={[styles.titleText, { color: activeTheme.colors.textPrimary }]}>
              {section.title}
            </Text>
            <Text style={styles.subtitleText}>{section.subtitle}</Text>
          </View>
        </View>

        <View style={styles.zenkaiPill}>
          <Text style={styles.zenkaiPillText}>⚡ ZENKAI</Text>
        </View>
      </View>

      {/* Horizontal List of Recommendations */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={section.items}
        keyExtractor={(item) => `${item.mediaType}_${item.id}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const mediaColor = getMediaBadgeColor(item.mediaType);

          return (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => onSelectItem(item)}
              style={[
                styles.itemCard,
                {
                  backgroundColor: activeTheme.colors.card,
                  borderColor: activeTheme.colors.border,
                },
              ]}
            >
              {/* Cover Image */}
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item.coverImage }}
                  style={styles.coverImage}
                  resizeMode="cover"
                />

                {/* Match Percentage Pill */}
                <View style={styles.matchPill}>
                  <Text style={styles.matchText}>{item.matchPercentage}% Match</Text>
                </View>

                {/* Media Format Badge */}
                <View
                  style={[
                    styles.mediaTypeBadge,
                    { backgroundColor: mediaColor },
                  ]}
                >
                  <Text style={styles.mediaTypeText}>{item.mediaType}</Text>
                </View>

                {/* Rating Badge */}
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>⭐ {item.score}</Text>
                </View>
              </View>

              {/* Meta Info */}
              <View style={styles.metaContainer}>
                <Text
                  numberOfLines={1}
                  style={[styles.itemTitle, { color: activeTheme.colors.textPrimary }]}
                >
                  {item.title}
                </Text>

                <Text numberOfLines={2} style={styles.reasonText}>
                  {item.reason}
                </Text>

                <View style={styles.genreTagsRow}>
                  {item.genres.slice(0, 2).map((g) => (
                    <View key={g} style={styles.genreChip}>
                      <Text style={styles.genreChipText}>{g}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitleText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  zenkaiPill: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  zenkaiPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFD700',
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  itemCard: {
    width: 175,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: '#000000',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  matchPill: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.92)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  matchText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  mediaTypeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mediaTypeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '700',
  },
  metaContainer: {
    padding: 10,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 10,
    color: '#94A3B8',
    lineHeight: 14,
    marginBottom: 8,
  },
  genreTagsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  genreChip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  genreChipText: {
    fontSize: 9,
    color: '#CBD5E1',
    fontWeight: '600',
  },
});
