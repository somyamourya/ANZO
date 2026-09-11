import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { UnifiedAnime } from '../../types/anime';
import { colors, borderRadius, shadows } from '../../theme';
import { GenreBadge } from './GenreBadge';
import { formatScore } from '../../utils/formatters';

interface HeroBannerProps {
  anime: UnifiedAnime;
  onPressWatch: () => void;
  onPressDetails: () => void;
}

const { width } = Dimensions.get('window');

export const HeroBanner: React.FC<HeroBannerProps> = ({
  anime,
  onPressWatch,
  onPressDetails,
}) => {
  const title = anime.title.english || anime.title.romaji || anime.title.userPreferred || 'Featured Anime';
  const bannerUri = anime.bannerImage || anime.coverImage.extraLarge || anime.coverImage.large;

  return (
    <View style={styles.container}>
      <Image source={{ uri: bannerUri }} style={styles.bannerImage} resizeMode="cover" />
      <View style={styles.gradientOverlay} />

      <View style={styles.contentOverlay}>
        <View style={styles.tagRow}>
          <View style={styles.trendingBadge}>
            <Text style={styles.trendingText}>🔥 #1 SPOTLIGHT</Text>
          </View>
          {anime.averageScore ? (
            <View style={styles.scoreBadge}>
              <Text style={styles.starText}>★</Text>
              <Text style={styles.scoreText}>{formatScore(anime.averageScore)}</Text>
            </View>
          ) : null}
        </View>

        <Text numberOfLines={2} style={styles.title}>
          {title}
        </Text>

        <View style={styles.genresRow}>
          {anime.genres.slice(0, 3).map((g) => (
            <GenreBadge key={g} label={g} size="sm" variant="surface" />
          ))}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPressWatch}
            style={[styles.playButton, shadows.neon]}
          >
            <Text style={styles.playIcon}>▶</Text>
            <Text style={styles.playButtonText}>Watch Ep 1</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPressDetails}
            style={styles.detailsButton}
          >
            <Text style={styles.detailsButtonText}>Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 380,
    position: 'relative',
    backgroundColor: colors.background,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 13, 19, 0.65)',
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(11, 13, 19, 0.88)',
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendingBadge: {
    backgroundColor: 'rgba(244, 63, 94, 0.25)',
    borderColor: colors.accent,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    marginRight: 8,
  },
  trendingText: {
    color: '#FDA4AF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  starText: {
    color: '#FBBF24',
    fontSize: 11,
    marginRight: 4,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 8,
    lineHeight: 28,
  },
  genresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: borderRadius.xl,
    marginRight: 12,
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    marginRight: 8,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  detailsButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  detailsButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
