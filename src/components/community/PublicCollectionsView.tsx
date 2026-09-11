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

interface PublicCollectionsViewProps {
  onSelectMedia?: (mediaType: 'ANIME' | 'MANGA' | 'NOVEL', mediaId: string | number) => void;
}

export const PublicCollectionsView: React.FC<PublicCollectionsViewProps> = ({ onSelectMedia }) => {
  const { collections, likeCollection, currentUser } = useCommunity();

  return (
    <View style={styles.container}>
      <FlatList
        data={collections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isLiked = item.likedUserIds.includes(currentUser.id);

          return (
            <View style={[styles.collectionCard, shadows.sm]}>
              {/* Creator & Title */}
              <View style={styles.headerRow}>
                <View style={styles.creatorWrap}>
                  <Image source={{ uri: item.creator.avatar }} style={styles.avatar} />
                  <View>
                    <Text style={styles.creatorName}>{item.creator.displayName}</Text>
                    <Text style={styles.collectionTime}>{item.createdAt}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => likeCollection(item.id)}
                  style={[styles.likeBtn, isLiked && styles.likeBtnActive]}
                >
                  <Ionicons
                    name={isLiked ? 'heart' : 'heart-outline'}
                    size={16}
                    color={isLiked ? '#F43F5E' : theme.colors.textSecondary}
                  />
                  <Text style={[styles.likeCount, isLiked && styles.likeCountActive]}>
                    {item.likesCount}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.collectionTitle}>{item.title}</Text>
              <Text style={styles.collectionDesc}>{item.description}</Text>

              {/* Multi-Poster Preview Collage */}
              <View style={styles.postersRow}>
                {item.items.slice(0, 4).map((entry, idx) => (
                  <TouchableOpacity
                    key={`${entry.mediaType}_${entry.id}_${idx}`}
                    activeOpacity={0.8}
                    style={styles.posterItem}
                    onPress={() => onSelectMedia && onSelectMedia(entry.mediaType, entry.id)}
                  >
                    <Image source={{ uri: entry.coverUrl }} style={styles.posterImage} />
                    <View style={styles.itemBadge}>
                      <Text style={styles.itemBadgeText}>{entry.mediaType[0]}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tags & Count */}
              <View style={styles.footerRow}>
                <View style={styles.tagsRow}>
                  {item.tags.map((t) => (
                    <View key={t} style={styles.tagPill}>
                      <Text style={styles.tagText}>#{t}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.itemCountText}>{item.items.length} titles in list</Text>
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
  collectionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: borderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  creatorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  creatorName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  collectionTime: {
    color: theme.colors.textMuted,
    fontSize: 10,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  likeBtnActive: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: 'rgba(244, 63, 94, 0.4)',
  },
  likeCount: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  likeCountActive: {
    color: '#FDA4AF',
  },
  collectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: 4,
  },
  collectionDesc: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  postersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  posterItem: {
    flex: 1,
    height: 110,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.colors.surface,
  },
  posterImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.75)',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tagPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    color: theme.colors.accent,
    fontSize: 10,
    fontWeight: '700',
  },
  itemCountText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
});
