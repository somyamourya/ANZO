import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCommunity } from '../../context/CommunityContext';
import { MediaReview } from '../../types/community';
import { CreateReviewModal } from './CreateReviewModal';
import { theme, borderRadius, shadows } from '../../theme';

interface ReviewsListViewProps {
  onSelectMedia?: (mediaType: 'ANIME' | 'MANGA' | 'NOVEL', mediaId: string | number) => void;
}

export const ReviewsListView: React.FC<ReviewsListViewProps> = ({ onSelectMedia }) => {
  const { reviews, voteReviewHelpful, currentUser } = useCommunity();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});

  const toggleSpoiler = (id: string) => {
    setRevealedSpoilers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getMediaBadgeColor = (type: 'ANIME' | 'MANGA' | 'NOVEL') => {
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
      {/* Top Action Header */}
      <View style={styles.actionHeader}>
        <Text style={styles.headerTitle}>Community Reviews ({reviews.length})</Text>
        <TouchableOpacity
          style={[styles.writeBtn, shadows.neon]}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="pencil" size={13} color="#FFFFFF" />
          <Text style={styles.writeBtnText}>Write Review</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isHelpful = item.helpfulUserIds.includes(currentUser.id);
          const isSpoilerRevealed = revealedSpoilers[item.id];

          return (
            <View style={[styles.reviewCard, shadows.sm]}>
              {/* Media & Overall Rating Row */}
              <View style={styles.cardTopRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.mediaInfoRow}
                  onPress={() => onSelectMedia && onSelectMedia(item.mediaType, item.mediaId)}
                >
                  <Image source={{ uri: item.mediaCover }} style={styles.mediaPoster} />
                  <View style={styles.mediaMeta}>
                    <View style={[styles.typeBadge, { backgroundColor: getMediaBadgeColor(item.mediaType) }]}>
                      <Text style={styles.typeBadgeText}>{item.mediaType}</Text>
                    </View>
                    <Text numberOfLines={1} style={styles.mediaTitleText}>
                      {item.mediaTitle}
                    </Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreStar}>★</Text>
                  <Text style={styles.scoreNumber}>{item.overallScore.toFixed(1)}</Text>
                </View>
              </View>

              {/* Review Headline & Author */}
              <Text style={styles.reviewHeadline}>{item.reviewTitle}</Text>

              <View style={styles.authorRow}>
                <Image source={{ uri: item.author.avatar }} style={styles.authorAvatar} />
                <Text style={styles.authorName}>{item.author.displayName}</Text>
                <Text style={styles.timestampText}>• {item.createdAt}</Text>
              </View>

              {/* Sub-Scores Breakdown */}
              <View style={styles.breakdownRow}>
                {item.storyScore && <Text style={styles.subScoreItem}>Story: {item.storyScore}</Text>}
                {item.artScore && <Text style={styles.subScoreItem}>Art: {item.artScore}</Text>}
                {item.soundScore && <Text style={styles.subScoreItem}>Sound: {item.soundScore}</Text>}
                {item.characterScore && <Text style={styles.subScoreItem}>Chars: {item.characterScore}</Text>}
              </View>

              {/* Review Body with Spoiler Shield */}
              {item.containsSpoilers && !isSpoilerRevealed ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => toggleSpoiler(item.id)}
                  style={styles.spoilerShield}
                >
                  <Ionicons name="eye-off" size={15} color="#FBBF24" />
                  <Text style={styles.spoilerShieldText}>
                    Review Contains Spoilers • Tap to Read
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.reviewBody}>{item.reviewBody}</Text>
              )}

              {/* Footer / Helpful Button */}
              <View style={styles.cardFooter}>
                <TouchableOpacity
                  onPress={() => voteReviewHelpful(item.id)}
                  style={[styles.helpfulBtn, isHelpful && styles.helpfulBtnActive]}
                >
                  <Ionicons
                    name={isHelpful ? 'thumbs-up' : 'thumbs-up-outline'}
                    size={14}
                    color={isHelpful ? '#10B981' : theme.colors.textSecondary}
                  />
                  <Text style={[styles.helpfulText, isHelpful && styles.helpfulTextActive]}>
                    Helpful ({item.helpfulCount})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <CreateReviewModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  writeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  writeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
    gap: 16,
  },
  reviewCard: {
    backgroundColor: theme.colors.card,
    borderRadius: borderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mediaInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  mediaPoster: {
    width: 36,
    height: 50,
    borderRadius: borderRadius.sm,
    backgroundColor: theme.colors.surface,
  },
  mediaMeta: {
    flex: 1,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: borderRadius.xs,
    marginBottom: 2,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  mediaTitleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  scoreStar: {
    color: '#FBBF24',
    fontSize: 12,
  },
  scoreNumber: {
    color: '#FBBF24',
    fontSize: 13,
    fontWeight: '900',
  },
  reviewHeadline: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
    marginBottom: 6,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  authorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  authorName: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  timestampText: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginBottom: 10,
  },
  subScoreItem: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  spoilerShield: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    padding: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: 10,
  },
  spoilerShieldText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '700',
  },
  reviewBody: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 8,
  },
  helpfulBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  helpfulBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  helpfulText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  helpfulTextActive: {
    color: '#34D399',
    fontWeight: '700',
  },
});
