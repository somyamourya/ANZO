import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StatsForNerdsData, CineTheme } from '../../types/cineplayer';
import { borderRadius } from '../../theme';

interface StatsForNerdsProps {
  stats: StatsForNerdsData;
  theme: CineTheme;
  onClose: () => void;
}

export const StatsForNerds: React.FC<StatsForNerdsProps> = ({
  stats,
  theme,
  onClose,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: 'rgba(11, 13, 19, 0.94)',
          borderColor: theme.hudBorder,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.accent }]}>
          ⚡ CinePlayer Diagnostics (Stats for Nerds)
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <View style={styles.row}>
          <Text style={styles.label}>Resolution / Quality:</Text>
          <Text style={styles.value}>{stats.resolution}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Stream Bitrate:</Text>
          <Text style={styles.value}>{stats.bitrateKbps} kbps</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Buffer Ahead (Health):</Text>
          <Text
            style={[
              styles.value,
              { color: stats.bufferHealthSeconds > 10 ? '#10B981' : '#F59E0B' },
            ]}
          >
            {stats.bufferHealthSeconds.toFixed(1)} seconds
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Frame Rate / Dropped:</Text>
          <Text style={styles.value}>
            {stats.fps} FPS ({stats.droppedFrames} dropped)
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Active CDN Server:</Text>
          <Text style={[styles.value, { color: theme.accentSecondary }]}>
            {stats.activeServer} ({stats.serverPingMs}ms ping)
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Audio Track Mode:</Text>
          <Text style={styles.value}>
            {stats.audioMode.toUpperCase()} ({stats.audioCodec})
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>HLS Protocol Stream:</Text>
          <Text style={styles.value}>Level {stats.hlsLevel} (Adaptive ABR)</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    padding: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    zIndex: 99,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  grid: {
    paddingVertical: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    fontWeight: '500',
  },
  value: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
