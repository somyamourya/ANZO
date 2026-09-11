import { searchAnime } from './anilist';
import { resolveMangaSearch } from './manga/mangaResolver';
import { resolveNovelSearch } from './novel/novelResolver';
import { UniversalMediaResult, UniversalFilterType } from '../types/universalSearch';

/**
 * Executes a high-performance cross-media universal search across
 * Anime (AniList / MAL), Manga (MangaDex / Asura / Kakalot / Pill), and Light Novels (NovelFull / NovelBin / ReadLightNovel).
 */
export async function executeUniversalSearch(
  query: string,
  filterType: UniversalFilterType = 'ALL',
  genreFilter?: string
): Promise<UniversalMediaResult[]> {
  const cleanQuery = query.trim();

  const promises: [
    Promise<any>,
    Promise<any>,
    Promise<any>
  ] = [
    filterType === 'ALL' || filterType === 'ANIME'
      ? searchAnime({ search: cleanQuery || undefined, genre: genreFilter, perPage: 12 })
      : Promise.resolve({ animeList: [] }),

    filterType === 'ALL' || filterType === 'MANGA'
      ? resolveMangaSearch(cleanQuery || 'trending')
      : Promise.resolve([]),

    filterType === 'ALL' || filterType === 'NOVEL'
      ? resolveNovelSearch(cleanQuery || 'cultivation')
      : Promise.resolve([]),
  ];

  const [animeRes, mangaRes, novelRes] = await Promise.allSettled(promises);

  const animeList = animeRes.status === 'fulfilled' ? animeRes.value?.animeList || [] : [];
  const mangaList = mangaRes.status === 'fulfilled' ? mangaRes.value || [] : [];
  const novelList = novelRes.status === 'fulfilled' ? novelRes.value || [] : [];

  // 1. Normalize Anime Results
  const normalizedAnime: UniversalMediaResult[] = animeList.map((anime: any) => ({
    id: anime.id,
    mediaType: 'ANIME',
    title: anime.title.english || anime.title.romaji || anime.title.userPreferred || 'Untitled Anime',
    coverUrl: anime.coverImage.large || anime.coverImage.medium,
    rating: (anime.averageScore || 80) / 10,
    status: anime.status || 'RELEASING',
    genres: anime.genres || [],
    sourceProvider: 'AniList & TMDB',
    totalUnits: anime.episodes || 12,
    latestUnit: anime.episodes ? `Ep ${anime.episodes}` : 'Ongoing',
    rawAnime: anime,
  }));

  // 2. Normalize Manga Results
  const normalizedManga: UniversalMediaResult[] = mangaList.map((manga: any) => ({
    id: manga.id,
    mediaType: 'MANGA',
    title: manga.title,
    coverUrl: manga.coverUrl,
    rating: manga.rating || 9.0,
    status: manga.status || 'ONGOING',
    genres: manga.genres || [],
    sourceProvider: manga.source || 'MangaDex',
    totalUnits: manga.totalChapters || 100,
    latestUnit: manga.totalChapters ? `Ch ${manga.totalChapters}` : 'Latest',
    rawManga: manga,
  }));

  // 3. Normalize Light Novel Results
  const normalizedNovels: UniversalMediaResult[] = novelList.map((novel: any) => ({
    id: novel.id,
    mediaType: 'NOVEL',
    title: novel.title,
    coverUrl: novel.coverUrl,
    rating: novel.rating || 9.2,
    status: novel.status || 'ONGOING',
    genres: novel.genres || [],
    sourceProvider: novel.source || 'NovelFull',
    totalUnits: novel.totalChapters || 250,
    latestUnit: novel.totalChapters ? `Ch ${novel.totalChapters}` : 'Latest',
    rawNovel: novel,
  }));

  // Interleave results cleanly when viewing 'ALL'
  if (filterType === 'ANIME') return normalizedAnime;
  if (filterType === 'MANGA') return normalizedManga;
  if (filterType === 'NOVEL') return normalizedNovels;

  const combined: UniversalMediaResult[] = [];
  const maxLen = Math.max(normalizedAnime.length, normalizedManga.length, normalizedNovels.length);

  for (let i = 0; i < maxLen; i++) {
    if (normalizedAnime[i]) combined.push(normalizedAnime[i]);
    if (normalizedManga[i]) combined.push(normalizedManga[i]);
    if (normalizedNovels[i]) combined.push(normalizedNovels[i]);
  }

  return combined;
}
