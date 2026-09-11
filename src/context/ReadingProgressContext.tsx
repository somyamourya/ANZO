import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  MangaItem,
  MangaReadingProgress,
  OfflineMangaChapter,
  MangaPage,
} from '../types/manga';
import {
  NovelItem,
  NovelReadingProgress,
  OfflineNovelChapter,
  NovelReaderSettings,
} from '../types/novel';
import { storage } from '../utils/storage';

export type ReadingStatus = 'READING' | 'PLAN_TO_READ' | 'COMPLETED' | 'ON_HOLD' | 'DROPPED' | 'FAVORITE';

export const DEFAULT_NOVEL_READER_SETTINGS: NovelReaderSettings = {
  theme: 'oled',
  fontFamily: 'Inter',
  fontSize: 18,
  lineHeight: 1.8,
  paragraphSpacing: 16,
  textAlignment: 'left',
  autoScrollSpeed: 0,
  ttsVoiceRate: 1.0,
  ttsVoicePitch: 1.0,
};

interface ReadingProgressContextType {
  mangaProgress: Record<string, MangaReadingProgress>;
  novelProgress: Record<string, NovelReadingProgress>;
  mangaLibrary: Record<string, { manga: MangaItem; status: ReadingStatus; addedAt: number }>;
  novelLibrary: Record<string, { novel: NovelItem; status: ReadingStatus; addedAt: number }>;
  offlineManga: Record<string, OfflineMangaChapter>;
  offlineNovels: Record<string, OfflineNovelChapter>;
  novelSettings: NovelReaderSettings;
  updateMangaProgress: (
    manga: MangaItem,
    chapterId: string,
    chapterNumber: string,
    pageNumber: number,
    totalPages: number,
    scrollOffset?: number
  ) => Promise<void>;
  updateNovelProgress: (
    novel: NovelItem,
    chapterId: string,
    chapterNumber: number,
    scrollPercentage: number,
    scrollOffset?: number
  ) => Promise<void>;
  setMangaStatus: (manga: MangaItem, status: ReadingStatus) => Promise<void>;
  setNovelStatus: (novel: NovelItem, status: ReadingStatus) => Promise<void>;
  downloadMangaChapter: (
    mangaId: string,
    mangaTitle: string,
    chapterId: string,
    chapterNumber: string,
    pages: MangaPage[]
  ) => Promise<void>;
  downloadNovelChapter: (
    novelId: string,
    chapterId: string,
    chapterNumber: number,
    title: string,
    content: string
  ) => Promise<void>;
  updateNovelSettings: (settings: Partial<NovelReaderSettings>) => Promise<void>;
}

const MANGA_PROGRESS_KEY = '@animenext_manga_progress';
const NOVEL_PROGRESS_KEY = '@animenext_novel_progress';
const MANGA_LIB_KEY = '@animenext_manga_library';
const NOVEL_LIB_KEY = '@animenext_novel_library';
const OFFLINE_MANGA_KEY = '@animenext_offline_manga';
const OFFLINE_NOVEL_KEY = '@animenext_offline_novels';
const NOVEL_SETTINGS_KEY = '@animenext_novel_settings';

const ReadingProgressContext = createContext<ReadingProgressContextType>({
  mangaProgress: {},
  novelProgress: {},
  mangaLibrary: {},
  novelLibrary: {},
  offlineManga: {},
  offlineNovels: {},
  novelSettings: DEFAULT_NOVEL_READER_SETTINGS,
  updateMangaProgress: async () => {},
  updateNovelProgress: async () => {},
  setMangaStatus: async () => {},
  setNovelStatus: async () => {},
  downloadMangaChapter: async () => {},
  downloadNovelChapter: async () => {},
  updateNovelSettings: async () => {},
});

export const ReadingProgressProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mangaProgress, setMangaProgress] = useState<Record<string, MangaReadingProgress>>({});
  const [novelProgress, setNovelProgress] = useState<Record<string, NovelReadingProgress>>({});
  const [mangaLibrary, setMangaLibrary] = useState<
    Record<string, { manga: MangaItem; status: ReadingStatus; addedAt: number }>
  >({});
  const [novelLibrary, setNovelLibrary] = useState<
    Record<string, { novel: NovelItem; status: ReadingStatus; addedAt: number }>
  >({});
  const [offlineManga, setOfflineManga] = useState<Record<string, OfflineMangaChapter>>({});
  const [offlineNovels, setOfflineNovels] = useState<Record<string, OfflineNovelChapter>>({});
  const [novelSettings, setNovelSettings] = useState<NovelReaderSettings>(
    DEFAULT_NOVEL_READER_SETTINGS
  );

  useEffect(() => {
    loadReadingData();
  }, []);

  const loadReadingData = async () => {
    try {
      const [mp, np, ml, nl, om, on, ns] = await Promise.all([
        storage.get(MANGA_PROGRESS_KEY, {}),
        storage.get(NOVEL_PROGRESS_KEY, {}),
        storage.get(MANGA_LIB_KEY, {}),
        storage.get(NOVEL_LIB_KEY, {}),
        storage.get(OFFLINE_MANGA_KEY, {}),
        storage.get(OFFLINE_NOVEL_KEY, {}),
        storage.get(NOVEL_SETTINGS_KEY, DEFAULT_NOVEL_READER_SETTINGS),
      ]);

      setMangaProgress(mp);
      setNovelProgress(np);
      setMangaLibrary(ml);
      setNovelLibrary(nl);
      setOfflineManga(om);
      setOfflineNovels(on);
      setNovelSettings(ns);
    } catch (e) {
      console.warn('Failed to load reading progress:', e);
    }
  };

  const updateMangaProgress = async (
    manga: MangaItem,
    chapterId: string,
    chapterNumber: string,
    pageNumber: number,
    totalPages: number,
    scrollOffset?: number
  ) => {
    const existing = mangaProgress[manga.id];
    // Conflict resolution: only update if timestamp is newer
    if (existing && existing.updatedAt && existing.updatedAt > Date.now()) {
      return;
    }

    const item: MangaReadingProgress = {
      mangaId: manga.id,
      mangaTitle: manga.title,
      mangaCover: manga.coverUrl,
      currentChapterId: chapterId,
      currentChapterNumber: chapterNumber,
      currentPageNumber: pageNumber,
      totalPages,
      updatedAt: Date.now(),
    };

    const next = { ...mangaProgress, [manga.id]: item };
    setMangaProgress(next);
    await storage.set(MANGA_PROGRESS_KEY, next);

    if (!mangaLibrary[manga.id]) {
      const updatedLib = {
        ...mangaLibrary,
        [manga.id]: { manga, status: 'READING' as ReadingStatus, addedAt: Date.now() },
      };
      setMangaLibrary(updatedLib);
      await storage.set(MANGA_LIB_KEY, updatedLib);
    }
  };

  const updateNovelProgress = async (
    novel: NovelItem,
    chapterId: string,
    chapterNumber: number,
    scrollPercentage: number,
    scrollOffset?: number
  ) => {
    const existing = novelProgress[novel.id];
    if (existing && existing.updatedAt && existing.updatedAt > Date.now()) {
      return;
    }

    const item: NovelReadingProgress = {
      novelId: novel.id,
      novelTitle: novel.title,
      novelCover: novel.coverUrl,
      currentChapterId: chapterId,
      currentChapterNumber: chapterNumber,
      scrollPercentage: Math.floor(scrollPercentage),
      updatedAt: Date.now(),
    };

    const next = { ...novelProgress, [novel.id]: item };
    setNovelProgress(next);
    await storage.set(NOVEL_PROGRESS_KEY, next);

    if (!novelLibrary[novel.id]) {
      const updatedLib = {
        ...novelLibrary,
        [novel.id]: { novel, status: 'READING' as ReadingStatus, addedAt: Date.now() },
      };
      setNovelLibrary(updatedLib);
      await storage.set(NOVEL_LIB_KEY, updatedLib);
    }
  };

  const setMangaStatus = async (manga: MangaItem, status: ReadingStatus) => {
    const updated = {
      ...mangaLibrary,
      [manga.id]: { manga, status, addedAt: Date.now() },
    };
    setMangaLibrary(updated);
    await storage.set(MANGA_LIB_KEY, updated);
  };

  const setNovelStatus = async (novel: NovelItem, status: ReadingStatus) => {
    const updated = {
      ...novelLibrary,
      [novel.id]: { novel, status, addedAt: Date.now() },
    };
    setNovelLibrary(updated);
    await storage.set(NOVEL_LIB_KEY, updated);
  };

  const downloadMangaChapter = async (
    mangaId: string,
    mangaTitle: string,
    chapterId: string,
    chapterNumber: string,
    pages: MangaPage[]
  ) => {
    const key = `${mangaId}_ch_${chapterNumber}`;
    const item: OfflineMangaChapter = {
      mangaId,
      chapterId,
      chapterNumber,
      mangaTitle,
      pages,
      downloadedAt: Date.now(),
    };
    const next = { ...offlineManga, [key]: item };
    setOfflineManga(next);
    await storage.set(OFFLINE_MANGA_KEY, next);
  };

  const downloadNovelChapter = async (
    novelId: string,
    chapterId: string,
    chapterNumber: number,
    title: string,
    content: string
  ) => {
    const key = `${novelId}_ch_${chapterNumber}`;
    const item: OfflineNovelChapter = {
      novelId,
      chapterId,
      chapterNumber,
      title,
      content,
      downloadedAt: Date.now(),
    };
    const next = { ...offlineNovels, [key]: item };
    setOfflineNovels(next);
    await storage.set(OFFLINE_NOVEL_KEY, next);
  };

  const updateNovelSettings = async (settings: Partial<NovelReaderSettings>) => {
    const next = { ...novelSettings, ...settings };
    setNovelSettings(next);
    await storage.set(NOVEL_SETTINGS_KEY, next);
  };

  return (
    <ReadingProgressContext.Provider
      value={{
        mangaProgress,
        novelProgress,
        mangaLibrary,
        novelLibrary,
        offlineManga,
        offlineNovels,
        novelSettings,
        updateMangaProgress,
        updateNovelProgress,
        setMangaStatus,
        setNovelStatus,
        downloadMangaChapter,
        downloadNovelChapter,
        updateNovelSettings,
      }}
    >
      {children}
    </ReadingProgressContext.Provider>
  );
};

export const useReadingProgress = () => useContext(ReadingProgressContext);
