import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useGamification } from '../../context/GamificationContext';

export const LevelUpModal: React.FC = () => {
  const { levelUpModalData, closeLevelUpModal } = useGamification();

  if (!levelUpModalData || !levelUpModalData.visible) return null;

  const { newLevel, newRank, unlockedPerks } = levelUpModalData;

  return (
    <Modal visible={true} animationType="fade" transparent onRequestClose={closeLevelUpModal}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Glowing Header Icon */}
          <View style={styles.glowCircle}>
            <Text style={styles.levelUpEmoji}>{newRank ? '👑' : '⚡'}</Text>
          </View>

          <Text style={styles.titleText}>{newRank ? 'HUNTER RANK PROMOTION!' : 'LEVEL UP!'}</Text>
          <Text style={styles.subtitleText}>
            You have ascended to <Text style={styles.highlightLevel}>Level {newLevel}</Text>
          </Text>

          {/* New Rank Display */}
          {newRank && (
            <View
              style={[
                styles.newRankCard,
                { backgroundColor: newRank.color + '18', borderColor: newRank.color },
              ]}
            >
              <Text style={styles.rankIcon}>{newRank.icon}</Text>
              <View>
                <Text style={[styles.newRankTitle, { color: newRank.color }]}>
                  {newRank.title}
                </Text>
                <Text style={styles.newRankSub}>New Hunter Tier Unlocked</Text>
              </View>
            </View>
          )}

          {/* Unlocked Perks */}
          {unlockedPerks && unlockedPerks.length > 0 && (
            <View style={styles.perksSection}>
              <Text style={styles.perksHeader}>Unlocked Privileges:</Text>
              {unlockedPerks.map((perk, idx) => (
                <View key={idx} style={styles.perkItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.perkText}>{perk}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Claim & Continue Button */}
          <TouchableOpacity style={styles.continueBtn} onPress={closeLevelUpModal}>
            <Text style={styles.continueBtnText}>Claim & Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  glowCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  levelUpEmoji: {
    fontSize: 32,
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  highlightLevel: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  newRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    width: '100%',
    marginBottom: 16,
  },
  rankIcon: {
    fontSize: 24,
  },
  newRankTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  newRankSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  perksSection: {
    width: '100%',
    marginBottom: 20,
    gap: 8,
  },
  perksHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  perkText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
  },
  continueBtn: {
    backgroundColor: '#FFD700',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  continueBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
