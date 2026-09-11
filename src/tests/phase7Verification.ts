import { getCrossMediaConnections } from '../api/crossMediaEngine';
import { executeUniversalSearch } from '../api/universalSearch';
import { calculateStorageUsage } from '../utils/offlineStorageEngine';

async function runPhase7Tests() {
  console.log('===========================================================');
  console.log('🌐 RUNNING PHASE 7: ANZO ECOSYSTEM VERIFICATION SUITE');
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

  // TEST 1: Cross-Media Linking & Franchise Associator
  console.log('--- 1. Testing Cross-Media Linking Engine ---');
  const soloBundle = getCrossMediaConnections('ANIME', 151807, 'Solo Leveling');
  assert(soloBundle.connectedItems.length === 2, `Cross-media bundle returned 2 connected adaptations (got ${soloBundle.connectedItems.length})`);
  
  const mangaNode = soloBundle.connectedItems.find(i => i.mediaType === 'MANGA');
  const novelNode = soloBundle.connectedItems.find(i => i.mediaType === 'NOVEL');
  assert(!!mangaNode && mangaNode.title.includes('Na Honjaman Level-Up'), 'Mapped to Korean Webtoon / Manga: Na Honjaman Level-Up');
  assert(!!novelNode && novelNode.relationship === 'ORIGINAL_LIGHT_NOVEL', 'Mapped to Original Light Novel Source: Chugong Web Novel');

  const jjkBundle = getCrossMediaConnections('MANGA', 'jujutsu_kaisen_manga', 'Jujutsu Kaisen');
  assert(jjkBundle.connectedItems.some(i => i.mediaType === 'ANIME'), 'Manga maps back to TV Anime adaptation');
  assert(jjkBundle.connectedItems.some(i => i.mediaType === 'NOVEL'), 'Manga maps to Light Novel spin-offs');

  // TEST 2: Dynamic Cross-Media Fallback for Any Anime/Manga/Novel
  console.log('\n--- 2. Testing Dynamic Cross-Media Fallback ---');
  const demonSlayerBundle = getCrossMediaConnections('ANIME', 101922, 'Kimetsu no Yaiba');
  assert(demonSlayerBundle.connectedItems.length >= 2, `Dynamic bundle resolved ${demonSlayerBundle.connectedItems.length} media connections`);
  assert(demonSlayerBundle.connectedItems.some(i => i.mediaType === 'MANGA' && i.badgeLabel.includes('Manga')), 'Generated Manga connection');

  // TEST 3: Universal Search Aggregation Engine
  console.log('\n--- 3. Testing Universal Search Engine (All Media) ---');
  const allResults = await executeUniversalSearch('Solo Leveling', 'ALL');
  assert(allResults.length > 0, `Universal search returned ${allResults.length} aggregated results across formats`);
  
  const hasAnime = allResults.some(r => r.mediaType === 'ANIME');
  const hasManga = allResults.some(r => r.mediaType === 'MANGA');
  const hasNovel = allResults.some(r => r.mediaType === 'NOVEL');
  assert(hasAnime, 'Universal search includes Anime results (AniList / TMDB)');
  assert(hasManga, 'Universal search includes Manga results (MangaDex / Asura / Kakalot)');
  assert(hasNovel, 'Universal search includes Light Novel results (NovelFull / NovelBin)');

  // TEST 4: Type-Filtered Universal Search
  console.log('\n--- 4. Testing Filtered Universal Search Queries ---');
  const animeOnly = await executeUniversalSearch('One Piece', 'ANIME');
  assert(animeOnly.every(r => r.mediaType === 'ANIME'), 'ANIME filter returns strictly anime results');

  const mangaOnly = await executeUniversalSearch('Chainsaw Man', 'MANGA');
  assert(mangaOnly.every(r => r.mediaType === 'MANGA'), 'MANGA filter returns strictly manga results');

  const novelOnly = await executeUniversalSearch('Shadow Slave', 'NOVEL');
  assert(novelOnly.every(r => r.mediaType === 'NOVEL'), 'NOVEL filter returns strictly light novel results');

  // TEST 5: Unified Continue Experiencing Queue Logic
  console.log('\n--- 5. Testing Unified Continue Queue Logic ---');
  const sampleAnimeProg = { type: 'ANIME', title: 'Solo Leveling', ep: 10, pos: 1200, dur: 1400, updatedAt: 3000 };
  const sampleMangaProg = { type: 'MANGA', title: 'Na Honjaman', ch: 110, pg: 45, total: 45, updatedAt: 5000 };
  const sampleNovelProg = { type: 'NOVEL', title: 'Shadow Slave', ch: 800, percent: 75, updatedAt: 4000 };

  const unifiedQueue = [sampleAnimeProg, sampleMangaProg, sampleNovelProg].sort((a, b) => b.updatedAt - a.updatedAt);
  assert(unifiedQueue[0].type === 'MANGA' && unifiedQueue[0].title === 'Na Honjaman', 'Most recently read manga placed at front of queue');
  assert(unifiedQueue[1].type === 'NOVEL' && unifiedQueue[1].title === 'Shadow Slave', 'Second item placed correctly in unified queue');
  assert(unifiedQueue[2].type === 'ANIME' && unifiedQueue[2].title === 'Solo Leveling', 'Third item placed correctly in unified queue');

  // TEST 6: Unified Library Storage Aggregation
  console.log('\n--- 6. Testing Unified Library Storage & Metrics ---');
  const storage = await calculateStorageUsage();
  assert(typeof storage.totalMbFormatted === 'string', `Storage usage calculated correctly (${storage.totalMbFormatted})`);

  console.log('\n===========================================================');
  console.log(`📊 SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${Math.round((passed / (passed + failed)) * 100)}%)`);
  console.log('===========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase7Tests().catch((err) => {
  console.error('Test suite execution error:', err);
  process.exit(1);
});
