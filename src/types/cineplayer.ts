import { VideoSource, SubtitleTrack } from './anime';

export type CineThemeId = 'cyberpunk' | 'oled' | 'crimson' | 'midnight' | 'emerald';
export type AudioMode = 'sub' | 'dub';
export type AspectRatioMode = 'contain' | 'cover' | 'fill' | '16:9' | '21:9' | '4:3';

export interface CineTheme {
  id: CineThemeId;
  name: string;
  accent: string;
  accentSecondary: string;
  glow: string;
  hudBackground: string;
  hudBorder: string;
  progressBarTrack: string;
  progressBarFill: string;
  buttonActiveBg: string;
  buttonText: string;
}

export interface StreamingServer {
  id: string;
  name: string;
  provider: string;
  type: 'HLS' | 'MP4' | 'EMBED';
  qualityOptions: string[];
  latencyMs?: number;
  isHealthy: boolean;
  priority: number;
  sources: VideoSource[];
  subtitles: SubtitleTrack[];
  audioMode: AudioMode;
  headers?: Record<string, string>;
}

export interface StatsForNerdsData {
  resolution: string;
  bitrateKbps: number;
  fps: number;
  bufferHealthSeconds: number;
  droppedFrames: number;
  audioCodec: string;
  serverPingMs: number;
  activeServer: string;
  audioMode: AudioMode;
  hlsLevel: number | string;
}

export interface DialogueItem {
  id: number;
  start: number; // in seconds
  end: number;
  text: string;
  translatedText?: string;
  speaker?: string;
}

export interface SleepTimerConfig {
  active: boolean;
  minutesRemaining: number; // 0 when disabled
  mode: 'minutes' | 'end_of_episode' | 'off';
}
