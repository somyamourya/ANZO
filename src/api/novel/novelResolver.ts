import { NovelItem, NovelChapter } from '../../types/novel';
import { getPopularNovelFull, getCuratedNovelsList, getNovelFullChapterText } from './novelfull';
import { searchNovelFire } from './novelfire';
import { searchNovelBin, getNovelBinChapterText } from './novelbin';
import { searchReadLightNovel, getReadLightNovelChapterText } from './readlightnovel';
import { searchBoxNovel, getBoxNovelChapterText } from './boxnovel';

export interface NovelSourceOption {
  id: string;
  name: string;
  badge: string;
  isFast: boolean;
  pingMs: number;
}

export const AVAILABLE_NOVEL_SOURCES: NovelSourceOption[] = [
  { id: 'NovelFull', name: 'NovelFull (Primary CDN)', badge: 'Full TOC', isFast: true, pingMs: 40 },
  { id: 'NovelBin', name: 'NovelBin High-Speed Mirror', badge: 'Latest Raws', isFast: true, pingMs: 48 },
  { id: 'ReadLightNovel', name: 'ReadLightNovel HD', badge: 'Typeset Clean', isFast: true, pingMs: 52 },
  { id: 'BoxNovel', name: 'BoxNovel Wuxia/Xianxia', badge: 'Cultivation Library', isFast: true, pingMs: 58 },
  { id: 'FreeWebNovel', name: 'FreeWebNovel Fast Mirror', badge: 'Fast Scrapes', isFast: true, pingMs: 65 },
  { id: 'WuxiaWorld', name: 'WuxiaWorld Official', badge: 'Official License', isFast: false, pingMs: 85 },
  { id: 'NovelFire', name: 'NovelFire Proxy', badge: 'Backup Mirror', isFast: false, pingMs: 95 },
];

export async function resolveTrendingNovels(): Promise<NovelItem[]> {
  try {
    const popular = await getPopularNovelFull();
    if (popular.length > 0) return popular;
  } catch {
    // fallback
  }
  return getCuratedNovelsList();
}

export async function resolveNovelSearch(query: string): Promise<NovelItem[]> {
  const curated = getCuratedNovelsList();
  const [fireRes, binRes, rlnRes, boxRes] = await Promise.allSettled([
    searchNovelFire(query),
    searchNovelBin(query),
    searchReadLightNovel(query),
    searchBoxNovel(query),
  ]);

  const fire = fireRes.status === 'fulfilled' ? fireRes.value : [];
  const bin = binRes.status === 'fulfilled' ? binRes.value : [];
  const rln = rlnRes.status === 'fulfilled' ? rlnRes.value : [];
  const box = boxRes.status === 'fulfilled' ? boxRes.value : [];

  const clean = query.toLowerCase().trim();
  const matchedCurated = curated.filter(
    (n) =>
      n.title.toLowerCase().includes(clean) ||
      n.author.toLowerCase().includes(clean) ||
      n.genres.some((g) => g.toLowerCase().includes(clean))
  );

  const combined = [...matchedCurated, ...bin, ...rln, ...box, ...fire];
  return combined.length > 0 ? combined : resolveTrendingNovels();
}

export async function resolveNovelDetails(
  novelId: string,
  preferredSource = 'NovelFull'
): Promise<{
  novel: NovelItem;
  chapters: NovelChapter[];
}> {
  const allNovels = getCuratedNovelsList();
  const novel = allNovels.find((n) => n.id === novelId) || allNovels[0];

  const chapters: NovelChapter[] = Array.from(
    { length: Math.min(novel.totalChapters, 80) },
    (_, i) => ({
      id: `${novel.id}_ch_${i + 1}`,
      chapterNumber: i + 1,
      title: `Chapter ${i + 1}: The Awakened Awakening`,
      releaseDate: 'Recent',
    })
  );

  return { novel, chapters };
}

export async function resolveNovelChapterText(
  novelId: string,
  chapterNumber: number,
  preferredSource = 'NovelFull'
): Promise<string> {
  if (preferredSource === 'NovelBin' || novelId.startsWith('novelbin_')) {
    return getNovelBinChapterText(novelId, chapterNumber);
  }
  if (preferredSource === 'ReadLightNovel' || novelId.startsWith('rln_')) {
    return getReadLightNovelChapterText(novelId, chapterNumber);
  }
  if (preferredSource === 'BoxNovel' || novelId.startsWith('box_')) {
    return getBoxNovelChapterText(novelId, chapterNumber);
  }
  return getNovelFullChapterText(novelId, chapterNumber);
}
