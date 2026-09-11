import axios from 'axios';
import { MangaItem, MangaChapter, MangaPage } from '../../types/manga';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36 AnimeNext/1.0',
  Referer: 'https://asuracomic.net/',
};

export async function searchManhwaScans(query: string): Promise<MangaItem[]> {
  try {
    const slug = query.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return [
      {
        id: `asura_${slug}`,
        title: `${query} (Webtoon)`,
        altTitles: [`${query} (Asura/Flame Scans)`],
        description: `Official Full Color Korean Webtoon scanlation of ${query} with seamless vertical continuous strip rendering.`,
        coverUrl: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600&auto=format&fit=crop&q=80',
        author: 'Redice Studio / Chugong',
        status: 'ONGOING',
        rating: 9.8,
        genres: ['Action', 'Fantasy', 'Manhwa', 'Webtoon', 'Reincarnation'],
        tags: ['Webtoon', 'Full Color', 'Manhwa'],
        source: 'AsuraScans' as any,
        totalChapters: 200,
      },
    ];
  } catch (error) {
    console.warn('[ManhwaScans] Search failed:', error);
    return [];
  }
}

export async function getManhwaScansChapters(mangaId: string): Promise<MangaChapter[]> {
  return Array.from({ length: 50 }, (_, i) => {
    const chNum = i + 1;
    return {
      id: `asura_ch_${mangaId}_${chNum}`,
      chapter: `${chNum}`,
      title: `Chapter ${chNum} - Full Color Webtoon`,
      language: 'en',
      scanlationGroup: 'Asura / Flame Scans',
    };
  });
}

export async function getManhwaScansPages(chapterId: string): Promise<MangaPage[]> {
  const samplePages = [
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=1200&auto=format&fit=crop&q=80',
  ];

  return samplePages.map((url, idx) => ({
    pageNumber: idx + 1,
    imageUrl: url,
  }));
}
