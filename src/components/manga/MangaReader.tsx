import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Platform,
} from 'react-native';
import { MangaItem, MangaChapter, MangaPage, MangaReaderMode } from '../../types/manga';
import { useReadingProgress } from '../../context/ReadingProgressContext';
import { colors, borderRadius, shadows } from '../../theme';

interface MangaReaderProps {
  manga: MangaItem;
  chapter: MangaChapter;
  pages: MangaPage[];
  initialPage?: number;
  onClose: () => void;
  onNextChapter?: () => void;
  onPreviousChapter?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const MangaReader: React.FC<MangaReaderProps> = ({
  manga,
  chapter,
  pages,
  initialPage = 1,
  onClose,
  onNextChapter,
  onPreviousChapter,
}) => {
  const { updateMangaProgress, mangaProgress } = useReadingProgress();

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [readerMode, setReaderMode] = useState<MangaReaderMode>('webtoon');
  const [mangaTheme, setMangaTheme] = useState<'oled' | 'dark' | 'sepia'>('oled');
  const [showHUD, setShowHUD] = useState(true);

  const flatListRef = useRef<FlatList | null>(null);

  const themeBgs = {
    oled: '#000000',
    dark: '#0B0D13',
    sepia: '#FBF0D9',
  };

  // Resume saved page
  useEffect(() => {
    const saved = mangaProgress[manga.id];
    if (saved && saved.currentChapterId === chapter.id && saved.currentPageNumber > 0) {
      setCurrentPage(saved.currentPageNumber);
    }
  }, [manga.id, chapter.id]);

  // Update Reading Progress
  const handlePageChange = (pageNum: number) => {
    setCurrentPage(pageNum);
    updateMangaProgress(manga, chapter.id, chapter.chapter, pageNum, pages.length);
  };

  const toggleHUD = () => {
    setShowHUD(!showHUD);
  };

  const nextPage = () => {
    if (currentPage < pages.length) {
      const next = currentPage + 1;
      handlePageChange(next);
      if (flatListRef.current && readerMode !== 'webtoon') {
        flatListRef.current.scrollToIndex({ index: next - 1, animated: true });
      }
    } else if (onNextChapter) {
      onNextChapter();
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      const prev = currentPage - 1;
      handlePageChange(prev);
      if (flatListRef.current && readerMode !== 'webtoon') {
        flatListRef.current.scrollToIndex({ index: prev - 1, animated: true });
      }
    } else if (onPreviousChapter) {
      onPreviousChapter();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeBgs[mangaTheme] }]}>
      {/* 1. Main Reading Canvas */}
      {readerMode === 'webtoon' ? (
        // Webtoon Long Strip Mode (Continuous Vertical Scroll)
        <ScrollView
          style={[styles.webtoonScroll, { backgroundColor: themeBgs[mangaTheme] }]}
          contentContainerStyle={styles.webtoonContent}
          onScroll={(e) => {
            const offsetY = e.nativeEvent.contentOffset.y;
            const approxPage = Math.min(
              pages.length,
              Math.max(1, Math.floor(offsetY / (screenHeight * 0.8)) + 1)
            );
            if (approxPage !== currentPage) {
              handlePageChange(approxPage);
            }
          }}
          scrollEventThrottle={16}
        >
          {pages.map((page) => (
            <TouchableOpacity
              key={page.pageNumber}
              activeOpacity={1}
              onPress={toggleHUD}
              style={styles.webtoonPageWrapper}
            >
              <Image
                source={{ uri: page.imageUrl }}
                style={styles.webtoonImage}
                resizeMode="contain"
              />
              <Text style={styles.webtoonPageNumber}>
                Page {page.pageNumber} / {pages.length}
              </Text>
            </TouchableOpacity>
          ))}

          {/* End of Chapter Action */}
          <View style={styles.chapterEndCard}>
            <Text style={styles.chapterEndTitle}>End of Chapter {chapter.chapter}</Text>
            {onNextChapter && (
              <TouchableOpacity
                onPress={onNextChapter}
                style={[styles.nextChapterBtn, shadows.neon]}
              >
                <Text style={styles.nextChapterBtnText}>Read Next Chapter ⏭</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      ) : (
        // Paged Mode (RTL Japanese or LTR Western)
        <FlatList
          ref={flatListRef}
          horizontal
          pagingEnabled
          inverted={readerMode === 'rtl'}
          data={pages}
          keyExtractor={(item) => item.pageNumber.toString()}
          initialScrollIndex={Math.max(0, currentPage - 1)}
          getItemLayout={(_data, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
            handlePageChange(index + 1);
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={1}
              onPress={toggleHUD}
              style={[styles.pagedWrapper, { backgroundColor: themeBgs[mangaTheme] }]}
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.pagedImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        />
      )}

      {/* 2. Reading HUD Overlay */}
      {showHUD && (
        <View style={styles.hudOverlay}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn}>
              <Text style={styles.backBtnText}>‹ Back</Text>
            </TouchableOpacity>

            <View style={styles.titleInfo}>
              <Text numberOfLines={1} style={styles.mangaTitle}>
                {manga.title}
              </Text>
              <Text style={styles.chapterTitle}>
                Chapter {chapter.chapter} • Page {currentPage}/{pages.length}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 6 }}>
              {/* Theme Toggle Button */}
              <TouchableOpacity
                onPress={() => {
                  const themes: Array<'oled' | 'dark' | 'sepia'> = ['oled', 'dark', 'sepia'];
                  const nextIdx = (themes.indexOf(mangaTheme) + 1) % themes.length;
                  setMangaTheme(themes[nextIdx]);
                }}
                style={styles.themeToggleBtn}
              >
                <Text style={styles.themeToggleText}>
                  {mangaTheme === 'oled' ? '🌑' : mangaTheme === 'dark' ? '🌌' : '📜'}
                </Text>
              </TouchableOpacity>

              {/* Mode Switcher Button */}
              <TouchableOpacity
                onPress={() => {
                  const modes: MangaReaderMode[] = ['webtoon', 'rtl', 'ltr'];
                  const nextIdx = (modes.indexOf(readerMode) + 1) % modes.length;
                  setReaderMode(modes[nextIdx]);
                }}
                style={styles.modeToggleBtn}
              >
                <Text style={styles.modeToggleText}>
                  {readerMode === 'webtoon'
                    ? '📜 Strip'
                    : readerMode === 'rtl'
                    ? '📖 RTL'
                    : '📘 LTR'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Bar Controls */}
          <View style={styles.bottomBar}>
            <View style={styles.navButtonsRow}>
              {onPreviousChapter && (
                <TouchableOpacity
                  onPress={onPreviousChapter}
                  style={styles.navBtn}
                >
                  <Text style={styles.navBtnText}>⏮ Prev Ch</Text>
                </TouchableOpacity>
              )}

              <View style={styles.pageIndicatorBox}>
                <Text style={styles.pageIndicatorText}>
                  {currentPage} / {pages.length}
                </Text>
              </View>

              {onNextChapter && (
                <TouchableOpacity onPress={onNextChapter} style={styles.navBtn}>
                  <Text style={styles.navBtnText}>Next Ch ⏭</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  webtoonScroll: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webtoonContent: {
    paddingBottom: 40,
  },
  webtoonPageWrapper: {
    width: screenWidth,
    alignItems: 'center',
    marginBottom: 2,
    position: 'relative',
  },
  webtoonImage: {
    width: screenWidth,
    height: screenHeight * 0.95,
  },
  webtoonPageNumber: {
    position: 'absolute',
    bottom: 6,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    color: '#A1A1AA',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  pagedWrapper: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  pagedImage: {
    width: screenWidth,
    height: screenHeight,
  },
  chapterEndCard: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chapterEndTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  nextChapterBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: borderRadius.xl,
  },
  nextChapterBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  hudOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 24 : 8,
    backgroundColor: 'rgba(11, 13, 19, 0.92)',
    padding: 12,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  titleInfo: {
    flex: 1,
    marginHorizontal: 10,
  },
  mangaTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  chapterTitle: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  themeToggleBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  themeToggleText: {
    fontSize: 12,
  },
  modeToggleBtn: {
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  modeToggleText: {
    color: '#D8B4FE',
    fontSize: 11,
    fontWeight: '700',
  },
  bottomBar: {
    backgroundColor: 'rgba(11, 13, 19, 0.92)',
    padding: 12,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: Platform.OS === 'android' ? 16 : 8,
  },
  navButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  navBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  pageIndicatorBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pageIndicatorText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
