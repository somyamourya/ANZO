import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCommunity } from '../../context/CommunityContext';
import { theme, borderRadius, shadows } from '../../theme';

interface CreateReviewModalProps {
  visible: boolean;
  onClose: () => void;
  defaultMediaId?: string | number;
  defaultMediaType?: 'ANIME' | 'MANGA' | 'NOVEL';
  defaultMediaTitle?: string;
  defaultMediaCover?: string;
}

export const CreateReviewModal: React.FC<CreateReviewModalProps> = ({
  visible,
  onClose,
  defaultMediaId = 151807,
  defaultMediaType = 'ANIME',
  defaultMediaTitle = 'Solo Leveling',
  defaultMediaCover = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
}) => {
  const { createReview } = useCommunity();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [overallScore, setOverallScore] = useState(9.0);
  const [storyScore, setStoryScore] = useState(9.0);
  const [artScore, setArtScore] = useState(9.5);
  const [soundScore, setSoundScore] = useState(9.0);
  const [characterScore, setCharacterScore] = useState(8.5);
  const [containsSpoilers, setContainsSpoilers] = useState(false);

  const handleSubmit = () => {
    if (!title.trim() || !body.trim()) {
      alert('Please provide a review title and body.');
      return;
    }

    createReview({
      mediaId: defaultMediaId,
      mediaType: defaultMediaType,
      mediaTitle: defaultMediaTitle,
      mediaCover: defaultMediaCover,
      overallScore,
      storyScore,
      artScore,
      soundScore,
      characterScore,
      reviewTitle: title.trim(),
      reviewBody: body.trim(),
      containsSpoilers,
    });

    setTitle('');
    setBody('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <Ionicons name="star" size={20} color="#FBBF24" />
              <Text style={styles.headerTitle}>Write Review & Rating</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
            {/* Target Media Badge */}
            <View style={styles.targetMediaCard}>
              <Text style={styles.targetMediaLabel}>Reviewing {defaultMediaType}:</Text>
              <Text style={styles.targetMediaTitle}>{defaultMediaTitle}</Text>
            </View>

            {/* Overall Score Selector */}
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Overall Score</Text>
              <View style={styles.scoreControl}>
                <TouchableOpacity
                  onPress={() => setOverallScore(Math.max(1, +(overallScore - 0.5).toFixed(1)))}
                  style={styles.scoreBtn}
                >
                  <Text style={styles.scoreBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.scoreValue}>★ {overallScore.toFixed(1)} / 10</Text>
                <TouchableOpacity
                  onPress={() => setOverallScore(Math.min(10, +(overallScore + 0.5).toFixed(1)))}
                  style={styles.scoreBtn}
                >
                  <Text style={styles.scoreBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sub-Criteria Breakdown */}
            <View style={styles.subCriteriaGrid}>
              <View style={styles.criteriaItem}>
                <Text style={styles.critLabel}>Story: {storyScore.toFixed(1)}</Text>
                <View style={styles.miniBtnRow}>
                  <TouchableOpacity onPress={() => setStoryScore(Math.max(1, +(storyScore - 0.5).toFixed(1)))} style={styles.miniBtn}><Text style={styles.miniBtnText}>-</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => setStoryScore(Math.min(10, +(storyScore + 0.5).toFixed(1)))} style={styles.miniBtn}><Text style={styles.miniBtnText}>+</Text></TouchableOpacity>
                </View>
              </View>

              <View style={styles.criteriaItem}>
                <Text style={styles.critLabel}>Art/Anim: {artScore.toFixed(1)}</Text>
                <View style={styles.miniBtnRow}>
                  <TouchableOpacity onPress={() => setArtScore(Math.max(1, +(artScore - 0.5).toFixed(1)))} style={styles.miniBtn}><Text style={styles.miniBtnText}>-</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => setArtScore(Math.min(10, +(artScore + 0.5).toFixed(1)))} style={styles.miniBtn}><Text style={styles.miniBtnText}>+</Text></TouchableOpacity>
                </View>
              </View>

              <View style={styles.criteriaItem}>
                <Text style={styles.critLabel}>Sound: {soundScore.toFixed(1)}</Text>
                <View style={styles.miniBtnRow}>
                  <TouchableOpacity onPress={() => setSoundScore(Math.max(1, +(soundScore - 0.5).toFixed(1)))} style={styles.miniBtn}><Text style={styles.miniBtnText}>-</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => setSoundScore(Math.min(10, +(soundScore + 0.5).toFixed(1)))} style={styles.miniBtn}><Text style={styles.miniBtnText}>+</Text></TouchableOpacity>
                </View>
              </View>

              <View style={styles.criteriaItem}>
                <Text style={styles.critLabel}>Characters: {characterScore.toFixed(1)}</Text>
                <View style={styles.miniBtnRow}>
                  <TouchableOpacity onPress={() => setCharacterScore(Math.max(1, +(characterScore - 0.5).toFixed(1)))} style={styles.miniBtn}><Text style={styles.miniBtnText}>-</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => setCharacterScore(Math.min(10, +(characterScore + 0.5).toFixed(1)))} style={styles.miniBtn}><Text style={styles.miniBtnText}>+</Text></TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Headline */}
            <Text style={styles.inputLabel}>Review Headline</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="e.g. Masterpiece with god-tier soundtrack..."
              placeholderTextColor={theme.colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            {/* Detailed Body */}
            <Text style={styles.inputLabel}>Detailed Review</Text>
            <TextInput
              style={styles.bodyInput}
              placeholder="Share what worked, the animation peaks, character development, and sound design..."
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={body}
              onChangeText={setBody}
            />

            {/* Spoiler Shield Checkbox */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.spoilerRow}
              onPress={() => setContainsSpoilers(!containsSpoilers)}
            >
              <View style={[styles.checkbox, containsSpoilers && styles.checkboxActive]}>
                {containsSpoilers && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
              <View>
                <Text style={styles.spoilerText}>Contains Major Spoilers</Text>
                <Text style={styles.spoilerSubtext}>Review will be shielded with a tap-to-reveal blur</Text>
              </View>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity activeOpacity={0.85} style={[styles.submitBtn, shadows.neon]} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>Publish Community Review</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'android' ? 24 : 36,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  targetMediaCard: {
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: borderRadius.lg,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
  },
  targetMediaLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  targetMediaTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: borderRadius.lg,
    marginBottom: 12,
  },
  scoreLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  scoreControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scoreBtn: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  scoreValue: {
    color: '#FBBF24',
    fontSize: 14,
    fontWeight: '800',
  },
  subCriteriaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  criteriaItem: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 10,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  critLabel: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  miniBtnRow: {
    flexDirection: 'row',
    gap: 4,
  },
  miniBtn: {
    width: 20,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  titleInput: {
    backgroundColor: theme.colors.surface,
    color: '#FFFFFF',
    padding: 12,
    borderRadius: borderRadius.md,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: 13,
  },
  bodyInput: {
    backgroundColor: theme.colors.surface,
    color: '#FFFFFF',
    padding: 12,
    borderRadius: borderRadius.md,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: 13,
    minHeight: 100,
  },
  spoilerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  spoilerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  spoilerSubtext: {
    color: theme.colors.textMuted,
    fontSize: 10,
  },
  submitBtn: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 14,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
