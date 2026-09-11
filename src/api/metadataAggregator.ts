import { UnifiedAnime, EpisodeInfo } from '../types/anime';
import { getAnimeDetailsById } from './anilist';
import { fetchKitsuByTitle } from './kitsu';
import { fetchJikanById } from './jikan';
import { fetchTMDBArtwork } from './tmdb';

// In-memory LRU-like cache for enriched anime metadata
const metadataCache = new Map<number, UnifiedAnime>();

export async function getEnrichedAnimeDetails(anilistId: number): Promise<UnifiedAnime | null> {
  if (metadataCache.has(anilistId)) {
    return metadataCache.get(anilistId)!;
  }

  // 1. Fetch primary metadata from AniList
  const anilistData = await getAnimeDetailsById(anilistId);
  if (!anilistData) return null;

  const titleForSearch =
    anilistData.title.english || anilistData.title.romaji || anilistData.title.userPreferred || '';

  // 2. Concurrently fetch secondary data from MAL (Jikan), Kitsu, and TMDB
  const [jikanRes, kitsuRes, tmdbRes] = await Promise.allSettled([
    anilistData.malId ? fetchJikanById(anilistData.malId) : Promise.resolve(null),
    fetchKitsuByTitle(titleForSearch),
    fetchTMDBArtwork(titleForSearch, anilistData.seasonYear),
  ]);

  const jikanData = jikanRes.status === 'fulfilled' ? jikanRes.value : null;
  const kitsuData = kitsuRes.status === 'fulfilled' ? kitsuRes.value : null;
  const tmdbData = tmdbRes.status === 'fulfilled' ? tmdbRes.value : null;

  // 3. Merge all metadata fields
  const enriched: UnifiedAnime = {
    ...anilistData,
    kitsuId: kitsuData?.id,
    tmdbId: tmdbData?.tmdbId,
    // Use TMDB 4K backdrop if available, fallback to AniList banner
    bannerImage: tmdbData?.backdropUrl || anilistData.bannerImage,
    tmdbBackdrop: tmdbData?.backdropUrl,
    tmdbLogo: tmdbData?.logoUrl,
    // If description missing in AniList, fallback to Kitsu
    description: anilistData.description || kitsuData?.synopsis || 'No description available.',
    // Enhance theme music tracks from MAL/Jikan
    themes: jikanData?.themes
      ? {
          openings: jikanData.themes.openings,
          endings: jikanData.themes.endings,
        }
      : undefined,
  };

  metadataCache.set(anilistId, enriched);
  return enriched;
}

export function generateEpisodeList(totalEpisodes?: number): EpisodeInfo[] {
  const count = totalEpisodes && totalEpisodes > 0 ? totalEpisodes : 24;
  const list: EpisodeInfo[] = [];

  for (let i = 1; i <= count; i++) {
    list.push({
      number: i,
      title: `Episode ${i}`,
      synopsis: `Watch Episode ${i} with multiple servers and subtitles.`,
    });
  }

  return list;
}
