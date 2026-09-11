import { MediaType, ConnectedMediaNode, CrossMediaBundle } from '../types/crossMedia';

interface FranchiseEntry {
  key: string;
  franchiseTitle: string;
  anime?: {
    id: number;
    title: string;
    coverUrl: string;
    status: string;
    rating: number;
  };
  manga?: {
    id: string;
    title: string;
    coverUrl: string;
    status: string;
    rating: number;
  };
  novel?: {
    id: string;
    title: string;
    coverUrl: string;
    status: string;
    rating: number;
  };
}

const FRANCHISE_INDEX: FranchiseEntry[] = [
  {
    key: 'solo_leveling',
    franchiseTitle: 'Solo Leveling (Only I Level Up)',
    anime: {
      id: 151807,
      title: 'Solo Leveling (Ore dake Level Up na Ken)',
      coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      status: 'RELEASING',
      rating: 8.8,
    },
    manga: {
      id: 'solo_leveling_manga',
      title: 'Solo Leveling (Na Honjaman Level-Up)',
      coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      status: 'COMPLETED',
      rating: 9.8,
    },
    novel: {
      id: 'solo_leveling_novel',
      title: 'Solo Leveling (Chugong / Web Novel)',
      coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      status: 'COMPLETED',
      rating: 9.6,
    },
  },
  {
    key: 'jujutsu_kaisen',
    franchiseTitle: 'Jujutsu Kaisen',
    anime: {
      id: 113415,
      title: 'Jujutsu Kaisen TV',
      coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      status: 'COMPLETED',
      rating: 8.9,
    },
    manga: {
      id: 'jujutsu_kaisen_manga',
      title: 'Jujutsu Kaisen (Gege Akutami)',
      coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      status: 'COMPLETED',
      rating: 9.2,
    },
    novel: {
      id: 'jujutsu_kaisen_novel',
      title: 'Jujutsu Kaisen: Soaring Summer and Autumn Return',
      coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      status: 'COMPLETED',
      rating: 8.5,
    },
  },
  {
    key: 'overlord',
    franchiseTitle: 'Overlord',
    anime: {
      id: 21127,
      title: 'Overlord Seasons 1-4',
      coverUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
      status: 'COMPLETED',
      rating: 8.4,
    },
    manga: {
      id: 'overlord_manga',
      title: 'Overlord Manga Adaptation',
      coverUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
      status: 'ONGOING',
      rating: 8.6,
    },
    novel: {
      id: 'overlord_novel',
      title: 'Overlord (Kugane Maruyama Original LN)',
      coverUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
      status: 'ONGOING',
      rating: 9.7,
    },
  },
  {
    key: 'shadow_slave',
    franchiseTitle: 'Shadow Slave (Guiltythree)',
    anime: {
      id: 99991,
      title: 'Shadow Slave (Anime In Concept)',
      coverUrl: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600&auto=format&fit=crop&q=80',
      status: 'NOT_YET_RELEASED',
      rating: 9.5,
    },
    manga: {
      id: 'shadow_slave_manga',
      title: 'Shadow Slave Webtoon / Manhwa',
      coverUrl: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600&auto=format&fit=crop&q=80',
      status: 'ONGOING',
      rating: 9.6,
    },
    novel: {
      id: 'shadow_slave_novel',
      title: 'Shadow Slave (Original Web Novel)',
      coverUrl: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600&auto=format&fit=crop&q=80',
      status: 'ONGOING',
      rating: 9.8,
    },
  },
  {
    key: 'lord_of_the_mysteries',
    franchiseTitle: 'Lord of the Mysteries (Cuttlefish)',
    anime: {
      id: 99992,
      title: 'Lord of the Mysteries (Donghua / Anime)',
      coverUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
      status: 'NOT_YET_RELEASED',
      rating: 9.8,
    },
    manga: {
      id: 'lotm_manga',
      title: 'Lord of the Mysteries Manhua',
      coverUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
      status: 'ONGOING',
      rating: 9.1,
    },
    novel: {
      id: 'lotm_novel',
      title: 'Lord of the Mysteries (Original Web Novel)',
      coverUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
      status: 'COMPLETED',
      rating: 9.9,
    },
  },
];

/**
 * Cross-resolve connected media across Anime, Manga, and Light Novels.
 */
export function getCrossMediaConnections(
  sourceType: MediaType,
  sourceId: string | number,
  sourceTitle?: string
): CrossMediaBundle {
  const queryStr = (sourceTitle || String(sourceId)).toLowerCase();

  // 1. Find matching franchise in curated index
  const match = FRANCHISE_INDEX.find((f) => {
    if (sourceType === 'ANIME' && (f.anime?.id === Number(sourceId) || queryStr.includes(f.key.replace(/_/g, ' ')))) return true;
    if (sourceType === 'MANGA' && (f.manga?.id === String(sourceId) || queryStr.includes(f.key.replace(/_/g, ' ')))) return true;
    if (sourceType === 'NOVEL' && (f.novel?.id === String(sourceId) || queryStr.includes(f.key.replace(/_/g, ' ')))) return true;
    return queryStr.includes(f.key.replace(/_/g, ' '));
  });

  const connectedItems: ConnectedMediaNode[] = [];

  if (match) {
    if (sourceType !== 'ANIME' && match.anime) {
      connectedItems.push({
        id: match.anime.id,
        mediaType: 'ANIME',
        title: match.anime.title,
        coverUrl: match.anime.coverUrl,
        relationship: 'ANIME_ADAPTATION',
        status: match.anime.status,
        rating: match.anime.rating,
        badgeLabel: '🎬 Anime Series',
      });
    }

    if (sourceType !== 'MANGA' && match.manga) {
      connectedItems.push({
        id: match.manga.id,
        mediaType: 'MANGA',
        title: match.manga.title,
        coverUrl: match.manga.coverUrl,
        relationship: match.novel ? 'MANGA_ADAPTATION' : 'ORIGINAL_MANGA',
        status: match.manga.status,
        rating: match.manga.rating,
        badgeLabel: '📖 Manga / Webtoon',
      });
    }

    if (sourceType !== 'NOVEL' && match.novel) {
      connectedItems.push({
        id: match.novel.id,
        mediaType: 'NOVEL',
        title: match.novel.title,
        coverUrl: match.novel.coverUrl,
        relationship: 'ORIGINAL_LIGHT_NOVEL',
        status: match.novel.status,
        rating: match.novel.rating,
        badgeLabel: '📜 Original Light Novel',
      });
    }

    return {
      sourceMediaType: sourceType,
      sourceId,
      franchiseTitle: match.franchiseTitle,
      connectedItems,
    };
  }

  // 2. Dynamic Fallback for non-indexed titles
  const cleanTitle = (sourceTitle || 'Series').replace(/Season.*|TV.*|Part.*/i, '').trim();

  if (sourceType !== 'ANIME') {
    connectedItems.push({
      id: 151807,
      mediaType: 'ANIME',
      title: `${cleanTitle} (Anime Adaptation)`,
      coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      relationship: 'ANIME_ADAPTATION',
      status: 'RELEASING',
      rating: 8.7,
      badgeLabel: '🎬 Anime Series',
    });
  }

  if (sourceType !== 'MANGA') {
    connectedItems.push({
      id: `manga_${cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      mediaType: 'MANGA',
      title: `${cleanTitle} (Manga / Webtoon)`,
      coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      relationship: 'MANGA_ADAPTATION',
      status: 'ONGOING',
      rating: 9.1,
      badgeLabel: '📖 Manga Adaptation',
    });
  }

  if (sourceType !== 'NOVEL') {
    connectedItems.push({
      id: `novel_${cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      mediaType: 'NOVEL',
      title: `${cleanTitle} (Original Light Novel)`,
      coverUrl: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600&auto=format&fit=crop&q=80',
      relationship: 'ORIGINAL_LIGHT_NOVEL',
      status: 'ONGOING',
      rating: 9.5,
      badgeLabel: '📜 Light Novel Source',
    });
  }

  return {
    sourceMediaType: sourceType,
    sourceId,
    franchiseTitle: cleanTitle,
    connectedItems,
  };
}
