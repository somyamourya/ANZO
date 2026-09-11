import { UserRole } from './community';

export type RankTier =
  | 'E_RANK'
  | 'D_RANK'
  | 'C_RANK'
  | 'B_RANK'
  | 'A_RANK'
  | 'S_RANK'
  | 'NATIONAL_RANK'
  | 'MONARCH';

export interface RankInfo {
  tier: RankTier;
  label: string;
  title: string;
  icon: string;
  color: string;
  glowColor: string;
  minLevel: number;
  perks: string[];
}

export interface UserLevelProgress {
  currentLevel: number;
  currentExp: number;
  nextLevelExp: number;
  totalExp: number;
  rank: RankInfo;
  rankProgressPercent: number;
}

export interface StreakData {
  currentStreakDays: number;
  longestStreakDays: number;
  lastActiveDate: string;
  hasCheckedInToday: boolean;
  streakFreezeTokens: number;
  weeklyHeatmap: boolean[]; // 7 days of the week
  claimedMilestones: number[];
}

export type QuestType = 'DAILY' | 'WEEKLY' | 'ACHIEVEMENT';

export interface QuestItem {
  id: string;
  title: string;
  description: string;
  expReward: number;
  icon: string;
  type: QuestType;
  current: number;
  target: number;
  completed: boolean;
  claimed: boolean;
}

export type CosmeticType = 'AVATAR_FRAME' | 'PROFILE_THEME' | 'NAME_EFFECT';

export interface CosmeticItem {
  id: string;
  name: string;
  type: CosmeticType;
  description: string;
  previewUrl?: string;
  borderColor?: string;
  glowColor?: string;
  requiredRank?: RankTier;
  requiredLevel: number;
  unlocked: boolean;
  isEquipped: boolean;
}

export type LeaderboardCategory = 'GLOBAL_EXP' | 'DAILY_STREAK' | 'EPISODES_WATCHED' | 'MANGA_CHAPTERS';

export interface LeaderboardEntry {
  rankPosition: number;
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  userRole: UserRole;
  rankTag: RankInfo;
  score: number;
  scoreLabel: string;
  isCurrentUser?: boolean;
  equippedFrame?: CosmeticItem;
}
