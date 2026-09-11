import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserLevelProgress,
  StreakData,
  QuestItem,
  CosmeticItem,
  LeaderboardEntry,
  LeaderboardCategory,
  RankInfo,
} from '../types/gamification';
import {
  calculateExpForLevel,
  getRankForLevel,
  INITIAL_DAILY_QUESTS,
  INITIAL_COSMETICS_CATALOG,
  INITIAL_LEADERBOARD_ENTRIES,
  HUNTER_RANKS,
} from '../api/gamification/gamificationEngine';

interface LevelUpInfo {
  visible: boolean;
  newLevel: number;
  newRank?: RankInfo;
  unlockedPerks: string[];
}

interface GamificationContextType {
  levelProgress: UserLevelProgress;
  streak: StreakData;
  quests: QuestItem[];
  cosmetics: CosmeticItem[];
  leaderboard: LeaderboardEntry[];
  leaderboardCategory: LeaderboardCategory;
  setLeaderboardCategory: (category: LeaderboardCategory) => void;
  gainExp: (amount: number, reason?: string) => void;
  checkInDaily: () => void;
  claimQuestReward: (questId: string) => void;
  equipCosmetic: (cosmeticId: string) => void;
  levelUpModalData: LevelUpInfo | null;
  closeLevelUpModal: () => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

const STORAGE_LEVEL_KEY = '@animenext_gamification_level';
const STORAGE_STREAK_KEY = '@animenext_gamification_streak';
const STORAGE_QUESTS_KEY = '@animenext_gamification_quests';
const STORAGE_COSMETICS_KEY = '@animenext_gamification_cosmetics';

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [level, setLevel] = useState<number>(42);
  const [currentExp, setCurrentExp] = useState<number>(420);
  const [totalExp, setTotalExp] = useState<number>(8420);
  const [streak, setStreak] = useState<StreakData>({
    currentStreakDays: 14,
    longestStreakDays: 28,
    lastActiveDate: new Date().toISOString().split('T')[0],
    hasCheckedInToday: true,
    streakFreezeTokens: 2,
    weeklyHeatmap: [true, true, true, true, true, true, true],
    claimedMilestones: [3, 7],
  });
  const [quests, setQuests] = useState<QuestItem[]>(INITIAL_DAILY_QUESTS);
  const [cosmetics, setCosmetics] = useState<CosmeticItem[]>(INITIAL_COSMETICS_CATALOG);
  const [leaderboardCategory, setLeaderboardCategory] = useState<LeaderboardCategory>('GLOBAL_EXP');
  const [levelUpModalData, setLevelUpModalData] = useState<LevelUpInfo | null>(null);

  // Load from local storage
  useEffect(() => {
    (async () => {
      try {
        const storedLevel = await AsyncStorage.getItem(STORAGE_LEVEL_KEY);
        if (storedLevel) {
          const parsed = JSON.parse(storedLevel);
          setLevel(parsed.level || 42);
          setCurrentExp(parsed.currentExp || 420);
          setTotalExp(parsed.totalExp || 8420);
        }

        const storedStreak = await AsyncStorage.getItem(STORAGE_STREAK_KEY);
        if (storedStreak) setStreak(JSON.parse(storedStreak));

        const storedQuests = await AsyncStorage.getItem(STORAGE_QUESTS_KEY);
        if (storedQuests) setQuests(JSON.parse(storedQuests));

        const storedCosmetics = await AsyncStorage.getItem(STORAGE_COSMETICS_KEY);
        if (storedCosmetics) setCosmetics(JSON.parse(storedCosmetics));
      } catch (e) {
        console.warn('[GamificationContext] Failed to load persisted state:', e);
      }
    })();
  }, []);

  const nextLevelExp = calculateExpForLevel(level);
  const currentRank = getRankForLevel(level);
  const rankProgressPercent = Math.min(100, Math.floor((currentExp / nextLevelExp) * 100));

  const levelProgress: UserLevelProgress = {
    currentLevel: level,
    currentExp,
    nextLevelExp,
    totalExp,
    rank: currentRank,
    rankProgressPercent,
  };

  // Gain EXP & handle Level Up
  const gainExp = (amount: number, reason = 'Activity') => {
    let newExp = currentExp + amount;
    let newLevel = level;
    let newTotalExp = totalExp + amount;
    let requiredExp = calculateExpForLevel(newLevel);
    let didLevelUp = false;

    while (newExp >= requiredExp) {
      newExp -= requiredExp;
      newLevel += 1;
      requiredExp = calculateExpForLevel(newLevel);
      didLevelUp = true;
    }

    setLevel(newLevel);
    setCurrentExp(newExp);
    setTotalExp(newTotalExp);

    AsyncStorage.setItem(
      STORAGE_LEVEL_KEY,
      JSON.stringify({ level: newLevel, currentExp: newExp, totalExp: newTotalExp })
    ).catch(console.warn);

    if (didLevelUp) {
      const updatedRank = getRankForLevel(newLevel);
      const isNewRank = updatedRank.tier !== currentRank.tier;
      setLevelUpModalData({
        visible: true,
        newLevel,
        newRank: isNewRank ? updatedRank : undefined,
        unlockedPerks: updatedRank.perks,
      });
    }
  };

  // Daily Streak Check-in
  const checkInDaily = () => {
    if (streak.hasCheckedInToday) return;

    const newStreakDays = streak.currentStreakDays + 1;
    const newLongest = Math.max(streak.longestStreakDays, newStreakDays);
    const updatedHeatmap = [...streak.weeklyHeatmap.slice(1), true];

    const updatedStreak: StreakData = {
      ...streak,
      currentStreakDays: newStreakDays,
      longestStreakDays: newLongest,
      hasCheckedInToday: true,
      weeklyHeatmap: updatedHeatmap,
      lastActiveDate: new Date().toISOString().split('T')[0],
    };

    setStreak(updatedStreak);
    AsyncStorage.setItem(STORAGE_STREAK_KEY, JSON.stringify(updatedStreak)).catch(console.warn);

    // Award bonus XP for daily check-in (100 base + 10 per streak day)
    const bonusXp = 100 + newStreakDays * 10;
    gainExp(bonusXp, 'Daily Streak Check-in');
  };

  // Claim Quest Reward
  const claimQuestReward = (questId: string) => {
    const targetQuest = quests.find((q) => q.id === questId);
    if (!targetQuest || !targetQuest.completed || targetQuest.claimed) return;

    const updatedQuests = quests.map((q) => (q.id === questId ? { ...q, claimed: true } : q));
    setQuests(updatedQuests);
    AsyncStorage.setItem(STORAGE_QUESTS_KEY, JSON.stringify(updatedQuests)).catch(console.warn);

    gainExp(targetQuest.expReward, `Quest: ${targetQuest.title}`);
  };

  // Equip Cosmetic Item (Avatar Frame, Theme, Name Effect)
  const equipCosmetic = (cosmeticId: string) => {
    const target = cosmetics.find((c) => c.id === cosmeticId);
    if (!target || !target.unlocked) return;

    const updated = cosmetics.map((c) => {
      if (c.type === target.type) {
        return { ...c, isEquipped: c.id === cosmeticId };
      }
      return c;
    });

    setCosmetics(updated);
    AsyncStorage.setItem(STORAGE_COSMETICS_KEY, JSON.stringify(updated)).catch(console.warn);
  };

  const closeLevelUpModal = () => {
    setLevelUpModalData(null);
  };

  // Build Leaderboard list with active user info
  const activeFrame = cosmetics.find((c) => c.type === 'AVATAR_FRAME' && c.isEquipped);
  const updatedLeaderboard = INITIAL_LEADERBOARD_ENTRIES.map((entry) => {
    if (entry.isCurrentUser) {
      return {
        ...entry,
        rankTag: currentRank,
        score: totalExp,
        scoreLabel: `${totalExp.toLocaleString()} XP`,
        equippedFrame: activeFrame,
      };
    }
    return entry;
  });

  return (
    <GamificationContext.Provider
      value={{
        levelProgress,
        streak,
        quests,
        cosmetics,
        leaderboard: updatedLeaderboard,
        leaderboardCategory,
        setLeaderboardCategory,
        gainExp,
        checkInDaily,
        claimQuestReward,
        equipCosmetic,
        levelUpModalData,
        closeLevelUpModal,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};
