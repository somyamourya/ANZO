import AsyncStorage from '@react-native-async-storage/async-storage';
import { MangaPage } from '../types/manga';

export interface StorageBreakdown {
  mangaBytes: number;
  novelBytes: number;
  totalMbFormatted: string;
  totalChaptersCached: number;
}

export interface BulkDownloadJob {
  id: string;
  type: 'MANGA' | 'NOVEL';
  title: string;
  chapterIds: string[];
  totalChapters: number;
  completedChapters: number;
  status: 'QUEUED' | 'DOWNLOADING' | 'COMPLETED' | 'FAILED';
}

const STORAGE_MANGA_PAGES_PREFIX = '@animenext_offline_pages_';
const STORAGE_NOVEL_TEXT_PREFIX = '@animenext_offline_novel_';

export async function saveMangaChapterOffline(
  chapterId: string,
  pages: MangaPage[]
): Promise<void> {
  await AsyncStorage.setItem(
    `${STORAGE_MANGA_PAGES_PREFIX}${chapterId}`,
    JSON.stringify(pages)
  );
}

export async function getMangaChapterOffline(
  chapterId: string
): Promise<MangaPage[] | null> {
  const data = await AsyncStorage.getItem(`${STORAGE_MANGA_PAGES_PREFIX}${chapterId}`);
  return data ? JSON.parse(data) : null;
}

export async function saveNovelChapterOffline(
  novelId: string,
  chapterNumber: number,
  prose: string
): Promise<void> {
  await AsyncStorage.setItem(
    `${STORAGE_NOVEL_TEXT_PREFIX}${novelId}_${chapterNumber}`,
    prose
  );
}

export async function getNovelChapterOffline(
  novelId: string,
  chapterNumber: number
): Promise<string | null> {
  return AsyncStorage.getItem(`${STORAGE_NOVEL_TEXT_PREFIX}${novelId}_${chapterNumber}`);
}

export async function calculateStorageUsage(): Promise<StorageBreakdown> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const mangaKeys = keys.filter((k) => k.startsWith(STORAGE_MANGA_PAGES_PREFIX));
    const novelKeys = keys.filter((k) => k.startsWith(STORAGE_NOVEL_TEXT_PREFIX));

    // Estimate ~1.2 MB per manga chapter bundle, ~25 KB per novel chapter text
    const mangaBytes = mangaKeys.length * 1.2 * 1024 * 1024;
    const novelBytes = novelKeys.length * 25 * 1024;
    const totalMb = (mangaBytes + novelBytes) / (1024 * 1024);

    return {
      mangaBytes,
      novelBytes,
      totalMbFormatted: `${totalMb.toFixed(1)} MB`,
      totalChaptersCached: mangaKeys.length + novelKeys.length,
    };
  } catch {
    return {
      mangaBytes: 0,
      novelBytes: 0,
      totalMbFormatted: '0.0 MB',
      totalChaptersCached: 0,
    };
  }
}

export function estimateChaptersSize(
  chapterCount: number,
  type: 'manga' | 'novel' = 'manga'
): string {
  if (type === 'manga') {
    const mb = chapterCount * 1.2;
    return `${mb.toFixed(1)} MB`;
  }
  const kb = chapterCount * 25;
  if (kb >= 1024) {
    return `${(kb / 1024).toFixed(1)} MB`;
  }
  return `${kb} KB`;
}

export function calculateStorageSavings(
  totalChapters: number,
  rawBytes: number,
  compressedBytes: number
): { savedBytes: number; savedPercentage: number } {
  const savedBytes = Math.max(0, rawBytes - compressedBytes);
  const savedPercentage = rawBytes > 0 ? Math.round((savedBytes / rawBytes) * 100) : 0;
  return { savedBytes, savedPercentage };
}
