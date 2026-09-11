import axios from 'axios';

const KITSU_BASE_URL = 'https://kitsu.io/api/edge';

export interface KitsuAnimeData {
  id: string;
  synopsis?: string;
  titles?: {
    en?: string;
    en_jp?: string;
    ja_jp?: string;
  };
  episodeCount?: number;
  episodeLength?: number;
  ageRating?: string;
  ageRatingGuide?: string;
  posterImage?: string;
  coverImage?: string;
  averageRating?: string;
}

export async function fetchKitsuByTitle(title: string): Promise<KitsuAnimeData | null> {
  try {
    const encodedTitle = encodeURIComponent(title.trim());
    const response = await axios.get(`${KITSU_BASE_URL}/anime?filter[text]=${encodedTitle}&page[limit]=1`, {
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
      timeout: 8000,
    });

    const item = response.data?.data?.[0];
    if (!item) return null;

    const attr = item.attributes || {};
    return {
      id: item.id,
      synopsis: attr.synopsis,
      titles: {
        en: attr.titles?.en,
        en_jp: attr.titles?.en_jp,
        ja_jp: attr.titles?.ja_jp,
      },
      episodeCount: attr.episodeCount,
      episodeLength: attr.episodeLength,
      ageRating: attr.ageRating,
      ageRatingGuide: attr.ageRatingGuide,
      posterImage: attr.posterImage?.large || attr.posterImage?.medium,
      coverImage: attr.coverImage?.large || attr.coverImage?.original,
      averageRating: attr.averageRating,
    };
  } catch (error) {
    console.warn('[Kitsu] Failed to fetch metadata for:', title, error);
    return null;
  }
}
