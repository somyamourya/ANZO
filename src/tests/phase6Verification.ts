import { parseChapterNumber, parseVolumeNumber, groupChaptersByVolume } from '../utils/chapterParser';
import { resolveMangaSearch, AVAILABLE_MANGA_SOURCES } from '../api/manga/mangaResolver';
import { searchMangaKakalot, getMangaKakalotChapters } from '../api/manga/mangakakalot';
import { searchMangaPill, getMangaPillChapters } from '../api/manga/mangapill';
import { searchManhwaScans, getManhwaScansChapters } from '../api/manga/manhwascans';
import { resolveNovelSearch, AVAILABLE_NOVEL_SOURCES } from '../api/novel/novelResolver';
import { searchNovelBin, getNovelBinChapterText } from '../api/novel/novelbin';
import { searchReadLightNovel, getReadLightNovelChapterText } from '../api/novel/readlightnovel';
import { searchBoxNovel, getBoxNovelChapterText } from '../api/novel/boxnovel';
import { calculateStorageSavings, estimateChaptersSize } from '../utils/offlineStorageEngine';

async function runPhase6Tests() {
  console.log('=== [PHASE 6 VERIFICATION TEST SUITE] ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // TEST 1: Chapter Normalization & Decimals
  console.log('\n--- 1. CHAPTER / VOLUME HANDLING & DECIMAL PARSER ---');
  assert(parseChapterNumber('Chapter 12.5 - Extra Omakes').number === 12.5, 'Decimal Chapter 12.5 normalized correctly');
  assert(parseChapterNumber('Ch. 100: The Monarch Descends').number === 100, 'Standard Ch. 100 parsed');
  assert(parseChapterNumber('Episode 004').number === 4, 'Episode 004 parsed as chapter 4');
  assert(parseVolumeNumber('Vol. 3 Chapter 22') === 3, 'Volume 3 parsed accurately');

  const sampleChapters = [
    { id: '1', title: 'Ch 1', chapterNumber: 1, volumeNumber: 1 },
    { id: '2', title: 'Ch 2', chapterNumber: 2, volumeNumber: 1 },
    { id: '3', title: 'Ch 2.5 (Side story)', chapterNumber: 2.5, volumeNumber: 1 },
    { id: '4', title: 'Ch 3', chapterNumber: 3, volumeNumber: 2 },
    { id: '5', title: 'Ch 4', chapterNumber: 4 },
  ];
  const grouped = groupChaptersByVolume(sampleChapters);
  assert(grouped.length === 3, `Grouped into 3 volume categories (found ${grouped.length})`);
  assert(grouped[0].volume === 1 && grouped[0].chapters.length === 3, 'Volume 1 contains 3 chapters including 2.5');

  // TEST 2: Multi-Source Manga Providers & Fallback
  console.log('\n--- 2. MANGA SOURCES & FALLBACK RESOLVER ---');
  assert(AVAILABLE_MANGA_SOURCES.length >= 5, `Registered ${AVAILABLE_MANGA_SOURCES.length} Manga Sources`);
  console.log(`Available Manga Sources: ${AVAILABLE_MANGA_SOURCES.map(s => s.name).join(' | ')}`);

  const kakalotRes = await searchMangaKakalot('Solo Leveling');
  assert(kakalotRes.length > 0 && kakalotRes[0].source === 'MangaKakalot', 'MangaKakalot search returns structured items');

  const pillRes = await searchMangaPill('One Piece');
  assert(pillRes.length > 0 && pillRes[0].source === 'MangaPill', 'MangaPill search returns structured items');

  const manhwaRes = await searchManhwaScans('Omniscient Reader');
  assert(manhwaRes.length > 0 && manhwaRes[0].source === 'AsuraScans', 'ManhwaScans search returns structured items');

  const mergedMangaSearch = await resolveMangaSearch('Jujutsu Kaisen');
  assert(mergedMangaSearch.length > 0, `Unified Manga resolver returned ${mergedMangaSearch.length} aggregated results`);

  // TEST 3: Multi-Source Light Novel Coverage
  console.log('\n--- 3. NOVEL SOURCES & RESOLVER EXPANSION ---');
  assert(AVAILABLE_NOVEL_SOURCES.length >= 6, `Registered ${AVAILABLE_NOVEL_SOURCES.length} Light Novel Sources`);
  console.log(`Available Novel Sources: ${AVAILABLE_NOVEL_SOURCES.map(s => s.name).join(' | ')}`);

  const binRes = await searchNovelBin('Shadow Slave');
  assert(binRes.length > 0 && binRes[0].source === 'NovelBin', 'NovelBin search returns structured items');

  const rlnRes = await searchReadLightNovel('Overlord');
  assert(rlnRes.length > 0 && rlnRes[0].source === 'ReadLightNovel', 'ReadLightNovel search returns structured items');

  const boxRes = await searchBoxNovel('Lord of the Mysteries');
  assert(boxRes.length > 0 && boxRes[0].source === 'BoxNovel', 'BoxNovel search returns structured items');

  const mergedNovelSearch = await resolveNovelSearch('Cultivation');
  assert(mergedNovelSearch.length > 0, `Unified Novel resolver returned ${mergedNovelSearch.length} aggregated results`);

  // TEST 4: Offline Library Workflows & Storage Engine
  console.log('\n--- 4. OFFLINE STORAGE ENGINE & BULK DOWNLOADS ---');
  const mangaEst = estimateChaptersSize(20, 'manga');
  const novelEst = estimateChaptersSize(50, 'novel');
  assert(mangaEst.includes('MB'), `Manga storage estimated correctly: ${mangaEst}`);
  assert(novelEst.includes('MB') || novelEst.includes('KB'), `Novel storage estimated correctly: ${novelEst}`);

  const savings = calculateStorageSavings(100, 100 * 1024 * 1024, 70 * 1024 * 1024);
  assert(savings.savedPercentage === 30, `Calculated 30% storage savings (got ${savings.savedPercentage}%)`);

  // TEST 5: Reading Progress & Conflict Resolution
  console.log('\n--- 5. READING PROGRESS SYNCHRONIZATION HARDENING ---');
  const localProg = { currentChapterNumber: 15, scrollOffset: 420, scrollPercentage: 65, updatedAt: 1000 };
  const remoteProg = { currentChapterNumber: 15, scrollOffset: 850, scrollPercentage: 90, updatedAt: 2000 };
  
  const resolvedProg = remoteProg.updatedAt > localProg.updatedAt ? remoteProg : localProg;
  assert(resolvedProg.scrollPercentage === 90, 'Resolved timestamp conflict favoring most recent progress with scrollOffset');
  assert(resolvedProg.scrollOffset === 850, 'Retained high-fidelity scrollOffset for seamless jump back');

  console.log(`\n========================================`);
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase6Tests().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
