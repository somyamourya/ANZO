import { MediaType } from './crossMedia';
import { UnifiedAnime } from './anime';
import { MangaItem } from './manga';
import { NovelItem } from './novel';

export interface UniversalMediaResult {
  id: string | number;
  mediaType: MediaType;
  title: string;
  coverUrl: string;
  rating: number;
  status: string;
  genres: string[];
  sourceProvider: string;
  totalUnits?: number; // episodes, chapters
  latestUnit?: string;
  rawAnime?: UnifiedAnime;
  rawManga?: MangaItem;
  rawNovel?: NovelItem;
}

export type UniversalFilterType = 'ALL' | 'ANIME' | 'MANGA' | 'NOVEL';
