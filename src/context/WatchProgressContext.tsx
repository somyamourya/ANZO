import React, { createContext, useContext, useState, useEffect } from 'react';
import { WatchProgressItem, WatchStatus, UnifiedAnime } from '../types/anime';
import { storage } from '../utils/storage';
import { useAuth } from './AuthContext';
import axios from 'axios';

interface WatchProgressContextType {
  progressList: Record<number, WatchProgressItem>;
  watchlist: Record<number, { anime: UnifiedAnime; status: WatchStatus; addedAt: number }>;
  continueWatching: WatchProgressItem[];
  updateProgress: (
    anime: UnifiedAnime,
    episodeNumber: number,
    currentTime: number,
    duration: number
  ) => Promise<void>;
  setWatchStatus: (anime: UnifiedAnime, status: WatchStatus) => Promise<void>;
  getAnimeStatus: (animeId: number) => WatchStatus | null;
  getAnimeProgress: (animeId: number) => WatchProgressItem | null;
  removeFromWatchlist: (animeId: number) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const PROGRESS_STORAGE_KEY = '@animenext_watch_progress';
const WATCHLIST_STORAGE_KEY = '@animenext_user_watchlist';

const WatchProgressContext = createContext<WatchProgressContextType>({
  progressList: {},
  watchlist: {},
  continueWatching: [],
  updateProgress: async () => {},
  setWatchStatus: async () => {},
  getAnimeStatus: () => null,
  getAnimeProgress: () => null,
  removeFromWatchlist: async () => {},
  clearHistory: async () => {},
});

export const WatchProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progressList, setProgressList] = useState<Record<number, WatchProgressItem>>({});
  const [watchlist, setWatchlist] = useState<
    Record<number, { anime: UnifiedAnime; status: WatchStatus; addedAt: number }>
  >({});
  const { user, updateUserStats } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedProgress = await storage.get<Record<number, WatchProgressItem>>(
        PROGRESS_STORAGE_KEY,
        {}
      );
      const savedWatchlist = await storage.get<
        Record<number, { anime: UnifiedAnime; status: WatchStatus; addedAt: number }>
      >(WATCHLIST_STORAGE_KEY, {});

      setProgressList(savedProgress);
      setWatchlist(savedWatchlist);
    } catch (e) {
      console.warn('Failed to load watch progress data:', e);
    }
  };

  const syncWithAniList = async (mediaId: number, episode: number, isCompleted: boolean) => {
    if (!user.isAniListAuthed || !user.anilistToken) return;

    try {
      const mutation = `
        mutation ($mediaId: Int, $progress: Int, $status: MediaListStatus) {
          SaveMediaListEntry(mediaId: $mediaId, progress: $progress, status: $status) {
            id
            progress
            status
          }
        }
      `;

      await axios.post(
        'https://graphql.anilist.co',
        {
          query: mutation,
          variables: {
            mediaId,
            progress: episode,
            status: isCompleted ? 'COMPLETED' : 'CURRENT',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${user.anilistToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 8000,
        }
      );
    } catch (e) {
      console.warn('[AniList Sync] Failed to sync progress to AniList:', e);
    }
  };

  const updateProgress = async (
    anime: UnifiedAnime,
    episodeNumber: number,
    currentTime: number,
    duration: number
  ) => {
    const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;
    const isCompleted = percentage >= 85;

    const item: WatchProgressItem = {
      animeId: anime.id,
      animeTitle: anime.title.english || anime.title.romaji || anime.title.userPreferred || 'Anime',
      animeCover: anime.coverImage.large || anime.coverImage.medium || '',
      animeBanner: anime.bannerImage,
      currentEpisode: episodeNumber,
      totalEpisodes: anime.episodes,
      currentTime: Math.floor(currentTime),
      duration: Math.floor(duration),
      percentage: Math.min(100, Math.floor(percentage)),
      status: isCompleted ? 'COMPLETED' : 'WATCHING',
      updatedAt: Date.now(),
    };

    const updatedProgress = { ...progressList, [anime.id]: item };
    setProgressList(updatedProgress);
    await storage.set(PROGRESS_STORAGE_KEY, updatedProgress);

    // Auto add to watching list if not present
    if (!watchlist[anime.id]) {
      const updatedList = {
        ...watchlist,
        [anime.id]: {
          anime,
          status: isCompleted ? 'COMPLETED' : ('WATCHING' as WatchStatus),
          addedAt: Date.now(),
        },
      };
      setWatchlist(updatedList);
      await storage.set(WATCHLIST_STORAGE_KEY, updatedList);
    }

    // Sync to AniList account if logged in
    if (isCompleted) {
      updateUserStats(1, Math.floor(duration / 60));
      syncWithAniList(anime.id, episodeNumber, isCompleted);
    }
  };

  const setWatchStatus = async (anime: UnifiedAnime, status: WatchStatus) => {
    const updated = {
      ...watchlist,
      [anime.id]: {
        anime,
        status,
        addedAt: Date.now(),
      },
    };
    setWatchlist(updated);
    await storage.set(WATCHLIST_STORAGE_KEY, updated);
  };

  const removeFromWatchlist = async (animeId: number) => {
    const updated = { ...watchlist };
    delete updated[animeId];
    setWatchlist(updated);
    await storage.set(WATCHLIST_STORAGE_KEY, updated);
  };

  const clearHistory = async () => {
    setProgressList({});
    await storage.remove(PROGRESS_STORAGE_KEY);
  };

  const getAnimeStatus = (animeId: number): WatchStatus | null => {
    return watchlist[animeId]?.status || null;
  };

  const getAnimeProgress = (animeId: number): WatchProgressItem | null => {
    return progressList[animeId] || null;
  };

  const continueWatching = Object.values(progressList)
    .filter((item) => item.percentage < 90)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 15);

  return (
    <WatchProgressContext.Provider
      value={{
        progressList,
        watchlist,
        continueWatching,
        updateProgress,
        setWatchStatus,
        getAnimeStatus,
        getAnimeProgress,
        removeFromWatchlist,
        clearHistory,
      }}
    >
      {children}
    </WatchProgressContext.Provider>
  );
};

export const useWatchProgress = () => useContext(WatchProgressContext);
