import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  GestureResponderEvent,
} from 'react-native';
import { CineTheme } from '../../types/cineplayer';
import { formatDuration } from '../../utils/formatters';
import { borderRadius } from '../../theme';

interface ScrubberTimelineProps {
  currentTime: number;
  duration: number;
  intro?: { start: number; end: number };
  outro?: { start: number; end: number };
  theme: CineTheme;
  onSeek: (time: number) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const ScrubberTimeline: React.FC<ScrubberTimelineProps> = ({
  currentTime,
  duration,
  intro,
  outro,
  theme,
  onSeek,
}) => {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Intro segment position
  const introStartPercent = intro && duration > 0 ? (intro.start / duration) * 100 : 0;
  const introWidthPercent =
    intro && duration > 0 ? ((intro.end - intro.start) / duration) * 100 : 0;

  // Outro segment position
  const outroStartPercent = outro && duration > 0 ? (outro.start / duration) * 100 : 0;
  const outroWidthPercent =
    outro && duration > 0 ? ((outro.end - outro.start) / duration) * 100 : 0;

  const handleTouch = (e: GestureResponderEvent) => {
    const clickX = e.nativeEvent.locationX;
    const trackWidth = screenWidth - 32;
    const ratio = Math.max(0, Math.min(1, clickX / trackWidth));
    const targetTime = ratio * duration;
    onSeek(targetTime);
  };

  return (
    <View style={styles.container}>
      {/* Tooltip while scrubbing */}
      {isScrubbing && hoverTime !== null && (
        <View
          style={[
            styles.tooltipBubble,
            {
              left: `${duration > 0 ? (hoverTime / duration) * 100 : 0}%`,
              backgroundColor: theme.hudBackground,
              borderColor: theme.accent,
            },
          ]}
        >
          <Text style={styles.tooltipText}>{formatDuration(hoverTime)}</Text>
        </View>
      )}

      {/* Main Track */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleTouch}
        style={styles.touchArea}
      >
        <View
          style={[
            styles.trackBg,
            { backgroundColor: theme.progressBarTrack },
          ]}
        >
          {/* Colored AniSkip Intro Segment (Purple) */}
          {intro && introWidthPercent > 0 && (
            <View
              style={[
                styles.chapterMarker,
                {
                  left: `${introStartPercent}%`,
                  width: `${introWidthPercent}%`,
                  backgroundColor: 'rgba(168, 85, 247, 0.75)',
                },
              ]}
            />
          )}

          {/* Colored AniSkip Outro Segment (Orange) */}
          {outro && outroWidthPercent > 0 && (
            <View
              style={[
                styles.chapterMarker,
                {
                  left: `${outroStartPercent}%`,
                  width: `${outroWidthPercent}%`,
                  backgroundColor: 'rgba(249, 115, 22, 0.75)',
                },
              ]}
            />
          )}

          {/* Active Progress Fill */}
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: theme.progressBarFill,
              },
            ]}
          />
        </View>

        {/* Playhead Thumb */}
        <View
          style={[
            styles.thumb,
            {
              left: `${progressPercent}%`,
              backgroundColor: theme.accent,
              borderColor: '#FFFFFF',
            },
          ]}
        />
      </TouchableOpacity>

      {/* Timeline Chapter Legend */}
      <View style={styles.legendRow}>
        <Text style={[styles.timeLabel, { color: '#FFFFFF' }]}>
          {formatDuration(currentTime)}
        </Text>

        <View style={styles.legendBadges}>
          {intro && (
            <View style={styles.legendBadge}>
              <View style={[styles.legendDot, { backgroundColor: '#A855F7' }]} />
              <Text style={styles.legendText}>OP Chapter</Text>
            </View>
          )}
          {outro && (
            <View style={styles.legendBadge}>
              <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
              <Text style={styles.legendText}>ED Chapter</Text>
            </View>
          )}
        </View>

        <Text style={[styles.timeLabel, { color: 'rgba(255, 255, 255, 0.7)' }]}>
          {formatDuration(duration)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 8,
    position: 'relative',
  },
  touchArea: {
    width: '100%',
    height: 24,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBg: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  chapterMarker: {
    height: '100%',
    position: 'absolute',
    top: 0,
    borderRadius: 1,
  },
  thumb: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    position: 'absolute',
    top: 5,
    marginLeft: -7,
  },
  tooltipBubble: {
    position: 'absolute',
    top: -24,
    marginLeft: -25,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  legendBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  legendText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '600',
  },
});
