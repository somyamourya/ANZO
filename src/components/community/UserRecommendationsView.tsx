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
import { useCommunity } from '../../context/CommunityContext';
import { theme, borderRadius, shadows } from '../../theme';

interface UserRecommendationsViewProps {
  onSelectMedia?: (mediaType: 'ANIME' | 'MANGA' | 'NOVEL', mediaId: string | number) => void;
}

export const UserRecommendationsView: React.FC<UserRecommendationsViewProps> = ({ onSelectMedia }) => {
  const { recommendations, voteRecommendationHelpful, currentUser } = useCommunity();

  return (
    <View style={styles.container}>
      <FlatList
        data={recommendations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isHelpfulVoted = item.helpfulUserIds.includes(currentUser.id);

          return (
            <View style={[styles.recCard, shadows.sm]}>
              {/* Author */}
              <View style={styles.authorRow}>
                <Image source={{ uri: item.author.avatar }} style={styles.avatar} />
                <View>
                  <Text style={styles.authorName}>{item.author.displayName}</Text>
                  <Text style={styles.timeText}>{item.createdAt}</Text>
                </View>
              </View>

              {/* Side-by-Side Media Pairing */}
              <View style={styles.pairingContainer}>
                {/* Source Item */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.mediaNode}
                  onPress={() => onSelectMedia && onSelectMedia(item.sourceMedia.mediaType, item.sourceMedia.id)}
                >
                  <Image source={{ uri: item.sourceMedia.coverUrl }} style={styles.nodePoster} />
                  <Text numberOfLines={1} style={styles.nodeTitle}>
                    {item.sourceMedia.title}
                  </Text>
                  <Text style={styles.nodeLabel}>IF YOU LIKED</Text>
                </TouchableOpacity>

                {/* Arrow Connector */}
                <View style={styles.connector}>
                  <Ionicons name="arrow-forward" size={18} color={theme.colors.accent} />
                  <Text style={styles.connectorText}>TRY THIS</Text>
                </View>

                {/* Target Item */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.mediaNode}
                  onPress={() => onSelectMedia && onSelectMedia(item.targetMedia.mediaType, item.targetMedia.id)}
                >
                  <Image source={{ uri: item.targetMedia.coverUrl }} style={styles.nodePoster} />
                  <Text numberOfLines={1} style={styles.nodeTitle}>
                    {item.targetMedia.title}
                  </Text>
                  <Text style={styles.nodeLabel}>{item.targetMedia.mediaType}</Text>
                </TouchableOpacity>
              </View>

              {/* Recommendation Reason */}
              <Text style={styles.reasonText}>{item.reason}</Text>

              {/* Footer / Helpful Vote */}
              <View style={styles.footerRow}>
                <TouchableOpacity
                  onPress={() => voteRecommendationHelpful(item.id)}
                  style={[styles.helpfulBtn, isHelpfulVoted && styles.helpfulBtnActive]}
                >
                  <Ionicons
                    name={isHelpfulVoted ? 'thumbs-up' : 'thumbs-up-outline'}
                    size={14}
                    color={isHelpfulVoted ? '#10B981' : theme.colors.textSecondary}
                  />
                  <Text style={[styles.helpfulText, isHelpfulVoted && styles.helpfulTextActive]}>
                    Helpful ({item.helpfulCount})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
    gap: 16,
  },
  recCard: {
    backgroundColor: theme.colors.card,
    borderRadius: borderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  authorName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  timeText: {
    color: theme.colors.textMuted,
    fontSize: 10,
  },
  pairingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: 10,
    borderRadius: borderRadius.lg,
    marginBottom: 12,
  },
  mediaNode: {
    flex: 1,
    alignItems: 'center',
  },
  nodePoster: {
    width: 65,
    height: 90,
    borderRadius: borderRadius.md,
    marginBottom: 6,
    backgroundColor: theme.colors.card,
  },
  nodeTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    maxWidth: 90,
  },
  nodeLabel: {
    color: theme.colors.accent,
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
  },
  connector: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  connectorText: {
    color: theme.colors.accent,
    fontSize: 8,
    fontWeight: '900',
    marginTop: 2,
  },
  reasonText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 10,
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
