import { UnifiedAnime } from './anime';

export type UserRole = 'OWNER' | 'ADMIN' | 'MODERATOR' | 'VIP' | 'CREATOR' | 'MEMBER';

export interface UserBadge {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  unlockedAt?: string;
}

export interface UserActivity {
  id: string;
  type: 'WATCHED_EPISODE' | 'READ_CHAPTER' | 'RATED_ANIME' | 'COMPLETED_SERIES' | 'JOINED_CLUB';
  title: string;
  subtitle: string;
  coverUrl?: string;
  rating?: number;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bannerUrl: string;
  bio: string;
  customStatus?: string;
  role: UserRole;
  badges: UserBadge[];
  level: number;
  xp: number;
  joinedDate: string;
  followersCount: number;
  followingCount: number;
  favoriteAnime: Array<{
    id: string;
    title: string;
    coverUrl: string;
    rating?: number;
  }>;
  activities: UserActivity[];
  isOnline?: boolean;
}

export type ReactionType = '❤️' | '🔥' | '👑' | '😱' | '👏' | '💀';

export interface CommunityReply {
  id: string;
  postId: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    role: UserRole;
    badges: UserBadge[];
  };
  content: string;
  replyToUser?: string;
  timestamp: string;
  reactions: Record<string, string[]>; // emoji -> array of userIds
  isEdited?: boolean;
  isModerated?: boolean;
}

export interface CommunityPost {
  id: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    role: UserRole;
    badges: UserBadge[];
  };
  content: string;
  mediaUrls?: string[];
  gifUrl?: string;
  attachedAnime?: {
    id: string;
    title: string;
    coverUrl: string;
    rating?: number;
    episodes?: number;
    genre?: string[];
  };
  isSpoiler?: boolean;
  isPinned?: boolean;
  tags?: string[];
  timestamp: string;
  editedAt?: string;
  likesCount: number;
  reactions: Record<string, string[]>; // emoji -> array of userIds
  replyCount: number;
  replies: CommunityReply[];
  isModerated?: boolean;
}

export type ChatRoomType = 'GLOBAL' | 'EPISODE_LIVE' | 'MANGA_SPOILERS' | 'THEORY_ZONE';

export interface ChatRoom {
  id: string;
  name: string;
  topic: string;
  type: ChatRoomType;
  icon: string;
  activeUsersCount: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    role: UserRole;
  };
  content: string;
  gifUrl?: string;
  replyTo?: {
    id: string;
    username: string;
    content: string;
  };
  timestamp: string;
  reactions?: Record<string, string[]>;
}

export type ModerationAction = 'PIN' | 'UNPIN' | 'FLAG_SPOILER' | 'DELETE_POST' | 'MUTE_USER' | 'REPORT' | 'LOCK_THREAD';

// --- COMMUNITY 2.0 TYPES ---

export interface MediaReview {
  id: string;
  mediaId: string | number;
  mediaType: 'ANIME' | 'MANGA' | 'NOVEL';
  mediaTitle: string;
  mediaCover: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    role: UserRole;
  };
  overallScore: number; // 1-10
  storyScore?: number;
  artScore?: number;
  soundScore?: number;
  characterScore?: number;
  reviewTitle: string;
  reviewBody: string;
  containsSpoilers: boolean;
  helpfulCount: number;
  helpfulUserIds: string[];
  createdAt: string;
}

export interface CollectionItem {
  id: string | number;
  mediaType: 'ANIME' | 'MANGA' | 'NOVEL';
  title: string;
  coverUrl: string;
  note?: string;
}

export interface PublicCollection {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  creator: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    role: UserRole;
  };
  items: CollectionItem[];
  likesCount: number;
  likedUserIds: string[];
  tags: string[];
  isPublic: boolean;
  createdAt: string;
}

export interface UserRecommendation {
  id: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    role: UserRole;
  };
  sourceMedia: {
    id: string | number;
    mediaType: 'ANIME' | 'MANGA' | 'NOVEL';
    title: string;
    coverUrl: string;
  };
  targetMedia: {
    id: string | number;
    mediaType: 'ANIME' | 'MANGA' | 'NOVEL';
    title: string;
    coverUrl: string;
  };
  reason: string;
  helpfulCount: number;
  helpfulUserIds: string[];
  createdAt: string;
}

export interface DiscussionThread {
  id: string;
  mediaId: string | number;
  mediaType: 'ANIME' | 'MANGA' | 'NOVEL';
  mediaTitle: string;
  unitLabel: string; // e.g. "Episode 12" or "Chapter 271"
  threadTitle: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    role: UserRole;
  };
  content: string;
  isSpoiler: boolean;
  isLocked: boolean;
  replyCount: number;
  replies: CommunityReply[];
  createdAt: string;
}
