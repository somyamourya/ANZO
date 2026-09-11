import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

export interface SourceItem {
  id: string;
  name: string;
  badge: string;
  isFast: boolean;
  pingMs: number;
}

interface SourceSwitcherModalProps {
  visible: boolean;
  onClose: () => void;
  sources: SourceItem[];
  currentSource: string;
  onSelectSource: (sourceId: string) => void;
  type?: 'MANGA' | 'NOVEL';
}

export const SourceSwitcherModal: React.FC<SourceSwitcherModalProps> = ({
  visible,
  onClose,
  sources,
  currentSource,
  onSelectSource,
  type = 'MANGA',
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="server" size={20} color={theme.colors.accent} />
              <Text style={styles.headerTitle}>Select {type === 'MANGA' ? 'Manga' : 'Novel'} Source</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subTitle}>
            Switch mirror providers to resolve missing chapters or increase download speed.
          </Text>

          {/* Sources List */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            {sources.map((src) => {
              const isSelected = currentSource.toLowerCase() === src.id.toLowerCase();

              return (
                <TouchableOpacity
                  key={src.id}
                  style={[
                    styles.sourceCard,
                    isSelected && styles.sourceCardSelected,
                  ]}
                  onPress={() => {
                    onSelectSource(src.id);
                    onClose();
                  }}
                >
                  <View style={styles.sourceInfo}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.sourceName, isSelected && { color: theme.colors.accent }]}>
                        {src.name}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={16} color={theme.colors.accent} />
                      )}
                    </View>
                    <View style={styles.badgeRow}>
                      <View style={styles.featureBadge}>
                        <Text style={styles.featureBadgeText}>{src.badge}</Text>
                      </View>
                      <View
                        style={[
                          styles.pingBadge,
                          {
                            backgroundColor:
                              src.pingMs < 50
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(255, 149, 0, 0.15)',
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.pingDot,
                            { backgroundColor: src.pingMs < 50 ? '#10B981' : '#FF9500' },
                          ]}
                        />
                        <Text
                          style={[
                            styles.pingText,
                            { color: src.pingMs < 50 ? '#10B981' : '#FF9500' },
                          ]}
                        >
                          {src.pingMs}ms
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '65%',
    backgroundColor: theme.colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  listContent: {
    gap: 10,
    paddingBottom: 24,
  },
  sourceCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sourceCardSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
  },
  sourceInfo: {
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sourceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  featureBadgeText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  pingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pingDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  pingText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});
