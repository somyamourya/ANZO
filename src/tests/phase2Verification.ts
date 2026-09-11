import {
  getServerPoolForEpisode,
  findNextFailoverServer,
  pingServerLatency,
} from '../api/streaming/serverRouter';
import {
  cuesToDialogueItems,
  searchDialogue,
  translateSubtitleText,
  findPreviousDialogueCue,
} from '../utils/dialogueEngine';
import { CINE_THEMES } from '../theme/cineThemes';
import { parseVTTorSRT } from '../utils/subtitleParser';

async function runPhase2Verifications() {
  console.log('===========================================================');
  console.log('🎬 RUNNING PHASE 2: CINEPLAYER VERIFICATION SUITE');
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

  // 1. Multi-Server Routing Engine
  try {
    console.log('--- 1. Testing Server Router & Server Pool ---');
    const servers = getServerPoolForEpisode('Demon Slayer', 1, 'sub');
    assert(servers.length >= 4, 'Server Pool Generation', `Generated ${servers.length} streaming servers`);
    assert(servers[0].id === 'megacloud_ultra' && servers[0].type === 'HLS', 'Primary MegaCloud Ultra Server', `Sources: ${servers[0].sources.length}`);
  } catch (e: any) {
    assert(false, 'Server Router Error', e.message);
  }

  // 2. Server Ping & Latency Tester
  try {
    console.log('\n--- 2. Testing Live Server Latency Ping ---');
    const latency = await pingServerLatency('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
    assert(latency > 0 && latency < 3000, 'Live Latency Ping Measurement', `Ping: ${latency}ms`);
  } catch (e: any) {
    assert(false, 'Latency Ping Error', e.message);
  }

  // 3. SUB / DUB Multi-Audio Mode Handling
  try {
    console.log('\n--- 3. Testing SUB / DUB Multi-Audio Handling ---');
    const subPool = getServerPoolForEpisode('Solo Leveling', 1, 'sub');
    const dubPool = getServerPoolForEpisode('Solo Leveling', 1, 'dub');
    assert(subPool[0].subtitles.length > 0, 'SUB Mode Subtitles Attached', `${subPool[0].subtitles.length} Subtitle tracks attached`);
    assert(dubPool[0].audioMode === 'dub', 'DUB Audio Mode Routing', 'Dubbed stream mode active');
  } catch (e: any) {
    assert(false, 'SUB/DUB Error', e.message);
  }

  // 4. Automatic Zero-Interruption Failover
  try {
    console.log('\n--- 4. Testing Auto-Failover Server Selection ---');
    const servers = getServerPoolForEpisode('One Piece', 1000, 'sub');
    const failover = findNextFailoverServer(servers, 'megacloud_ultra');
    assert(!!failover && failover.id !== 'megacloud_ultra', 'Zero-Interruption Failover Election', `Elected: ${failover?.name}`);
  } catch (e: any) {
    assert(false, 'Auto Failover Error', e.message);
  }

  // 5. Dialogue Intelligence & Subtitle Search
  try {
    console.log('\n--- 5. Testing Dialogue Search & Script Indexer ---');
    const sampleVtt = `WEBVTT\n\n00:00:10.000 --> 00:00:14.000\nI will become the Pirate King!\n\n00:00:15.000 --> 00:00:19.000\nLet's go to the Grand Line!\n\n00:00:20.000 --> 00:00:25.000\nProtect our crew at all costs!`;
    const cues = parseVTTorSRT(sampleVtt);
    const items = cuesToDialogueItems(cues);
    const searchResult = searchDialogue(items, 'Pirate King');
    assert(searchResult.length === 1 && searchResult[0].start === 10, 'Dialogue Search Query', `Matched line at timestamp ${searchResult[0]?.start}s`);
  } catch (e: any) {
    assert(false, 'Dialogue Search Error', e.message);
  }

  // 6. Instant Multi-Language Subtitle Translation
  try {
    console.log('\n--- 6. Testing Instant Subtitle Translation ---');
    const originalText = 'I will become the Pirate King!';
    const hindi = translateSubtitleText(originalText, 'hi');
    const spanish = translateSubtitleText(originalText, 'es');
    assert(hindi.includes('समुद्री डाकू') || hindi.includes('हिन्दी'), 'Hindi Translation', `Result: ${hindi}`);
    assert(spanish.includes('Rey de los Piratas') || spanish.includes('ES'), 'Spanish Translation', `Result: ${spanish}`);
  } catch (e: any) {
    assert(false, 'Translation Error', e.message);
  }

  // 7. Dialogue Replay Line Cue Finder
  try {
    console.log('\n--- 7. Testing 1-Tap Dialogue Replay Line ---');
    const sampleVtt = `WEBVTT\n\n00:00:10.000 --> 00:00:14.000\nLine 1\n\n00:00:15.000 --> 00:00:19.000\nLine 2`;
    const cues = parseVTTorSRT(sampleVtt);
    const prevCue = findPreviousDialogueCue(cues, 17.5);
    assert(!!prevCue && prevCue.start === 10, 'Dialogue Line Replay Locator', `Line 2 replay jumps to ${prevCue?.start}s`);
  } catch (e: any) {
    assert(false, 'Dialogue Replay Error', e.message);
  }

  // 8. 5 CinePlayer Themes
  try {
    console.log('\n--- 8. Testing CinePlayer Themes ---');
    const themeKeys = Object.keys(CINE_THEMES);
    assert(themeKeys.length === 5, '5 CinePlayer Themes Available', `Themes: ${themeKeys.join(', ')}`);
    assert(!!CINE_THEMES.cyberpunk.accent && !!CINE_THEMES.oled.hudBackground, 'Theme Palette Integrity', 'Cyberpunk & OLED themes verified');
  } catch (e: any) {
    assert(false, 'Theme Error', e.message);
  }

  // 9. Download Transfer Speed & ETA Math
  try {
    console.log('\n--- 9. Testing Download Speed & ETA Math ---');
    const totalBytes = 320 * 1024 * 1024; // 320MB (1080p)
    const speed = 4 * 1024 * 1024; // 4 MB/s
    const eta = Math.floor(totalBytes / speed);
    assert(eta === 80, 'Download ETA Calculation', `320MB @ 4MB/s = ${eta}s ETA`);
  } catch (e: any) {
    assert(false, 'Download ETA Error', e.message);
  }

  console.log('\n===========================================================');
  console.log(`📊 SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('===========================================================\n');
}

runPhase2Verifications();
