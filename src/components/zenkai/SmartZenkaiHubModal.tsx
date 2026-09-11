import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../context/SettingsContext';
import { useWatchProgress } from '../../context/WatchProgressContext';
import { useReadingProgress } from '../../context/ReadingProgressContext';
import {
  calculatePersonalizedRecommendations,
  getBecauseYouWatchedRecommendations,
  getBecauseYouReadRecommendations,
  getSmartSeasonalRecommendations,
  generateIntelligentQueue,
  CROSS_MEDIA_TRANSITIONS,
} from '../../api/zenkai/zenkaiEngine';
import { ZenkaiRecommendationItem, IntelligentQueueItem } from '../../types/zenkai';
import { borderRadius, shadows } from '../../theme';

interface SmartZenkaiHubModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectMedia?: (mediaType: 'ANIME' | 'MANGA' | 'NOVEL', mediaId: string | number) => void;
}

type ZenkaiTab = 'FOR_YOU' | 'BECAUSE_YOU' | 'SEASONAL' | 'CROSS_MEDIA' | 'SMART_QUEUE';

const { width: screenWidth } = Dimensions.get('window');

export const SmartZenkaiHubModal: React.FC<SmartZenkaiHubModalProps> = ({
  visible,
  onClose,
  onSelectMedia,
}) => {
  const { activeTheme } = useSettings();
  const { continueWatching, progressList } = useWatchProgress();
  const { mangaProgress, novelProgress } = useReadingProgress();

  const [activeTab, setActiveTab] = useState<ZenkaiTab>('FOR_YOU');

  // Derive Zenkai recommendations
  const watchedTitles = continueWatching.map((a) => a.animeTitle || '');
  const readMangaTitles = Object.values(mangaProgress).map((m) => m.mangaTitle);
  const readNovelTitles = Object.values(novelProgress).map((n) => n.novelTitle);

  const forYouItems = calculatePersonalizedRecommendations(
    watchedTitles,
    readMangaTitles,
    readNovelTitles
  );

  const becauseWatchedSection = getBecauseYouWatchedRecommendations(
    watchedTitles[0] || 'Solo Leveling'
  );

  const becauseReadSection = getBecauseYouReadRecommendations(
    readNovelTitles[0] || 'Shadow Slave'
  );

  const seasonalPacks = getSmartSeasonalRecommendations();

  const smartQueue = generateIntelligentQueue(
    progressList,
    mangaProgress,
    novelProgress
  );

  const handleItemPress = (item: ZenkaiRecommendationItem) => {
    if (onSelectMedia) {
      onSelectMedia(item.mediaType, item.id);
      onClose();
    }
  };

  const handleQueuePress = (item: IntelligentQueueItem) => {
    if (onSelectMedia) {
      onSelectMedia(item.mediaType, item.mediaId);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { borderColor: activeTheme.colors.border }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.headerIconBox,
                  { backgroundColor: 'rgba(255, 215, 0, 0.15)' },
                ]}
              >
                <Text style={{ fontSize: 18 }}>⚡</Text>
              </View>
              <View>
                <Text style={styles.headerTitle}>Smart Zenkai AI Discovery</Text>
                <Text style={styles.headerSubtitle}>
                  Personalized recommendations & cross-media continuations
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={activeTheme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Navigation Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabBar}
          >
            {[
              { key: 'FOR_YOU', label: '⚡ For You', icon: 'sparkles' },
              { key: 'BECAUSE_YOU', label: '🔥 Because You Watched', icon: 'flame' },
              { key: 'SEASONAL', label: '🍁 Smart Seasonal', icon: 'leaf' },
              { key: 'CROSS_MEDIA', label: '🌐 Cross-Media', icon: 'swap-horizontal' },
              { key: 'SMART_QUEUE', label: '⏯️ Smart Queue', icon: 'play-forward' },
            ].map((t) => {
              const isSelected = activeTab === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  style={[
                    styles.tabButton,
                    isSelected && {
                      backgroundColor: activeTheme.colors.primary,
                    },
                  ]}
                  onPress={() => setActiveTab(t.key as ZenkaiTab)}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      isSelected && styles.tabButtonTextActive,
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Tab Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* TAB 1: FOR YOU */}
            {activeTab === 'FOR_YOU' && (
              <View style={styles.tabContentContainer}>
                <Text style={styles.sectionHeading}>
                  RECOMMENDED BASED ON YOUR WATCH & READ HISTORY
                </Text>
                <View style={styles.gridContainer}>
                  {forYouItems.map((item) => (
                    <TouchableOpacity
                      key={`${item.mediaType}_${item.id}`}
                      activeOpacity={0.88}
                      onPress={() => handleItemPress(item)}
                      style={[
                        styles.gridCard,
                        {
                          backgroundColor: activeTheme.colors.card,
                          borderColor: activeTheme.colors.border,
                        },
                      ]}
                    >
                      <View style={styles.gridImageContainer}>
                        <Image
                          source={{ uri: item.coverImage }}
                          style={styles.gridCoverImage}
                          resizeMode="cover"
                        />
                        <View style={styles.matchBadge}>
                          <Text style={styles.matchBadgeText}>
                            {item.matchPercentage}% Match
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.formatBadge,
                            {
                              backgroundColor:
                                item.mediaType === 'ANIME'
                                  ? '#8B5CF6'
                                  : item.mediaType === 'MANGA'
                                  ? '#06B6D4'
                                  : '#10B981',
                            },
                          ]}
                        >
                          <Text style={styles.formatBadgeText}>{item.mediaType}</Text>
                        </View>
                      </View>

                      <View style={styles.gridMeta}>
                        <Text
                          numberOfLines={1}
                          style={[styles.gridTitle, { color: activeTheme.colors.textPrimary }]}
                        >
                          {item.title}
                        </Text>
                        <Text numberOfLines={2} style={styles.gridReason}>
                          {item.reason}
                        </Text>
                        <Text style={styles.scoreText}>⭐ {item.score} / 10</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* TAB 2: BECAUSE YOU CONSUMED */}
            {activeTab === 'BECAUSE_YOU' && (
              <View style={styles.tabContentContainer}>
                {/* 1. Because you watched */}
                <Text style={styles.sectionHeading}>
                  {becauseWatchedSection.title.toUpperCase()}
                </Text>
                <Text style={styles.sectionSubHeading}>
                  {becauseWatchedSection.subtitle}
                </Text>
                <View style={styles.gridContainer}>
                  {becauseWatchedSection.items.map((item) => (
                    <TouchableOpacity
                      key={`${item.mediaType}_${item.id}`}
                      activeOpacity={0.88}
                      onPress={() => handleItemPress(item)}
                      style={[
                        styles.gridCard,
                        {
                          backgroundColor: activeTheme.colors.card,
                          borderColor: activeTheme.colors.border,
                        },
                      ]}
                    >
                      <Image
                        source={{ uri: item.coverImage }}
                        style={styles.gridCoverImage}
                        resizeMode="cover"
                      />
                      <View style={styles.gridMeta}>
                        <Text
                          numberOfLines={1}
                          style={[styles.gridTitle, { color: activeTheme.colors.textPrimary }]}
                        >
                          {item.title}
                        </Text>
                        <Text numberOfLines={2} style={styles.gridReason}>
                          {item.reason}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 2. Because you read */}
                <Text style={[styles.sectionHeading, { marginTop: 24 }]}>
                  {becauseReadSection.title.toUpperCase()}
                </Text>
                <Text style={styles.sectionSubHeading}>
                  {becauseReadSection.subtitle}
                </Text>
                <View style={styles.gridContainer}>
                  {becauseReadSection.items.map((item) => (
                    <TouchableOpacity
                      key={`${item.mediaType}_${item.id}`}
                      activeOpacity={0.88}
                      onPress={() => handleItemPress(item)}
                      style={[
                        styles.gridCard,
                        {
                          backgroundColor: activeTheme.colors.card,
                          borderColor: activeTheme.colors.border,
                        },
                      ]}
                    >
                      <Image
                        source={{ uri: item.coverImage }}
                        style={styles.gridCoverImage}
                        resizeMode="cover"
                      />
                      <View style={styles.gridMeta}>
                        <Text
                          numberOfLines={1}
                          style={[styles.gridTitle, { color: activeTheme.colors.textPrimary }]}
                        >
                          {item.title}
                        </Text>
                        <Text numberOfLines={2} style={styles.gridReason}>
                          {item.reason}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* TAB 3: SMART SEASONAL RECOMMENDATIONS */}
            {activeTab === 'SEASONAL' && (
              <View style={styles.tabContentContainer}>
                {seasonalPacks.map((pack) => (
                  <View key={pack.categoryName} style={{ marginBottom: 20 }}>
                    <View style={styles.seasonalHeaderRow}>
                      <Text style={styles.seasonPackTitle}>{pack.categoryName}</Text>
                      <View style={styles.seasonBadge}>
                        <Text style={styles.seasonBadgeText}>{pack.badge}</Text>
                      </View>
                    </View>
                    <Text style={styles.seasonPackSub}>{pack.tagline}</Text>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 12, marginTop: 10 }}
                    >
                      {pack.items.map((item) => (
                        <TouchableOpacity
                          key={`${item.mediaType}_${item.id}`}
                          activeOpacity={0.88}
                          onPress={() => handleItemPress(item)}
                          style={[
                            styles.seasonalCard,
                            {
                              backgroundColor: activeTheme.colors.card,
                              borderColor: activeTheme.colors.border,
                            },
                          ]}
                        >
                          <Image
                            source={{ uri: item.coverImage }}
                            style={styles.seasonalImage}
                            resizeMode="cover"
                          />
                          <View style={styles.seasonalMeta}>
                            <Text
                              numberOfLines={1}
                              style={[
                                styles.seasonalTitle,
                                { color: activeTheme.colors.textPrimary },
                              ]}
                            >
                              {item.title}
                            </Text>
                            <Text style={styles.seasonTagText}>{item.seasonTag}</Text>
                            <Text style={styles.scoreText}>⭐ {item.score}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                ))}
              </View>
            )}

            {/* TAB 4: CROSS-MEDIA CONTINUATIONS */}
            {activeTab === 'CROSS_MEDIA' && (
              <View style={styles.tabContentContainer}>
                <Text style={styles.sectionHeading}>
                  CROSS-MEDIA BRIDGES: CONTINUE WHERE ANIME ENDED
                </Text>
                <Text style={styles.sectionSubHeading}>
                  Direct manga and light novel chapter links after anime finales
                </Text>

                <View style={{ gap: 14, marginTop: 10 }}>
                  {CROSS_MEDIA_TRANSITIONS.map((trans) => (
                    <View
                      key={trans.sourceTitle}
                      style={[
                        styles.transitionCard,
                        {
                          backgroundColor: activeTheme.colors.card,
                          borderColor: activeTheme.colors.border,
                        },
                      ]}
                    >
                      <View style={styles.transitionTop}>
                        <Image
                          source={{ uri: trans.targetCover }}
                          style={styles.transitionThumb}
                          resizeMode="cover"
                        />
                        <View style={{ flex: 1 }}>
                          <View style={styles.transitionPathRow}>
                            <Text style={styles.sourceText}>{trans.sourceTitle}</Text>
                            <Ionicons name="arrow-forward" size={14} color="#00F0FF" />
                            <Text style={[styles.targetText, { color: activeTheme.colors.primary }]}>
                              {trans.targetTitle}
                            </Text>
                          </View>

                          <View style={styles.suggestedUnitBox}>
                            <Ionicons name="bookmark" size={12} color="#10B981" />
                            <Text style={styles.suggestedUnitText}>
                              {trans.targetSuggestedUnit}
                            </Text>
                          </View>

                          <Text style={styles.transitionReason}>
                            {trans.transitionReason}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* TAB 5: SMART QUEUE */}
            {activeTab === 'SMART_QUEUE' && (
              <View style={styles.tabContentContainer}>
                <Text style={styles.sectionHeading}>
                  SMART URGENCY QUEUE ({smartQueue.length} ITEMS)
                </Text>
                <View style={{ gap: 12, marginTop: 10 }}>
                  {smartQueue.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.88}
                      onPress={() => handleQueuePress(item)}
                      style={[
                        styles.queueListRow,
                        {
                          backgroundColor: activeTheme.colors.card,
                          borderColor: activeTheme.colors.border,
                        },
                      ]}
                    >
                      <Image
                        source={{ uri: item.coverImage }}
                        style={styles.queueListThumb}
                        resizeMode="cover"
                      />

                      <View style={{ flex: 1 }}>
                        <View style={styles.queueHeaderRow}>
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.queueListTitle,
                              { color: activeTheme.colors.textPrimary },
                            ]}
                          >
                            {item.title}
                          </Text>
                          <View style={styles.urgencyScoreBadge}>
                            <Text style={styles.urgencyScoreText}>
                              ⚡ {item.urgencyScore} Urgency
                            </Text>
                          </View>
                        </View>

                        <Text style={[styles.queueNextText, { color: activeTheme.colors.primary }]}>
                          {item.nextUnitLabel}
                        </Text>
                        <Text style={styles.queueReasonText}>{item.zenkaiReason}</Text>
                        <Text style={styles.queueEstTime}>
                          ⏱ ~{item.estimatedTimeMinutes} min remaining
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.queueActionBtn,
                          { backgroundColor: activeTheme.colors.primary },
                        ]}
                      >
                        <Ionicons
                          name={item.mediaType === 'ANIME' ? 'play' : 'book'}
                          size={14}
                          color="#FFFFFF"
                        />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '88%',
    backgroundColor: '#0E111A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 6,
    marginBottom: 10,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tabButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  tabContentContainer: {
    paddingTop: 6,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionSubHeading: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    width: (screenWidth - 44) / 2,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  gridImageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#000000',
  },
  gridCoverImage: {
    width: '100%',
    height: '100%',
  },
  matchBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  matchBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  formatBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  formatBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  gridMeta: {
    padding: 8,
  },
  gridTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  gridReason: {
    fontSize: 10,
    color: '#94A3B8',
    lineHeight: 13,
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFD700',
  },
  seasonalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seasonPackTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  seasonPackSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  seasonBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  seasonBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFD700',
  },
  seasonalCard: {
    width: 140,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  seasonalImage: {
    width: '100%',
    height: 160,
  },
  seasonalMeta: {
    padding: 8,
  },
  seasonalTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  seasonTagText: {
    fontSize: 9,
    color: '#00F0FF',
    marginTop: 2,
  },
  transitionCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  transitionTop: {
    flexDirection: 'row',
    gap: 12,
  },
  transitionThumb: {
    width: 65,
    height: 90,
    borderRadius: 8,
  },
  transitionPathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  sourceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  targetText: {
    fontSize: 12,
    fontWeight: '800',
  },
  suggestedUnitBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  suggestedUnitText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
  },
  transitionReason: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },
  queueListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  queueListThumb: {
    width: 50,
    height: 70,
    borderRadius: 6,
  },
  queueHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  queueListTitle: {
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
  urgencyScoreBadge: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgencyScoreText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00F0FF',
  },
  queueNextText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  queueReasonText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  queueEstTime: {
    fontSize: 9,
    color: '#CBD5E1',
    marginTop: 3,
  },
  queueActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
