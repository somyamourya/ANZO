export type ZenkaiRecommendationType =
  | 'BECAUSE_YOU_WATCHED'
  | 'BECAUSE_YOU_READ'
  | 'SMART_SEASONAL'
  | 'CROSS_MEDIA_DISCOVERY'
  | 'GENRE_AFFINITY'
  | 'TRENDING_ZENKAI';

export interface ZenkaiRecommendationItem {
  id: string | number;
  mediaType: 'ANIME' | 'MANGA' | 'NOVEL';
  title: string;
  romajiTitle?: string;
  coverImage: string;
  bannerImage?: string;
  genres: string[];
  score: number;
  matchPercentage: number; // e.g. 98%
  reason: string; // e.g. "Because you watched Solo Leveling: High-stakes dungeon leveling & shadow powers"
  sourceMediaTitle?: string;
  sourceMediaType?: 'ANIME' | 'MANGA' | 'NOVEL';
  seasonTag?: string; // e.g. "Fall 2024 Top Pick"
  episodesOrChapters?: string; // e.g. "24 Episodes", "200 Chapters"
  status?: string;
  synopsis?: string;
}

export interface ZenkaiRecommendationSection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  accentColor: string;
  type: ZenkaiRecommendationType;
  sourceItem?: {
    id: string | number;
    title: string;
    type: 'ANIME' | 'MANGA' | 'NOVEL';
  };
  items: ZenkaiRecommendationItem[];
}

export interface IntelligentQueueItem {
  id: string;
  mediaType: 'ANIME' | 'MANGA' | 'NOVEL';
  mediaId: string | number;
  title: string;
  coverImage: string;
  bannerImage?: string;
  currentUnitLabel: string; // e.g. "Episode 12", "Chapter 45"
  nextUnitLabel: string; // e.g. "Episode 13 (Up Next)", "Chapter 46"
  nextUnitNumber: number;
  progressPercentage: number; // 0 to 100
  estimatedTimeMinutes: number; // e.g. 24 mins for ep, 5 mins for ch
  urgencyScore: number; // 1 to 100 based on freshness, arc climax, streak
  zenkaiReason: string; // e.g. "Season finale up next!", "Next chapter released today"
  lastActivityTimestamp: number;
}

export interface SeasonalZenkaiCategory {
  categoryName: string;
  tagline: string;
  badge: string;
  items: ZenkaiRecommendationItem[];
}

export interface CrossMediaTransition {
  sourceTitle: string;
  sourceType: 'ANIME' | 'MANGA' | 'NOVEL';
  sourceCompletedUnit: string; // e.g. "Episode 12 (Season 1 Finale)"
  targetTitle: string;
  targetType: 'MANGA' | 'NOVEL';
  targetSuggestedUnit: string; // e.g. "Start at Manga Chapter 46"
  targetCover: string;
  synopsis: string;
  transitionReason: string;
}
