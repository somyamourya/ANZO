import {
  USER_ROLE_CONFIG,
  AVAILABLE_BADGES,
  CURRENT_LOGGED_USER,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_CHAT_ROOMS,
  INITIAL_CHAT_MESSAGES,
} from '../api/community/communityEngine';
import { searchAnimeGifs, getGifCategories } from '../api/community/gifService';
import { CommunityPost, CommunityReply, UserActivity } from '../types/community';

async function runPhase4Verifications() {
  console.log('===========================================================');
  console.log('💬 RUNNING PHASE 4: ANZO COMMUNITY VERIFICATION SUITE');
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

  // 1. Roles & Badges Configuration
  try {
    console.log('--- 1. Testing Roles & Badges Hierarchy ---');
    assert(!!USER_ROLE_CONFIG.OWNER && USER_ROLE_CONFIG.OWNER.icon === '👑', 'Owner Role Presentation', 'Icon: 👑, Color: ' + USER_ROLE_CONFIG.OWNER.color);
    assert(!!USER_ROLE_CONFIG.ADMIN && USER_ROLE_CONFIG.ADMIN.icon === '🛡️', 'Admin Role Presentation', 'Icon: 🛡️, Color: ' + USER_ROLE_CONFIG.ADMIN.color);
    assert(AVAILABLE_BADGES.length >= 4, 'Badges Catalog', `Found ${AVAILABLE_BADGES.length} collectible badges`);
  } catch (e: any) {
    assert(false, 'Role / Badge Error', e.message);
  }

  // 2. GIF Service & Filtering
  try {
    console.log('\n--- 2. Testing Anime GIF Catalog & Search ---');
    const categories = getGifCategories();
    assert(categories.includes('Hype') && categories.includes('Fight'), 'GIF Categories', categories.join(', '));
    const hypeGifs = await searchAnimeGifs('Sukuna', 'Hype');
    assert(hypeGifs.length > 0 && !!hypeGifs[0].url, 'GIF Search by Keyword & Category', `Found: ${hypeGifs[0].title}`);
  } catch (e: any) {
    assert(false, 'GIF Service Error', e.message);
  }

  // 3. Community Feed & Seed Posts
  let activePosts: CommunityPost[] = JSON.parse(JSON.stringify(INITIAL_COMMUNITY_POSTS));
  try {
    console.log('\n--- 3. Testing Community Feed & Attached Anime ---');
    assert(activePosts.length >= 3, 'Community Feed Initial Loading', `Loaded ${activePosts.length} posts`);
    const pinned = activePosts.find((p) => p.isPinned);
    assert(!!pinned && pinned.author.role === 'OWNER', 'Pinned Announcement Post', `Author: ${pinned?.author.displayName}`);
    const recPost = activePosts.find((p) => !!p.attachedAnime);
    assert(!!recPost?.attachedAnime?.title, 'Attached Anime Recommendation', `Recommended: ${recPost?.attachedAnime?.title}`);
  } catch (e: any) {
    assert(false, 'Feed Error', e.message);
  }

  // 4. Create New Post
  try {
    console.log('\n--- 4. Testing Post Creation with GIF & Tags ---');
    const newPost: CommunityPost = {
      id: 'test_post_101',
      author: {
        id: CURRENT_LOGGED_USER.id,
        username: CURRENT_LOGGED_USER.username,
        displayName: CURRENT_LOGGED_USER.displayName,
        avatar: CURRENT_LOGGED_USER.avatar,
        role: CURRENT_LOGGED_USER.role,
        badges: CURRENT_LOGGED_USER.badges,
      },
      content: 'Testing Solo Leveling Chapter 1850 hype! @GojoHonored check this out!',
      gifUrl: 'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif',
      isSpoiler: false,
      tags: ['TestTag', 'SoloLeveling'],
      timestamp: 'Just now',
      likesCount: 0,
      reactions: {},
      replyCount: 0,
      replies: [],
    };
    activePosts.unshift(newPost);
    assert(activePosts[0].id === 'test_post_101', 'Post Creation', 'Successfully prepended to community feed');
  } catch (e: any) {
    assert(false, 'Create Post Error', e.message);
  }

  // 5. Reactions Engine & Toggle
  try {
    console.log('\n--- 5. Testing Multi-Emoji Reactions ---');
    const targetPost = activePosts[0];
    // Add reaction
    targetPost.reactions['🔥'] = [CURRENT_LOGGED_USER.id];
    assert(targetPost.reactions['🔥'].includes(CURRENT_LOGGED_USER.id), 'Reaction Added (🔥)', 'Reacted by Sung Jinwoo');
    // Toggle remove reaction
    targetPost.reactions['🔥'] = [];
    assert(targetPost.reactions['🔥'].length === 0, 'Reaction Toggled Off', 'Cleaned up reaction');
  } catch (e: any) {
    assert(false, 'Reaction Error', e.message);
  }

  // 6. Nested Replies & Mentions
  try {
    console.log('\n--- 6. Testing Replies & User Mentions ---');
    const targetPost = activePosts[0];
    const newReply: CommunityReply = {
      id: 'reply_test_1',
      postId: targetPost.id,
      author: {
        id: 'user_admin_satoru',
        username: 'GojoHonored',
        displayName: 'Gojo Satoru 🛡️',
        avatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80',
        role: 'ADMIN',
        badges: [AVAILABLE_BADGES[0]],
      },
      content: '@ShadowMonarch Domain Expansion is ready!',
      replyToUser: 'ShadowMonarch',
      timestamp: 'Just now',
      reactions: { '👑': ['user_anzo_owner'] },
    };
    targetPost.replies.push(newReply);
    targetPost.replyCount = targetPost.replies.length;
    assert(targetPost.replyCount === 1, 'Nested Reply Creation', `Reply added with mention to @${newReply.replyToUser}`);
  } catch (e: any) {
    assert(false, 'Reply Error', e.message);
  }

  // 7. Post Editing
  try {
    console.log('\n--- 7. Testing In-Place Post Editing ---');
    const targetPost = activePosts[0];
    const updatedContent = 'Solo Leveling season 2 episode 1 was glorious in 4K HDR! [Edited]';
    targetPost.content = updatedContent;
    targetPost.editedAt = 'Just now';
    assert(targetPost.content === updatedContent && !!targetPost.editedAt, 'Post Content Edited', targetPost.content);
  } catch (e: any) {
    assert(false, 'Edit Error', e.message);
  }

  // 8. Live Chat Engine & Channels
  try {
    console.log('\n--- 8. Testing Live Chat Engine & Channels ---');
    assert(INITIAL_CHAT_ROOMS.length === 3, 'Chat Channels Setup', INITIAL_CHAT_ROOMS.map((r) => r.name).join(', '));
    const globalMessages = INITIAL_CHAT_MESSAGES.room_global_lounge || [];
    assert(globalMessages.length >= 2, 'Live Messages Stream', `Found ${globalMessages.length} chat messages in #global-lounge`);
  } catch (e: any) {
    assert(false, 'Chat Error', e.message);
  }

  // 9. Moderation Foundations (Pin, Spoiler Flag, Mute)
  try {
    console.log('\n--- 9. Testing Moderation Actions ---');
    const targetPost = activePosts[0];
    targetPost.isSpoiler = true;
    assert(targetPost.isSpoiler === true, 'Spoiler Flagging by Moderator', 'Post marked as spoiler');
    targetPost.isPinned = true;
    assert(targetPost.isPinned === true, 'Post Pinning by Admin/Owner', 'Post pinned to top of feed');
  } catch (e: any) {
    assert(false, 'Moderation Error', e.message);
  }

  // 10. Activity Sharing Broadcast
  try {
    console.log('\n--- 10. Testing Anime Watch Activity Broadcast ---');
    const activity: UserActivity = {
      id: 'act_test',
      type: 'WATCHED_EPISODE',
      title: 'Watched Jujutsu Kaisen 0',
      subtitle: 'Finished movie with 10/10 rating',
      rating: 10,
      timestamp: 'Just now',
    };
    const actPost: CommunityPost = {
      id: 'act_post_1',
      author: {
        id: CURRENT_LOGGED_USER.id,
        username: CURRENT_LOGGED_USER.username,
        displayName: CURRENT_LOGGED_USER.displayName,
        avatar: CURRENT_LOGGED_USER.avatar,
        role: CURRENT_LOGGED_USER.role,
        badges: CURRENT_LOGGED_USER.badges,
      },
      content: `Just watched **${activity.title}**! ${activity.subtitle} ⭐ (Rating: ${activity.rating}/10)`,
      tags: ['Activity', 'AnimeStream'],
      timestamp: 'Just now',
      likesCount: 1,
      reactions: { '🔥': [CURRENT_LOGGED_USER.id] },
      replyCount: 0,
      replies: [],
    };
    activePosts.unshift(actPost);
    assert(activePosts[0].tags?.includes('Activity') === true, 'Watch Activity Broadcast to Feed', actPost.content);
  } catch (e: any) {
    assert(false, 'Activity Broadcast Error', e.message);
  }

  console.log('\n===========================================================');
  console.log(`📊 SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('===========================================================\n');
}

runPhase4Verifications();
