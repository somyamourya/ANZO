import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Platform,
} from 'react-native';
import { UnifiedAnime, WatchStatus, EpisodeInfo } from '../types/anime';
import { getEnrichedAnimeDetails, generateEpisodeList } from '../api/metadataAggregator';
import { GenreBadge } from '../components/common/GenreBadge';
import { AnimeCard } from '../components/common/AnimeCard';
import { useWatchProgress } from '../context/WatchProgressContext';
import { useDownloads } from '../context/DownloadContext';
import { CrossMediaConnections } from '../components/common/CrossMediaConnections';
import { colors, borderRadius, shadows } from '../theme';
import { formatScore, formatSeason } from '../utils/formatters';

interface DetailsScreenProps {
  animeId: number;
  onBack: () => void;
  onPlayEpisode: (anime: UnifiedAnime, episodeNumber: number) => void;
  onSelectRelatedAnime: (id: number) => void;
  onSelectManga?: (mangaId: string) => void;
  onSelectNovel?: (novelId: string) => void;
}

const STATUS_OPTIONS: { label: string; value: WatchStatus }[] = [
  { label: 'Watching', value: 'WATCHING' },
  { label: 'Plan to Watch', value: 'PLANNING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'On Hold', value: 'ON_HOLD' },
  { label: 'Dropped', value: 'DROPPED' },
  { label: 'Favorite', value: 'FAVORITE' },
];

export const DetailsScreen: React.FC<DetailsScreenProps> = ({
  animeId,
  onBack,
  onPlayEpisode,
  onSelectRelatedAnime,
  onSelectManga,
  onSelectNovel,
}) => {
  const [anime, setAnime] = useState<UnifiedAnime | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'episodes' | 'characters' | 'relations' | 'themes'>('episodes');
  const [showStatusModal, setShowStatusModal] = useState(false);

  const { getAnimeStatus, setWatchStatus, getAnimeProgress } = useWatchProgress();
  const { addDownload, isEpisodeDownloaded } = useDownloads();

  const currentStatus = anime ? getAnimeStatus(anime.id) : null;
  const progress = anime ? getAnimeProgress(anime.id) : null;

  useEffect(() => {
    loadDetails();
  }, [animeId]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const data = await getEnrichedAnimeDetails(animeId);
      setAnime(data);
    } catch (e) {
      console.warn('Failed to load anime details:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !anime) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Fetching 4-API Unified Metadata...</Text>
      </View>
    );
  }

  const title = anime.title.english || anime.title.romaji || anime.title.userPreferred || 'Anime';
  const episodesList = generateEpisodeList(anime.episodes);
  const nextEpToWatch = progress ? Math.min(progress.currentEpisode + (progress.percentage >= 85 ? 1 : 0), episodesList.length) : 1;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* 1. Backdrop and Header Image */}
      <View style={styles.backdropContainer}>
        <Image
          source={{ uri: anime.bannerImage || anime.coverImage.extraLarge }}
          style={styles.backdropImage}
          resizeMode="cover"
        />
        <View style={styles.backdropGradient} />

        {/* Back Button */}
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>

        {/* Metadata Source Badges */}
        <View style={styles.sourceBadgesRow}>
          <View style={styles.sourceBadge}>
            <Text style={styles.sourceBadgeText}>AniList ✓</Text>
          </View>
          {anime.malId && (
            <View style={styles.sourceBadge}>
              <Text style={styles.sourceBadgeText}>MAL #{anime.malId}</Text>
            </View>
          )}
          {anime.tmdbId && (
            <View style={styles.sourceBadge}>
              <Text style={styles.sourceBadgeText}>TMDB 4K</Text>
            </View>
          )}
        </View>
      </View>

      {/* 2. Main Info Card */}
      <View style={styles.mainInfoCard}>
        <View style={styles.topInfoRow}>
          <Image
            source={{ uri: anime.coverImage.large || anime.coverImage.medium }}
            style={styles.posterImage}
            resizeMode="cover"
          />

          <View style={styles.metaDetailsCol}>
            <Text numberOfLines={2} style={styles.animeTitle}>
              {title}
            </Text>
            <Text style={styles.animeSubTitle}>
              {anime.title.native || anime.title.romaji}
            </Text>

            <View style={styles.statsRow}>
              {anime.averageScore && (
                <View style={styles.statChip}>
                  <Text style={styles.starText}>★</Text>
                  <Text style={styles.statText}>{formatScore(anime.averageScore)}</Text>
                </View>
              )}
              <View style={styles.statChip}>
                <Text style={styles.statText}>{anime.format || 'TV'}</Text>
              </View>
              <View style={styles.statChip}>
                <Text style={styles.statText}>
                  {anime.episodes ? `${anime.episodes} EPS` : 'Ongoing'}
                </Text>
              </View>
            </View>

            <Text style={styles.seasonText}>
              {formatSeason(anime.season, anime.seasonYear)} • {anime.status}
            </Text>
          </View>
        </View>

        {/* Genres */}
        <View style={styles.genresRow}>
          {anime.genres.map((g) => (
            <GenreBadge key={g} label={g} size="sm" variant="primary" />
          ))}
        </View>

        {/* Quick Actions (Watch Next Ep, Watchlist Status) */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onPlayEpisode(anime, nextEpToWatch)}
            style={[styles.watchBtn, shadows.neon]}
          >
            <Text style={styles.watchBtnIcon}>▶</Text>
            <Text style={styles.watchBtnText}>
              {progress ? `Resume EP ${progress.currentEpisode}` : `Watch Episode 1`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowStatusModal(!showStatusModal)}
            style={[styles.statusBtn, currentStatus && styles.statusBtnActive]}
          >
            <Text style={styles.statusBtnText}>
              {currentStatus ? `✓ ${currentStatus}` : '+ Watchlist'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Watchlist Status Selector Dropdown */}
        {showStatusModal && (
          <View style={styles.statusDropdown}>
            {STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  setWatchStatus(anime, opt.value);
                  setShowStatusModal(false);
                }}
                style={[
                  styles.statusOption,
                  currentStatus === opt.value && styles.statusOptionSelected,
                ]}
              >
                <Text style={styles.statusOptionText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Synopsis */}
        <Text style={styles.synopsisHeader}>Synopsis</Text>
        <Text style={styles.synopsisText}>{anime.description}</Text>

        {/* Studios */}
        {anime.studios.length > 0 && (
          <Text style={styles.studiosText}>
            Produced by <Text style={styles.studioHighlight}>{anime.studios.join(', ')}</Text>
          </Text>
        )}
      </View>

      {/* Cross-Media Ecosystem (Manga & Light Novel Sources) */}
      <CrossMediaConnections
        currentMediaType="ANIME"
        currentId={anime.id}
        currentTitle={anime.title.english || anime.title.userPreferred || anime.title.romaji || ''}
        onSelectAnime={onSelectRelatedAnime}
        onSelectManga={onSelectManga}
        onSelectNovel={onSelectNovel}
      />

      {/* 3. Navigation Tabs (Episodes, Cast, Relations, Themes) */}
      <View style={styles.tabNavRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('episodes')}
          style={[styles.tabNavItem, activeTab === 'episodes' && styles.tabNavItemActive]}
        >
          <Text style={[styles.tabNavText, activeTab === 'episodes' && styles.tabNavTextActive]}>
            Episodes ({episodesList.length})
          </Text>
        </TouchableOpacity>

        {anime.characters && anime.characters.length > 0 && (
          <TouchableOpacity
            onPress={() => setActiveTab('characters')}
            style={[styles.tabNavItem, activeTab === 'characters' && styles.tabNavItemActive]}
          >
            <Text style={[styles.tabNavText, activeTab === 'characters' && styles.tabNavTextActive]}>
              Characters
            </Text>
          </TouchableOpacity>
        )}

        {anime.relations && anime.relations.length > 0 && (
          <TouchableOpacity
            onPress={() => setActiveTab('relations')}
            style={[styles.tabNavItem, activeTab === 'relations' && styles.tabNavItemActive]}
          >
            <Text style={[styles.tabNavText, activeTab === 'relations' && styles.tabNavTextActive]}>
              Relations
            </Text>
          </TouchableOpacity>
        )}

        {anime.themes && (
          <TouchableOpacity
            onPress={() => setActiveTab('themes')}
            style={[styles.tabNavItem, activeTab === 'themes' && styles.tabNavItemActive]}
          >
            <Text style={[styles.tabNavText, activeTab === 'themes' && styles.tabNavTextActive]}>
              Music
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 4. Tab Content */}
      {activeTab === 'episodes' && (
        <View style={styles.episodesGrid}>
          {episodesList.map((ep) => {
            const isDownloaded = isEpisodeDownloaded(anime.id, ep.number);
            const isCurrent = progress?.currentEpisode === ep.number;
            return (
              <TouchableOpacity
                key={ep.number}
                activeOpacity={0.8}
                onPress={() => onPlayEpisode(anime, ep.number)}
                style={[
                  styles.episodeCard,
                  isCurrent && styles.episodeCardCurrent,
                ]}
              >
                <View style={styles.episodeCardHeader}>
                  <Text style={styles.episodeNumberText}>Episode {ep.number}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      addDownload(
                        anime,
                        ep.number,
                        'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                        []
                      );
                    }}
                    style={styles.downloadIconBtn}
                  >
                    <Text style={styles.downloadIconText}>
                      {isDownloaded ? '✓ Saved' : '📥 Download'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text numberOfLines={1} style={styles.episodeTitleText}>
                  {ep.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {activeTab === 'characters' && anime.characters && (
        <View style={styles.charactersList}>
          {anime.characters.map((char) => (
            <View key={char.id} style={styles.characterCard}>
              <Image
                source={{ uri: char.image?.large || char.image?.medium }}
                style={styles.charAvatar}
              />
              <View style={styles.charInfo}>
                <Text style={styles.charName}>{char.name.full}</Text>
                <Text style={styles.charRole}>{char.role}</Text>
                {char.voiceActor && (
                  <Text style={styles.vaText}>
                    VA: {char.voiceActor.name} ({char.voiceActor.language})
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {activeTab === 'relations' && anime.relations && (
        <View style={styles.relationsList}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={anime.relations}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onSelectRelatedAnime(item.id)}
                style={styles.relationCard}
              >
                <Image
                  source={{ uri: item.coverImage.large || item.coverImage.medium }}
                  style={styles.relationImage}
                />
                <Text numberOfLines={1} style={styles.relationType}>
                  {item.relationType}
                </Text>
                <Text numberOfLines={2} style={styles.relationTitle}>
                  {item.title.english || item.title.romaji || item.title.userPreferred}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {activeTab === 'themes' && anime.themes && (
        <View style={styles.themesContainer}>
          {anime.themes.openings && anime.themes.openings.length > 0 && (
            <View style={styles.themeSection}>
              <Text style={styles.themeHeader}>🎵 Opening Themes (OP)</Text>
              {anime.themes.openings.map((op, i) => (
                <Text key={i} style={styles.themeTrackText}>
                  {op}
                </Text>
              ))}
            </View>
          )}

          {anime.themes.endings && anime.themes.endings.length > 0 && (
            <View style={styles.themeSection}>
              <Text style={styles.themeHeader}>🎼 Ending Themes (ED)</Text>
              {anime.themes.endings.map((ed, i) => (
                <Text key={i} style={styles.themeTrackText}>
                  {ed}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* 5. Recommendations Shelf */}
      {anime.recommendations && anime.recommendations.length > 0 && (
        <View style={styles.recSection}>
          <Text style={styles.recTitle}>Recommended For You</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={anime.recommendations}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <AnimeCard anime={item} onPress={() => onSelectRelatedAnime(item.id)} />
            )}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 12,
    fontSize: 13,
  },
  backdropContainer: {
    width: '100%',
    height: 280,
    position: 'relative',
  },
  backdropImage: {
    width: '100%',
    height: '100%',
  },
  backdropGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 13, 19, 0.65)',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 28 : 16,
    left: 16,
    backgroundColor: 'rgba(11, 13, 19, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  sourceBadgesRow: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    flexDirection: 'row',
  },
  sourceBadge: {
    backgroundColor: 'rgba(11, 13, 19, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  sourceBadgeText: {
    color: '#67E8F9',
    fontSize: 10,
    fontWeight: '700',
  },
  mainInfoCard: {
    padding: 16,
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    marginTop: -20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  topInfoRow: {
    flexDirection: 'row',
  },
  posterImage: {
    width: 100,
    height: 145,
    borderRadius: borderRadius.md,
  },
  metaDetailsCol: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  animeTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },
  animeSubTitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    marginRight: 6,
  },
  starText: {
    color: '#FBBF24',
    fontSize: 11,
    marginRight: 3,
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  seasonText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 6,
  },
  genresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    marginTop: 14,
  },
  watchBtn: {
    flex: 1.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: borderRadius.xl,
    marginRight: 10,
  },
  watchBtnIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    marginRight: 6,
  },
  watchBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  statusBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statusBtnActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    borderColor: colors.primary,
  },
  statusBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  statusDropdown: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
  },
  statusOptionSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  statusOptionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  synopsisHeader: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 6,
  },
  synopsisText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  studiosText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 10,
  },
  studioHighlight: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tabNavRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: borderRadius.lg,
    padding: 4,
  },
  tabNavItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: borderRadius.md,
  },
  tabNavItemActive: {
    backgroundColor: colors.primary,
  },
  tabNavText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  tabNavTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  episodesGrid: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  episodeCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  episodeCardCurrent: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  episodeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  episodeNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  downloadIconBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  downloadIconText: {
    color: '#67E8F9',
    fontSize: 11,
    fontWeight: '600',
  },
  episodeTitleText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  charactersList: {
    padding: 16,
  },
  characterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 10,
    borderRadius: borderRadius.lg,
    marginBottom: 8,
  },
  charAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  charInfo: {
    marginLeft: 12,
    flex: 1,
  },
  charName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  charRole: {
    color: colors.textMuted,
    fontSize: 11,
  },
  vaText: {
    color: '#A78BFA',
    fontSize: 11,
    marginTop: 2,
  },
  relationsList: {
    paddingLeft: 16,
    paddingTop: 12,
  },
  relationCard: {
    width: 120,
    marginRight: 12,
  },
  relationImage: {
    width: '100%',
    height: 160,
    borderRadius: borderRadius.md,
  },
  relationType: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  relationTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 2,
  },
  themesContainer: {
    padding: 16,
  },
  themeSection: {
    marginBottom: 16,
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: borderRadius.lg,
  },
  themeHeader: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  themeTrackText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  recSection: {
    marginTop: 20,
    paddingLeft: 16,
  },
  recTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
});
