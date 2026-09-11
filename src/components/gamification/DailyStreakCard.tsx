import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useGamification } from '../../context/GamificationContext';

const DAYS_OF_WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const DailyStreakCard: React.FC = () => {
  const { streak, checkInDaily } = useGamification();
  const {
    currentStreakDays,
    longestStreakDays,
    hasCheckedInToday,
    streakFreezeTokens,
    weeklyHeatmap,
  } = streak;

  return (
    <View style={styles.card}>
      {/* Header: Flame Icon, Streak Count & Longest Record */}
      <View style={styles.headerRow}>
        <View style={styles.streakTitleGroup}>
          <View style={styles.flameCircle}>
            <Text style={styles.flameEmoji}>🔥</Text>
          </View>
          <View>
            <View style={styles.countRow}>
              <Text style={styles.streakCountNumber}>{currentStreakDays}</Text>
              <Text style={styles.streakDaysLabel}>Day Streak</Text>
            </View>
            <Text style={styles.recordSubText}>Longest: {longestStreakDays} days</Text>
          </View>
        </View>

        {/* Streak Freeze Shields */}
        <View style={styles.shieldBadge}>
          <Ionicons name="shield-checkmark" size={14} color="#00F0FF" />
          <Text style={styles.shieldCountText}>{streakFreezeTokens} Freezes</Text>
        </View>
      </View>

      {/* 7-Day Weekly Heatmap Check-in Row */}
      <View style={styles.weekContainer}>
        {DAYS_OF_WEEK.map((day, idx) => {
          const isChecked = weeklyHeatmap[idx];
          const isToday = idx === 6; // Last item represents today
          return (
            <View key={idx} style={styles.dayCol}>
              <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>{day}</Text>
              <View
                style={[
                  styles.dayDot,
                  isChecked && styles.dayDotChecked,
                  isToday && !isChecked && styles.dayDotTodayPending,
                ]}
              >
                {isChecked ? (
                  <Ionicons name="checkmark" size={12} color="#000000" />
                ) : (
                  <View style={styles.innerPendingDot} />
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Check-In Action Button */}
      <TouchableOpacity
        style={[
          styles.checkInBtn,
          hasCheckedInToday && styles.checkInBtnClaimed,
        ]}
        disabled={hasCheckedInToday}
        onPress={checkInDaily}
      >
        <Ionicons
          name={hasCheckedInToday ? 'checkmark-circle' : 'flash'}
          size={16}
          color={hasCheckedInToday ? '#10B981' : '#000000'}
        />
        <Text
          style={[
            styles.checkInBtnText,
            hasCheckedInToday && styles.checkInBtnTextClaimed,
          ]}
        >
          {hasCheckedInToday ? 'Daily Streak Claimed (+150 XP)' : 'Claim Daily Streak Check-in (+150 XP)'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flameCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    borderWidth: 1.5,
    borderColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameEmoji: {
    fontSize: 22,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  streakCountNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  streakDaysLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  recordSubText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  shieldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  shieldCountText: {
    fontSize: 11,
    color: '#00F0FF',
    fontWeight: '600',
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
  },
  dayLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  todayLabel: {
    color: '#FF9500',
    fontWeight: 'bold',
  },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dayDotChecked: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  dayDotTodayPending: {
    borderColor: '#FF9500',
    borderWidth: 1.5,
  },
  innerPendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF9500',
    borderRadius: 14,
    paddingVertical: 10,
    marginTop: 16,
  },
  checkInBtnClaimed: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  checkInBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: 'bold',
  },
  checkInBtnTextClaimed: {
    color: '#10B981',
  },
});
