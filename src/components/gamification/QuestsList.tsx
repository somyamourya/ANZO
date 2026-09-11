import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useGamification } from '../../context/GamificationContext';
import { QuestItem } from '../../types/gamification';

export const QuestsList: React.FC = () => {
  const { quests, claimQuestReward } = useGamification();

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.headerLeft}>
          <Ionicons name="list" size={18} color={theme.colors.accent} />
          <Text style={styles.sectionTitle}>Daily & Weekly Quests</Text>
        </View>
        <Text style={styles.resetTimerText}>Resets in 11h 24m</Text>
      </View>

      <View style={styles.questsList}>
        {quests.map((quest: QuestItem) => {
          const progressPercent = Math.min(100, Math.floor((quest.current / quest.target) * 100));
          return (
            <View key={quest.id} style={styles.questCard}>
              <View style={styles.iconCircle}>
                <Ionicons name={quest.icon as any} size={18} color={theme.colors.accent} />
              </View>

              <View style={styles.questInfo}>
                <View style={styles.questHeader}>
                  <Text style={styles.questTitle}>{quest.title}</Text>
                  <View style={styles.expBadge}>
                    <Text style={styles.expText}>+{quest.expReward} XP</Text>
                  </View>
                </View>

                <Text style={styles.questDesc}>{quest.description}</Text>

                {/* Progress Bar & Status */}
                <View style={styles.progressRow}>
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${progressPercent}%`,
                          backgroundColor: quest.completed
                            ? '#10B981'
                            : theme.colors.accent,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressCount}>
                    {quest.current}/{quest.target}
                  </Text>
                </View>
              </View>

              {/* Action Button: Claim or In Progress */}
              {quest.completed ? (
                <TouchableOpacity
                  style={[
                    styles.claimBtn,
                    quest.claimed && styles.claimBtnClaimed,
                  ]}
                  disabled={quest.claimed}
                  onPress={() => claimQuestReward(quest.id)}
                >
                  <Text
                    style={[
                      styles.claimBtnText,
                      quest.claimed && styles.claimBtnTextClaimed,
                    ]}
                  >
                    {quest.claimed ? 'Claimed' : 'Claim!'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.inProgressBadge}>
                  <Text style={styles.inProgressText}>In Progress</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  resetTimerText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  questsList: {
    gap: 10,
  },
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questInfo: {
    flex: 1,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  expBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  expText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  questDesc: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  progressBarTrack: {
    flex: 1,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  progressCount: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: 'bold',
  },
  claimBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  claimBtnClaimed: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  claimBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  claimBtnTextClaimed: {
    color: theme.colors.textMuted,
  },
  inProgressBadge: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  inProgressText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
});
