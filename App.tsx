import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { WatchProgressProvider } from './src/context/WatchProgressContext';
import { DownloadProvider } from './src/context/DownloadContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { ReadingProgressProvider } from './src/context/ReadingProgressContext';
import { CommunityProvider } from './src/context/CommunityContext';
import { GamificationProvider } from './src/context/GamificationContext';
import { LevelUpModal } from './src/components/gamification/LevelUpModal';

import { HomeScreen } from './src/screens/HomeScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { WatchlistScreen } from './src/screens/WatchlistScreen';
import { DownloadsScreen } from './src/screens/DownloadsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { DetailsScreen } from './src/screens/DetailsScreen';
import { WatchScreen } from './src/screens/WatchScreen';
import { CommunityScreen } from './src/screens/CommunityScreen';

import { MangaScreen } from './src/screens/MangaScreen';
import { MangaDetailsScreen } from './src/screens/MangaDetailsScreen';
import { MangaReader } from './src/components/manga/MangaReader';
import { resolveMangaChapterPages } from './src/api/manga/mangaResolver';

import { NovelScreen } from './src/screens/NovelScreen';
import { NovelDetailsScreen } from './src/screens/NovelDetailsScreen';
import { NovelReader } from './src/components/novel/NovelReader';

import { BottomTabs, TabScreen } from './src/components/common/BottomTabs';
import { UnifiedAnime } from './src/types/anime';
import { MangaItem, MangaChapter, MangaPage } from './src/types/manga';
import { NovelItem, NovelChapter } from './src/types/novel';
import { colors } from './src/theme';

function MainApp() {
  const [activeTab, setActiveTab] = useState<TabScreen>('home');

  // Anime Navigation State
  const [selectedAnimeId, setSelectedAnimeId] = useState<number | null>(null);
  const [watchSession, setWatchSession] = useState<{
    anime: UnifiedAnime;
    episodeNumber: number;
  } | null>(null);

  // Manga Navigation State
  const [selectedMangaId, setSelectedMangaId] = useState<string | null>(null);
  const [mangaSession, setMangaSession] = useState<{
    manga: MangaItem;
    chapter: MangaChapter;
    pages: MangaPage[];
  } | null>(null);

  // Novel Navigation State
  const [selectedNovelId, setSelectedNovelId] = useState<string | null>(null);
  const [novelSession, setNovelSession] = useState<{
    novel: NovelItem;
    chapter: NovelChapter;
    text: string;
  } | null>(null);

  const isFullscreenReaderActive = !!watchSession || !!mangaSession || !!novelSession;

  const handleStartMangaRead = async (manga: MangaItem, chapter: MangaChapter) => {
    const pages = await resolveMangaChapterPages(chapter.id);
    setMangaSession({ manga, chapter, pages });
  };

  const handleStartNovelRead = (novel: NovelItem, chapter: NovelChapter, text: string) => {
    setNovelSession({ novel, chapter, text });
  };

  const handleSelectAnime = (id: number) => {
    setSelectedMangaId(null);
    setSelectedNovelId(null);
    setSelectedAnimeId(id);
  };

  const handleSelectManga = (id: string) => {
    setSelectedAnimeId(null);
    setSelectedNovelId(null);
    setSelectedMangaId(id);
  };

  const handleSelectNovel = (id: string) => {
    setSelectedAnimeId(null);
    setSelectedMangaId(null);
    setSelectedNovelId(id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Main Tab Screen Content */}
      <View style={styles.content}>
        {activeTab === 'home' && (
          <HomeScreen
            onSelectAnime={handleSelectAnime}
            onSelectManga={handleSelectManga}
            onSelectNovel={handleSelectNovel}
            onQuickWatch={(anime, ep) => setWatchSession({ anime, episodeNumber: ep })}
          />
        )}
        {activeTab === 'manga' && (
          <MangaScreen onSelectManga={handleSelectManga} />
        )}
        {activeTab === 'novels' && (
          <NovelScreen onSelectNovel={handleSelectNovel} />
        )}
        {activeTab === 'community' && (
          <CommunityScreen
            onSelectAnime={(id: string) => handleSelectAnime(parseInt(id, 10) || 151807)}
            onSelectManga={handleSelectManga}
            onSelectNovel={handleSelectNovel}
          />
        )}
        {activeTab === 'search' && (
          <SearchScreen
            onSelectAnime={handleSelectAnime}
            onSelectManga={handleSelectManga}
            onSelectNovel={handleSelectNovel}
          />
        )}
        {activeTab === 'watchlist' && (
          <WatchlistScreen
            onSelectAnime={handleSelectAnime}
            onSelectManga={handleSelectManga}
            onSelectNovel={handleSelectNovel}
          />
        )}
        {activeTab === 'downloads' && (
          <DownloadsScreen
            onPlayOfflineEpisode={(item) => {
              const mockAnime: UnifiedAnime = {
                id: item.animeId,
                title: { english: item.animeTitle, userPreferred: item.animeTitle },
                description: 'Offline downloaded episode playback.',
                coverImage: { large: item.animeCover },
                format: 'TV',
                status: 'FINISHED',
                genres: ['Action'],
                studios: [],
              };
              setWatchSession({ anime: mockAnime, episodeNumber: item.episodeNumber });
            }}
          />
        )}
        {activeTab === 'profile' && <ProfileScreen />}
      </View>

      {/* Persistent Bottom Tab Bar */}
      {!isFullscreenReaderActive && (
        <BottomTabs
          activeTab={activeTab}
          onTabChange={(tab) => {
            setSelectedAnimeId(null);
            setSelectedMangaId(null);
            setSelectedNovelId(null);
            setActiveTab(tab);
          }}
        />
      )}

      {/* Anime Details Screen Overlay */}
      {selectedAnimeId !== null && !watchSession && (
        <View style={StyleSheet.absoluteFill}>
          <DetailsScreen
            animeId={selectedAnimeId}
            onBack={() => setSelectedAnimeId(null)}
            onPlayEpisode={(anime, ep) => setWatchSession({ anime, episodeNumber: ep })}
            onSelectRelatedAnime={handleSelectAnime}
            onSelectManga={handleSelectManga}
            onSelectNovel={handleSelectNovel}
          />
        </View>
      )}

      {/* Manga Details Screen Overlay */}
      {selectedMangaId !== null && !mangaSession && (
        <View style={StyleSheet.absoluteFill}>
          <MangaDetailsScreen
            mangaId={selectedMangaId}
            onBack={() => setSelectedMangaId(null)}
            onReadChapter={handleStartMangaRead}
            onSelectAnime={handleSelectAnime}
            onSelectNovel={handleSelectNovel}
          />
        </View>
      )}

      {/* Novel Details Screen Overlay */}
      {selectedNovelId !== null && !novelSession && (
        <View style={StyleSheet.absoluteFill}>
          <NovelDetailsScreen
            novelId={selectedNovelId}
            onBack={() => setSelectedNovelId(null)}
            onReadChapter={handleStartNovelRead}
            onSelectAnime={handleSelectAnime}
            onSelectManga={handleSelectManga}
          />
        </View>
      )}

      {/* CinePlayer Video Player */}
      {watchSession && (
        <View style={StyleSheet.absoluteFill}>
          <WatchScreen
            anime={watchSession.anime}
            initialEpisode={watchSession.episodeNumber}
            onClose={() => setWatchSession(null)}
          />
        </View>
      )}

      {/* Manga Reader Overlay */}
      {mangaSession && (
        <View style={StyleSheet.absoluteFill}>
          <MangaReader
            manga={mangaSession.manga}
            chapter={mangaSession.chapter}
            pages={mangaSession.pages}
            onClose={() => setMangaSession(null)}
          />
        </View>
      )}

      {/* Novel Reader Overlay */}
      {novelSession && (
        <View style={StyleSheet.absoluteFill}>
          <NovelReader
            novel={novelSession.novel}
            chapter={novelSession.chapter}
            chapterText={novelSession.text}
            onClose={() => setNovelSession(null)}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <WatchProgressProvider>
          <ReadingProgressProvider>
            <GamificationProvider>
              <CommunityProvider>
                <DownloadProvider>
                  <SettingsProvider>
                    <MainApp />
                    <LevelUpModal />
                  </SettingsProvider>
                </DownloadProvider>
              </CommunityProvider>
            </GamificationProvider>
          </ReadingProgressProvider>
        </WatchProgressProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});
