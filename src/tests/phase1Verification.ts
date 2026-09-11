import { getTrendingAnime, searchAnime, getAnimeDetailsById } from '../api/anilist';
import { fetchKitsuByTitle } from '../api/kitsu';
import { fetchJikanById } from '../api/jikan';
import { fetchTMDBArtwork } from '../api/tmdb';
import { fetchAniSkipTimes } from '../api/aniskip';
import { getEnrichedAnimeDetails } from '../api/metadataAggregator';
import { resolveAnimeStream } from '../api/streaming/streamResolver';
import { parseVTTorSRT, getActiveCueText } from '../utils/subtitleParser';

async function runPhase1Verifications() {
  console.log('====================================================');
  console.log('🚀 RUNNING PHASE 1: FOUNDATION VERIFICATION SUITE');
  console.log('====================================================\n');

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

  // 1. AniList GraphQL API Verification
  try {
    console.log('--- 1. Testing AniList GraphQL Engine ---');
    const trending = await getTrendingAnime(1, 5);
    assert(trending.length > 0, 'AniList Trending Feeds', `Found ${trending.length} anime`);

    const searchRes = await searchAnime({ search: 'Attack on Titan', perPage: 3 });
    assert(searchRes.animeList.length > 0, 'AniList Search Query', `Found ${searchRes.animeList.length} items`);

    const sampleId = trending[0]?.id || 16498;
    const details = await getAnimeDetailsById(sampleId);
    assert(!!details && !!details.title, 'AniList Detailed Media Fetch', `Fetched: ${details?.title.romaji || details?.title.english}`);
  } catch (e: any) {
    assert(false, 'AniList API Error', e.message);
  }

  // 2. Kitsu API Verification
  try {
    console.log('\n--- 2. Testing Kitsu API Fallback ---');
    const kitsu = await fetchKitsuByTitle('Naruto');
    assert(!!kitsu && !!kitsu.id, 'Kitsu Anime Search', `Kitsu ID: ${kitsu?.id}, Episodes: ${kitsu?.episodeCount}`);
  } catch (e: any) {
    assert(false, 'Kitsu API Error', e.message);
  }

  // 3. MyAnimeList / Jikan v4 API Verification
  try {
    console.log('\n--- 3. Testing MyAnimeList (Jikan v4) API ---');
    const jikan = await fetchJikanById(20); // Naruto MAL ID = 20
    assert(!!jikan && typeof jikan.score === 'number', 'Jikan / MAL Data', `MAL Score: ${jikan?.score}, Rank: #${jikan?.rank}`);
  } catch (e: any) {
    assert(false, 'Jikan API Error', e.message);
  }

  // 4. TMDB API Verification
  try {
    console.log('\n--- 4. Testing TMDB 4K Backdrops & Artwork ---');
    const tmdb = await fetchTMDBArtwork('One Piece', 1999);
    assert(!!tmdb && (!!tmdb.backdropUrl || !!tmdb.posterUrl), 'TMDB Artwork API', `Backdrop: ${tmdb?.backdropUrl ? 'Available' : 'Poster Available'}`);
  } catch (e: any) {
    assert(false, 'TMDB API Error', e.message);
  }

  // 5. AniSkip API Verification
  try {
    console.log('\n--- 5. Testing AniSkip OP/ED Timestamp Detection ---');
    const skip = await fetchAniSkipTimes(16498, 1); // Shingeki no Kyojin
    assert(skip.statusCode === 200 || skip.statusCode === 404, 'AniSkip Timestamps Engine', `Status: ${skip.statusCode}, OP: ${skip.op ? `${skip.op.startTime}s-${skip.op.endTime}s` : 'None/Fallback'}`);
  } catch (e: any) {
    assert(false, 'AniSkip API Error', e.message);
  }

  // 6. Unified 4-API Aggregator
  try {
    console.log('\n--- 6. Testing 4-API Unified Aggregator Engine ---');
    const enriched = await getEnrichedAnimeDetails(21); // One Piece AniList ID = 21
    assert(!!enriched && enriched.genres.length > 0, 'Unified Aggregator Merging', `Title: ${enriched?.title.english || enriched?.title.romaji}, Backdrop: ${enriched?.bannerImage ? 'Ready' : 'Cover'}, Genres: ${enriched?.genres.slice(0, 3).join(', ')}`);
  } catch (e: any) {
    assert(false, 'Unified Aggregator Error', e.message);
  }

  // 7. Streaming Provider & Universal Resolver
  try {
    console.log('\n--- 7. Testing Universal Streaming Resolver ---');
    const stream = await resolveAnimeStream({
      animeTitle: 'Solo Leveling',
      episodeNumber: 1,
      malId: 52299,
    });
    assert(!!stream && stream.sources.length > 0, 'Stream Source Extraction', `Provider: ${stream.provider}, Server: ${stream.serverName}, Sources: ${stream.sources.length}, Subtitles: ${stream.subtitles.length}`);
    assert(stream.sources.some(s => s.isM3U8), 'HLS Stream Support', `Primary Stream: ${stream.sources[0]?.url}`);
  } catch (e: any) {
    assert(false, 'Stream Resolver Error', e.message);
  }

  // 8. Subtitle Parser Engine
  try {
    console.log('\n--- 8. Testing Subtitle Parser Engine ---');
    const sampleVtt = `WEBVTT\n\n00:00:01.000 --> 00:00:04.000\nI will become the Pirate King!\n\n00:00:05.000 --> 00:00:08.500\nLet's go to the Grand Line!`;
    const cues = parseVTTorSRT(sampleVtt);
    const cueAt2s = getActiveCueText(cues, 2.5);
    const cueAt6s = getActiveCueText(cues, 6.0);
    assert(cues.length === 2 && cueAt2s === 'I will become the Pirate King!' && cueAt6s === "Let's go to the Grand Line!", 'WebVTT / SRT Parsing & Cue Lookup', `Cues parsed: ${cues.length}`);
  } catch (e: any) {
    assert(false, 'Subtitle Parser Error', e.message);
  }

  console.log('\n====================================================');
  console.log(`📊 SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('====================================================\n');
}

runPhase1Verifications();
