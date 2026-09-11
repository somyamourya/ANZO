import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { UnifiedAnime } from '../types/anime';
import { CinePlayer } from '../components/player/CinePlayer';
import { colors } from '../theme';

interface WatchScreenProps {
  anime: UnifiedAnime;
  initialEpisode?: number;
  onClose: () => void;
}

export const WatchScreen: React.FC<WatchScreenProps> = ({
  anime,
  initialEpisode = 1,
  onClose,
}) => {
  const [episodeNumber, setEpisodeNumber] = useState(initialEpisode);

  const handleNextEpisode = () => {
    const total = anime.episodes || 24;
    if (episodeNumber < total) {
      setEpisodeNumber((prev) => prev + 1);
    }
  };

  const handlePreviousEpisode = () => {
    if (episodeNumber > 1) {
      setEpisodeNumber((prev) => prev - 1);
    }
  };

  return (
    <View style={styles.container}>
      <CinePlayer
        anime={anime}
        episodeNumber={episodeNumber}
        totalEpisodes={anime.episodes || 24}
        onClose={onClose}
        onNextEpisode={handleNextEpisode}
        onPreviousEpisode={handlePreviousEpisode}
        onSelectEpisode={(ep) => setEpisodeNumber(ep)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
  },
  loadingSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
});
