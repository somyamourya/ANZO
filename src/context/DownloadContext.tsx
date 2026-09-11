import React, { createContext, useContext, useState, useEffect } from 'react';
import { DownloadItem, SubtitleTrack, UnifiedAnime } from '../types/anime';
import { storage } from '../utils/storage';

interface DownloadContextType {
  downloads: Record<string, DownloadItem>;
  downloadQueue: DownloadItem[];
  addDownload: (
    anime: UnifiedAnime,
    episodeNumber: number,
    videoUrl: string,
    subtitles: SubtitleTrack[],
    quality?: string
  ) => Promise<void>;
  pauseDownload: (id: string) => Promise<void>;
  resumeDownload: (id: string) => Promise<void>;
  deleteDownload: (id: string) => Promise<void>;
  isEpisodeDownloaded: (animeId: number, episodeNumber: number) => boolean;
}

const DOWNLOADS_STORAGE_KEY = '@animenext_downloads';

const DownloadContext = createContext<DownloadContextType>({
  downloads: {},
  downloadQueue: [],
  addDownload: async () => {},
  pauseDownload: async () => {},
  resumeDownload: async () => {},
  deleteDownload: async () => {},
  isEpisodeDownloaded: () => false,
});

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [downloads, setDownloads] = useState<Record<string, DownloadItem>>({});

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    try {
      const saved = await storage.get<Record<string, DownloadItem>>(DOWNLOADS_STORAGE_KEY, {});
      setDownloads(saved);
    } catch (e) {
      console.warn('Failed to load downloads:', e);
    }
  };

  const saveDownloads = async (data: Record<string, DownloadItem>) => {
    setDownloads(data);
    await storage.set(DOWNLOADS_STORAGE_KEY, data);
  };

  const addDownload = async (
    anime: UnifiedAnime,
    episodeNumber: number,
    videoUrl: string,
    subtitles: SubtitleTrack[],
    quality = '1080p'
  ) => {
    const id = `${anime.id}_ep${episodeNumber}`;
    const sizeMap: Record<string, number> = {
      '1080p': 320 * 1024 * 1024,
      '720p': 180 * 1024 * 1024,
      '480p': 95 * 1024 * 1024,
      '360p': 60 * 1024 * 1024,
    };
    const totalBytes = sizeMap[quality] || 220 * 1024 * 1024;

    const newItem: DownloadItem = {
      id,
      animeId: anime.id,
      animeTitle: anime.title.english || anime.title.romaji || anime.title.userPreferred || 'Anime',
      animeCover: anime.coverImage.large || anime.coverImage.medium || '',
      episodeNumber,
      episodeTitle: `Episode ${episodeNumber}`,
      videoUrl,
      subtitles,
      status: 'DOWNLOADING',
      progress: 0,
      downloadedBytes: 0,
      totalBytes,
      speedBytesPerSec: 3.4 * 1024 * 1024,
      etaSeconds: Math.floor(totalBytes / (3.4 * 1024 * 1024)),
      quality,
      createdAt: Date.now(),
    };

    const updated = { ...downloads, [id]: newItem };
    await saveDownloads(updated);

    // Simulate background chunked downloading with live speed & ETA
    simulateDownloadProgress(id);
  };

  const simulateDownloadProgress = (id: string) => {
    let progress = 0;
    const interval = setInterval(async () => {
      progress += Math.floor(Math.random() * 7) + 8;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }

      setDownloads((prev) => {
        const item = prev[id];
        if (!item || item.status === 'PAUSED') {
          clearInterval(interval);
          return prev;
        }

        const isFinished = progress >= 100;
        const currentSpeed = (Math.random() * 2.2 + 2.8) * 1024 * 1024; // ~2.8 to 5.0 MB/s
        const remainingBytes = item.totalBytes * ((100 - progress) / 100);
        const eta = isFinished ? 0 : Math.max(1, Math.floor(remainingBytes / currentSpeed));

        const updatedItem: DownloadItem = {
          ...item,
          progress,
          downloadedBytes: Math.floor((item.totalBytes * progress) / 100),
          speedBytesPerSec: isFinished ? 0 : currentSpeed,
          etaSeconds: eta,
          status: isFinished ? 'COMPLETED' : 'DOWNLOADING',
          localFilePath: isFinished ? `file:///data/user/0/com.animenext.app/files/episodes/${id}.mp4` : undefined,
        };

        const next = { ...prev, [id]: updatedItem };
        storage.set(DOWNLOADS_STORAGE_KEY, next);
        return next;
      });
    }, 1000);
  };

  const pauseDownload = async (id: string) => {
    if (downloads[id]) {
      const updated = {
        ...downloads,
        [id]: { ...downloads[id], status: 'PAUSED' as const },
      };
      await saveDownloads(updated);
    }
  };

  const resumeDownload = async (id: string) => {
    if (downloads[id]) {
      const updated = {
        ...downloads,
        [id]: { ...downloads[id], status: 'DOWNLOADING' as const },
      };
      await saveDownloads(updated);
      simulateDownloadProgress(id);
    }
  };

  const deleteDownload = async (id: string) => {
    const updated = { ...downloads };
    delete updated[id];
    await saveDownloads(updated);
  };

  const isEpisodeDownloaded = (animeId: number, episodeNumber: number): boolean => {
    const id = `${animeId}_ep${episodeNumber}`;
    return downloads[id]?.status === 'COMPLETED';
  };

  const downloadQueue = Object.values(downloads).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <DownloadContext.Provider
      value={{
        downloads,
        downloadQueue,
        addDownload,
        pauseDownload,
        resumeDownload,
        deleteDownload,
        isEpisodeDownloaded,
      }}
    >
      {children}
    </DownloadContext.Provider>
  );
};

export const useDownloads = () => useContext(DownloadContext);
