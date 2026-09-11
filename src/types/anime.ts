export type AnimeFormat = 'TV' | 'TV_SHORT' | 'MOVIE' | 'SPECIAL' | 'OVA' | 'ONA' | 'MUSIC';
export type AnimeStatus = 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';
export type AnimeSeason = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';

export type WatchStatus = 'WATCHING' | 'PLANNING' | 'COMPLETED' | 'ON_HOLD' | 'DROPPED' | 'FAVORITE';

export interface AnimeTitle {
  romaji?: string;
  english?: string;
  native?: string;
  userPreferred?: string;
}

export interface AnimeCoverImage {
  extraLarge?: string;
  large?: string;
  medium?: string;
  color?: string;
}

export interface CharacterItem {
  id: number;
  name: {
    full: string;
    native?: string;
  };
  image?: {
    large?: string;
    medium?: string;
  };
  role: string;
  voiceActor?: {
    name: string;
    language: string;
    image?: string;
  };
}

export interface AnimeRelation {
  id: number;
  title: AnimeTitle;
  format: AnimeFormat;
  type: string;
  status: AnimeStatus;
  coverImage: AnimeCoverImage;
  relationType: string;
}

export interface AiringSchedule {
  airingAt: number;
  timeUntilAiring: number;
  episode: number;
}

export interface UnifiedAnime {
  id: number; // AniList ID
  malId?: number;
  kitsuId?: string | number;
  tmdbId?: number;
  title: AnimeTitle;
  description: string;
  coverImage: AnimeCoverImage;
  bannerImage?: string;
  tmdbBackdrop?: string;
  tmdbLogo?: string;
  format: AnimeFormat;
  status: AnimeStatus;
  episodes?: number;
  duration?: number;
  season?: AnimeSeason;
  seasonYear?: number;
  averageScore?: number;
  popularity?: number;
  genres: string[];
  studios: string[];
  isAdult?: boolean;
  nextAiringEpisode?: AiringSchedule;
  characters?: CharacterItem[];
  relations?: AnimeRelation[];
  recommendations?: UnifiedAnime[];
  trailer?: {
    id?: string;
    site?: string;
    thumbnail?: string;
  };
  themes?: {
    openings?: string[];
    endings?: string[];
  };
  synonyms?: string[];
}

export interface EpisodeInfo {
  number: number;
  title?: string;
  thumbnail?: string;
  synopsis?: string;
  airDate?: string;
  filler?: boolean;
  score?: number;
}

export interface SubtitleTrack {
  url: string;
  lang: string;
  label: string;
  isDefault?: boolean;
}

export interface VideoSource {
  url: string;
  quality: '360p' | '480p' | '720p' | '1080p' | 'auto' | 'default';
  isM3U8: boolean;
  isDASH?: boolean;
  headers?: Record<string, string>;
}

export interface StreamData {
  sources: VideoSource[];
  subtitles: SubtitleTrack[];
  provider: string;
  serverName: string;
  intro?: {
    start: number;
    end: number;
  };
  outro?: {
    start: number;
    end: number;
  };
  headers?: Record<string, string>;
  embedUrl?: string;
}

export interface WatchProgressItem {
  animeId: number;
  animeTitle: string;
  animeCover: string;
  animeBanner?: string;
  currentEpisode: number;
  totalEpisodes?: number;
  currentTime: number; // in seconds
  duration: number; // in seconds
  percentage: number;
  status: WatchStatus;
  updatedAt: number;
}

export type WatchProgress = WatchProgressItem;

export interface DownloadItem {
  id: string; // animeId_epNum
  animeId: number;
  animeTitle: string;
  animeCover: string;
  episodeNumber: number;
  episodeTitle?: string;
  videoUrl: string;
  localFilePath?: string;
  subtitles: SubtitleTrack[];
  status: 'QUEUED' | 'DOWNLOADING' | 'PAUSED' | 'COMPLETED' | 'ERROR';
  progress: number; // 0 to 100
  downloadedBytes: number;
  totalBytes: number;
  speedBytesPerSec?: number;
  etaSeconds?: number;
  quality: string;
  createdAt: number;
}

export interface UserProfile {
  id: string | number;
  username: string;
  avatar?: string;
  banner?: string;
  isAniListAuthed: boolean;
  anilistToken?: string;
  totalAnimeWatched: number;
  totalEpisodesWatched: number;
  minutesWatched: number;
  meanScore?: number;
}

export interface SubtitleSettings {
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  backgroundOpacity: number;
  textOutline: boolean;
  bottomOffset: number;
}

export interface PlayerSettings {
  defaultQuality: 'auto' | '1080p' | '720p' | '480p' | '360p';
  autoPlayNext: boolean;
  autoSkipIntro: boolean;
  autoSkipOutro: boolean;
  preferredAudio: 'sub' | 'dub';
  preferredServer: 'MegaCloud' | 'Vidstream' | 'StreamWish' | 'Auto';
  gestureControls: boolean;
  doubleTapSeekSeconds: number;
  resizeMode: 'contain' | 'cover' | 'stretch';
  subtitles: SubtitleSettings;
}
