import { MangaItem, MangaVolume, MangaPage, MangaChapter } from '../../types/manga';
import {
  getTrendingManga,
  searchManga,
  getMangaDetails,
  getMangaVolumesAndChapters,
  getChapterPages,
} from './mangadex';
import { searchWeebCentral } from './weebcentral';
import { searchMangaKakalot, getMangaKakalotChapters, getMangaKakalotPages } from './mangakakalot';
import { searchMangaPill, getMangaPillChapters, getMangaPillPages } from './mangapill';
import { searchManhwaScans, getManhwaScansChapters, getManhwaScansPages } from './manhwascans';
import { collateChaptersIntoVolumes } from '../../utils/chapterParser';

export interface MangaSourceOption {
  id: string;
  name: string;
  badge: string;
  isFast: boolean;
  pingMs: number;
}

export const AVAILABLE_MANGA_SOURCES: MangaSourceOption[] = [
  { id: 'MangaDex', name: 'MangaDex (Official API v5)', badge: 'HQ Scanlations', isFast: true, pingMs: 45 },
  { id: 'AsuraScans', name: 'Asura / Flame Scans (Webtoons)', badge: 'Full Color HD', isFast: true, pingMs: 38 },
  { id: 'MangaKakalot', name: 'MangaKakalot / Manganato', badge: 'Fast Mirror', isFast: true, pingMs: 55 },
  { id: 'MangaPill', name: 'MangaPill Direct', badge: 'Ad-Free CDN', isFast: true, pingMs: 62 },
  { id: 'WeebCentral', name: 'WeebCentral Multi-Audio', badge: 'Backup Mirror', isFast: false, pingMs: 90 },
];

export async function resolveTrendingManga(): Promise<MangaItem[]> {
  const mangadex = await getTrendingManga(20);
  if (mangadex.length > 0) return mangadex;

  // Curated Fallback
  return [
    {
      id: 'solo_leveling_manga',
      title: 'Solo Leveling (Chugong)',
      description: '10 years ago, after "the Gate" that connected the real world with the monster world opened, some of the ordinary, everyday people received the power to hunt monsters.',
      coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      status: 'COMPLETED',
      rating: 9.8,
      genres: ['Action', 'Fantasy', 'Manhwa', 'Webtoon'],
      tags: ['Dungeon', 'Monsters', 'System'],
      source: 'AsuraScans',
    },
    {
      id: 'jujutsu_kaisen_manga',
      title: 'Jujutsu Kaisen',
      description: 'A boy swallowed a cursed talisman - the finger of the Demon, and became the curse himself.',
      coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      status: 'ONGOING',
      rating: 8.9,
      genres: ['Action', 'Demons', 'Shounen'],
      tags: ['Curses', 'Sorcery'],
      source: 'MangaDex',
    },
    {
      id: 'chainsaw_man_manga',
      title: 'Chainsaw Man',
      description: 'Denji had a simple dream—to live a happy and peaceful life, spending time with a girl he likes.',
      coverUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
      status: 'ONGOING',
      rating: 9.0,
      genres: ['Action', 'Gore', 'Dark Fantasy'],
      tags: ['Devils', 'Chaos'],
      source: 'MangaPill',
    },
  ];
}

export async function resolveMangaSearch(query: string): Promise<MangaItem[]> {
  const [mdRes, asuraRes, kakalotRes, pillRes, wcRes] = await Promise.allSettled([
    searchManga(query),
    searchManhwaScans(query),
    searchMangaKakalot(query),
    searchMangaPill(query),
    searchWeebCentral(query),
  ]);

  const mdList = mdRes.status === 'fulfilled' ? mdRes.value : [];
  const asuraList = asuraRes.status === 'fulfilled' ? asuraRes.value : [];
  const kakalotList = kakalotRes.status === 'fulfilled' ? kakalotRes.value : [];
  const pillList = pillRes.status === 'fulfilled' ? pillRes.value : [];
  const wcList = wcRes.status === 'fulfilled' ? wcRes.value : [];

  const combined = [...mdList, ...asuraList, ...kakalotList, ...pillList, ...wcList];
  return combined.length > 0 ? combined : resolveTrendingManga();
}

export async function resolveMangaFullDetails(
  mangaId: string,
  preferredSource = 'MangaDex'
): Promise<{
  manga: MangaItem | null;
  volumes: MangaVolume[];
}> {
  if (preferredSource === 'AsuraScans' || mangaId.startsWith('asura_')) {
    const chapters = await getManhwaScansChapters(mangaId);
    const volumes = collateChaptersIntoVolumes(chapters, 15);
    const trending = await resolveTrendingManga();
    const manga = trending.find((m) => m.id === mangaId) || trending[0];
    return { manga, volumes };
  }

  if (preferredSource === 'MangaKakalot' || mangaId.startsWith('kakalot_')) {
    const chapters = await getMangaKakalotChapters(mangaId);
    const volumes = collateChaptersIntoVolumes(chapters, 12);
    const trending = await resolveTrendingManga();
    const manga = trending.find((m) => m.id === mangaId) || trending[0];
    return { manga, volumes };
  }

  if (preferredSource === 'MangaPill' || mangaId.startsWith('pill_')) {
    const chapters = await getMangaPillChapters(mangaId);
    const volumes = collateChaptersIntoVolumes(chapters, 10);
    const trending = await resolveTrendingManga();
    const manga = trending.find((m) => m.id === mangaId) || trending[0];
    return { manga, volumes };
  }

  // Default: MangaDex
  const [mangaRes, volumesRes] = await Promise.allSettled([
    getMangaDetails(mangaId),
    getMangaVolumesAndChapters(mangaId),
  ]);

  let manga = mangaRes.status === 'fulfilled' ? mangaRes.value : null;
  let volumes = volumesRes.status === 'fulfilled' ? volumesRes.value : [];

  if (!manga) {
    const trending = await resolveTrendingManga();
    manga = trending.find((m) => m.id === mangaId) || trending[0];
  }

  if (volumes.length === 0) {
    volumes = await getMangaVolumesAndChapters(mangaId);
  }

  return { manga, volumes };
}

export async function resolveMangaChapterPages(chapterId: string): Promise<MangaPage[]> {
  if (chapterId.startsWith('asura_')) return getManhwaScansPages(chapterId);
  if (chapterId.startsWith('kakalot_')) return getMangaKakalotPages(chapterId);
  if (chapterId.startsWith('pill_')) return getMangaPillPages(chapterId);
  return getChapterPages(chapterId);
}
