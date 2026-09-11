import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useDownloads } from '../context/DownloadContext';
import { colors, borderRadius } from '../theme';
import { formatBytes } from '../utils/formatters';

interface DownloadsScreenProps {
  onPlayOfflineEpisode: (item: any) => void;
}

export const DownloadsScreen: React.FC<DownloadsScreenProps> = ({ onPlayOfflineEpisode }) => {
  const { downloadQueue, pauseDownload, resumeDownload, deleteDownload } = useDownloads();

  const totalDownloadedBytes = downloadQueue
    .filter((d) => d.status === 'COMPLETED')
    .reduce((acc, curr) => acc + curr.downloadedBytes, 0);

  return (
    <View style={styles.container}>
      {/* Header & Storage Meter */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Offline Downloads</Text>
        <Text style={styles.headerSubtitle}>
          {downloadQueue.length} episodes • {formatBytes(totalDownloadedBytes)} used
        </Text>

        {/* Storage Bar Indicator */}
        <View style={styles.storageBarWrapper}>
          <View style={styles.storageBarTrack}>
            <View
              style={[
                styles.storageBarFill,
                { width: `${Math.min(100, (downloadQueue.length * 10))}%` },
              ]}
            />
          </View>
          <Text style={styles.storageText}>
            Internal Phone Storage • Ready for offline playback without WiFi
          </Text>
        </View>
      </View>

      {/* Downloads List */}
      {downloadQueue.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📥</Text>
          <Text style={styles.emptyTitle}>No Offline Downloads</Text>
          <Text style={styles.emptySubtitle}>
            Download anime episodes to watch on flights, road trips, or when offline.
          </Text>
        </View>
      ) : (
        <FlatList
          data={downloadQueue}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isCompleted = item.status === 'COMPLETED';
            return (
              <View style={styles.downloadCard}>
                <Image source={{ uri: item.animeCover }} style={styles.coverImage} />

                <View style={styles.cardInfo}>
                  <Text numberOfLines={1} style={styles.animeTitle}>
                    {item.animeTitle}
                  </Text>
                  <Text style={styles.episodeText}>
                    Episode {item.episodeNumber} • {item.quality}
                  </Text>

                  {/* Progress Bar & Real-time Transfer Speed if Downloading */}
                  {!isCompleted && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBarTrack}>
                        <View
                          style={[styles.progressBarFill, { width: `${item.progress}%` }]}
                        />
                      </View>
                      <View style={styles.statsRow}>
                        <Text style={styles.progressText}>
                          {item.status === 'PAUSED' ? 'Paused' : `${item.progress}%`} •{' '}
                          {formatBytes(item.downloadedBytes)} / {formatBytes(item.totalBytes)}
                        </Text>
                        {item.status === 'DOWNLOADING' && item.speedBytesPerSec && (
                          <Text style={styles.speedText}>
                            ⚡ {(item.speedBytesPerSec / (1024 * 1024)).toFixed(1)} MB/s (ETA: {item.etaSeconds || 12}s)
                          </Text>
                        )}
                      </View>
                    </View>
                  )}

                  {isCompleted && (
                    <Text style={styles.completedSizeText}>
                      ✓ Ready ({formatBytes(item.totalBytes)})
                    </Text>
                  )}
                </View>

                {/* Actions */}
                <View style={styles.actionColumn}>
                  {isCompleted ? (
                    <TouchableOpacity
                      onPress={() => onPlayOfflineEpisode(item)}
                      style={styles.playOfflineBtn}
                    >
                      <Text style={styles.playOfflineBtnText}>▶ Play</Text>
                    </TouchableOpacity>
                  ) : item.status === 'DOWNLOADING' ? (
                    <TouchableOpacity
                      onPress={() => pauseDownload(item.id)}
                      style={styles.pauseBtn}
                    >
                      <Text style={styles.pauseBtnText}>❚❚</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => resumeDownload(item.id)}
                      style={styles.resumeBtn}
                    >
                      <Text style={styles.resumeBtnText}>▶</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => deleteDownload(item.id)}
                    style={styles.deleteBtn}
                  >
                    <Text style={styles.deleteBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 28 : 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(18, 21, 31, 0.98)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    marginBottom: 10,
  },
  storageBarWrapper: {
    marginTop: 4,
  },
  storageBarTrack: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  storageBarFill: {
    height: '100%',
    backgroundColor: colors.secondary,
  },
  storageText: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 6,
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  downloadCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  coverImage: {
    width: 60,
    height: 85,
    borderRadius: borderRadius.md,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  animeTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  episodeText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    color: '#A78BFA',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  speedText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '700',
  },
  completedSizeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  actionColumn: {
    alignItems: 'center',
    marginLeft: 8,
  },
  playOfflineBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    marginBottom: 8,
  },
  playOfflineBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  pauseBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    marginBottom: 8,
  },
  pauseBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  resumeBtn: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    marginBottom: 8,
  },
  resumeBtnText: {
    color: '#0B0D13',
    fontSize: 11,
    fontWeight: '800',
  },
  deleteBtn: {
    padding: 4,
  },
  deleteBtnText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
});
