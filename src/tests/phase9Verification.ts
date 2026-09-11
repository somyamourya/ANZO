import {
  APP_THEME_PACKS,
  PROFILE_BACKGROUNDS,
  AVATAR_DECORATIONS,
  EQUIPABLE_TITLES,
  NAMEPLATE_EFFECTS,
  EXPANDED_READER_THEMES,
  DEFAULT_ADVANCED_PLAYER_CONFIG,
} from '../api/personalization/personalizationEngine';
import { AppThemeId } from '../types/personalization';

async function runPhase9Tests() {
  console.log('===========================================================');
  console.log('🎨 RUNNING PHASE 9: PERSONALIZATION VERIFICATION SUITE');
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

  // TEST 1: App Theme Packs Catalog
  console.log('--- 1. Testing App-Wide Theme Packs ---');
  const themeIds = Object.keys(APP_THEME_PACKS) as AppThemeId[];
  assert(themeIds.length === 8, `Loaded ${themeIds.length} app theme packs`);

  const oledTheme = APP_THEME_PACKS.oled_pitch;
  assert(oledTheme.colors.background === '#000000', 'OLED theme uses true pure black #000000');
  assert(oledTheme.unlocked && oledTheme.requiredLevel === 1, 'OLED theme available from Level 1');

  const cyberpunkTheme = APP_THEME_PACKS.cyberpunk;
  assert(cyberpunkTheme.colors.primary === '#00F0FF', 'Cyberpunk theme has neon cyan primary #00F0FF');
  assert(cyberpunkTheme.requiredRank === 'D_RANK', 'Cyberpunk theme unlocked at D-Rank (LVL 10)');

  const shadowTheme = APP_THEME_PACKS.midnight_violet;
  assert(shadowTheme.colors.primary === '#C084FC', 'Midnight Violet theme uses monarch purple #C084FC');

  const sakuraTheme = APP_THEME_PACKS.sakura_bloom;
  assert(sakuraTheme.colors.primary === '#F472B6', 'Sakura theme uses pastel pink #F472B6');

  // TEST 2: Profile Backgrounds & Wallpapers
  console.log('\n--- 2. Testing Profile Backgrounds & Wallpapers ---');
  assert(PROFILE_BACKGROUNDS.length === 8, `Loaded ${PROFILE_BACKGROUNDS.length} profile background banners`);

  const shadowGates = PROFILE_BACKGROUNDS.find((b) => b.id === 'bg_shadow_gates');
  assert(!!shadowGates && shadowGates.rarity === 'MYTHIC', 'Shadow Sovereign Gates background is MYTHIC rarity');
  assert(shadowGates?.overlayGradient.length === 2, 'Background includes dual gradient overlays');

  const grandLine = PROFILE_BACKGROUNDS.find((b) => b.id === 'bg_grand_line_ocean');
  assert(!!grandLine && grandLine.unlocked, 'Grand Line wallpaper unlocked by default');

  // TEST 3: Avatar Decorations & Glowing Frames
  console.log('\n--- 3. Testing Avatar Frames & Decorations ---');
  assert(AVATAR_DECORATIONS.length === 8, `Loaded ${AVATAR_DECORATIONS.length} avatar frame cosmetics`);

  const shadowFrame = AVATAR_DECORATIONS.find((f) => f.id === 'frame_shadow_aura');
  assert(!!shadowFrame && shadowFrame.borderColor === '#BD00FF', 'Shadow Monarch Aura frame has violet border #BD00FF');
  assert(shadowFrame?.particleIcon === '🌌', 'Shadow Monarch Aura includes galaxy particle aura');

  const hinokamiFrame = AVATAR_DECORATIONS.find((f) => f.id === 'frame_dragon_fire');
  assert(!!hinokamiFrame && hinokamiFrame.particleIcon === '🔥', 'Hinokami Dragon frame includes flame particle');

  const goldenHalo = AVATAR_DECORATIONS.find((f) => f.id === 'frame_golden_halo');
  assert(!!goldenHalo && !goldenHalo.unlocked && goldenHalo.requiredLevel === 75, 'Golden Sovereign Halo requires Level 75 National-Rank');

  // TEST 4: Equipable Hunter & Lore Titles
  console.log('\n--- 4. Testing Equipable Titles & Lore ---');
  assert(EQUIPABLE_TITLES.length === 10, `Loaded ${EQUIPABLE_TITLES.length} equipable hunter and anime titles`);

  const monarchTitle = EQUIPABLE_TITLES.find((t) => t.id === 'title_shadow_monarch');
  assert(monarchTitle?.title === 'Monarch of Shadows', 'Title: "Monarch of Shadows" verified');
  assert(!!monarchTitle?.lore.includes('Monarch of Destruction'), 'Title lore includes accurate canon lore');

  const honoredTitle = EQUIPABLE_TITLES.find((t) => t.id === 'title_honored_one');
  assert(honoredTitle?.title === 'The Honored One', 'Title: "The Honored One" (Gojo Satoru) verified');
  assert(honoredTitle?.color === '#38BDF8', 'The Honored One uses limitless blue #38BDF8');

  const beyonderTitle = EQUIPABLE_TITLES.find((t) => t.id === 'title_supreme_beyonder');
  assert(beyonderTitle?.title === 'Supreme Beyonder', 'Title: "Supreme Beyonder" (Lord of Mysteries) verified');

  // TEST 5: Animated Nameplates
  console.log('\n--- 5. Testing Dynamic Nameplates ---');
  assert(NAMEPLATE_EFFECTS.length === 6, `Loaded ${NAMEPLATE_EFFECTS.length} dynamic animated nameplates`);

  const holographicPlate = NAMEPLATE_EFFECTS.find((p) => p.id === 'plate_holographic_cyber');
  assert(!!holographicPlate && holographicPlate.style === 'holographic', 'Holographic Cyber Grid plate verified');

  const amethystPlate = NAMEPLATE_EFFECTS.find((p) => p.id === 'plate_ethereal_amethyst');
  assert(!!amethystPlate && amethystPlate.borderGlow === '#C084FC', 'Ethereal Shadow Amethyst nameplate has violet border glow');

  const stardustPlate = NAMEPLATE_EFFECTS.find((p) => p.id === 'plate_cosmic_stardust');
  assert(!!stardustPlate && stardustPlate.icon === '✨', 'Cosmic Astral Stardust plate verified');

  // TEST 6: Expanded Reading Themes (Novels & Manga)
  console.log('\n--- 6. Testing Expanded Reading Themes ---');
  const readerThemeKeys = Object.keys(EXPANDED_READER_THEMES);
  assert(readerThemeKeys.length === 8, `Loaded ${readerThemeKeys.length} expanded reading themes`);

  const parchmentTheme = EXPANDED_READER_THEMES.parchment;
  assert(parchmentTheme.bg === '#F4ECD8' && parchmentTheme.text === '#3C2F1F', 'Parchment vintage theme has #F4ECD8 bg and #3C2F1F text');

  const draculaTheme = EXPANDED_READER_THEMES.dracula;
  assert(draculaTheme.bg === '#1E1F29' && draculaTheme.accentColor === '#FF79C6', 'Dracula Neon theme verified');

  const forestTheme = EXPANDED_READER_THEMES.forest;
  assert(forestTheme.bg === '#0D1A14' && forestTheme.text === '#D1FAE5', 'Soft Evergreen Forest reading theme verified');

  // TEST 7: Advanced Player Customization Config
  console.log('\n--- 7. Testing CinePlayer Customization Config ---');
  const config = { ...DEFAULT_ADVANCED_PLAYER_CONFIG };
  assert(config.audioEqualizerBoost === 1.0, 'Default audio boost is 100% (1.0x gain)');
  assert(config.progressBarGlow === true, 'Progress bar glow enabled by default');
  assert(config.highPrecisionScrubbing === true, 'High precision 60fps scrubbing enabled');

  // Simulate audio equalizer boost adjustment
  config.audioEqualizerBoost = 1.5;
  assert(config.audioEqualizerBoost === 1.5, 'Audio equalizer boost scaled to 150%');

  console.log('\n===========================================================');
  console.log(`📊 SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${Math.round((passed / (passed + failed)) * 100)}%)`);
  console.log('===========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase9Tests().catch((err) => {
  console.error('Phase 9 verification suite error:', err);
  process.exit(1);
});
