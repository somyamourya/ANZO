import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useGamification } from '../../context/GamificationContext';

interface RankProgressCardProps {
  onPressPerks?: () => void;
}

export const RankProgressCard: React.FC<RankProgressCardProps> = ({ onPressPerks }) => {
  const { levelProgress } = useGamification();
  const { currentLevel, currentExp, nextLevelExp, rank, rankProgressPercent } = levelProgress;

  return (
    <View style={[styles.card, { borderColor: rank.color + '60' }]}>
      {/* Top Banner: Rank Tag & Level Badge */}
      <View style={styles.topRow}>
        <View style={styles.rankInfoGroup}>
          <View
            style={[
              styles.rankTagBadge,
              { backgroundColor: rank.color + '20', borderColor: rank.color },
            ]}
          >
            <Text style={styles.rankIcon}>{rank.icon}</Text>
            <Text style={[styles.rankTagText, { color: rank.color }]}>
              {rank.label.toUpperCase()} HUNTER
            </Text>
          </View>
          <Text style={styles.rankTitleText}>{rank.title}</Text>
        </View>

        <View style={[styles.levelCircle, { borderColor: rank.color }]}>
          <Text style={styles.levelNum}>{currentLevel}</Text>
          <Text style={styles.levelSub}>LVL</Text>
        </View>
      </View>

      {/* EXP Progress Bar */}
      <View style={styles.expSection}>
        <View style={styles.expLabelsRow}>
          <Text style={styles.expCurrentText}>
            {currentExp.toLocaleString()} / {nextLevelExp.toLocaleString()} XP
          </Text>
          <Text style={[styles.expPercentText, { color: rank.color }]}>
            {rankProgressPercent}%
          </Text>
        </View>

        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${rankProgressPercent}%`,
                backgroundColor: rank.color,
                shadowColor: rank.color,
              },
            ]}
          />
        </View>
      </View>

      {/* Perks Summary Footer */}
      <View style={styles.footerRow}>
        <View style={styles.perksRow}>
          <Ionicons name="sparkles" size={12} color={rank.color} />
          <Text style={styles.perksText} numberOfLines={1}>
            Active Perk: {rank.perks[0] || 'Enhanced Experience'}
          </Text>
        </View>

        {onPressPerks && (
          <TouchableOpacity style={styles.perksBtn} onPress={onPressPerks}>
            <Text style={[styles.perksBtnText, { color: rank.color }]}>All Perks ›</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rankInfoGroup: {
    flex: 1,
  },
  rankTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  rankIcon: {
    fontSize: 14,
  },
  rankTagText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  rankTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: 6,
  },
  levelCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNum: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
  levelSub: {
    fontSize: 9,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },
  expSection: {
    marginTop: 14,
  },
  expLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  expCurrentText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  expPercentText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  perksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  perksText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  perksBtn: {
    paddingLeft: 8,
  },
  perksBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});
