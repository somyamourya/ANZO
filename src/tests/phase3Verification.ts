import {
  getTrendingManga,
  searchManga,
  getMangaVolumesAndChapters,
  getChapterPages,
} from '../api/manga/mangadex';
import {
  resolveTrendingManga,
  resolveMangaSearch,
  resolveMangaFullDetails,
} from '../api/manga/mangaResolver';
import {
  resolveTrendingNovels,
  resolveNovelSearch,
  resolveNovelDetails,
  resolveNovelChapterText,
} from '../api/novel/novelResolver';

async function runPhase3Verifications() {
  console.log('===========================================================');
  console.log('📖 RUNNING PHASE 3: MANGA & LIGHT NOVELS VERIFICATION SUITE');
  console.log('===========================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, extraInfo = '') {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`✅ [PASS] ${testName} ${extraInfo ? `(${extraInfo})` : ''}`);
    } else {
      console.error(`❌ [FAIL] ${testName} ${extraInfo ? `(${extraInfo})` : ''}`);
    }
  }

  // 1. MangaDex API Integration & Trending
  try {
    console.log('--- 1. Testing MangaDex API v5 Engine ---');
    const trending = await getTrendingManga(5);
    assert(trending.length > 0, 'MangaDex Trending Feeds', `Found ${trending.length} manga titles`);
    if (trending.length > 0) {
      assert(!!trending[0].title && !!trending[0].coverUrl, 'MangaDex Title & Cover Metadata', `Title: ${trending[0].title}`);
    }
  } catch (e: any) {
    assert(false, 'MangaDex API Error', e.message);
  }

  // 2. MangaDex Search
  try {
    console.log('\n--- 2. Testing Manga Search Query ---');
    const searchRes = await searchManga('Berserk', 3);
    assert(searchRes.length > 0, 'MangaDex Search Results', `Found ${searchRes.length} items`);
  } catch (e: any) {
    assert(false, 'Manga Search Error', e.message);
  }

  // 3. Volume-Aware Chapter Aggregation
  try {
    console.log('\n--- 3. Testing Volume-Aware Chapter Organization ---');
    const searchRes = await searchManga('Attack on Titan', 1);
    const targetId = searchRes.length > 0 ? searchRes[0].id : 'sample_id';
    const volumes = await getMangaVolumesAndChapters(targetId, 'en');
    assert(volumes.length > 0, 'Volume-Aware Grouping', `Grouped into ${volumes.length} volumes`);
    if (volumes.length > 0) {
      assert(volumes[0].chapters.length > 0, 'Chapters inside Volume', `${volumes[0].volume} has ${volumes[0].chapters.length} chapters`);
    }
  } catch (e: any) {
    assert(false, 'Volume Aggregate Error', e.message);
  }

  // 4. Manga Page Image Resolver
  try {
    console.log('\n--- 4. Testing Manga Chapter Page Extractor ---');
    const pages = await getChapterPages('sample_chapter_id');
    assert(pages.length > 0 && !!pages[0].imageUrl, 'Manga Chapter Pages Extraction', `Extracted ${pages.length} pages`);
  } catch (e: any) {
    assert(false, 'Manga Pages Error', e.message);
  }

  // 5. Universal Manga Resolver & Fallback
  try {
    console.log('\n--- 5. Testing Universal Manga Resolver ---');
    const mangaData = await resolveMangaFullDetails('solo_leveling_manga');
    assert(!!mangaData.manga && mangaData.volumes.length > 0, 'Manga Full Details Resolution', `Title: ${mangaData.manga?.title}, Volumes: ${mangaData.volumes.length}`);
  } catch (e: any) {
    assert(false, 'Manga Resolver Error', e.message);
  }

  // 6. Multi-Source Light Novel Engine (NovelFull, NovelFire, WuxiaWorld)
  try {
    console.log('\n--- 6. Testing Multi-Source Light Novel Engine ---');
    const novels = await resolveTrendingNovels();
    assert(novels.length >= 4, 'Trending Light Novels', `Found ${novels.length} novels across NovelFull & WuxiaWorld`);
    const shadowSlave = novels.find((n) => n.id === 'shadow_slave');
    assert(!!shadowSlave && shadowSlave.author === 'Guiltythree', 'Novel Metadata Parsing', `Author: ${shadowSlave?.author}`);
  } catch (e: any) {
    assert(false, 'Novel Engine Error', e.message);
  }

  // 7. Light Novel Search
  try {
    console.log('\n--- 7. Testing Light Novel Search ---');
    const results = await resolveNovelSearch('Lord of the Mysteries');
    assert(results.length > 0, 'Novel Search Resolution', `Found ${results[0]?.title} by ${results[0]?.author}`);
  } catch (e: any) {
    assert(false, 'Novel Search Error', e.message);
  }

  // 8. Novel Chapter Text Parser
  try {
    console.log('\n--- 8. Testing Novel Chapter Text Content Parser ---');
    const text = await resolveNovelChapterText('shadow_slave', 1);
    assert(text.length > 100 && text.includes('Sunny'), 'Chapter Text Parsing', `Parsed ${text.length} characters of prose`);
  } catch (e: any) {
    assert(false, 'Novel Text Error', e.message);
  }

  console.log('\n===========================================================');
  console.log(`📊 SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('===========================================================\n');
}

runPhase3Verifications();
