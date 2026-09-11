import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MangaVolume, MangaChapter, MangaItem } from '../../types/manga';
import { colors, borderRadius } from '../../theme';

interface VolumeChapterListProps {
  volumes: MangaVolume[];
  manga: MangaItem;
  currentChapterId?: string;
  onSelectChapter: (chapter: MangaChapter) => void;
  onDownloadChapter?: (chapter: MangaChapter) => void;
}

export const VolumeChapterList: React.FC<VolumeChapterListProps> = ({
  volumes,
  manga,
  currentChapterId,
  onSelectChapter,
  onDownloadChapter,
}) => {
  const [expandedVolumes, setExpandedVolumes] = useState<Record<string, boolean>>({
    [volumes[0]?.volume || 'Volume 1']: true,
  });

  const toggleVolume = (vol: string) => {
    setExpandedVolumes((prev) => ({
      ...prev,
      [vol]: !prev[vol],
    }));
  };

  return (
    <View style={styles.container}>
      {volumes.map((volGroup) => {
        const isExpanded = expandedVolumes[volGroup.volume] ?? false;
        return (
          <View key={volGroup.volume} style={styles.volumeCard}>
            {/* Volume Header Accordion Toggle */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => toggleVolume(volGroup.volume)}
              style={styles.volumeHeader}
            >
              <View style={styles.volumeHeaderLeft}>
                <Text style={styles.volumeIcon}>📚</Text>
                <Text style={styles.volumeTitle}>{volGroup.volume}</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>
                    {volGroup.chapters.length} Chs
                  </Text>
                </View>
              </View>
              <Text style={styles.expandArrow}>{isExpanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {/* Chapters inside Volume */}
            {isExpanded && (
              <View style={styles.chaptersList}>
                {volGroup.chapters.map((ch) => {
                  const isCurrent = currentChapterId === ch.id;
                  return (
                    <TouchableOpacity
                      key={ch.id}
                      activeOpacity={0.7}
                      onPress={() => onSelectChapter(ch)}
                      style={[
                        styles.chapterRow,
                        isCurrent && styles.chapterRowActive,
                      ]}
                    >
                      <View style={styles.chapterInfo}>
                        <Text
                          style={[
                            styles.chapterTitle,
                            isCurrent && styles.chapterTitleActive,
                          ]}
                        >
                          Chapter {ch.chapter}
                        </Text>
                        <Text style={styles.scanGroup}>
                          {ch.scanlationGroup || 'English'} • {ch.language.toUpperCase()}
                        </Text>
                      </View>

                      {onDownloadChapter && (
                        <TouchableOpacity
                          onPress={() => onDownloadChapter(ch)}
                          style={styles.downloadBtn}
                        >
                          <Text style={styles.downloadBtnText}>📥</Text>
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  volumeCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  volumeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: colors.surface,
  },
  volumeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  volumeTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  countBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginLeft: 10,
  },
  countBadgeText: {
    color: '#C4B5FD',
    fontSize: 11,
    fontWeight: '700',
  },
  expandArrow: {
    color: colors.textMuted,
    fontSize: 12,
  },
  chaptersList: {
    padding: 8,
  },
  chapterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    marginBottom: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  chapterRowActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  chapterTitleActive: {
    color: '#D8B4FE',
    fontWeight: '700',
  },
  scanGroup: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  downloadBtn: {
    padding: 6,
  },
  downloadBtnText: {
    fontSize: 14,
  },
});
