import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { UnifiedAnime } from '../types/anime';
import { getTrendingAnime, getPopularSeasonAnime, getTopRatedAnime } from '../api/anilist';
import { HeroBanner } from '../components/common/HeroBanner';
import { AnimeCard } from '../components/common/AnimeCard';
import { useWatchProgress } from '../context/WatchProgressContext';
import { useReadingProgress } from '../context/ReadingProgressContext';
import { useGamification } from '../context/GamificationContext';
import { useSettings } from '../context/SettingsContext';
import { UnifiedContinueQueue } from '../components/common/UnifiedContinueQueue';
import { IntelligentQueueView } from '../components/zenkai/IntelligentQueueView';
import { ZenkaiRecommendationSection } from '../components/zenkai/ZenkaiRecommendationSection';
import { SmartZenkaiHubModal } from '../components/zenkai/SmartZenkaiHubModal';
import {
  generateIntelligentQueue,
  getBecauseYouWatchedRecommendations,
  getBecauseYouReadRecommendations,
} from '../api/zenkai/zenkaiEngine';
import { ZenkaiRecommendationItem, IntelligentQueueItem } from '../types/zenkai';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Ionicons } from '@expo/vector-icons';

interface HomeScreenProps {
  onSelectAnime: (animeId: number) => void;
  onQuickWatch: (anime: UnifiedAnime, episode: number) => void;
  onSelectManga?: (mangaId: string) => void;
  onSelectNovel?: (novelId: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectAnime,
  onQuickWatch,
  onSelectManga,
  onSelectNovel,
}) => {
  const { continueWatching, progressList } = useWatchProgress();
  const { mangaProgress, novelProgress } = useReadingProgress();
  const { levelProgress, streak, checkInDaily } = useGamification();
  const { activeTheme } = useSettings();

  const [trending, setTrending] = useState<UnifiedAnime[]>([]);
  const [popularSeason, setPopularSeason] = useState<UnifiedAnime[]>([]);
  const [topRated, setTopRated] = useState<UnifiedAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showZenkaiHubModal, setShowZenkaiHubModal] = useState(false);

  useEffect(() => {
    loadHomeContent();
  }, []);

  const loadHomeContent = async () => {
    try {
      setLoading(true);
      const [trendingData, seasonData, topData] = await Promise.all([
        getTrendingAnime(1, 15),
        getPopularSeasonAnime('FALL', 2024, 1, 15),
        getTopRatedAnime(1, 15),
      ]);

      setTrending(trendingData);
      setPopularSeason(seasonData);
      setTopRated(topData);
    } catch (error) {
      console.warn('Failed to load home anime feeds:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHomeContent();
  };

  const spotlightAnime = trending[0] || null;

  // Smart Zenkai Data
  const intelligentQueue = generateIntelligentQueue(
    progressList,
    mangaProgress,
    novelProgress
  );

  const primaryWatched = continueWatching[0]?.animeTitle || 'Solo Leveling';
  const becauseWatchedSection = getBecauseYouWatchedRecommendations(primaryWatched);

  const handleSelectMedia = (type: 'ANIME' | 'MANGA' | 'NOVEL', id: string | number) => {
    if (type === 'ANIME') {
      onSelectAnime(Number(id));
    } else if (type === 'MANGA' && onSelectManga) {
      onSelectManga(String(id));
    } else if (type === 'NOVEL' && onSelectNovel) {
      onSelectNovel(String(id));
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: activeTheme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={activeTheme.colors.primary} />}
    >
      {/* 1. Hero Spotlight Carousel */}
      {spotlightAnime ? (
        <HeroBanner
          anime={spotlightAnime}
          onPressWatch={() => onQuickWatch(spotlightAnime, 1)}
          onPressDetails={() => onSelectAnime(spotlightAnime.id)}
        />
      ) : loading ? (
        <View style={styles.heroLoader}>
          <ActivityIndicator size="large" color={activeTheme.colors.primary} />
        </View>
      ) : null}

      {/* Gamification Quick Status Widget */}
      <View style={styles.gamificationWidget}>
        <View style={styles.widgetLeft}>
          <View style={[styles.widgetRankBadge, { borderColor: levelProgress.rank.color, backgroundColor: levelProgress.rank.color + '15' }]}>
            <Text style={styles.widgetRankIcon}>{levelProgress.rank.icon}</Text>
            <Text style={[styles.widgetRankText, { color: levelProgress.rank.color }]}>
              {levelProgress.rank.label} LVL {levelProgress.currentLevel}
            </Text>
          </View>
          <Text style={styles.widgetExpText}>
            {levelProgress.currentExp}/{levelProgress.nextLevelExp} XP
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.widgetStreakBtn, streak.hasCheckedInToday && styles.widgetStreakBtnDone]}
          onPress={checkInDaily}
        >
          <Text style={styles.widgetStreakEmoji}>🔥</Text>
          <Text style={[styles.widgetStreakText, streak.hasCheckedInToday && { color: '#10B981' }]}>
            {streak.currentStreakDays}d Streak {streak.hasCheckedInToday ? '✓' : '+XP'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. Smart Zenkai Discovery AI Banner Trigger */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setShowZenkaiHubModal(true)}
        style={[
          styles.zenkaiTriggerBanner,
          {
            backgroundColor: activeTheme.colors.card,
            borderColor: activeTheme.colors.primary,
          },
          shadows.neon,
        ]}
      >
        <View style={styles.zenkaiTriggerLeft}>
          <View style={[styles.zenkaiIconCircle, { backgroundColor: activeTheme.colors.badgeBg }]}>
            <Text style={{ fontSize: 18 }}>⚡</Text>
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.zenkaiTriggerTitle, { color: activeTheme.colors.textPrimary }]}>
                Smart Zenkai AI Hub
              </Text>
              <View style={styles.zenkaiLiveTag}>
                <Text style={styles.zenkaiLiveText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.zenkaiTriggerSub}>
              Because-You-Watched & Cross-Media Continuations
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={activeTheme.colors.primary} />
      </TouchableOpacity>

      {/* 3. Intelligent Up-Next Queue */}
      <IntelligentQueueView
        items={intelligentQueue}
        onSelectItem={(qItem: IntelligentQueueItem) => handleSelectMedia(qItem.mediaType, qItem.mediaId)}
      />

      {/* 4. Because You Watched Zenkai Recommendations */}
      <ZenkaiRecommendationSection
        section={becauseWatchedSection}
        onSelectItem={(rec: ZenkaiRecommendationItem) => handleSelectMedia(rec.mediaType, rec.id)}
      />

      {/* 5. Trending Now Shelf */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 Trending Now</Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={[styles.viewAllText, { color: activeTheme.colors.primary }]}>View All ›</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={trending}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.horizontalListPadding}
          renderItem={({ item }) => (
            <AnimeCard anime={item} onPress={() => onSelectAnime(item.id)} />
          )}
        />
      </View>

      {/* 6. Popular This Season */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>✨ Popular This Season</Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={[styles.viewAllText, { color: activeTheme.colors.primary }]}>View All ›</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={popularSeason}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.horizontalListPadding}
          renderItem={({ item }) => (
            <AnimeCard anime={item} onPress={() => onSelectAnime(item.id)} />
          )}
        />
      </View>

      {/* 7. Top 100 Rated All-Time */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏆 All-Time Highest Rated</Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={[styles.viewAllText, { color: activeTheme.colors.primary }]}>View All ›</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={topRated}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.horizontalListPadding}
          renderItem={({ item }) => (
            <AnimeCard anime={item} onPress={() => onSelectAnime(item.id)} />
          )}
        />
      </View>

      {/* Smart Zenkai Hub Modal */}
      <SmartZenkaiHubModal
        visible={showZenkaiHubModal}
        onClose={() => setShowZenkaiHubModal(false)}
        onSelectMedia={handleSelectMedia}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: 90,
  },
  heroLoader: {
    height: 360,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  gamificationWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginHorizontal: 16,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  widgetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  widgetRankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  widgetRankIcon: {
    fontSize: 10,
  },
  widgetRankText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  widgetExpText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  widgetStreakBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  widgetStreakBtnDone: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  widgetStreakEmoji: {
    fontSize: 12,
  },
  widgetStreakText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  zenkaiTriggerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
  },
  zenkaiTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  zenkaiIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zenkaiTriggerTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  zenkaiLiveTag: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  zenkaiLiveText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  zenkaiTriggerSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  viewAllText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  horizontalListPadding: {
    paddingHorizontal: 16,
  },
});
