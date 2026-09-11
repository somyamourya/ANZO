export type MangaStatus = 'ONGOING' | 'COMPLETED' | 'HIATUS' | 'CANCELLED';
export type MangaReaderMode = 'webtoon' | 'rtl' | 'ltr';

export interface MangaChapter {
  id: string;
  chapter: string; // e.g. "1", "1.5", "102"
  title?: string;
  volume?: string; // e.g. "1", "2", "none"
  language: string; // e.g. "en"
  scanlationGroup?: string;
  publishAt?: string;
  pagesCount?: number;
}

export interface MangaVolume {
  volume: string; // e.g. "Volume 1", "Volume 2", "No Volume"
  chapters: MangaChapter[];
}

export interface MangaItem {
  id: string; // MangaDex UUID or slug
  title: string;
  altTitles?: string[];
  description: string;
  coverUrl: string;
  bannerUrl?: string;
  author?: string;
  artist?: string;
  status: MangaStatus;
  year?: number;
  rating?: number;
  genres: string[];
  tags: string[];
  source: 'MangaDex' | 'WeebCentral' | 'MangaKakalot' | 'MangaPill' | 'AsuraScans';
  totalChapters?: number;
  totalVolumes?: number;
  volumes?: MangaVolume[];
}

export interface MangaPage {
  pageNumber: number;
  imageUrl: string;
}

export interface MangaReadingProgress {
  mangaId: string;
  mangaTitle: string;
  mangaCover: string;
  currentChapterId: string;
  currentChapterNumber: string;
  currentPageNumber: number;
  totalPages: number;
  updatedAt: number;
}

export interface OfflineMangaChapter {
  mangaId: string;
  chapterId: string;
  chapterNumber: string;
  mangaTitle: string;
  pages: MangaPage[];
  downloadedAt: number;
}
