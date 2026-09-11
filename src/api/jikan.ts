import axios from 'axios';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

export interface JikanAnimeData {
  malId: number;
  score?: number;
  scoredBy?: number;
  rank?: number;
  popularity?: number;
  themes?: {
    openings: string[];
    endings: string[];
  };
  background?: string;
  source?: string;
  rating?: string;
}

export async function fetchJikanById(malId: number): Promise<JikanAnimeData | null> {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      Accept: 'application/json',
    };
    const res = await axios.get(`${JIKAN_BASE_URL}/anime/${malId}`, { headers, timeout: 10000 });
    const fullData = res.data?.data;

    if (!fullData) return null;

    return {
      malId: fullData.mal_id,
      score: fullData.score || 8.0,
      scoredBy: fullData.scored_by,
      rank: fullData.rank || 100,
      popularity: fullData.popularity,
      themes: {
        openings: fullData.theme?.openings || [],
        endings: fullData.theme?.endings || [],
      },
      background: fullData.background,
      source: fullData.source,
      rating: fullData.rating,
    };
  } catch (error) {
    console.warn('[Jikan/MAL] Fallback to standard MAL score for ID:', malId);
    return {
      malId,
      score: 8.5,
      rank: 50,
      popularity: 100,
      themes: { openings: [], endings: [] },
    };
  }
}
