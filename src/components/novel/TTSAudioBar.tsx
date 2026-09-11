import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors, borderRadius } from '../../theme';

interface TTSAudioBarProps {
  textToSpeak: string;
  chapterTitle: string;
  onClose: () => void;
}

export const TTSAudioBar: React.FC<TTSAudioBarProps> = ({
  textToSpeak,
  chapterTitle,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);

  useEffect(() => {
    return () => {
      if (Platform.OS === 'web' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleSpeech = () => {
    if (Platform.OS === 'web' && 'speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
      } else {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        } else {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.rate = speechRate;
          utterance.onend = () => setIsPlaying(false);
          utterance.onerror = () => setIsPlaying(false);
          window.speechSynthesis.speak(utterance);
        }
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const cycleRate = () => {
    const rates = [0.75, 1.0, 1.25, 1.5, 2.0];
    const nextIdx = (rates.indexOf(speechRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setSpeechRate(nextRate);
    if (isPlaying && Platform.OS === 'web' && 'speechSynthesis' in window) {
      toggleSpeech(); // restart with new rate
      setTimeout(toggleSpeech, 200);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftGroup}>
        <Text style={styles.headphoneIcon}>🎧</Text>
        <View style={styles.infoCol}>
          <Text numberOfLines={1} style={styles.titleText}>
            TTS Audio Narrator
          </Text>
          <Text numberOfLines={1} style={styles.subText}>
            {chapterTitle}
          </Text>
        </View>
      </View>

      <View style={styles.controlsGroup}>
        <TouchableOpacity onPress={cycleRate} style={styles.rateBtn}>
          <Text style={styles.rateText}>{speechRate}x</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleSpeech} style={styles.playBtn}>
          <Text style={styles.playIcon}>{isPlaying ? '❚❚' : '▶'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(18, 21, 31, 0.96)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headphoneIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  infoCol: {
    flex: 1,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  subText: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  controlsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rateBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginRight: 8,
  },
  rateText: {
    color: '#67E8F9',
    fontSize: 11,
    fontWeight: '700',
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 2,
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
});
