import axios from 'axios';
import { UnifiedAnime, AnimeSeason, AnimeFormat, AnimeStatus } from '../types/anime';

const ANILIST_GRAPHQL_URL = 'https://graphql.anilist.co';

const animeMediaFields = `
  id
  idMal
  title {
    romaji
    english
    native
    userPreferred
  }
  description(asHtml: false)
  coverImage {
    extraLarge
    large
    medium
    color
  }
  bannerImage
  format
  status
  episodes
  duration
  season
  seasonYear
  averageScore
  popularity
  genres
  synonyms
  studios(isMain: true) {
    nodes {
      name
    }
  }
  nextAiringEpisode {
    airingAt
    timeUntilAiring
    episode
  }
  trailer {
    id
    site
    thumbnail
  }
`;

const detailedAnimeMediaFields = `
  ${animeMediaFields}
  characters(sort: ROLE, perPage: 12) {
    edges {
      role
      node {
        id
        name {
          full
          native
        }
        image {
          large
          medium
        }
      }
      voiceActors(language: JAPANESE, sort: RELEVANCE) {
        id
        name {
          full
        }
        languageV2
        image {
          medium
        }
      }
    }
  }
  relations {
    edges {
      relationType
      node {
        id
        title {
          romaji
          english
          userPreferred
        }
        format
        type
        status
        coverImage {
          medium
          large
        }
      }
    }
  }
  recommendations(perPage: 10, sort: RATING_DESC) {
    nodes {
      mediaRecommendation {
        ${animeMediaFields}
      }
    }
  }
`;

function mapAniListMedia(media: any): UnifiedAnime {
  const characters = media.characters?.edges?.map((edge: any) => ({
    id: edge.node.id,
    name: {
      full: edge.node.name.full,
      native: edge.node.name.native,
    },
    image: edge.node.image,
    role: edge.role,
    voiceActor: edge.voiceActors?.[0]
      ? {
          name: edge.voiceActors[0].name.full,
          language: edge.voiceActors[0].languageV2,
          image: edge.voiceActors[0].image?.medium,
        }
      : undefined,
  })) || [];

  const relations = media.relations?.edges?.map((edge: any) => ({
    id: edge.node.id,
    title: edge.node.title,
    format: edge.node.format,
    type: edge.node.type,
    status: edge.node.status,
    coverImage: edge.node.coverImage,
    relationType: edge.relationType,
  })) || [];

  const recommendations = media.recommendations?.nodes
    ?.filter((node: any) => node.mediaRecommendation)
    ?.map((node: any) => mapAniListMedia(node.mediaRecommendation)) || [];

  return {
    id: media.id,
    malId: media.idMal,
    title: media.title,
    description: media.description || 'No description available.',
    coverImage: media.coverImage || {},
    bannerImage: media.bannerImage || media.coverImage?.extraLarge,
    format: media.format,
    status: media.status,
    episodes: media.episodes,
    duration: media.duration,
    season: media.season,
    seasonYear: media.seasonYear,
    averageScore: media.averageScore,
    popularity: media.popularity,
    genres: media.genres || [],
    studios: media.studios?.nodes?.map((s: any) => s.name) || [],
    nextAiringEpisode: media.nextAiringEpisode,
    characters: characters.length > 0 ? characters : undefined,
    relations: relations.length > 0 ? relations : undefined,
    recommendations: recommendations.length > 0 ? recommendations : undefined,
    trailer: media.trailer,
    synonyms: media.synonyms,
  };
}

export async function fetchAniListGraphQL(query: string, variables: Record<string, any> = {}) {
  const response = await axios.post(
    ANILIST_GRAPHQL_URL,
    { query, variables },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        Referer: 'https://anilist.co/',
        Origin: 'https://anilist.co',
      },
      timeout: 12000,
    }
  );
  return response.data?.data;
}

export async function getTrendingAnime(page = 1, perPage = 20): Promise<UnifiedAnime[]> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(sort: TRENDING_DESC, type: ANIME, isAdult: false) {
          ${animeMediaFields}
        }
      }
    }
  `;
  const data = await fetchAniListGraphQL(query, { page, perPage });
  return (data?.Page?.media || []).map(mapAniListMedia);
}

export async function getPopularSeasonAnime(
  season: AnimeSeason,
  year: number,
  page = 1,
  perPage = 20
): Promise<UnifiedAnime[]> {
  const query = `
    query ($page: Int, $perPage: Int, $season: MediaSeason, $year: Int) {
      Page(page: $page, perPage: $perPage) {
        media(season: $season, seasonYear: $year, sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
          ${animeMediaFields}
        }
      }
    }
  `;
  const data = await fetchAniListGraphQL(query, { page, perPage, season, year });
  return (data?.Page?.media || []).map(mapAniListMedia);
}

export async function getTopRatedAnime(page = 1, perPage = 20): Promise<UnifiedAnime[]> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(sort: SCORE_DESC, type: ANIME, isAdult: false) {
          ${animeMediaFields}
        }
      }
    }
  `;
  const data = await fetchAniListGraphQL(query, { page, perPage });
  return (data?.Page?.media || []).map(mapAniListMedia);
}

export async function getAiringSchedule(start: number, end: number): Promise<any[]> {
  const query = `
    query ($start: Int, $end: Int) {
      Page(page: 1, perPage: 50) {
        airingSchedules(airingAt_greater: $start, airingAt_lesser: $end, sort: TIME) {
          id
          airingAt
          timeUntilAiring
          episode
          media {
            ${animeMediaFields}
          }
        }
      }
    }
  `;
  const data = await fetchAniListGraphQL(query, { start, end });
  return (data?.Page?.airingSchedules || []).map((item: any) => ({
    id: item.id,
    airingAt: item.airingAt,
    timeUntilAiring: item.timeUntilAiring,
    episode: item.episode,
    anime: mapAniListMedia(item.media),
  }));
}

export async function searchAnime(params: {
  search?: string;
  genre?: string;
  season?: AnimeSeason;
  seasonYear?: number;
  format?: AnimeFormat;
  status?: AnimeStatus;
  sort?: string[];
  page?: number;
  perPage?: number;
}): Promise<{ animeList: UnifiedAnime[]; hasNextPage: boolean }> {
  const query = `
    query (
      $page: Int,
      $perPage: Int,
      $search: String,
      $genre: String,
      $season: MediaSeason,
      $seasonYear: Int,
      $format: MediaFormat,
      $status: MediaStatus,
      $sort: [MediaSort]
    ) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
          currentPage
        }
        media(
          search: $search,
          genre: $genre,
          season: $season,
          seasonYear: $seasonYear,
          format: $format,
          status: $status,
          sort: $sort,
          type: ANIME,
          isAdult: false
        ) {
          ${animeMediaFields}
        }
      }
    }
  `;

  const variables = {
    page: params.page || 1,
    perPage: params.perPage || 20,
    search: params.search || undefined,
    genre: params.genre || undefined,
    season: params.season || undefined,
    seasonYear: params.seasonYear || undefined,
    format: params.format || undefined,
    status: params.status || undefined,
    sort: params.sort || ['POPULARITY_DESC'],
  };

  const data = await fetchAniListGraphQL(query, variables);
  return {
    animeList: (data?.Page?.media || []).map(mapAniListMedia),
    hasNextPage: !!data?.Page?.pageInfo?.hasNextPage,
  };
}

export async function getAnimeDetailsById(id: number): Promise<UnifiedAnime | null> {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${detailedAnimeMediaFields}
      }
    }
  `;
  const data = await fetchAniListGraphQL(query, { id });
  if (!data?.Media) return null;
  return mapAniListMedia(data.Media);
}
