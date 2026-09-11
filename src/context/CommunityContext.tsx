import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CommunityPost,
  CommunityReply,
  ChatRoom,
  ChatMessage,
  UserProfile,
  UserActivity,
  ReactionType,
  MediaReview,
  PublicCollection,
  UserRecommendation,
  DiscussionThread,
} from '../types/community';
import {
  CURRENT_LOGGED_USER,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_CHAT_ROOMS,
  INITIAL_CHAT_MESSAGES,
} from '../api/community/communityEngine';
import {
  INITIAL_DISCUSSION_THREADS,
  INITIAL_REVIEWS,
  INITIAL_PUBLIC_COLLECTIONS,
  INITIAL_USER_RECOMMENDATIONS,
} from '../api/community/communityV2Engine';

export type FeedFilterType = 'ALL' | 'FOLLOWING' | 'TRENDING' | 'DISCUSSIONS' | 'RECOMMENDATIONS';

interface CommunityContextType {
  // Feed State
  posts: CommunityPost[];
  feedFilter: FeedFilterType;
  setFeedFilter: (filter: FeedFilterType) => void;
  createPost: (params: {
    content: string;
    gifUrl?: string;
    attachedAnime?: CommunityPost['attachedAnime'];
    isSpoiler?: boolean;
    tags?: string[];
  }) => void;
  editPost: (postId: string, newContent: string) => void;
  deletePost: (postId: string) => void;
  toggleReaction: (postId: string, emoji: ReactionType, replyId?: string) => void;
  addReply: (postId: string, content: string, replyToUser?: string) => void;
  deleteReply: (postId: string, replyId: string) => void;

  // Social: Following & Followers
  followingUserIds: string[];
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  isFollowing: (userId: string) => boolean;

  // Reviews & Ratings
  reviews: MediaReview[];
  createReview: (params: Omit<MediaReview, 'id' | 'author' | 'helpfulCount' | 'helpfulUserIds' | 'createdAt'>) => void;
  voteReviewHelpful: (reviewId: string) => void;

  // Public Collections
  collections: PublicCollection[];
  createCollection: (params: Omit<PublicCollection, 'id' | 'creator' | 'likesCount' | 'likedUserIds' | 'createdAt'>) => void;
  likeCollection: (collectionId: string) => void;

  // User Recommendations
  recommendations: UserRecommendation[];
  submitRecommendation: (params: Omit<UserRecommendation, 'id' | 'author' | 'helpfulCount' | 'helpfulUserIds' | 'createdAt'>) => void;
  voteRecommendationHelpful: (recommendationId: string) => void;

  // Discussion Threads
  discussionThreads: DiscussionThread[];
  createDiscussionThread: (params: Omit<DiscussionThread, 'id' | 'author' | 'replyCount' | 'replies' | 'isLocked' | 'createdAt'>) => void;
  lockThread: (threadId: string) => void;
  addThreadReply: (threadId: string, content: string) => void;

  // Live Chat State
  chatRooms: ChatRoom[];
  activeRoomId: string;
  setActiveRoomId: (roomId: string) => void;
  chatMessages: Record<string, ChatMessage[]>;
  sendChatMessage: (
    roomId: string,
    content: string,
    gifUrl?: string,
    replyTo?: { id: string; username: string; content: string }
  ) => void;

  // User Profile & Live Sync
  currentUser: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  shareWatchActivity: (activity: Omit<UserActivity, 'id' | 'timestamp'>) => void;

  // Moderation Tools
  pinPost: (postId: string) => void;
  flagSpoiler: (postId: string) => void;
  reportPost: (postId: string, reason: string) => void;
  mutedUserIds: string[];
  muteUser: (userId: string) => void;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

const STORAGE_POSTS_KEY = '@animenext_community_posts';
const STORAGE_USER_KEY = '@animenext_community_user';
const STORAGE_CHAT_KEY = '@animenext_community_chats';
const STORAGE_FOLLOWING_KEY = '@animenext_community_following';
const STORAGE_REVIEWS_KEY = '@animenext_community_reviews';
const STORAGE_COLLECTIONS_KEY = '@animenext_community_collections';
const STORAGE_RECS_KEY = '@animenext_community_recs';
const STORAGE_THREADS_KEY = '@animenext_community_threads';

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_COMMUNITY_POSTS);
  const [feedFilter, setFeedFilter] = useState<FeedFilterType>('ALL');
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_LOGGED_USER);
  const [chatRooms] = useState<ChatRoom[]>(INITIAL_CHAT_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState<string>('room_global_lounge');
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_CHAT_MESSAGES);
  const [mutedUserIds, setMutedUserIds] = useState<string[]>([]);

  // Community 2.0 State
  const [followingUserIds, setFollowingUserIds] = useState<string[]>(['usr_gojo_satoru', 'usr_tarot_club']);
  const [reviews, setReviews] = useState<MediaReview[]>(INITIAL_REVIEWS);
  const [collections, setCollections] = useState<PublicCollection[]>(INITIAL_PUBLIC_COLLECTIONS);
  const [recommendations, setRecommendations] = useState<UserRecommendation[]>(INITIAL_USER_RECOMMENDATIONS);
  const [discussionThreads, setDiscussionThreads] = useState<DiscussionThread[]>(INITIAL_DISCUSSION_THREADS);

  // Load from local storage on mount
  useEffect(() => {
    (async () => {
      try {
        const storedPosts = await AsyncStorage.getItem(STORAGE_POSTS_KEY);
        if (storedPosts) setPosts(JSON.parse(storedPosts));

        const storedUser = await AsyncStorage.getItem(STORAGE_USER_KEY);
        if (storedUser) setCurrentUser(JSON.parse(storedUser));

        const storedChat = await AsyncStorage.getItem(STORAGE_CHAT_KEY);
        if (storedChat) setChatMessages(JSON.parse(storedChat));

        const storedFollowing = await AsyncStorage.getItem(STORAGE_FOLLOWING_KEY);
        if (storedFollowing) setFollowingUserIds(JSON.parse(storedFollowing));

        const storedReviews = await AsyncStorage.getItem(STORAGE_REVIEWS_KEY);
        if (storedReviews) setReviews(JSON.parse(storedReviews));

        const storedCols = await AsyncStorage.getItem(STORAGE_COLLECTIONS_KEY);
        if (storedCols) setCollections(JSON.parse(storedCols));

        const storedRecs = await AsyncStorage.getItem(STORAGE_RECS_KEY);
        if (storedRecs) setRecommendations(JSON.parse(storedRecs));

        const storedThreads = await AsyncStorage.getItem(STORAGE_THREADS_KEY);
        if (storedThreads) setDiscussionThreads(JSON.parse(storedThreads));
      } catch (e) {
        console.warn('[CommunityContext] Failed to load persisted state:', e);
      }
    })();
  }, []);

  const savePosts = async (newPosts: CommunityPost[]) => {
    setPosts(newPosts);
    AsyncStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(newPosts)).catch(() => {});
  };

  // Follow / Unfollow logic
  const followUser = (userId: string) => {
    if (!followingUserIds.includes(userId)) {
      const updated = [...followingUserIds, userId];
      setFollowingUserIds(updated);
      AsyncStorage.setItem(STORAGE_FOLLOWING_KEY, JSON.stringify(updated)).catch(() => {});
    }
  };

  const unfollowUser = (userId: string) => {
    const updated = followingUserIds.filter((id) => id !== userId);
    setFollowingUserIds(updated);
    AsyncStorage.setItem(STORAGE_FOLLOWING_KEY, JSON.stringify(updated)).catch(() => {});
  };

  const isFollowing = (userId: string) => followingUserIds.includes(userId);

  // Create Post
  const createPost = (params: {
    content: string;
    gifUrl?: string;
    attachedAnime?: CommunityPost['attachedAnime'];
    isSpoiler?: boolean;
    tags?: string[];
  }) => {
    const newPost: CommunityPost = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      author: {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatar: currentUser.avatar,
        role: currentUser.role,
        badges: currentUser.badges,
      },
      content: params.content,
      gifUrl: params.gifUrl,
      attachedAnime: params.attachedAnime,
      isSpoiler: params.isSpoiler || false,
      tags: params.tags || [],
      timestamp: 'Just now',
      likesCount: 0,
      reactions: {},
      replyCount: 0,
      replies: [],
    };

    const updated = [newPost, ...posts];
    savePosts(updated);
  };

  // Edit Post
  const editPost = (postId: string, newContent: string) => {
    const updated = posts.map((p) =>
      p.id === postId ? { ...p, content: newContent, editedAt: 'Just now' } : p
    );
    savePosts(updated);
  };

  // Delete Post
  const deletePost = (postId: string) => {
    const updated = posts.filter((p) => p.id !== postId);
    savePosts(updated);
  };

  // Toggle Reaction
  const toggleReaction = (postId: string, emoji: ReactionType, replyId?: string) => {
    const userId = currentUser.id;
    const updated = posts.map((post) => {
      if (post.id !== postId) return post;

      if (replyId) {
        const updatedReplies = post.replies.map((reply) => {
          if (reply.id !== replyId) return reply;
          const currentReactions = { ...reply.reactions };
          const usersList = currentReactions[emoji] || [];
          const hasReacted = usersList.includes(userId);

          if (hasReacted) {
            currentReactions[emoji] = usersList.filter((id) => id !== userId);
            if (currentReactions[emoji].length === 0) delete currentReactions[emoji];
          } else {
            currentReactions[emoji] = [...usersList, userId];
          }
          return { ...reply, reactions: currentReactions };
        });
        return { ...post, replies: updatedReplies };
      }

      const currentReactions = { ...post.reactions };
      const usersList = currentReactions[emoji] || [];
      const hasReacted = usersList.includes(userId);

      if (hasReacted) {
        currentReactions[emoji] = usersList.filter((id) => id !== userId);
        if (currentReactions[emoji].length === 0) delete currentReactions[emoji];
      } else {
        currentReactions[emoji] = [...usersList, userId];
      }

      return {
        ...post,
        reactions: currentReactions,
        likesCount: Object.values(currentReactions).reduce((acc, curr) => acc + curr.length, 0),
      };
    });

    savePosts(updated);
  };

  // Add Reply
  const addReply = (postId: string, content: string, replyToUser?: string) => {
    const newReply: CommunityReply = {
      id: `reply_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      postId,
      author: {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatar: currentUser.avatar,
        role: currentUser.role,
        badges: currentUser.badges,
      },
      content,
      replyToUser,
      timestamp: 'Just now',
      reactions: {},
    };

    const updated = posts.map((p) => {
      if (p.id !== postId) return p;
      return {
        ...p,
        replyCount: (p.replyCount || 0) + 1,
        replies: [...p.replies, newReply],
      };
    });

    savePosts(updated);
  };

  // Delete Reply
  const deleteReply = (postId: string, replyId: string) => {
    const updated = posts.map((p) => {
      if (p.id !== postId) return p;
      return {
        ...p,
        replyCount: Math.max(0, (p.replyCount || 1) - 1),
        replies: p.replies.filter((r) => r.id !== replyId),
      };
    });
    savePosts(updated);
  };

  // Reviews & Ratings
  const createReview = (params: Omit<MediaReview, 'id' | 'author' | 'helpfulCount' | 'helpfulUserIds' | 'createdAt'>) => {
    const newRev: MediaReview = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      author: {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatar: currentUser.avatar,
        role: currentUser.role,
      },
      ...params,
      helpfulCount: 0,
      helpfulUserIds: [],
      createdAt: 'Just now',
    };

    const updated = [newRev, ...reviews];
    setReviews(updated);
    AsyncStorage.setItem(STORAGE_REVIEWS_KEY, JSON.stringify(updated)).catch(() => {});
  };

  const voteReviewHelpful = (reviewId: string) => {
    const userId = currentUser.id;
    const updated = reviews.map((rev) => {
      if (rev.id !== reviewId) return rev;
      const isVoted = rev.helpfulUserIds.includes(userId);
      const userIds = isVoted
        ? rev.helpfulUserIds.filter((id) => id !== userId)
        : [...rev.helpfulUserIds, userId];
      return {
        ...rev,
        helpfulCount: userIds.length,
        helpfulUserIds: userIds,
      };
    });

    setReviews(updated);
    AsyncStorage.setItem(STORAGE_REVIEWS_KEY, JSON.stringify(updated)).catch(() => {});
  };

  // Public Collections
  const createCollection = (params: Omit<PublicCollection, 'id' | 'creator' | 'likesCount' | 'likedUserIds' | 'createdAt'>) => {
    const newCol: PublicCollection = {
      id: `col_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      creator: {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatar: currentUser.avatar,
        role: currentUser.role,
      },
      ...params,
      likesCount: 0,
      likedUserIds: [],
      createdAt: 'Just now',
    };

    const updated = [newCol, ...collections];
    setCollections(updated);
    AsyncStorage.setItem(STORAGE_COLLECTIONS_KEY, JSON.stringify(updated)).catch(() => {});
  };

  const likeCollection = (collectionId: string) => {
    const userId = currentUser.id;
    const updated = collections.map((col) => {
      if (col.id !== collectionId) return col;
      const isLiked = col.likedUserIds.includes(userId);
      const userIds = isLiked
        ? col.likedUserIds.filter((id) => id !== userId)
        : [...col.likedUserIds, userId];
      return {
        ...col,
        likesCount: userIds.length,
        likedUserIds: userIds,
      };
    });

    setCollections(updated);
    AsyncStorage.setItem(STORAGE_COLLECTIONS_KEY, JSON.stringify(updated)).catch(() => {});
  };

  // User Recommendations
  const submitRecommendation = (params: Omit<UserRecommendation, 'id' | 'author' | 'helpfulCount' | 'helpfulUserIds' | 'createdAt'>) => {
    const newRec: UserRecommendation = {
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      author: {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatar: currentUser.avatar,
        role: currentUser.role,
      },
      ...params,
      helpfulCount: 0,
      helpfulUserIds: [],
      createdAt: 'Just now',
    };

    const updated = [newRec, ...recommendations];
    setRecommendations(updated);
    AsyncStorage.setItem(STORAGE_RECS_KEY, JSON.stringify(updated)).catch(() => {});
  };

  const voteRecommendationHelpful = (recId: string) => {
    const userId = currentUser.id;
    const updated = recommendations.map((rec) => {
      if (rec.id !== recId) return rec;
      const isVoted = rec.helpfulUserIds.includes(userId);
      const userIds = isVoted
        ? rec.helpfulUserIds.filter((id) => id !== userId)
        : [...rec.helpfulUserIds, userId];
      return {
        ...rec,
        helpfulCount: userIds.length,
        helpfulUserIds: userIds,
      };
    });

    setRecommendations(updated);
    AsyncStorage.setItem(STORAGE_RECS_KEY, JSON.stringify(updated)).catch(() => {});
  };

  // Discussion Threads
  const createDiscussionThread = (params: Omit<DiscussionThread, 'id' | 'author' | 'replyCount' | 'replies' | 'isLocked' | 'createdAt'>) => {
    const newThread: DiscussionThread = {
      id: `thread_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      author: {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatar: currentUser.avatar,
        role: currentUser.role,
      },
      ...params,
      isLocked: false,
      replyCount: 0,
      replies: [],
      createdAt: 'Just now',
    };

    const updated = [newThread, ...discussionThreads];
    setDiscussionThreads(updated);
    AsyncStorage.setItem(STORAGE_THREADS_KEY, JSON.stringify(updated)).catch(() => {});
  };

  const lockThread = (threadId: string) => {
    const updated = discussionThreads.map((t) =>
      t.id === threadId ? { ...t, isLocked: !t.isLocked } : t
    );
    setDiscussionThreads(updated);
    AsyncStorage.setItem(STORAGE_THREADS_KEY, JSON.stringify(updated)).catch(() => {});
  };

  const addThreadReply = (threadId: string, content: string) => {
    const newReply: CommunityReply = {
      id: `th_rep_${Date.now()}`,
      postId: threadId,
      author: {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatar: currentUser.avatar,
        role: currentUser.role,
        badges: currentUser.badges,
      },
      content,
      timestamp: 'Just now',
      reactions: {},
    };

    const updated = discussionThreads.map((t) => {
      if (t.id !== threadId) return t;
      return {
        ...t,
        replyCount: (t.replyCount || 0) + 1,
        replies: [...t.replies, newReply],
      };
    });

    setDiscussionThreads(updated);
    AsyncStorage.setItem(STORAGE_THREADS_KEY, JSON.stringify(updated)).catch(() => {});
  };

  // Live Chat: Send Message
  const sendChatMessage = (
    roomId: string,
    content: string,
    gifUrl?: string,
    replyTo?: { id: string; username: string; content: string }
  ) => {
    const newMsg: ChatMessage = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      roomId,
      author: {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatar: currentUser.avatar,
        role: currentUser.role,
      },
      content,
      gifUrl,
      replyTo,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const roomMsgs = chatMessages[roomId] || [];
    const updated = {
      ...chatMessages,
      [roomId]: [...roomMsgs, newMsg],
    };

    setChatMessages(updated);
    AsyncStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(updated)).catch(() => {});
  };

  // Profile update & Live Sync
  const updateUserProfile = (updates: Partial<UserProfile>) => {
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updatedUser)).catch(() => {});
  };

  const shareWatchActivity = (activityData: Omit<UserActivity, 'id' | 'timestamp'>) => {
    const newAct: UserActivity = {
      id: `act_${Date.now()}`,
      ...activityData,
      timestamp: 'Just now',
    };

    const updatedActivities = [newAct, ...currentUser.activities];
    updateUserProfile({ activities: updatedActivities });

    createPost({
      content: `Just watched **${activityData.title}**! ${activityData.subtitle} ⭐ (Rating: ${activityData.rating || 10}/10)`,
      attachedAnime: activityData.coverUrl
        ? {
            id: `anime_${Date.now()}`,
            title: activityData.title,
            coverUrl: activityData.coverUrl,
            rating: activityData.rating || 9.5,
          }
        : undefined,
      tags: ['Activity', 'AnimeStream', 'Watchlist'],
    });
  };

  // Moderation tools
  const pinPost = (postId: string) => {
    const updated = posts.map((p) => (p.id === postId ? { ...p, isPinned: !p.isPinned } : p));
    savePosts(updated);
  };

  const flagSpoiler = (postId: string) => {
    const updated = posts.map((p) => (p.id === postId ? { ...p, isSpoiler: true } : p));
    savePosts(updated);
  };

  const reportPost = (postId: string, reason: string) => {
    console.log(`[Moderation] Post ${postId} reported for: ${reason}`);
  };

  const muteUser = (userId: string) => {
    if (!mutedUserIds.includes(userId)) {
      setMutedUserIds([...mutedUserIds, userId]);
    }
  };

  // Computed feed posts considering Following filter and Muted users
  const visiblePosts = posts
    .filter((p) => !mutedUserIds.includes(p.author.id))
    .filter((p) => {
      if (feedFilter === 'FOLLOWING') return followingUserIds.includes(p.author.id);
      if (feedFilter === 'TRENDING') return p.likesCount >= 2;
      if (feedFilter === 'DISCUSSIONS') return p.tags?.includes('Discussion') || (p.replyCount || 0) > 0;
      if (feedFilter === 'RECOMMENDATIONS') return !!p.attachedAnime;
      return true;
    });

  return (
    <CommunityContext.Provider
      value={{
        posts: visiblePosts,
        feedFilter,
        setFeedFilter,
        createPost,
        editPost,
        deletePost,
        toggleReaction,
        addReply,
        deleteReply,
        followingUserIds,
        followUser,
        unfollowUser,
        isFollowing,
        reviews,
        createReview,
        voteReviewHelpful,
        collections,
        createCollection,
        likeCollection,
        recommendations,
        submitRecommendation,
        voteRecommendationHelpful,
        discussionThreads,
        createDiscussionThread,
        lockThread,
        addThreadReply,
        chatRooms,
        activeRoomId,
        setActiveRoomId,
        chatMessages,
        sendChatMessage,
        currentUser,
        updateUserProfile,
        shareWatchActivity,
        pinPost,
        flagSpoiler,
        reportPost,
        mutedUserIds,
        muteUser,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};
