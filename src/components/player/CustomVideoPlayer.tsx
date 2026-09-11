import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import Hls from 'hls.js';
import { StreamData, SubtitleTrack, UnifiedAnime, VideoSource } from '../../types/anime';
import { colors, borderRadius, shadows } from '../../theme';
import { formatDuration } from '../../utils/formatters';
import { parseVTTorSRT, getActiveCueText, SubtitleCue } from '../../utils/subtitleParser';
import { useWatchProgress } from '../../context/WatchProgressContext';
import { useSettings } from '../../context/SettingsContext';
import axios from 'axios';

interface CustomVideoPlayerProps {
  anime: UnifiedAnime;
  episodeNumber: number;
  streamData: StreamData;
  onClose?: () => void;
  onNextEpisode?: () => void;
  onPreviousEpisode?: () => void;
  onServerChange?: (serverName: string) => void;
  totalEpisodes?: number;
  onSelectEpisode?: (ep: number) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  anime,
  episodeNumber,
  streamData,
  onClose,
  onNextEpisode,
  onPreviousEpisode,
  onServerChange,
  totalEpisodes = 24,
  onSelectEpisode,
}) => {
  const { updateProgress, getAnimeProgress } = useWatchProgress();
  const { settings } = useSettings();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [activeQuality, setActiveQuality] = useState('auto');
  const [isMuted, setIsMuted] = useState(false);

  // Subtitle state
  const [selectedSubtitle, setSelectedSubtitle] = useState<SubtitleTrack | null>(null);
  const [subtitleCues, setSubtitleCues] = useState<SubtitleCue[]>([]);
  const [currentSubtitleText, setCurrentSubtitleText] = useState<string | null>(null);

  // Drawers / Menus
  const [activeModal, setActiveModal] = useState<'quality' | 'subtitles' | 'servers' | 'episodes' | 'speed' | null>(null);

  // Controls auto-hide timer
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Source Selection
  const activeSource: VideoSource =
    streamData.sources.find((s) => s.quality === activeQuality) ||
    streamData.sources.find((s) => s.quality === 'auto') ||
    streamData.sources[0];

  // 2. Resume Previous Timestamp
  useEffect(() => {
    const saved = getAnimeProgress(anime.id);
    if (saved && saved.currentEpisode === episodeNumber && saved.currentTime > 0) {
      if (videoRef.current) {
        videoRef.current.currentTime = saved.currentTime;
      }
    }
  }, [anime.id, episodeNumber]);

  // 3. Load & Initialize Video Stream (HLS or direct MP4)
  useEffect(() => {
    if (Platform.OS === 'web' && videoRef.current && activeSource) {
      setIsLoading(true);
      const video = videoRef.current;

      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      if (activeSource.isM3U8 && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });

        hls.loadSource(activeSource.url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          video.play().catch(() => setIsPlaying(false));
          setIsPlaying(true);
        });

        hls.on(Hls.Events.BUFFER_APPENDED, () => setIsBuffering(false));

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });

        hlsRef.current = hls;
      } else {
        // Direct Native or MP4 playback
        video.src = activeSource.url;
        video.onloadedmetadata = () => {
          setIsLoading(false);
          video.play().catch(() => setIsPlaying(false));
          setIsPlaying(true);
        };
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [activeSource?.url]);

  // 4. Load Default Subtitles & Parse Cues
  useEffect(() => {
    if (streamData.subtitles && streamData.subtitles.length > 0) {
      const defaultSub = streamData.subtitles.find((s) => s.isDefault) || streamData.subtitles[0];
      setSelectedSubtitle(defaultSub);
    } else {
      setSelectedSubtitle(null);
      setSubtitleCues([]);
    }
  }, [streamData.subtitles]);

  useEffect(() => {
    if (!selectedSubtitle) {
      setSubtitleCues([]);
      setCurrentSubtitleText(null);
      return;
    }

    let isMounted = true;
    axios
      .get(selectedSubtitle.url, { timeout: 6000 })
      .then((res) => {
        if (isMounted && typeof res.data === 'string') {
          const cues = parseVTTorSRT(res.data);
          setSubtitleCues(cues);
        }
      })
      .catch((err) => {
        console.warn('[Subtitles] Failed to fetch subtitle file:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSubtitle?.url]);

  // 5. Update Real-time Subtitle Cue & Progress
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;

    setCurrentTime(time);
    setDuration(dur);

    // Update Subtitles
    if (subtitleCues.length > 0) {
      const activeText = getActiveCueText(subtitleCues, time);
      setCurrentSubtitleText(activeText);
    }

    // Update Watch Progress every 5 seconds or at end
    if (Math.floor(time) % 5 === 0 || time >= dur - 2) {
      updateProgress(anime, episodeNumber, time, dur);
    }
  };

  // 6. Controls Interaction
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
    resetControlsTimeout();
  };

  const seek = (seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    resetControlsTimeout();
  };

  const seekTo = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const resetControlsTimeout = () => {
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    setShowControls(true);
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying && !isLocked && !activeModal) {
        setShowControls(false);
      }
    }, 4500);
  };

  // 7. AniSkip OP/ED Detection
  const isInIntro =
    streamData.intro &&
    currentTime >= streamData.intro.start &&
    currentTime <= streamData.intro.end;

  const isInOutro =
    streamData.outro &&
    currentTime >= streamData.outro.start &&
    currentTime <= streamData.outro.end;

  const skipIntro = () => {
    if (streamData.intro) {
      seekTo(streamData.intro.end + 1);
    }
  };

  const skipOutro = () => {
    if (streamData.outro) {
      seekTo(streamData.outro.end + 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Video Element Wrapper */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          if (showControls) {
            setShowControls(false);
          } else {
            resetControlsTimeout();
          }
        }}
        style={styles.videoSurface}
      >
        {Platform.OS === 'web' ? (
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: settings.resizeMode === 'cover' ? 'cover' : 'contain',
              backgroundColor: '#000',
            }}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => {
              setIsPlaying(false);
              if (settings.autoPlayNext && onNextEpisode) {
                onNextEpisode();
              }
            }}
          />
        ) : null}

        {/* Loading Spinner */}
        {(isLoading || isBuffering) && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.bufferingText}>
              {isLoading ? 'Connecting to Fast Stream...' : 'Buffering...'}
            </Text>
          </View>
        )}

        {/* Dynamic Subtitle Display */}
        {currentSubtitleText && !activeModal && (
          <View
            style={[
              styles.subtitleOverlay,
              {
                bottom: settings.subtitles.bottomOffset,
              },
            ]}
          >
            <View
              style={[
                styles.subtitleBox,
                {
                  backgroundColor: `rgba(0, 0, 0, ${settings.subtitles.backgroundOpacity})`,
                },
              ]}
            >
              <Text
                style={[
                  styles.subtitleText,
                  {
                    fontSize: settings.subtitles.fontSize,
                    color: settings.subtitles.fontColor,
                  },
                ]}
              >
                {currentSubtitleText}
              </Text>
            </View>
          </View>
        )}

        {/* AniSkip Dynamic "Skip Intro / Outro" Overlay Button */}
        {isInIntro && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={skipIntro}
            style={[styles.skipButton, shadows.neon]}
          >
            <Text style={styles.skipButtonText}>⏭ Skip Intro</Text>
          </TouchableOpacity>
        )}

        {isInOutro && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={skipOutro}
            style={[styles.skipButton, shadows.neon]}
          >
            <Text style={styles.skipButtonText}>⏭ Skip Outro</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Video Controls Overlay */}
      {showControls && (
        <View style={styles.controlsOverlay}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onClose} style={styles.topButton}>
              <Text style={styles.topButtonText}>✕ Close</Text>
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text numberOfLines={1} style={styles.animeTitleText}>
                {anime.title.english || anime.title.romaji || 'Anime'}
              </Text>
              <Text style={styles.episodeSubtitleText}>
                Episode {episodeNumber} • {streamData.serverName}
              </Text>
            </View>

            <View style={styles.topActionGroup}>
              <TouchableOpacity
                onPress={() => setActiveModal('subtitles')}
                style={styles.iconButton}
              >
                <Text style={styles.iconButtonText}>💬 Sub</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveModal('quality')}
                style={styles.iconButton}
              >
                <Text style={styles.iconButtonText}>⚙ {activeQuality}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveModal('servers')}
                style={styles.iconButton}
              >
                <Text style={styles.iconButtonText}>🌐 Server</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Center Playback Area */}
          <View style={styles.centerControls}>
            <TouchableOpacity
              onPress={() => seek(-10)}
              style={styles.centerSeekButton}
            >
              <Text style={styles.seekIconText}>⏪ 10s</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={togglePlay}
              style={[styles.centerPlayButton, shadows.neon]}
            >
              <Text style={styles.centerPlayIcon}>{isPlaying ? '❚❚' : '▶'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => seek(10)}
              style={styles.centerSeekButton}
            >
              <Text style={styles.seekIconText}>10s ⏩</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Bar */}
          <View style={styles.bottomBar}>
            {/* Progress Bar & Seek Slider */}
            <View style={styles.progressBarWrapper}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={(e: any) => {
                  const nativeEvent = e.nativeEvent;
                  const rectWidth = screenWidth - 40;
                  const clickX = nativeEvent.locationX || 0;
                  const seekTime = (clickX / rectWidth) * duration;
                  seekTo(seekTime);
                }}
                style={styles.progressTrack}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                    },
                  ]}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.bottomRow}>
              <Text style={styles.timeText}>
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </Text>

              <View style={styles.bottomRightGroup}>
                <TouchableOpacity
                  onPress={() => setActiveModal('episodes')}
                  style={styles.bottomActionBtn}
                >
                  <Text style={styles.bottomActionBtnText}>☰ Episodes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setActiveModal('speed')}
                  style={styles.bottomActionBtn}
                >
                  <Text style={styles.bottomActionBtnText}>{playbackSpeed}x</Text>
                </TouchableOpacity>

                {onNextEpisode && (
                  <TouchableOpacity
                    onPress={onNextEpisode}
                    style={styles.nextEpBtn}
                  >
                    <Text style={styles.nextEpBtnText}>Next Ep ⏭</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Modal Drawer: Subtitle Selector */}
      <Modal
        visible={activeModal === 'subtitles'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Select Subtitles</Text>
            <ScrollView style={styles.modalScroll}>
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  selectedSubtitle === null && styles.modalItemActive,
                ]}
                onPress={() => {
                  setSelectedSubtitle(null);
                  setActiveModal(null);
                }}
              >
                <Text style={styles.modalItemText}>Off (None)</Text>
              </TouchableOpacity>

              {streamData.subtitles.map((sub) => (
                <TouchableOpacity
                  key={sub.url}
                  style={[
                    styles.modalItem,
                    selectedSubtitle?.url === sub.url && styles.modalItemActive,
                  ]}
                  onPress={() => {
                    setSelectedSubtitle(sub);
                    setActiveModal(null);
                  }}
                >
                  <Text style={styles.modalItemText}>{sub.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setActiveModal(null)}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Drawer: Quality Selector */}
      <Modal
        visible={activeModal === 'quality'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Video Quality</Text>
            <ScrollView style={styles.modalScroll}>
              {['auto', '1080p', '720p', '480p', '360p'].map((q) => (
                <TouchableOpacity
                  key={q}
                  style={[
                    styles.modalItem,
                    activeQuality === q && styles.modalItemActive,
                  ]}
                  onPress={() => {
                    setActiveQuality(q);
                    setActiveModal(null);
                  }}
                >
                  <Text style={styles.modalItemText}>
                    {q.toUpperCase()} {q === 'auto' ? '(Recommended)' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setActiveModal(null)}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Drawer: Episode Selector */}
      <Modal
        visible={activeModal === 'episodes'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Choose Episode</Text>
            <ScrollView style={styles.modalScroll}>
              {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => (
                <TouchableOpacity
                  key={ep}
                  style={[
                    styles.modalItem,
                    episodeNumber === ep && styles.modalItemActive,
                  ]}
                  onPress={() => {
                    setActiveModal(null);
                    if (onSelectEpisode) onSelectEpisode(ep);
                  }}
                >
                  <Text style={styles.modalItemText}>Episode {ep}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setActiveModal(null)}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoSurface: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 16,
    borderRadius: borderRadius.lg,
  },
  bufferingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
  },
  subtitleOverlay: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  subtitleBox: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    maxWidth: '90%',
  },
  subtitleText: {
    textAlign: 'center',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  skipButton: {
    position: 'absolute',
    bottom: 80,
    right: 24,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  skipButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'space-between',
    padding: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 24 : 8,
  },
  topButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.md,
  },
  topButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  animeTitleText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  episodeSubtitleText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  topActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    marginLeft: 8,
  },
  iconButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  centerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSeekButton: {
    padding: 14,
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.full,
  },
  seekIconText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  centerPlayButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPlayIcon: {
    color: '#FFFFFF',
    fontSize: 26,
    marginLeft: 3,
  },
  bottomBar: {
    width: '100%',
    paddingBottom: Platform.OS === 'android' ? 16 : 8,
  },
  progressBarWrapper: {
    width: '100%',
    paddingVertical: 10,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.sm,
    marginLeft: 8,
  },
  bottomActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  nextEpBtn: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    marginLeft: 10,
  },
  nextEpBtnText: {
    color: '#0B0D13',
    fontSize: 12,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    padding: 20,
    maxHeight: '60%',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalHeader: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  modalScroll: {
    marginBottom: 16,
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  modalItemActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.35)',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  modalItemText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalCloseBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
