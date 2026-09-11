import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { UnifiedAnime, WatchProgressItem } from '../../types/anime';
import { colors, borderRadius, shadows } from '../../theme';
import { formatScore } from '../../utils/formatters';

interface AnimeCardProps {
  anime?: UnifiedAnime;
  progressItem?: WatchProgressItem;
  variant?: 'portrait' | 'landscape' | 'compact';
  onPress: () => void;
  width?: number;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({
  anime,
  progressItem,
  variant = 'portrait',
  onPress,
  width = 135,
}) => {
  const title =
    anime?.title?.english ||
    anime?.title?.romaji ||
    anime?.title?.userPreferred ||
    progressItem?.animeTitle ||
    'Anime';

  const imageUrl =
    anime?.coverImage?.large ||
    anime?.coverImage?.medium ||
    progressItem?.animeCover ||
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80';

  const score = anime?.averageScore;
  const episodes = anime?.episodes;
  const currentEp = progressItem?.currentEpisode;
  const percentage = progressItem?.percentage || 0;

  if (variant === 'landscape') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[styles.landscapeContainer, { width: 260 }]}
      >
        <View style={styles.landscapeImageWrapper}>
          <Image
            source={{ uri: anime?.bannerImage || imageUrl }}
            style={styles.landscapeImage}
            resizeMode="cover"
          />
          {progressItem && (
            <View style={styles.landscapeProgressOverlay}>
              <Text style={styles.epBadgeText}>EP {currentEp}</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
              </View>
            </View>
          )}
        </View>
        <View style={styles.landscapeInfo}>
          <Text numberOfLines={1} style={styles.landscapeTitle}>
            {title}
          </Text>
          <Text style={styles.landscapeSub}>
            {progressItem ? `${percentage}% completed` : anime?.genres?.slice(0, 2).join(' • ')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.container, { width }]}
    >
      <View style={[styles.imageWrapper, shadows.sm]}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        
        {score ? (
          <View style={styles.scoreBadge}>
            <Text style={styles.starText}>★</Text>
            <Text style={styles.scoreText}>{formatScore(score)}</Text>
          </View>
        ) : null}

        {episodes ? (
          <View style={styles.epBadge}>
            <Text style={styles.epText}>{episodes} EPS</Text>
          </View>
        ) : null}

        {progressItem && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
            </View>
          </View>
        )}
      </View>

      <Text numberOfLines={2} style={styles.title}>
        {title}
      </Text>

      {anime?.genres && anime.genres.length > 0 && (
        <Text numberOfLines={1} style={styles.genreText}>
          {anime.genres[0]}
        </Text>
      )}
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
  scoreBadge: {
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
  starText: {
    color: '#FBBF24',
    fontSize: 10,
    marginRight: 3,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  epBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  epText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  title: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    lineHeight: 18,
  },
  genreText: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  // Landscape styling
  landscapeContainer: {
    marginRight: 14,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  landscapeImageWrapper: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  landscapeImage: {
    width: '100%',
    height: '100%',
  },
  landscapeProgressOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(11, 13, 19, 0.85)',
  },
  epBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  landscapeInfo: {
    padding: 10,
  },
  landscapeTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  landscapeSub: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
});
