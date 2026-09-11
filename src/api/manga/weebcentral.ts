import axios from 'axios';
import { MangaItem, MangaVolume, MangaChapter } from '../../types/manga';

const CONSUMET_MANGA_URL = 'https://anime-api-phi.vercel.app/manga/mangakakalot';

export async function searchWeebCentral(query: string): Promise<MangaItem[]> {
  try {
    const res = await axios.get(`${CONSUMET_MANGA_URL}/${encodeURIComponent(query)}`, {
      timeout: 7000,
    });
    const results = res.data?.results || [];

    return results.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description || 'WeebCentral curated manga stream.',
      coverUrl: item.image || item.cover,
      status: item.status === 'Completed' ? 'COMPLETED' : 'ONGOING',
      rating: 8.5,
      genres: item.genres || ['Action', 'Fantasy'],
      tags: [],
      source: 'WeebCentral' as const,
    }));
  } catch (error) {
    console.warn('[WeebCentral] Scraper fallback triggered for:', query);
    return [];
  }
}
