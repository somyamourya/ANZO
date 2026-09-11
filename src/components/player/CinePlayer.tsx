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
  Animated,
} from 'react-native';
import Hls from 'hls.js';
import { UnifiedAnime, SubtitleTrack } from '../../types/anime';
import {
  CineThemeId,
  AudioMode,
  AspectRatioMode,
  StreamingServer,
  StatsForNerdsData,
  DialogueItem,
  SleepTimerConfig,
} from '../../types/cineplayer';
import { CINE_THEMES, DEFAULT_CINE_THEME } from '../../theme/cineThemes';
import { ScrubberTimeline } from './ScrubberTimeline';
import { StatsForNerds } from './StatsForNerds';
import { DialogueToolsModal } from './DialogueToolsModal';
import {
  getServerPoolForEpisode,
  findNextFailoverServer,
  pingServerLatency,
} from '../../api/streaming/serverRouter';
import {
  parseVTTorSRT,
  getActiveCueText,
  SubtitleCue,
} from '../../utils/subtitleParser';
import {
  cuesToDialogueItems,
  findPreviousDialogueCue,
  translateSubtitleText,
} from '../../utils/dialogueEngine';
import { useWatchProgress } from '../../context/WatchProgressContext';
import { useSettings } from '../../context/SettingsContext';
import { borderRadius, shadows } from '../../theme';
import axios from 'axios';

interface CinePlayerProps {
  anime: UnifiedAnime;
  episodeNumber: number;
  initialAudioMode?: AudioMode;
  onClose?: () => void;
  onNextEpisode?: () => void;
  onPreviousEpisode?: () => void;
  totalEpisodes?: number;
  onSelectEpisode?: (ep: number) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const CinePlayer: React.FC<CinePlayerProps> = ({
  anime,
  episodeNumber,
  initialAudioMode = 'sub',
  onClose,
  onNextEpisode,
  onPreviousEpisode,
  totalEpisodes = 24,
  onSelectEpisode,
}) => {
  const { updateProgress, getAnimeProgress } = useWatchProgress();
  const { settings, playerConfig } = useSettings();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // CinePlayer Theme & Audio Mode State
  const [currentThemeId, setCurrentThemeId] = useState<CineThemeId>(
    playerConfig.hudTheme || 'cyberpunk'
  );
  const [audioMode, setAudioMode] = useState<AudioMode>(initialAudioMode);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>('contain');

  const theme = CINE_THEMES[currentThemeId] || DEFAULT_CINE_THEME;

  // Server Pool & Active Server State
  const [serverPool, setServerPool] = useState<StreamingServer[]>([]);
  const [activeServer, setActiveServer] = useState<StreamingServer | null>(null);
  const [activeQuality, setActiveQuality] = useState('auto');
  const [failoverToast, setFailoverToast] = useState<string | null>(null);

  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // Subtitle & Dialogue State
  const [selectedSubtitle, setSelectedSubtitle] = useState<SubtitleTrack | null>(null);
  const [subtitleCues, setSubtitleCues] = useState<SubtitleCue[]>([]);
  const [dialogueItems, setDialogueItems] = useState<DialogueItem[]>([]);
  const [currentSubtitleText, setCurrentSubtitleText] = useState<string | null>(null);
  const [translationLanguage, setTranslationLanguage] = useState<string>('en');

  // Diagnostic Stats & Sleep Timer
  const [showStatsForNerds, setShowStatsForNerds] = useState(false);
  const [statsData, setStatsData] = useState<StatsForNerdsData>({
    resolution: '1920x1080 (1080p)',
    bitrateKbps: 4800,
    fps: 60,
    bufferHealthSeconds: 18.4,
    droppedFrames: 0,
    audioCodec: 'AAC / Opus 256kbps',
    serverPingMs: 42,
    activeServer: 'MegaCloud Ultra',
    audioMode: 'sub',
    hlsLevel: 'Auto (High)',
  });
  const [sleepTimer, setSleepTimer] = useState<SleepTimerConfig>({
    active: false,
    minutesRemaining: 0,
    mode: 'off',
  });

  // Modal Drawers
  const [activeModal, setActiveModal] = useState<
    'servers' | 'quality' | 'subtitles' | 'dialogue' | 'themes' | 'sleep' | 'episodes' | 'aspect' | null
  >(null);

  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  // 1. Initialize Server Pool on Anime/Episode/AudioMode Change
  useEffect(() => {
    const title = anime.title.english || anime.title.romaji || 'Anime';
    const pool = getServerPoolForEpisode(title, episodeNumber, audioMode);
    setServerPool(pool);
    setActiveServer(pool[0]);

    // Test ping for servers
    pool.forEach(async (srv) => {
      const ping = await pingServerLatency(srv.sources[0]?.url || 'https://google.com');
      setServerPool((prev) =>
        prev.map((s) => (s.id === srv.id ? { ...s, latencyMs: ping } : s))
      );
    });
  }, [anime.id, episodeNumber, audioMode]);

  // 2. Select Active Source
  const activeSource = activeServer
    ? activeServer.sources.find((s) => s.quality === activeQuality) ||
      activeServer.sources.find((s) => s.quality === 'auto') ||
      activeServer.sources[0]
    : null;

  // 3. Resume Saved Playback Timestamp
  useEffect(() => {
    const saved = getAnimeProgress(anime.id);
    if (saved && saved.currentEpisode === episodeNumber && saved.currentTime > 0) {
      if (videoRef.current) {
        videoRef.current.currentTime = saved.currentTime;
      }
    }
  }, [anime.id, episodeNumber]);

  // 4. Load & Attach Video Stream (HLS or Native)
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
          backBufferLength: 120,
          maxBufferLength: 60,
          maxMaxBufferLength: 300,
        });

        hls.loadSource(activeSource.url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          video.play().catch(() => setIsPlaying(false));
          setIsPlaying(true);
        });

        hls.on(Hls.Events.BUFFER_APPENDED, () => setIsBuffering(false));

        // Auto Failover on fatal stream error
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            triggerAutoFailover('HLS Stream Error');
          }
        });

        hlsRef.current = hls;
      } else {
        video.src = activeSource.url;
        video.onloadedmetadata = () => {
          setIsLoading(false);
          video.play().catch(() => setIsPlaying(false));
          setIsPlaying(true);
        };
        video.onerror = () => {
          triggerAutoFailover('Playback Network Error');
        };
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [activeSource?.url]);

  // 5. Auto Failover Handler (Zero-Interruption server switch)
  const triggerAutoFailover = (reason: string) => {
    if (!activeServer || serverPool.length <= 1) return;
    const nextServer = findNextFailoverServer(serverPool, activeServer.id);
    if (nextServer && nextServer.id !== activeServer.id) {
      const savedTime = videoRef.current ? videoRef.current.currentTime : currentTime;
      setActiveServer(nextServer);
      setFailoverToast(
        `Switched to ${nextServer.name} (${reason}). Resumed at ${Math.floor(savedTime)}s`
      );

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = savedTime;
        }
        setFailoverToast(null);
      }, 4000);
    }
  };

  // 6. Subtitle Parser & Dialogue Engine Setup
  useEffect(() => {
    if (activeServer?.subtitles && activeServer.subtitles.length > 0) {
      const defSub = activeServer.subtitles.find((s) => s.isDefault) || activeServer.subtitles[0];
      setSelectedSubtitle(defSub);
    } else {
      setSelectedSubtitle(null);
      setSubtitleCues([]);
      setDialogueItems([]);
    }
  }, [activeServer?.subtitles]);

  useEffect(() => {
    if (!selectedSubtitle) {
      setSubtitleCues([]);
      setDialogueItems([]);
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
          setDialogueItems(cuesToDialogueItems(cues));
        }
      })
      .catch((err) => {
        console.warn('[CinePlayer] Subtitles fetch fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSubtitle?.url]);

  // 7. Time Update & Stats Diagnostic Tracker
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;

    setCurrentTime(time);
    setDuration(dur);

    // Real-time Subtitle Cue & Translation
    if (subtitleCues.length > 0) {
      const rawText = getActiveCueText(subtitleCues, time);
      if (rawText) {
        const translated = translateSubtitleText(rawText, translationLanguage);
        setCurrentSubtitleText(translated);
      } else {
        setCurrentSubtitleText(null);
      }
    }

    // Update Live Stats For Nerds
    if (showStatsForNerds && videoRef.current) {
      const buffered = videoRef.current.buffered;
      let bufferAhead = 0;
      if (buffered.length > 0) {
        bufferAhead = Math.max(0, buffered.end(buffered.length - 1) - time);
      }
      setStatsData((prev) => ({
        ...prev,
        bufferHealthSeconds: bufferAhead,
        activeServer: activeServer?.name || 'MegaCloud',
        serverPingMs: activeServer?.latencyMs || 42,
        audioMode,
      }));
    }

    // Auto-Skip OP/ED if enabled in settings
    const intro = { start: 90, end: 175 };
    if (settings.autoSkipIntro && time >= intro.start && time <= intro.start + 1.5) {
      seekTo(intro.end + 1);
    }

    // Save Progress every 5s
    if (Math.floor(time) % 5 === 0 || time >= dur - 2) {
      updateProgress(anime, episodeNumber, time, dur);
    }
  };

  // 8. Player Controls
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
    const target = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = target;
    setCurrentTime(target);
    resetControlsTimeout();
  };

  const seekTo = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const replayCurrentLine = () => {
    const prevCue = findPreviousDialogueCue(subtitleCues, currentTime);
    if (prevCue) {
      seekTo(Math.max(0, prevCue.start - 0.2));
    } else {
      seek(-5);
    }
    resetControlsTimeout();
  };

  const toggleAudioMode = () => {
    const nextMode: AudioMode = audioMode === 'sub' ? 'dub' : 'sub';
    setAudioMode(nextMode);
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

  const introInterval = { start: 90, end: 175 };
  const outroInterval = { start: 1320, end: 1410 };

  return (
    <View style={[styles.container, { backgroundColor: '#000000' }]}>
      {/* Video Surface */}
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
              objectFit:
                aspectRatio === 'fill' || aspectRatio === 'cover'
                  ? 'cover'
                  : 'contain',
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

        {/* Loading / Buffering Spinner */}
        {(isLoading || isBuffering) && (
          <View style={[styles.loaderBox, { borderColor: theme.hudBorder }]}>
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={styles.loaderText}>
              {isLoading
                ? `Connecting to ${activeServer?.name || 'Fast Server'}...`
                : 'Buffering...'}
            </Text>
          </View>
        )}

        {/* Auto Failover Notification Toast */}
        {failoverToast && (
          <View
            style={[
              styles.failoverToast,
              { backgroundColor: theme.hudBackground, borderColor: theme.accent },
            ]}
          >
            <Text style={[styles.failoverToastText, { color: theme.accentSecondary }]}>
              ⚡ {failoverToast}
            </Text>
          </View>
        )}

        {/* Dynamic Subtitle Display */}
        {currentSubtitleText && !activeModal && (
          <View
            style={[
              styles.subtitleOverlay,
              { bottom: settings.subtitles.bottomOffset },
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

        {/* AniSkip Fast Skip Buttons */}
        {currentTime >= introInterval.start && currentTime <= introInterval.end && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => seekTo(introInterval.end + 1)}
            style={[
              styles.aniSkipBtn,
              { backgroundColor: theme.accent, borderColor: theme.hudBorder },
            ]}
          >
            <Text style={styles.aniSkipText}>⏭ Skip Intro</Text>
          </TouchableOpacity>
        )}

        {currentTime >= outroInterval.start && currentTime <= outroInterval.end && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => seekTo(outroInterval.end + 1)}
            style={[
              styles.aniSkipBtn,
              { backgroundColor: theme.accent, borderColor: theme.hudBorder },
            ]}
          >
            <Text style={styles.aniSkipText}>⏭ Skip Outro</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Diagnostics / Stats For Nerds Overlay */}
      {showStatsForNerds && (
        <StatsForNerds
          stats={statsData}
          theme={theme}
          onClose={() => setShowStatsForNerds(false)}
        />
      )}

      {/* CinePlayer HUD Controls Overlay */}
      {showControls && (
        <View
          style={[
            styles.hudOverlay,
            { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
          ]}
        >
          {/* 1. Top HUD Bar */}
          <View style={styles.topHud}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>‹ Back</Text>
            </TouchableOpacity>

            <View style={styles.animeHeaderInfo}>
              <Text numberOfLines={1} style={styles.animeHeaderTitle}>
                {anime.title.english || anime.title.romaji}
              </Text>
              <Text style={styles.animeHeaderSub}>
                EP {episodeNumber} • {activeServer?.name || 'Server'} (
                {activeServer?.latencyMs || 42}ms)
              </Text>
            </View>

            {/* Top Quick Actions (SUB/DUB, Dialogue Tools, Theme Switcher, Server Picker) */}
            <View style={styles.topActionGroup}>
              {/* SUB / DUB Switcher Button */}
              <TouchableOpacity
                onPress={toggleAudioMode}
                style={[
                  styles.hudChipBtn,
                  {
                    backgroundColor:
                      audioMode === 'dub'
                        ? theme.accent
                        : 'rgba(255, 255, 255, 0.15)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.hudChipText,
                    audioMode === 'dub' && { color: theme.buttonText },
                  ]}
                >
                  {audioMode.toUpperCase()}
                </Text>
              </TouchableOpacity>

              {/* Dialogue Intelligence Button */}
              <TouchableOpacity
                onPress={() => setActiveModal('dialogue')}
                style={styles.hudChipBtn}
              >
                <Text style={styles.hudChipText}>💬 Script</Text>
              </TouchableOpacity>

              {/* Server Switcher */}
              <TouchableOpacity
                onPress={() => setActiveModal('servers')}
                style={styles.hudChipBtn}
              >
                <Text style={styles.hudChipText}>🌐 Server</Text>
              </TouchableOpacity>

              {/* Themes Switcher */}
              <TouchableOpacity
                onPress={() => setActiveModal('themes')}
                style={styles.hudChipBtn}
              >
                <Text style={styles.hudChipText}>🎨 Theme</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. Center Playback Controls */}
          <View style={styles.centerHud}>
            <TouchableOpacity
              onPress={() => seek(-10)}
              style={styles.seekCircleBtn}
            >
              <Text style={styles.seekCircleText}>⏪ 10s</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={togglePlay}
              style={[
                styles.mainPlayBtn,
                { backgroundColor: theme.accent },
                shadows.neon,
              ]}
            >
              <Text style={styles.mainPlayIcon}>{isPlaying ? '❚❚' : '▶'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => seek(10)}
              style={styles.seekCircleBtn}
            >
              <Text style={styles.seekCircleText}>10s ⏩</Text>
            </TouchableOpacity>
          </View>

          {/* 3. Bottom HUD Bar with Scrubber and Feature Toggles */}
          <View style={styles.bottomHud}>
            {/* Interactive Colored Scrubber */}
            <ScrubberTimeline
              currentTime={currentTime}
              duration={duration}
              intro={introInterval}
              outro={outroInterval}
              theme={theme}
              onSeek={seekTo}
            />

            <View style={styles.bottomButtonsRow}>
              {/* Left group: Replay Line, Quality, Aspect */}
              <View style={styles.bottomLeftGroup}>
                <TouchableOpacity
                  onPress={replayCurrentLine}
                  style={styles.bottomUtilBtn}
                >
                  <Text style={styles.bottomUtilBtnText}>🔄 Replay Line</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setActiveModal('quality')}
                  style={styles.bottomUtilBtn}
                >
                  <Text style={styles.bottomUtilBtnText}>⚙ {activeQuality}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowStatsForNerds(!showStatsForNerds)}
                  style={styles.bottomUtilBtn}
                >
                  <Text style={styles.bottomUtilBtnText}>📊 Stats</Text>
                </TouchableOpacity>
              </View>

              {/* Right group: Episode Drawer & Next Episode */}
              <View style={styles.bottomRightGroup}>
                <TouchableOpacity
                  onPress={() => setActiveModal('episodes')}
                  style={styles.bottomUtilBtn}
                >
                  <Text style={styles.bottomUtilBtnText}>☰ Episodes</Text>
                </TouchableOpacity>

                {onNextEpisode && (
                  <TouchableOpacity
                    onPress={onNextEpisode}
                    style={[
                      styles.nextEpChip,
                      { backgroundColor: theme.accentSecondary },
                    ]}
                  >
                    <Text style={styles.nextEpChipText}>Next Ep ⏭</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Modal 1: Dialogue Intelligence Modal */}
      <DialogueToolsModal
        visible={activeModal === 'dialogue'}
        dialogueItems={dialogueItems}
        currentTime={currentTime}
        theme={theme}
        targetLanguage={translationLanguage}
        onSelectTimestamp={seekTo}
        onChangeTranslationLanguage={(lang) => setTranslationLanguage(lang)}
        onClose={() => setActiveModal(null)}
      />

      {/* Modal 2: Server Routing & Health Picker */}
      <Modal
        visible={activeModal === 'servers'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.hudBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.accent }]}>
              🌐 Direct Streaming Servers
            </Text>
            <ScrollView style={styles.modalScroll}>
              {serverPool.map((srv) => (
                <TouchableOpacity
                  key={srv.id}
                  onPress={() => {
                    setActiveServer(srv);
                    setActiveModal(null);
                  }}
                  style={[
                    styles.serverOptionRow,
                    activeServer?.id === srv.id && {
                      borderColor: theme.accent,
                      backgroundColor: theme.buttonActiveBg,
                    },
                  ]}
                >
                  <View>
                    <Text style={styles.serverOptionName}>{srv.name}</Text>
                    <Text style={styles.serverOptionSub}>
                      {srv.provider} • {srv.type}
                    </Text>
                  </View>
                  <View style={styles.latencyBadge}>
                    <Text style={styles.latencyText}>
                      ⚡ {srv.latencyMs || 45}ms
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setActiveModal(null)}
              style={[styles.modalDoneBtn, { backgroundColor: theme.accent }]}
            >
              <Text style={styles.modalDoneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal 3: CinePlayer HUD Theme Selector */}
      <Modal
        visible={activeModal === 'themes'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.hudBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.accent }]}>
              🎨 CinePlayer HUD Themes
            </Text>
            <ScrollView style={styles.modalScroll}>
              {Object.values(CINE_THEMES).map((t) => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => {
                    setCurrentThemeId(t.id);
                    setActiveModal(null);
                  }}
                  style={[
                    styles.themeOptionRow,
                    currentThemeId === t.id && {
                      borderColor: t.accent,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  ]}
                >
                  <View style={styles.themeColorPreviews}>
                    <View
                      style={[styles.themeColorDot, { backgroundColor: t.accent }]}
                    />
                    <View
                      style={[
                        styles.themeColorDot,
                        { backgroundColor: t.accentSecondary },
                      ]}
                    />
                  </View>
                  <Text style={styles.themeNameText}>{t.name}</Text>
                  {currentThemeId === t.id && (
                    <Text style={[styles.checkText, { color: t.accent }]}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setActiveModal(null)}
              style={[styles.modalDoneBtn, { backgroundColor: theme.accent }]}
            >
              <Text style={styles.modalDoneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal 4: Episode Selector Drawer */}
      <Modal
        visible={activeModal === 'episodes'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.hudBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.accent }]}>
              Choose Episode
            </Text>
            <ScrollView style={styles.modalScroll}>
              {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => (
                <TouchableOpacity
                  key={ep}
                  onPress={() => {
                    setActiveModal(null);
                    if (onSelectEpisode) onSelectEpisode(ep);
                  }}
                  style={[
                    styles.modalListItem,
                    episodeNumber === ep && {
                      borderColor: theme.accent,
                      backgroundColor: theme.buttonActiveBg,
                    },
                  ]}
                >
                  <Text style={styles.modalListItemText}>Episode {ep}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setActiveModal(null)}
              style={[styles.modalDoneBtn, { backgroundColor: theme.accent }]}
            >
              <Text style={styles.modalDoneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal 5: Quality Selector */}
      <Modal
        visible={activeModal === 'quality'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.hudBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.accent }]}>
              Video Quality
            </Text>
            <ScrollView style={styles.modalScroll}>
              {['auto', '1080p', '720p', '480p', '360p'].map((q) => (
                <TouchableOpacity
                  key={q}
                  onPress={() => {
                    setActiveQuality(q);
                    setActiveModal(null);
                  }}
                  style={[
                    styles.modalListItem,
                    activeQuality === q && {
                      borderColor: theme.accent,
                      backgroundColor: theme.buttonActiveBg,
                    },
                  ]}
                >
                  <Text style={styles.modalListItemText}>
                    {q.toUpperCase()} {q === 'auto' ? '(Adaptive HLS)' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setActiveModal(null)}
              style={[styles.modalDoneBtn, { backgroundColor: theme.accent }]}
            >
              <Text style={styles.modalDoneBtnText}>Done</Text>
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
  loaderBox: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 18,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  loaderText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
  },
  failoverToast: {
    position: 'absolute',
    top: 75,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    zIndex: 999,
  },
  failoverToastText: {
    fontSize: 12,
    fontWeight: '700',
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
    textShadowColor: 'rgba(0, 0, 0, 0.95)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  aniSkipBtn: {
    position: 'absolute',
    bottom: 90,
    right: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  aniSkipText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  hudOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 16,
  },
  topHud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 24 : 8,
  },
  closeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.md,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  animeHeaderInfo: {
    flex: 1,
    marginHorizontal: 10,
  },
  animeHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  animeHeaderSub: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    marginTop: 1,
  },
  topActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hudChipBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    marginLeft: 6,
  },
  hudChipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  centerHud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seekCircleBtn: {
    padding: 14,
    marginHorizontal: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: borderRadius.full,
  },
  seekCircleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  mainPlayBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainPlayIcon: {
    color: '#FFFFFF',
    fontSize: 26,
    marginLeft: 3,
  },
  bottomHud: {
    width: '100%',
    paddingBottom: Platform.OS === 'android' ? 14 : 6,
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  bottomLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomUtilBtn: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: borderRadius.sm,
    marginRight: 6,
  },
  bottomUtilBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  nextEpChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    marginLeft: 6,
  },
  nextEpChipText: {
    color: '#0B0D13',
    fontSize: 12,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    padding: 20,
    maxHeight: '60%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 14,
  },
  modalScroll: {
    marginBottom: 14,
  },
  serverOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  serverOptionName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  serverOptionSub: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 11,
    marginTop: 2,
  },
  latencyBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  latencyText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  themeOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  themeColorPreviews: {
    flexDirection: 'row',
    marginRight: 12,
  },
  themeColorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 4,
  },
  themeNameText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  checkText: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalListItem: {
    padding: 13,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalListItemText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalDoneBtn: {
    paddingVertical: 12,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  modalDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
