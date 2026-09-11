import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { MangaVolume, MangaChapter } from '../../types/manga';
import { saveMangaChapterOffline } from '../../utils/offlineStorageEngine';
import { resolveMangaChapterPages } from '../../api/manga/mangaResolver';

interface BulkDownloadModalProps {
  visible: boolean;
  onClose: () => void;
  volumes: MangaVolume[];
  mangaTitle: string;
}

export const BulkDownloadModal: React.FC<BulkDownloadModalProps> = ({
  visible,
  onClose,
  volumes,
  mangaTitle,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);

  const allChapters = volumes.flatMap((v) => v.chapters);

  const handleStartBulkDownload = async (count: number) => {
    setDownloading(true);
    const targetChapters = allChapters.slice(0, count);

    for (let i = 0; i < targetChapters.length; i++) {
      const ch = targetChapters[i];
      setProgressText(`Downloading Chapter ${ch.chapter} (${i + 1}/${targetChapters.length})...`);
      setDownloadProgress(Math.floor(((i + 1) / targetChapters.length) * 100));

      try {
        const pages = await resolveMangaChapterPages(ch.id);
        await saveMangaChapterOffline(ch.id, pages);
      } catch (e) {
        console.warn('Failed to cache chapter offline:', ch.id, e);
      }
    }

    setProgressText('Completed! Chapters stored offline.');
    setTimeout(() => {
      setDownloading(false);
      onClose();
    }, 800);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="cloud-download" size={20} color={theme.colors.accent} />
              <Text style={styles.headerTitle}>Bulk Offline Download</Text>
            </View>
            {!downloading && (
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.mangaTitleText} numberOfLines={1}>
            {mangaTitle}
          </Text>

          {downloading ? (
            <View style={styles.downloadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.accent} />
              <Text style={styles.progressLabel}>{progressText}</Text>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${downloadProgress}%` }]} />
              </View>
              <Text style={styles.percentageText}>{downloadProgress}%</Text>
            </View>
          ) : (
            <View style={styles.optionsList}>
              <Text style={styles.optionsSubtitle}>
                Select batch size to download for offline reading:
              </Text>

              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => handleStartBulkDownload(5)}
              >
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Next 5 Chapters</Text>
                  <Text style={styles.optionSub}>~6 MB • Estimated time: 3s</Text>
                </View>
                <Ionicons name="download-outline" size={20} color={theme.colors.accent} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => handleStartBulkDownload(10)}
              >
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Next 10 Chapters</Text>
                  <Text style={styles.optionSub}>~12 MB • Estimated time: 6s</Text>
                </View>
                <Ionicons name="download-outline" size={20} color={theme.colors.accent} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => handleStartBulkDownload(25)}
              >
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Next 25 Chapters</Text>
                  <Text style={styles.optionSub}>~30 MB • Estimated time: 15s</Text>
                </View>
                <Ionicons name="download-outline" size={20} color={theme.colors.accent} />
              </TouchableOpacity>

              {volumes.length > 0 && (
                <TouchableOpacity
                  style={[styles.optionCard, styles.volumeCard]}
                  onPress={() => handleStartBulkDownload(volumes[0].chapters.length)}
                >
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionTitle}>Download {volumes[0].volume}</Text>
                    <Text style={styles.optionSub}>
                      {volumes[0].chapters.length} chapters in current volume
                    </Text>
                  </View>
                  <Ionicons name="folder-outline" size={20} color="#FFD700" />
                </TouchableOpacity>
              )}
            </View>
          )}
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
    backgroundColor: theme.colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
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
  mangaTitleText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  optionsList: {
    gap: 10,
  },
  optionsSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  volumeCard: {
    borderColor: 'rgba(255, 215, 0, 0.3)',
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  optionSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  downloadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    gap: 12,
  },
  progressLabel: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    marginTop: 6,
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: 3,
  },
  percentageText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },
});
