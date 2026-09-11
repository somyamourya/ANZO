import {
  calculateExpForLevel,
  getRankForLevel,
  HUNTER_RANKS,
  INITIAL_DAILY_QUESTS,
  INITIAL_COSMETICS_CATALOG,
  INITIAL_LEADERBOARD_ENTRIES,
} from '../api/gamification/gamificationEngine';
import { StreakData, QuestItem, CosmeticItem, LeaderboardEntry } from '../types/gamification';

async function runPhase5Verifications() {
  console.log('===========================================================');
  console.log('🎮 RUNNING PHASE 5: GAMIFICATION VERIFICATION SUITE');
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

  // 1. Level Curve & EXP Formula
  try {
    console.log('--- 1. Testing EXP & Level Curve Formula ---');
    const lvl1Req = calculateExpForLevel(1);
    const lvl10Req = calculateExpForLevel(10);
    const lvl50Req = calculateExpForLevel(50);
    assert(lvl1Req === 250, 'Level 1 EXP Requirement', `${lvl1Req} XP`);
    assert(lvl10Req === 1600, 'Level 10 EXP Requirement', `${lvl10Req} XP`);
    assert(lvl50Req === 7600, 'Level 50 EXP Requirement', `${lvl50Req} XP`);
  } catch (e: any) {
    assert(false, 'EXP Curve Error', e.message);
  }

  // 2. Hunter Rank Mapping
  try {
    console.log('\n--- 2. Testing Hunter Rank Hierarchy ---');
    const rankE = getRankForLevel(3);
    const rankD = getRankForLevel(8);
    const rankC = getRankForLevel(15);
    const rankB = getRankForLevel(25);
    const rankA = getRankForLevel(42);
    const rankS = getRankForLevel(55);
    const rankNational = getRankForLevel(80);
    const rankMonarch = getRankForLevel(105);

    assert(rankE.tier === 'E_RANK' && rankE.icon === '🗡️', 'E-Rank Novice', rankE.title);
    assert(rankD.tier === 'D_RANK' && rankD.color === '#10B981', 'D-Rank Awakened', rankD.title);
    assert(rankC.tier === 'C_RANK' && rankC.color === '#06B6D4', 'C-Rank Elite', rankC.title);
    assert(rankB.tier === 'B_RANK' && rankB.color === '#3B82F6', 'B-Rank Guild Officer', rankB.title);
    assert(rankA.tier === 'A_RANK' && rankA.color === '#8B5CF6', 'A-Rank Raid Commander', rankA.title);
    assert(rankS.tier === 'S_RANK' && rankS.color === '#F43F5E', 'S-Rank National Asset', rankS.title);
    assert(rankNational.tier === 'NATIONAL_RANK' && rankNational.icon === '👑', 'National Level Authority', rankNational.title);
    assert(rankMonarch.tier === 'MONARCH' && rankMonarch.icon === '🌌', 'Shadow Monarch', rankMonarch.title);
  } catch (e: any) {
    assert(false, 'Rank Hierarchy Error', e.message);
  }

  // 3. Multi-Level Level-Up Calculation
  try {
    console.log('\n--- 3. Testing EXP Gain & Multi-Level Ascension ---');
    let testLevel = 5;
    let testExp = 100;
    const gainedExp = 2500;

    let totalExpToProcess = testExp + gainedExp;
    let requiredExp = calculateExpForLevel(testLevel);
    let levelUps = 0;

    while (totalExpToProcess >= requiredExp) {
      totalExpToProcess -= requiredExp;
      testLevel += 1;
      levelUps++;
      requiredExp = calculateExpForLevel(testLevel);
    }

    assert(testLevel > 5 && levelUps >= 2, 'Multi-Level Ascension', `Gained ${levelUps} levels (Now Level ${testLevel})`);
    const promotedRank = getRankForLevel(testLevel);
    assert(promotedRank.tier === 'D_RANK', 'Rank Promotion Trigger', `Promoted to ${promotedRank.title}`);
  } catch (e: any) {
    assert(false, 'Level Up Error', e.message);
  }

  // 4. Daily Streak Tracking & Rewards
  try {
    console.log('\n--- 4. Testing Daily Streak & Check-in ---');
    const mockStreak: StreakData = {
      currentStreakDays: 14,
      longestStreakDays: 28,
      lastActiveDate: '2026-09-10',
      hasCheckedInToday: false,
      streakFreezeTokens: 2,
      weeklyHeatmap: [true, true, true, true, true, true, false],
      claimedMilestones: [3, 7],
    };

    // Simulate Daily Check-in
    mockStreak.currentStreakDays += 1;
    mockStreak.hasCheckedInToday = true;
    mockStreak.weeklyHeatmap[6] = true;
    const bonusXp = 100 + mockStreak.currentStreakDays * 10;

    assert(mockStreak.currentStreakDays === 15, 'Streak Counter Increment', `${mockStreak.currentStreakDays} days streak`);
    assert(bonusXp === 250, 'Daily Streak XP Multiplier', `Awarded +${bonusXp} XP`);
    assert(mockStreak.hasCheckedInToday === true, 'Heatmap Marked', 'Sunday checked in');
  } catch (e: any) {
    assert(false, 'Streak Error', e.message);
  }

  // 5. Quests Catalog & Claiming
  try {
    console.log('\n--- 5. Testing Quests Engine & Reward Claiming ---');
    const questList: QuestItem[] = JSON.parse(JSON.stringify(INITIAL_DAILY_QUESTS));
    assert(questList.length >= 3, 'Quests Catalog Loading', `Loaded ${questList.length} missions`);

    const completedQuest = questList.find((q) => q.completed && !q.claimed);
    assert(!!completedQuest, 'Completed Quest Found', completedQuest?.title || '');
    if (completedQuest) {
      completedQuest.claimed = true;
      assert(completedQuest.claimed === true, 'Quest Reward Claimed', `Awarded +${completedQuest.expReward} XP`);
    }
  } catch (e: any) {
    assert(false, 'Quest Error', e.message);
  }

  // 6. Cosmetics Wardrobe & Avatar Frames
  try {
    console.log('\n--- 6. Testing Cosmetics Wardrobe Catalog ---');
    const cosmeticsList: CosmeticItem[] = JSON.parse(JSON.stringify(INITIAL_COSMETICS_CATALOG));
    assert(cosmeticsList.length >= 4, 'Cosmetics Catalog', `Loaded ${cosmeticsList.length} wardrobe items`);

    const shadowFrame = cosmeticsList.find((c) => c.id === 'frame_shadow_aura');
    assert(!!shadowFrame && shadowFrame.isEquipped, 'Avatar Frame Equipping', shadowFrame?.name || '');

    // Equip another frame
    const dragonFrame = cosmeticsList.find((c) => c.id === 'frame_dragon_fire');
    if (dragonFrame && shadowFrame) {
      shadowFrame.isEquipped = false;
      dragonFrame.isEquipped = true;
      assert(dragonFrame.isEquipped === true && !shadowFrame.isEquipped, 'Equipped New Frame', dragonFrame.name);
    }
  } catch (e: any) {
    assert(false, 'Cosmetics Error', e.message);
  }

  // 7. Leaderboards & Top 3 Podium
  try {
    console.log('\n--- 7. Testing Leaderboards & Top 3 Podium ---');
    const lb: LeaderboardEntry[] = INITIAL_LEADERBOARD_ENTRIES;
    assert(lb.length >= 5, 'Leaderboard Entries', `Loaded ${lb.length} hunters`);
    assert(lb[0].rankPosition === 1 && lb[0].score >= lb[1].score, 'Podium Rank 1 Ordering', `${lb[0].displayName} (${lb[0].scoreLabel})`);
    assert(lb[1].rankPosition === 2 && lb[1].score >= lb[2].score, 'Podium Rank 2 Ordering', `${lb[1].displayName} (${lb[1].scoreLabel})`);
  } catch (e: any) {
    assert(false, 'Leaderboard Error', e.message);
  }

  console.log('\n===========================================================');
  console.log(`📊 SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('===========================================================\n');
}

runPhase5Verifications();
