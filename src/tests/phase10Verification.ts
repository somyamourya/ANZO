import {
  calculatePersonalizedRecommendations,
  getBecauseYouWatchedRecommendations,
  getBecauseYouReadRecommendations,
  getSmartSeasonalRecommendations,
  generateIntelligentQueue,
  CROSS_MEDIA_TRANSITIONS,
  ZENKAI_CATALOG,
} from '../api/zenkai/zenkaiEngine';
import { WatchProgress } from '../types/anime';
import { MangaReadingProgress } from '../types/manga';
import { NovelReadingProgress } from '../types/novel';

async function runPhase10Tests() {
  console.log('===========================================================');
  console.log('⚡ RUNNING PHASE 10: SMART ZENKAI VERIFICATION SUITE');
  console.log('===========================================================\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // TEST 1: Zenkai Catalog & Master Database
  console.log('--- 1. Testing Zenkai Recommendation Catalog ---');
  assert(ZENKAI_CATALOG.length >= 10, `Loaded ${ZENKAI_CATALOG.length} items across Anime, Manga, and Light Novels`);

  const animeCount = ZENKAI_CATALOG.filter((i) => i.mediaType === 'ANIME').length;
  const mangaCount = ZENKAI_CATALOG.filter((i) => i.mediaType === 'MANGA').length;
  const novelCount = ZENKAI_CATALOG.filter((i) => i.mediaType === 'NOVEL').length;

  assert(animeCount >= 5, `Zenkai Anime catalog contains ${animeCount} items`);
  assert(mangaCount >= 3, `Zenkai Manga catalog contains ${mangaCount} items`);
  assert(novelCount >= 3, `Zenkai Novel catalog contains ${novelCount} items`);

  // TEST 2: Personalized Recommendation Engine & Affinity Matching
  console.log('\n--- 2. Testing Personalized Affinity Scoring Algorithm ---');
  const personalized = calculatePersonalizedRecommendations(
    ['Solo Leveling', 'Jujutsu Kaisen'],
    ['The Beginning After The End'],
    ['Shadow Slave']
  );

  assert(personalized.length >= 8, `Calculated ${personalized.length} personalized recommendations`);
  assert(personalized[0].matchPercentage >= 95, `Top recommendation has ${personalized[0].matchPercentage}% match score (${personalized[0].title})`);
  assert(!!personalized[0].reason, 'Personalized recommendation provides human-readable reason tag');

  // TEST 3: "Because You Watched" Discovery Engine
  console.log('\n--- 3. Testing Because-You-Watched Recommendations ---');
  const becauseWatched = getBecauseYouWatchedRecommendations('Solo Leveling');
  assert(becauseWatched.title === 'Because You Watched Solo Leveling', 'Generated section title for Solo Leveling');
  assert(becauseWatched.type === 'BECAUSE_YOU_WATCHED', 'Section type is BECAUSE_YOU_WATCHED');
  assert(becauseWatched.items.length >= 3, `Found ${becauseWatched.items.length} related high-affinity items`);
  assert(!becauseWatched.items.some((i) => i.title === 'Solo Leveling'), 'Original watched item excluded from its own recommendations');

  // TEST 4: "Because You Read" Discovery Engine
  console.log('\n--- 4. Testing Because-You-Read Recommendations ---');
  const becauseRead = getBecauseYouReadRecommendations('Shadow Slave');
  assert(becauseRead.title === 'Because You Read Shadow Slave', 'Generated section title for Shadow Slave');
  assert(becauseRead.type === 'BECAUSE_YOU_READ', 'Section type is BECAUSE_YOU_READ');
  assert(becauseRead.items.every((i) => i.mediaType === 'NOVEL' || i.mediaType === 'MANGA'), 'All items are reading-oriented formats (Manga/Novel)');

  // TEST 5: Smart Seasonal Zenkai Recommendations
  console.log('\n--- 5. Testing Smart Seasonal Recommendations ---');
  const seasonalCategories = getSmartSeasonalRecommendations();
  assert(seasonalCategories.length === 3, 'Loaded 3 curated seasonal categories');

  const fallCategory = seasonalCategories[0];
  assert(fallCategory.categoryName.includes('Fall 2024'), 'Category 1 focuses on Fall 2024 breakout hits');
  assert(fallCategory.items.length >= 2, `Found ${fallCategory.items.length} Fall 2024 series (e.g. Dandadan, Bleach TYBW)`);

  const hallOfFame = seasonalCategories[1];
  assert(hallOfFame.items.every((i) => i.score >= 9.0), 'Hall of Fame category strictly filters series with score >= 9.0');

  // TEST 6: Cross-Media Adaptation Transitions
  console.log('\n--- 6. Testing Cross-Media Adaptation Transitions ---');
  assert(CROSS_MEDIA_TRANSITIONS.length >= 4, `Loaded ${CROSS_MEDIA_TRANSITIONS.length} cross-media adaptation transition bridges`);

  const soloTransition = CROSS_MEDIA_TRANSITIONS.find((t) => t.sourceTitle.includes('Solo Leveling'));
  assert(!!soloTransition && soloTransition.targetSuggestedUnit === 'Start at Chapter 46', 'Solo Leveling Anime -> Webtoon starts at Chapter 46');

  const jjkTransition = CROSS_MEDIA_TRANSITIONS.find((t) => t.sourceTitle.includes('Jujutsu Kaisen'));
  assert(!!jjkTransition && jjkTransition.targetSuggestedUnit === 'Start at Chapter 138', 'Jujutsu Kaisen Shibuya Finale -> Manga starts at Chapter 138 (Culling Game)');

  const tbateTransition = CROSS_MEDIA_TRANSITIONS.find((t) => t.sourceTitle.includes('Beginning After The End'));
  assert(!!tbateTransition && tbateTransition.targetType === 'NOVEL', 'TBATE Manga -> Light Novel transition verified');

  // TEST 7: Intelligent Watch & Read Queue Engine
  console.log('\n--- 7. Testing Intelligent Watch & Read Queue Builder ---');
  const mockWatchProgress: Record<number, WatchProgress> = {
    151807: {
      animeId: 151807,
      animeTitle: 'Solo Leveling',
      animeCover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600',
      currentEpisode: 12,
      currentTime: 1300,
      duration: 1440,
      percentage: 90,
      status: 'WATCHING',
      updatedAt: Date.now() - 600000,
    },
  };

  const mockMangaProgress: Record<string, MangaReadingProgress> = {
    manga_orv: {
      mangaId: 'manga_orv',
      mangaTitle: 'Omniscient Reader\'s Viewpoint',
      mangaCover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600',
      currentChapterId: 'ch_210',
      currentChapterNumber: '210',
      currentPageNumber: 15,
      totalPages: 30,
      updatedAt: Date.now() - 1800000,
    },
  };

  const mockNovelProgress: Record<string, NovelReadingProgress> = {
    novel_shadow_slave: {
      novelId: 'novel_shadow_slave',
      novelTitle: 'Shadow Slave',
      novelCover: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600',
      currentChapterId: 'ch_350',
      currentChapterNumber: 350,
      scrollPercentage: 80,
      updatedAt: Date.now() - 3600000,
    },
  };

  const queue = generateIntelligentQueue(
    mockWatchProgress,
    mockMangaProgress,
    mockNovelProgress
  );

  assert(queue.length === 3, `Queue generated ${queue.length} items across all 3 media types`);
  assert(queue[0].mediaType === 'MANGA' || queue[0].mediaType === 'ANIME' || queue[0].mediaType === 'NOVEL', 'Queue contains multi-format elements');
  assert(queue.every((i) => i.urgencyScore >= 80), 'All queue items scored with high urgency (> 80)');
  assert(queue.every((i) => i.estimatedTimeMinutes > 0), 'All queue items calculated remaining time estimates');

  console.log('\n===========================================================');
  console.log(`📊 SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${Math.round((passed / (passed + failed)) * 100)}%)`);
  console.log('===========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase10Tests().catch((err) => {
  console.error('Phase 10 verification suite error:', err);
  process.exit(1);
});
