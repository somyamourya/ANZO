export type NovelStatus = 'ONGOING' | 'COMPLETED' | 'HIATUS';
export type NovelReaderThemeId =
  | 'oled'
  | 'sepia'
  | 'solarized'
  | 'cream'
  | 'dark'
  | 'parchment'
  | 'dracula'
  | 'cyberpunk'
  | 'forest';
export type NovelFontFamily = 'Merriweather' | 'Inter' | 'OpenDyslexic' | 'System' | 'Monospace';

export interface NovelChapter {
  id: string;
  chapterNumber: number;
  title: string;
  url?: string;
  content?: string;
  releaseDate?: string;
}

export interface NovelItem {
  id: string;
  title: string;
  altTitles?: string[];
  description: string;
  coverUrl: string;
  author: string;
  artist?: string;
  status: NovelStatus;
  rating?: number;
  genres: string[];
  source: 'NovelFull' | 'NovelFire' | 'FreeWebNovel' | 'WuxiaWorld' | 'NovelBin' | 'ReadLightNovel' | 'BoxNovel';
  totalChapters: number;
  chapters?: NovelChapter[];
}

export interface NovelReaderSettings {
  theme: NovelReaderThemeId;
  fontFamily: NovelFontFamily;
  fontSize: number; // 14 to 32
  lineHeight: number; // 1.2 to 2.4
  paragraphSpacing: number; // 8 to 24
  textAlignment: 'left' | 'justify';
  autoScrollSpeed: number; // 0 (off) to 10
  ttsVoiceRate: number; // 0.75 to 2.0
  ttsVoicePitch: number; // 0.8 to 1.2
}

export interface NovelReadingProgress {
  novelId: string;
  novelTitle: string;
  novelCover: string;
  currentChapterId: string;
  currentChapterNumber: number;
  scrollPercentage: number;
  updatedAt: number;
}

export interface OfflineNovelChapter {
  novelId: string;
  chapterId: string;
  chapterNumber: number;
  title: string;
  content: string;
  downloadedAt: number;
}
