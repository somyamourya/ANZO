import {
  ZenkaiRecommendationItem,
  ZenkaiRecommendationSection,
  IntelligentQueueItem,
  CrossMediaTransition,
  SeasonalZenkaiCategory,
} from '../../types/zenkai';
import { WatchProgress } from '../../types/anime';
import { MangaReadingProgress } from '../../types/manga';
import { NovelReadingProgress } from '../../types/novel';

// 1. CURATED ZENKAI MASTER CATALOG (Anime, Manga, Light Novels)
export const ZENKAI_CATALOG: ZenkaiRecommendationItem[] = [
  // Anime
  {
    id: 151807,
    mediaType: 'ANIME',
    title: 'Solo Leveling (Ore dake Level Up na Ken)',
    romajiTitle: 'Ore dake Level Up na Ken',
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    genres: ['Action', 'Fantasy', 'Adventure', 'Supernatural'],
    score: 8.8,
    matchPercentage: 99,
    reason: 'Top Pick: Shadow summons, dark fantasy, and unmatched solo progression.',
    seasonTag: 'Winter 2024 Blockbuster',
    episodesOrChapters: '12 Episodes',
    synopsis: 'In a world where hunters must battle deadly monsters, Sung Jinwoo ascends from E-Rank to the Monarch of Shadows.',
  },
  {
    id: 145064,
    mediaType: 'ANIME',
    title: 'Jujutsu Kaisen Season 2 (Shibuya Incident)',
    romajiTitle: 'Jujutsu Kaisen 2nd Season',
    coverImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    genres: ['Action', 'Supernatural', 'Dark Fantasy'],
    score: 8.9,
    matchPercentage: 97,
    reason: 'Because you watched modern dark action anime with God-tier choreography.',
    seasonTag: 'All-Time Action Peak',
    episodesOrChapters: '23 Episodes',
    synopsis: 'The Shibuya Incident commences as Kenjaku attempts to seal Gojo Satoru.',
  },
  {
    id: 154587,
    mediaType: 'ANIME',
    title: 'Frieren: Beyond Journey\'s End (Sousou no Frieren)',
    romajiTitle: 'Sousou no Frieren',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
    genres: ['Fantasy', 'Adventure', 'Drama'],
    score: 9.3,
    matchPercentage: 98,
    reason: 'Smart Seasonal: #1 Rated fantasy masterpiece with breathtaking emotional depth.',
    seasonTag: 'Masterpiece of the Decade',
    episodesOrChapters: '28 Episodes',
    synopsis: 'An elven mage explores the meaning of human connections after the Hero\'s party defeats the Demon King.',
  },
  {
    id: 164983,
    mediaType: 'ANIME',
    title: 'Kaiju No. 8',
    romajiTitle: 'Kaijuu 8-gou',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    genres: ['Action', 'Sci-Fi', 'Military'],
    score: 8.4,
    matchPercentage: 94,
    reason: 'Because you love high-stakes monster defense and underdog awakening.',
    seasonTag: 'Spring 2024 Top Airing',
    episodesOrChapters: '12 Episodes',
    synopsis: 'Kafka Hibino transforms into a humanoid Kaiju and joins the Defense Force.',
  },
  {
    id: 171018,
    mediaType: 'ANIME',
    title: 'Dandadan',
    romajiTitle: 'Dandadan',
    coverImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
    genres: ['Action', 'Comedy', 'Supernatural', 'Sci-Fi'],
    score: 8.7,
    matchPercentage: 96,
    reason: 'Smart Seasonal: Fall 2024 Breakout Hit by Science SARU with eccentric spirits & aliens.',
    seasonTag: 'Fall 2024 Breakout Hit',
    episodesOrChapters: '12 Episodes',
    synopsis: 'Momo and Okarun uncover the bizarre collision between yokai and extraterrestrials.',
  },
  {
    id: 171019,
    mediaType: 'ANIME',
    title: 'Bleach: Thousand-Year Blood War - The Conflict',
    romajiTitle: 'Bleach: Sennen Kessen-hen - Soukoku-tan',
    coverImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80',
    genres: ['Action', 'Adventure', 'Supernatural'],
    score: 8.8,
    matchPercentage: 95,
    reason: 'Smart Seasonal: Fall 2024 legendary soul reaper warfare.',
    seasonTag: 'Fall 2024 Hype Peak',
    episodesOrChapters: '13 Episodes',
    synopsis: 'Ichigo and the Soul Reapers defend the Soul King against Yhwach and the Sternritter.',
  },

  // Manga
  {
    id: 'manga_tbate',
    mediaType: 'MANGA',
    title: 'The Beginning After The End',
    coverImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    genres: ['Action', 'Fantasy', 'Isekai', 'Adventure'],
    score: 9.1,
    matchPercentage: 98,
    reason: 'Because you enjoyed Solo Leveling: Reincarnated king mastery of elemental aether & mana.',
    episodesOrChapters: '185 Chapters',
    synopsis: 'King Grey is reborn in a magical realm as Arthur Leywin, striving to protect his loved ones.',
  },
  {
    id: 'manga_orv',
    mediaType: 'MANGA',
    title: 'Omniscient Reader\'s Viewpoint',
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    genres: ['Action', 'Supernatural', 'Psychological', 'Fantasy'],
    score: 9.4,
    matchPercentage: 99,
    reason: 'Top Pick: The only reader who knows the ending of an apocalyptic web novel come to life.',
    episodesOrChapters: '210 Chapters',
    synopsis: 'Kim Dokja navigates the lethal scenarios of the novel "Ways of Survival" that has become reality.',
  },
  {
    id: 'manga_chainsaw_man',
    mediaType: 'MANGA',
    title: 'Chainsaw Man (Part 2 Academy Arc)',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    genres: ['Action', 'Dark Fantasy', 'Horror'],
    score: 8.9,
    matchPercentage: 93,
    reason: 'Because you watched Jujutsu Kaisen: Unfiltered devil contracts and intense twists.',
    episodesOrChapters: '175 Chapters',
    synopsis: 'Denji navigates high school while Asa Mitaka becomes host to the War Devil.',
  },

  // Light Novels
  {
    id: 'novel_shadow_slave',
    mediaType: 'NOVEL',
    title: 'Shadow Slave (Guiltythree)',
    coverImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80',
    genres: ['Action', 'Dark Fantasy', 'Mystery', 'Supernatural'],
    score: 9.6,
    matchPercentage: 99,
    reason: 'Cross-Media Masterpiece: Treacherous shadows, Nightmare Spell trials, and divine mystery.',
    episodesOrChapters: '1,840 Chapters',
    synopsis: 'Growing up in poverty, Sunny awakens the Divine Aspect of Shadows and enters the brutal Nightmare realms.',
  },
  {
    id: 'novel_lord_mysteries',
    mediaType: 'NOVEL',
    title: 'Lord of the Mysteries (Cuttlefish)',
    coverImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
    genres: ['Steampunk', 'Mystery', 'Supernatural', 'Occult'],
    score: 9.8,
    matchPercentage: 98,
    reason: 'Because you appreciate intricate lore: Victorian steampunk occultism & Tarot Club gatherings.',
    episodesOrChapters: '1,432 Chapters',
    synopsis: 'Zhou Mingrui awakens as Klein Moretti in an alternate Victorian world of tarot cards and potions.',
  },
  {
    id: 'novel_mushoku_tensei',
    mediaType: 'NOVEL',
    title: 'Mushoku Tensei: Jobless Reincarnation',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
    genres: ['Fantasy', 'Isekai', 'Drama', 'Adventure'],
    score: 9.2,
    matchPercentage: 95,
    reason: 'Because you love rich world-building, magical progression and lifelong redemption.',
    episodesOrChapters: '26 Volumes',
    synopsis: 'Rudeus Greyrat resolves to live without regrets in a vast fantasy world.',
  },
];

// 2. CROSS-MEDIA TRANSITION DATABASE
export const CROSS_MEDIA_TRANSITIONS: CrossMediaTransition[] = [
  {
    sourceTitle: 'Solo Leveling (Anime)',
    sourceType: 'ANIME',
    sourceCompletedUnit: 'Episode 12 (Season 1 Finale)',
    targetTitle: 'Solo Leveling (Webtoon)',
    targetType: 'MANGA',
    targetSuggestedUnit: 'Start at Chapter 46',
    targetCover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    synopsis: 'Continue immediately after the Job Change Quest into the Red Gate arc.',
    transitionReason: 'Experience the full Red Gate and Demon Castle arcs before Season 2 airs.',
  },
  {
    sourceTitle: 'Jujutsu Kaisen Season 2 (Anime)',
    sourceType: 'ANIME',
    sourceCompletedUnit: 'Episode 23 (Shibuya Incident Finale)',
    targetTitle: 'Jujutsu Kaisen (Manga)',
    targetType: 'MANGA',
    targetSuggestedUnit: 'Start at Chapter 138',
    targetCover: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    synopsis: 'Dive straight into the Culling Game and Yuta Okkotsu\'s execution mission.',
    transitionReason: 'Continue straight into the deadliest tournament arc in modern shonen.',
  },
  {
    sourceTitle: 'Frieren: Beyond Journey\'s End (Anime)',
    sourceType: 'ANIME',
    sourceCompletedUnit: 'Episode 28 (First-Class Mage Exam)',
    targetTitle: 'Sousou no Frieren (Manga)',
    targetType: 'MANGA',
    targetSuggestedUnit: 'Start at Chapter 61',
    targetCover: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
    synopsis: 'Journey to the Northern Plateau and encounter the Great Mage Macht.',
    transitionReason: 'Read the Golden Land of El Dorado arc regarded as the manga\'s peak.',
  },
  {
    sourceTitle: 'The Beginning After The End (Manga)',
    sourceType: 'MANGA',
    sourceCompletedUnit: 'Chapter 185',
    targetTitle: 'The Beginning After The End (Light Novel)',
    targetType: 'NOVEL',
    targetSuggestedUnit: 'Start at Novel Volume 6 (Chapter 138)',
    targetCover: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    synopsis: 'Discover Arthur\'s asura training and the Alacrya continent war.',
    transitionReason: 'The web novel is hundreds of chapters ahead with unmatched depth.',
  },
];

// 3. PERSONALIZED RECOMMENDATIONS ALGORITHM
export function calculatePersonalizedRecommendations(
  userWatchedAnime: string[],
  userReadManga: string[],
  userReadNovels: string[]
): ZenkaiRecommendationItem[] {
  // Score items by user history overlap & rating
  const scoredItems = ZENKAI_CATALOG.map((item) => {
    let affinityBonus = 0;
    const titleLower = item.title.toLowerCase();

    // Check if user has engaged in similar items
    const hasSoloHistory = userWatchedAnime.some((a) => a.toLowerCase().includes('solo'));
    const hasJJKHistory = userWatchedAnime.some((a) => a.toLowerCase().includes('jujutsu'));
    const hasFantasyHistory = userReadNovels.length > 0 || userReadManga.length > 0;

    if (hasSoloHistory && (titleLower.includes('shadow') || titleLower.includes('beginning') || titleLower.includes('reader'))) {
      affinityBonus += 5;
    }
    if (hasJJKHistory && (titleLower.includes('chainsaw') || titleLower.includes('dandadan') || titleLower.includes('kaiju'))) {
      affinityBonus += 4;
    }
    if (hasFantasyHistory && (titleLower.includes('mysteries') || titleLower.includes('frieren') || titleLower.includes('mushoku'))) {
      affinityBonus += 4;
    }

    const calculatedMatch = Math.min(99, Math.floor(item.matchPercentage + (affinityBonus > 0 ? 1 : -2)));

    return {
      ...item,
      matchPercentage: calculatedMatch,
    };
  });

  return scoredItems.sort((a, b) => b.matchPercentage - a.matchPercentage || b.score - a.score);
}

// 4. "BECAUSE YOU WATCHED" & "BECAUSE YOU READ" BUILDERS
export function getBecauseYouWatchedRecommendations(
  watchedTitle: string = 'Solo Leveling'
): ZenkaiRecommendationSection {
  const matches = ZENKAI_CATALOG.filter(
    (item) => item.title !== watchedTitle && (item.genres.includes('Action') || item.genres.includes('Fantasy'))
  ).slice(0, 5);

  return {
    id: 'section_because_watched_' + watchedTitle.toLowerCase().replace(/\s+/g, '_'),
    title: `Because You Watched ${watchedTitle}`,
    subtitle: 'High-octane leveling, strategic combat & supernatural abilities',
    icon: 'flame',
    accentColor: '#8B5CF6',
    type: 'BECAUSE_YOU_WATCHED',
    sourceItem: {
      id: 151807,
      title: watchedTitle,
      type: 'ANIME',
    },
    items: matches,
  };
}

export function getBecauseYouReadRecommendations(
  readTitle: string = 'Shadow Slave'
): ZenkaiRecommendationSection {
  const matches = ZENKAI_CATALOG.filter(
    (item) => item.title !== readTitle && (item.mediaType === 'NOVEL' || item.mediaType === 'MANGA')
  ).slice(0, 5);

  return {
    id: 'section_because_read_' + readTitle.toLowerCase().replace(/\s+/g, '_'),
    title: `Because You Read ${readTitle}`,
    subtitle: 'Intricate world-building, divine power systems & dark mysteries',
    icon: 'book',
    accentColor: '#00F0FF',
    type: 'BECAUSE_YOU_READ',
    sourceItem: {
      id: 'novel_shadow_slave',
      title: readTitle,
      type: 'NOVEL',
    },
    items: matches,
  };
}

// 5. SMART SEASONAL RECOMMENDATIONS
export function getSmartSeasonalRecommendations(): SeasonalZenkaiCategory[] {
  return [
    {
      categoryName: '🔥 Fall 2024 Breakout Hits',
      tagline: 'The most watched and critically acclaimed series of this season',
      badge: 'SEASON TOP',
      items: ZENKAI_CATALOG.filter((item) => item.seasonTag?.includes('Fall 2024') || item.score >= 8.7),
    },
    {
      categoryName: '⭐ Masterpieces & Hall of Fame',
      tagline: 'Universally acclaimed stories with scores exceeding 9.0/10',
      badge: 'HALL OF FAME',
      items: ZENKAI_CATALOG.filter((item) => item.score >= 9.0),
    },
    {
      categoryName: '🌐 Cross-Media Cult Classics',
      tagline: 'Light novels & manga with massive worldwide cult followings',
      badge: 'CROSS MEDIA',
      items: ZENKAI_CATALOG.filter((item) => item.mediaType === 'NOVEL' || item.mediaType === 'MANGA'),
    },
  ];
}

// 6. INTELLIGENT WATCH & READ QUEUE BUILDER
export function generateIntelligentQueue(
  watchProgress: Record<number, WatchProgress>,
  mangaProgress: Record<string, MangaReadingProgress>,
  novelProgress: Record<string, NovelReadingProgress>
): IntelligentQueueItem[] {
  const queue: IntelligentQueueItem[] = [];

  // 1. Process Anime Queue
  Object.values(watchProgress).forEach((wp) => {
    const isFinished = wp.duration > 0 && wp.currentTime >= wp.duration - 15;
    const nextEp = isFinished ? wp.currentEpisode + 1 : wp.currentEpisode;
    const progressPct = wp.duration > 0 ? Math.round((wp.currentTime / wp.duration) * 100) : 0;
    const urgency = isFinished ? 95 : 80;

    queue.push({
      id: `queue_anime_${wp.animeId}`,
      mediaType: 'ANIME',
      mediaId: wp.animeId,
      title: wp.animeTitle,
      coverImage: wp.animeCover,
      currentUnitLabel: `Episode ${wp.currentEpisode}`,
      nextUnitLabel: isFinished ? `Episode ${nextEp} (Next)` : `Episode ${wp.currentEpisode} (${progressPct}%)`,
      nextUnitNumber: nextEp,
      progressPercentage: progressPct,
      estimatedTimeMinutes: isFinished ? 24 : Math.max(2, Math.round((wp.duration - wp.currentTime) / 60)),
      urgencyScore: urgency,
      zenkaiReason: isFinished ? 'Next episode ready to binge!' : 'Resume where you left off',
      lastActivityTimestamp: wp.updatedAt || Date.now() - 3600000,
    });
  });

  // 2. Process Manga Queue
  Object.values(mangaProgress).forEach((mp) => {
    const isFinished = mp.currentPageNumber >= mp.totalPages && mp.totalPages > 0;
    const nextCh = isFinished ? (parseFloat(mp.currentChapterNumber) + 1).toString() : mp.currentChapterNumber;
    const progressPct = mp.totalPages > 0 ? Math.round((mp.currentPageNumber / mp.totalPages) * 100) : 0;

    queue.push({
      id: `queue_manga_${mp.mangaId}`,
      mediaType: 'MANGA',
      mediaId: mp.mangaId,
      title: mp.mangaTitle,
      coverImage: mp.mangaCover,
      currentUnitLabel: `Chapter ${mp.currentChapterNumber}`,
      nextUnitLabel: isFinished ? `Chapter ${nextCh} (Next)` : `Chapter ${mp.currentChapterNumber} (${progressPct}%)`,
      nextUnitNumber: parseFloat(nextCh),
      progressPercentage: progressPct,
      estimatedTimeMinutes: isFinished ? 5 : 2,
      urgencyScore: 88,
      zenkaiReason: isFinished ? 'New chapter available to read!' : `Page ${mp.currentPageNumber}/${mp.totalPages}`,
      lastActivityTimestamp: mp.updatedAt || Date.now() - 7200000,
    });
  });

  // 3. Process Novel Queue
  Object.values(novelProgress).forEach((np) => {
    const isFinished = np.scrollPercentage >= 95;
    const nextCh = isFinished ? np.currentChapterNumber + 1 : np.currentChapterNumber;

    queue.push({
      id: `queue_novel_${np.novelId}`,
      mediaType: 'NOVEL',
      mediaId: np.novelId,
      title: np.novelTitle,
      coverImage: np.novelCover,
      currentUnitLabel: `Chapter ${np.currentChapterNumber}`,
      nextUnitLabel: isFinished ? `Chapter ${nextCh} (Next)` : `Chapter ${np.currentChapterNumber} (${np.scrollPercentage}%)`,
      nextUnitNumber: nextCh,
      progressPercentage: np.scrollPercentage,
      estimatedTimeMinutes: isFinished ? 8 : 4,
      urgencyScore: 85,
      zenkaiReason: isFinished ? 'Chapter completed! Next chapter loaded' : `${np.scrollPercentage}% read`,
      lastActivityTimestamp: np.updatedAt || Date.now() - 10800000,
    });
  });

  // Default Sample Queue Items if user has an empty history
  if (queue.length === 0) {
    queue.push(
      {
        id: 'queue_sample_solo',
        mediaType: 'ANIME',
        mediaId: 151807,
        title: 'Solo Leveling',
        coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
        currentUnitLabel: 'Episode 12',
        nextUnitLabel: 'Episode 12 (Season Finale)',
        nextUnitNumber: 12,
        progressPercentage: 65,
        estimatedTimeMinutes: 8,
        urgencyScore: 98,
        zenkaiReason: '🔥 Climax fight in progress! 8 mins left',
        lastActivityTimestamp: Date.now() - 1800000,
      },
      {
        id: 'queue_sample_shadow_slave',
        mediaType: 'NOVEL',
        mediaId: 'novel_shadow_slave',
        title: 'Shadow Slave',
        coverImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80',
        currentUnitLabel: 'Chapter 350',
        nextUnitLabel: 'Chapter 351 (Up Next)',
        nextUnitNumber: 351,
        progressPercentage: 100,
        estimatedTimeMinutes: 6,
        urgencyScore: 92,
        zenkaiReason: 'Forgotten Shore arc milestone reached',
        lastActivityTimestamp: Date.now() - 7200000,
      },
      {
        id: 'queue_sample_tbate',
        mediaType: 'MANGA',
        mediaId: 'manga_tbate',
        title: 'The Beginning After The End',
        coverImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
        currentUnitLabel: 'Chapter 175',
        nextUnitLabel: 'Chapter 176 (Up Next)',
        nextUnitNumber: 176,
        progressPercentage: 100,
        estimatedTimeMinutes: 5,
        urgencyScore: 89,
        zenkaiReason: 'New chapter ready to read',
        lastActivityTimestamp: Date.now() - 14400000,
      }
    );
  }

  // Sort queue by urgency score (highest first)
  return queue.sort((a, b) => b.urgencyScore - a.urgencyScore || b.lastActivityTimestamp - a.lastActivityTimestamp);
}
