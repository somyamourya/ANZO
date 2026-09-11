import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useCommunity, FeedFilterType } from '../context/CommunityContext';
import { PostCard } from '../components/community/PostCard';
import { CreatePostModal } from '../components/community/CreatePostModal';
import { UserProfileModal } from '../components/community/UserProfileModal';
import { LiveChatView } from '../components/community/LiveChatView';
import { LeaderboardView } from '../components/gamification/LeaderboardView';
import { DiscussionThreadsView } from '../components/community/DiscussionThreadsView';
import { ReviewsListView } from '../components/community/ReviewsListView';
import { PublicCollectionsView } from '../components/community/PublicCollectionsView';
import { UserRecommendationsView } from '../components/community/UserRecommendationsView';
import { UserProfile, CommunityPost } from '../types/community';

interface CommunityScreenProps {
  onSelectAnime?: (animeId: string) => void;
  onSelectManga?: (mangaId: string) => void;
  onSelectNovel?: (novelId: string) => void;
}

type MainCommunityTab = 'FEED' | 'THREADS' | 'REVIEWS' | 'COLLECTIONS' | 'RECS' | 'CHAT' | 'LEADERBOARD';

const FILTER_OPTIONS: Array<{ key: FeedFilterType; label: string; icon: string }> = [
  { key: 'ALL', label: 'All Posts', icon: 'apps-outline' },
  { key: 'FOLLOWING', label: 'Following 👥', icon: 'people-outline' },
  { key: 'TRENDING', label: 'Trending 🔥', icon: 'flame-outline' },
  { key: 'DISCUSSIONS', label: 'Discussions 💬', icon: 'chatbubbles-outline' },
  { key: 'RECOMMENDATIONS', label: 'Recs 💡', icon: 'sparkles-outline' },
];

export const CommunityScreen: React.FC<CommunityScreenProps> = ({
  onSelectAnime,
  onSelectManga,
  onSelectNovel,
}) => {
  const { posts, feedFilter, setFeedFilter, currentUser } = useCommunity();
  const [activeTab, setActiveTab] = useState<MainCommunityTab>('FEED');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inspectedUser, setInspectedUser] = useState<UserProfile | null>(null);

  const handleSelectMedia = (mediaType: 'ANIME' | 'MANGA' | 'NOVEL', mediaId: string | number) => {
    if (mediaType === 'ANIME' && onSelectAnime) {
      onSelectAnime(String(mediaId));
    } else if (mediaType === 'MANGA' && onSelectManga) {
      onSelectManga(String(mediaId));
    } else if (mediaType === 'NOVEL' && onSelectNovel) {
      onSelectNovel(String(mediaId));
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="planet" size={24} color={theme.colors.accent} />
          <Text style={styles.headerTitle}>Anzo Community 2.0</Text>
        </View>

        {/* Profile Avatar Button */}
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => setInspectedUser(currentUser)}
        >
          <Ionicons name="person-circle" size={28} color={theme.colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Main Tab Switcher Bar */}
      <View style={styles.tabScrollContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { key: 'FEED', label: 'Feed 📰' },
            { key: 'THREADS', label: 'Threads 🧵' },
            { key: 'REVIEWS', label: 'Reviews ⭐' },
            { key: 'COLLECTIONS', label: 'Lists 📂' },
            { key: 'RECS', label: 'Recs 💡' },
            { key: 'CHAT', label: 'Live ⚡' },
            { key: 'LEADERBOARD', label: 'Ranks 🏆' },
          ]}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.tabsPadding}
          renderItem={({ item }) => {
            const isSelected = activeTab === item.key;
            return (
              <TouchableOpacity
                onPress={() => setActiveTab(item.key as MainCommunityTab)}
                style={[styles.segmentBtn, isSelected && styles.segmentBtnActive]}
              >
                <Text style={[styles.segmentText, isSelected && styles.segmentTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* 1. Feed View */}
      {activeTab === 'FEED' && (
        <View style={styles.tabBody}>
          {/* Feed Filter Chips */}
          <View style={styles.filterChipsRow}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={FILTER_OPTIONS}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => {
                const isSelected = feedFilter === item.key;
                return (
                  <TouchableOpacity
                    style={[styles.filterChip, isSelected && styles.filterChipActive]}
                    onPress={() => setFeedFilter(item.key)}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={13}
                      color={isSelected ? '#000000' : theme.colors.textSecondary}
                    />
                    <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          {/* Posts List */}
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.feedContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.accent} />
            }
            renderItem={({ item }) => (
              <PostCard
                post={item}
                onPressAnime={onSelectAnime}
                onPressUser={(userId) => {
                  setInspectedUser({
                    ...currentUser,
                    id: userId,
                    displayName: item.author.displayName,
                    avatar: item.author.avatar,
                    role: item.author.role,
                  });
                }}
              />
            )}
          />

          {/* Floating Create Post Button */}
          <TouchableOpacity
            style={styles.floatingActionBtn}
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* 2. Episodic & Chapter Discussion Threads */}
      {activeTab === 'THREADS' && (
        <DiscussionThreadsView onSelectMedia={handleSelectMedia} />
      )}

      {/* 3. Community Reviews */}
      {activeTab === 'REVIEWS' && (
        <ReviewsListView onSelectMedia={handleSelectMedia} />
      )}

      {/* 4. Public Curated Collections */}
      {activeTab === 'COLLECTIONS' && (
        <PublicCollectionsView onSelectMedia={handleSelectMedia} />
      )}

      {/* 5. User Recommendations Pairings */}
      {activeTab === 'RECS' && (
        <UserRecommendationsView onSelectMedia={handleSelectMedia} />
      )}

      {/* 6. Live Chat */}
      {activeTab === 'CHAT' && <LiveChatView />}

      {/* 7. Leaderboard */}
      {activeTab === 'LEADERBOARD' && <LeaderboardView />}

      {/* Create Post Modal */}
      <CreatePostModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* User Profile Modal */}
      {inspectedUser && (
        <UserProfileModal
          visible={!!inspectedUser}
          user={inspectedUser}
          isCurrentUser={inspectedUser.id === currentUser.id}
          onClose={() => setInspectedUser(null)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  profileBtn: {
    padding: 2,
  },
  tabScrollContainer: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabsPadding: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  segmentBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  segmentBtnActive: {
    backgroundColor: theme.colors.accent,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  tabBody: {
    flex: 1,
  },
  filterChipsRow: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.background,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginRight: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  filterChipText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  feedContent: {
    padding: 12,
    paddingBottom: 90,
  },
  floatingActionBtn: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
