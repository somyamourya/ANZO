import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCrossMediaConnections } from '../../api/crossMediaEngine';
import { MediaType, ConnectedMediaNode } from '../../types/crossMedia';
import { theme, borderRadius, shadows } from '../../theme';

interface CrossMediaConnectionsProps {
  currentMediaType: MediaType;
  currentId: string | number;
  currentTitle: string;
  onSelectAnime?: (animeId: number) => void;
  onSelectManga?: (mangaId: string) => void;
  onSelectNovel?: (novelId: string) => void;
}

export const CrossMediaConnections: React.FC<CrossMediaConnectionsProps> = ({
  currentMediaType,
  currentId,
  currentTitle,
  onSelectAnime,
  onSelectManga,
  onSelectNovel,
}) => {
  const bundle = getCrossMediaConnections(currentMediaType, currentId, currentTitle);

  if (!bundle.connectedItems || bundle.connectedItems.length === 0) {
    return null;
  }

  const handlePressNode = (node: ConnectedMediaNode) => {
    if (node.mediaType === 'ANIME' && onSelectAnime) {
      onSelectAnime(Number(node.id));
    } else if (node.mediaType === 'MANGA' && onSelectManga) {
      onSelectManga(String(node.id));
    } else if (node.mediaType === 'NOVEL' && onSelectNovel) {
      onSelectNovel(String(node.id));
    }
  };

  const getBadgeBg = (type: MediaType) => {
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
      <View style={styles.headerRow}>
        <View style={styles.headerTitleWrap}>
          <Ionicons name="git-network-outline" size={18} color={theme.colors.accent} />
          <Text style={styles.sectionTitle}>Connected Adaptations & Sources</Text>
        </View>
        <Text style={styles.franchiseBadge}>Franchise Eco</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {bundle.connectedItems.map((item) => (
          <TouchableOpacity
            key={`${item.mediaType}_${item.id}`}
            activeOpacity={0.85}
            style={[styles.card, shadows.sm]}
            onPress={() => handlePressNode(item)}
          >
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.coverUrl }} style={styles.poster} />
              <View style={[styles.typeBadge, { backgroundColor: getBadgeBg(item.mediaType) }]}>
                <Text style={styles.typeBadgeText}>{item.mediaType}</Text>
              </View>
            </View>

            <View style={styles.infoWrap}>
              <Text style={styles.nodeRole}>{item.badgeLabel}</Text>
              <Text numberOfLines={2} style={styles.nodeTitle}>
                {item.title}
              </Text>
              <View style={styles.metaRow}>
                {item.rating && (
                  <Text style={styles.ratingText}>★ {item.rating}</Text>
                )}
                <Text style={styles.switchPrompt}>Switch ›</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  franchiseBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.accent,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  scrollContent: {
    paddingRight: 16,
    gap: 12,
  },
  card: {
    width: 220,
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: borderRadius.lg,
    padding: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  imageContainer: {
    position: 'relative',
  },
  poster: {
    width: 60,
    height: 85,
    borderRadius: borderRadius.md,
    backgroundColor: theme.colors.surface,
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
    fontWeight: '800',
  },
  infoWrap: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  nodeRole: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.accent,
    textTransform: 'uppercase',
  },
  nodeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FBBF24',
  },
  switchPrompt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#60A5FA',
  },
});
