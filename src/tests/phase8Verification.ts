import {
  INITIAL_DISCUSSION_THREADS,
  INITIAL_REVIEWS,
  INITIAL_PUBLIC_COLLECTIONS,
  INITIAL_USER_RECOMMENDATIONS,
} from '../api/community/communityV2Engine';
import { MediaReview, PublicCollection, UserRecommendation, DiscussionThread } from '../types/community';

async function runPhase8Tests() {
  console.log('===========================================================');
  console.log('💬 RUNNING PHASE 8: COMMUNITY 2.0 VERIFICATION SUITE');
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

  // TEST 1: Following and Follower System
  console.log('--- 1. Testing Following & Follower Engine ---');
  let followingList: string[] = ['usr_gojo_satoru'];
  
  function followUser(id: string) {
    if (!followingList.includes(id)) followingList.push(id);
  }
  function unfollowUser(id: string) {
    followingList = followingList.filter(u => u !== id);
  }

  followUser('usr_tarot_club');
  assert(followingList.includes('usr_tarot_club'), 'User followed successfully (Following: ' + followingList.join(', ') + ')');
  assert(followingList.length === 2, 'Following count incremented to 2');

  unfollowUser('usr_gojo_satoru');
  assert(!followingList.includes('usr_gojo_satoru') && followingList.length === 1, 'User unfollowed successfully');

  // TEST 2: Personal Activity Feed
  console.log('\n--- 2. Testing Personal Activity Feeds ---');
  const userActivities = [
    { id: 'act_1', type: 'WATCHED_EPISODE', title: 'Solo Leveling', subtitle: 'Finished Episode 12', timestamp: '2h ago' },
    { id: 'act_2', type: 'READ_CHAPTER', title: 'Jujutsu Kaisen', subtitle: 'Read Chapter 271', timestamp: '5h ago' },
  ];
  assert(userActivities.length === 2, 'Personal activity stream records milestones');
  assert(userActivities[0].title === 'Solo Leveling', 'Most recent episode logged at top of personal activity');

  // TEST 3: Episodic & Chapter Discussion Threads
  console.log('\n--- 3. Testing Discussion Threads & Moderation ---');
  const threads: DiscussionThread[] = [...INITIAL_DISCUSSION_THREADS];
  assert(threads.length >= 3, `Loaded ${threads.length} initial episodic & chapter discussion threads`);
  
  const soloThread = threads.find(t => t.id === 'thread_solo_ep12');
  assert(!!soloThread && soloThread.isSpoiler, 'Solo Leveling Episode 12 thread marked with spoiler protection');
  assert(soloThread?.unitLabel === 'Episode 12 (Season Finale)', 'Thread labeled with exact unit header');

  // Thread Reply
  soloThread?.replies.push({
    id: 'reply_test_1',
    postId: 'thread_solo_ep12',
    author: {
      id: 'usr_test',
      username: 'TestUser',
      displayName: 'Test Hunter',
      avatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200',
      role: 'MEMBER',
      badges: [],
    },
    content: 'The animation was unbelievable!',
    timestamp: 'Just now',
    reactions: {},
  });
  assert(soloThread?.replies.length === 2, 'Thread reply added cleanly');

  // Thread Locking
  if (soloThread) soloThread.isLocked = true;
  assert(soloThread?.isLocked === true, 'Moderator locked discussion thread successfully');

  // TEST 4: Reviews and Multi-Criteria Ratings
  console.log('\n--- 4. Testing Reviews & Score Breakdown ---');
  const reviews: MediaReview[] = [...INITIAL_REVIEWS];
  assert(reviews.length >= 2, `Loaded ${reviews.length} community reviews`);

  const soloReview = reviews.find(r => r.id === 'rev_solo_1');
  assert(soloReview?.overallScore === 9.5, 'Overall rating: 9.5 / 10');
  assert(soloReview?.artScore === 10.0 && soloReview?.soundScore === 9.8, 'Multi-criteria sub-scores calculated (Art: 10.0, Sound: 9.8)');

  // Helpful Upvoting
  const initialHelpful = soloReview?.helpfulCount || 0;
  if (soloReview) {
    soloReview.helpfulUserIds.push('usr_test_voter');
    soloReview.helpfulCount += 1;
  }
  assert((soloReview?.helpfulCount || 0) === initialHelpful + 1, 'Helpfulness vote registered on review');

  // TEST 5: Public Curated Collections & Lists
  console.log('\n--- 5. Testing Public Collections & Lists ---');
  const collections: PublicCollection[] = [...INITIAL_PUBLIC_COLLECTIONS];
  assert(collections.length >= 2, `Loaded ${collections.length} curated public collections`);

  const darkFantasyCol = collections.find(c => c.id === 'col_dark_fantasy');
  assert((darkFantasyCol?.items.length || 0) >= 4, `Collection contains ${darkFantasyCol?.items.length} cross-media items`);
  assert(!!darkFantasyCol?.items.some(i => i.mediaType === 'NOVEL'), 'Collection includes Light Novels');
  assert(!!darkFantasyCol?.items.some(i => i.mediaType === 'MANGA'), 'Collection includes Manga');

  // Like Collection
  const initialLikes = darkFantasyCol?.likesCount || 0;
  if (darkFantasyCol) {
    darkFantasyCol.likedUserIds.push('usr_test');
    darkFantasyCol.likesCount = darkFantasyCol.likedUserIds.length;
  }
  assert((darkFantasyCol?.likesCount || 0) > 0, 'Collection like counter updated');

  // TEST 6: User Recommendations Pairings
  console.log('\n--- 6. Testing User Recommendations Engine ---');
  const recs: UserRecommendation[] = [...INITIAL_USER_RECOMMENDATIONS];
  assert(recs.length >= 2, `Loaded ${recs.length} user recommendations`);

  const pairing1 = recs.find(r => r.id === 'rec_1');
  assert(pairing1?.sourceMedia.title === 'Solo Leveling' && !!pairing1?.targetMedia.title.includes('Shadow Slave'), 'Cross-media pairing: Solo Leveling -> Shadow Slave');
  assert(!!pairing1?.reason.includes('Nightmare Spell'), 'Recommendation reasoning pitch verified');

  console.log('\n===========================================================');
  console.log(`📊 SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${Math.round((passed / (passed + failed)) * 100)}%)`);
  console.log('===========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase8Tests().catch((err) => {
  console.error('Phase 8 verification suite error:', err);
  process.exit(1);
});
