import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IntelligentQueueItem } from '../../types/zenkai';
import { useSettings } from '../../context/SettingsContext';
import { borderRadius, shadows } from '../../theme';

interface IntelligentQueueViewProps {
  items: IntelligentQueueItem[];
  onSelectItem: (item: IntelligentQueueItem) => void;
}

export const IntelligentQueueView: React.FC<IntelligentQueueViewProps> = ({
  items,
  onSelectItem,
}) => {
  const { activeTheme } = useSettings();

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: 'rgba(0, 240, 255, 0.15)' },
            ]}
          >
            <Ionicons name="play-forward" size={18} color="#00F0FF" />
          </View>
          <View>
            <Text style={[styles.titleText, { color: activeTheme.colors.textPrimary }]}>
              Intelligent Up-Next Queue
            </Text>
            <Text style={styles.subtitleText}>
              Smart-sorted by urgency, release schedule & progress
            </Text>
          </View>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{items.length} Ready</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {items.map((item) => {
          const mediaBadgeColor =
            item.mediaType === 'ANIME'
              ? '#8B5CF6'
              : item.mediaType === 'MANGA'
              ? '#06B6D4'
              : '#10B981';

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.88}
              onPress={() => onSelectItem(item)}
              style={[
                styles.queueCard,
                {
                  backgroundColor: activeTheme.colors.card,
                  borderColor: activeTheme.colors.border,
                },
              ]}
            >
              {/* Media Format & Urgency Header */}
              <View style={styles.cardTopRow}>
                <View
                  style={[
                    styles.mediaTypeBadge,
                    { backgroundColor: mediaBadgeColor },
                  ]}
                >
                  <Text style={styles.mediaTypeText}>{item.mediaType}</Text>
                </View>

                <View style={styles.urgencyPill}>
                  <Text style={styles.urgencyText}>⚡ {item.urgencyScore} Score</Text>
                </View>
              </View>

              {/* Main Info with Thumbnail */}
              <View style={styles.cardMain}>
                <Image
                  source={{ uri: item.coverImage }}
                  style={styles.cardThumb}
                  resizeMode="cover"
                />

                <View style={styles.cardInfo}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.cardTitle,
                      { color: activeTheme.colors.textPrimary },
                    ]}
                  >
                    {item.title}
                  </Text>

                  <Text style={[styles.nextUnitText, { color: activeTheme.colors.primary }]}>
                    {item.nextUnitLabel}
                  </Text>

                  <Text numberOfLines={1} style={styles.reasonText}>
                    {item.zenkaiReason}
                  </Text>

                  <View style={styles.timeEstimateRow}>
                    <Ionicons name="time-outline" size={11} color="#94A3B8" />
                    <Text style={styles.timeEstimateText}>
                      ~{item.estimatedTimeMinutes} min remaining
                    </Text>
                  </View>
                </View>
              </View>

              {/* Progress Bar & Quick Action */}
              <View style={styles.cardBottom}>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(100, item.progressPercentage)}%`,
                        backgroundColor: activeTheme.colors.primary,
                      },
                    ]}
                  />
                </View>

                <View style={styles.actionBtnRow}>
                  <Text style={styles.progressPctText}>
                    {item.progressPercentage}% Completed
                  </Text>

                  <View
                    style={[
                      styles.playBtn,
                      { backgroundColor: activeTheme.colors.primary },
                    ]}
                  >
                    <Ionicons
                      name={
                        item.mediaType === 'ANIME'
                          ? 'play'
                          : 'book-outline'
                      }
                      size={12}
                      color="#FFFFFF"
                    />
                    <Text style={styles.playBtnText}>
                      {item.mediaType === 'ANIME' ? 'Play' : 'Read'}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
  countBadge: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00F0FF',
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00F0FF',
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  queueCard: {
    width: 270,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mediaTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  mediaTypeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  urgencyPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  urgencyText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  cardMain: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  cardThumb: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#000000',
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  nextUnitText: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  reasonText: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 4,
  },
  timeEstimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeEstimateText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  cardBottom: {
    gap: 6,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  actionBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPctText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  playBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
