import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MangaItem } from '../../types/manga';
import { colors, borderRadius, shadows } from '../../theme';

interface MangaCardProps {
  manga: MangaItem;
  width?: number;
  onPress: () => void;
}

export const MangaCard: React.FC<MangaCardProps> = ({
  manga,
  width = 135,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.container, { width }]}
    >
      <View style={[styles.imageWrapper, shadows.sm]}>
        <Image
          source={{ uri: manga.coverUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {manga.rating && (
          <View style={styles.ratingBadge}>
            <Text style={styles.starIcon}>★</Text>
            <Text style={styles.ratingText}>{manga.rating.toFixed(1)}</Text>
          </View>
        )}

        <View style={styles.sourceBadge}>
          <Text style={styles.sourceText}>{manga.source}</Text>
        </View>
      </View>

      <Text numberOfLines={2} style={styles.title}>
        {manga.title}
      </Text>

      <Text numberOfLines={1} style={styles.author}>
        {manga.author || 'Manga'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
    marginBottom: 16,
  },
  imageWrapper: {
    width: '100%',
    height: 195,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.card,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 13, 19, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  starIcon: {
    color: '#FBBF24',
    fontSize: 10,
    marginRight: 3,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  sourceBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(6, 182, 212, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  sourceText: {
    color: '#0B0D13',
    fontSize: 9,
    fontWeight: '800',
  },
  title: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    lineHeight: 18,
  },
  author: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});
