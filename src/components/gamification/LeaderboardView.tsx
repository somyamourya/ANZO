import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useGamification } from '../../context/GamificationContext';
import { LeaderboardEntry, LeaderboardCategory } from '../../types/gamification';

const CATEGORIES: Array<{ key: LeaderboardCategory; label: string; icon: string }> = [
  { key: 'GLOBAL_EXP', label: 'Global EXP 🔥', icon: 'flash' },
  { key: 'DAILY_STREAK', label: 'Streaks ⚡', icon: 'flame' },
  { key: 'EPISODES_WATCHED', label: 'Episodes 🎬', icon: 'tv' },
];

export const LeaderboardView: React.FC = () => {
  const { leaderboard, leaderboardCategory, setLeaderboardCategory } = useGamification();

  const top3 = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <View style={styles.container}>
      {/* Category Filter Chips */}
      <View style={styles.categoriesBar}>
        {CATEGORIES.map((cat) => {
          const isSelected = leaderboardCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryChip,
                isSelected && styles.categoryChipActive,
              ]}
              onPress={() => setLeaderboardCategory(cat.key)}
            >
              <Text
                style={[
                  styles.categoryText,
                  isSelected && styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Top 3 Podium Presentation */}
      <View style={styles.podiumContainer}>
        {/* Rank 2 (Silver - Left) */}
        {top3[1] && (
          <View style={[styles.podiumCol, styles.podiumSilver]}>
            <View style={styles.podiumAvatarWrapper}>
              <Image source={{ uri: top3[1].avatar }} style={styles.podiumAvatar} />
              <View style={[styles.podiumBadge, { backgroundColor: '#C0C0C0' }]}>
                <Text style={styles.podiumBadgeText}>2</Text>
              </View>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>
              {top3[1].displayName}
            </Text>
            <Text style={styles.podiumScore}>{top3[1].scoreLabel}</Text>
            <View style={[styles.podiumStep, styles.stepSilver]}>
              <Text style={styles.stepRankText}>🥈 2ND</Text>
            </View>
          </View>
        )}

        {/* Rank 1 (Gold - Center) */}
        {top3[0] && (
          <View style={[styles.podiumCol, styles.podiumGold]}>
            <View style={styles.crownWrapper}>
              <Text style={styles.crownEmoji}>👑</Text>
            </View>
            <View
              style={[
                styles.podiumAvatarWrapper,
                styles.podiumGoldAvatarWrapper,
                top3[0].equippedFrame && {
                  borderColor: top3[0].equippedFrame.borderColor,
                },
              ]}
            >
              <Image source={{ uri: top3[0].avatar }} style={styles.podiumAvatarGold} />
              <View style={[styles.podiumBadge, { backgroundColor: '#FFD700' }]}>
                <Text style={styles.podiumBadgeText}>1</Text>
              </View>
            </View>
            <Text style={[styles.podiumName, styles.podiumGoldName]} numberOfLines={1}>
              {top3[0].displayName}
            </Text>
            <Text style={[styles.podiumScore, { color: '#FFD700' }]}>
              {top3[0].scoreLabel}
            </Text>
            <View style={[styles.podiumStep, styles.stepGold]}>
              <Text style={[styles.stepRankText, { color: '#000000', fontWeight: 'bold' }]}>
                🥇 1ST
              </Text>
            </View>
          </View>
        )}

        {/* Rank 3 (Bronze - Right) */}
        {top3[2] && (
          <View style={[styles.podiumCol, styles.podiumBronze]}>
            <View style={styles.podiumAvatarWrapper}>
              <Image source={{ uri: top3[2].avatar }} style={styles.podiumAvatar} />
              <View style={[styles.podiumBadge, { backgroundColor: '#CD7F32' }]}>
                <Text style={styles.podiumBadgeText}>3</Text>
              </View>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>
              {top3[2].displayName}
            </Text>
            <Text style={styles.podiumScore}>{top3[2].scoreLabel}</Text>
            <View style={[styles.podiumStep, styles.stepBronze]}>
              <Text style={styles.stepRankText}>🥉 3RD</Text>
            </View>
          </View>
        )}
      </View>

      {/* Leaderboard List (Rank 4+) */}
      <FlatList
        data={remaining}
        keyExtractor={(item) => item.userId}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }: { item: LeaderboardEntry }) => {
          return (
            <View
              style={[
                styles.rankRow,
                item.isCurrentUser && styles.rankRowCurrentUser,
              ]}
            >
              <Text style={styles.rankNumberText}>{item.rankPosition}</Text>

              <Image source={{ uri: item.avatar }} style={styles.rowAvatar} />

              <View style={styles.rowInfo}>
                <View style={styles.rowNameGroup}>
                  <Text style={styles.rowDisplayName} numberOfLines={1}>
                    {item.displayName}
                  </Text>
                  <View
                    style={[
                      styles.rowRankBadge,
                      {
                        backgroundColor: item.rankTag.color + '20',
                        borderColor: item.rankTag.color,
                      },
                    ]}
                  >
                    <Text style={[styles.rowRankText, { color: item.rankTag.color }]}>
                      {item.rankTag.label}
                    </Text>
                  </View>
                </View>
                <Text style={styles.rowUsername}>@{item.username}</Text>
              </View>

              <Text style={styles.rowScoreText}>{item.scoreLabel}</Text>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  categoriesBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  categoryChipActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: theme.colors.accent,
  },
  categoryText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: theme.colors.accent,
    fontWeight: 'bold',
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  podiumCol: {
    alignItems: 'center',
    width: '30%',
  },
  podiumGold: {
    zIndex: 2,
  },
  podiumSilver: {
    zIndex: 1,
  },
  podiumBronze: {
    zIndex: 1,
  },
  crownWrapper: {
    marginBottom: -4,
  },
  crownEmoji: {
    fontSize: 20,
  },
  podiumAvatarWrapper: {
    position: 'relative',
    marginBottom: 6,
  },
  podiumGoldAvatarWrapper: {
    borderWidth: 2.5,
    borderColor: '#FFD700',
    borderRadius: 34,
    padding: 2,
  },
  podiumAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1E1E28',
  },
  podiumAvatarGold: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1E1E28',
  },
  podiumBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  podiumBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
  },
  podiumName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  podiumGoldName: {
    fontSize: 13,
  },
  podiumScore: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 8,
  },
  podiumStep: {
    width: '100%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  stepGold: {
    height: 80,
    backgroundColor: '#FFD700',
  },
  stepSilver: {
    height: 60,
    backgroundColor: 'rgba(192, 192, 192, 0.2)',
    borderWidth: 1,
    borderColor: '#C0C0C0',
  },
  stepBronze: {
    height: 48,
    backgroundColor: 'rgba(205, 127, 50, 0.2)',
    borderWidth: 1,
    borderColor: '#CD7F32',
  },
  stepRankText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 8,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  rankRowCurrentUser: {
    borderColor: theme.colors.accent,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
  },
  rankNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
    width: 20,
    textAlign: 'center',
  },
  rowAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E1E28',
  },
  rowInfo: {
    flex: 1,
  },
  rowNameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowDisplayName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  rowRankBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
  },
  rowRankText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  rowUsername: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  rowScoreText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.accent,
  },
});
