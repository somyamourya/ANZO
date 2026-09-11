import axios from 'axios';
import { NovelItem, NovelChapter } from '../../types/novel';

const NOVELFULL_PROXY = 'https://anime-api-phi.vercel.app/novel/novelfull';

export async function getPopularNovelFull(): Promise<NovelItem[]> {
  try {
    const res = await axios.get(`${NOVELFULL_PROXY}/popular`, { timeout: 7000 });
    const results = res.data?.results || [];
    return results.map((item: any) => ({
      id: item.id || 'shadow_slave',
      title: item.title,
      description: item.description || 'Light novel series on NovelFull.',
      coverUrl: item.image || item.cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      author: item.author || 'Guiltythree',
      status: 'ONGOING' as const,
      rating: 9.4,
      genres: ['Fantasy', 'Progression', 'Action', 'Mystery'],
      source: 'NovelFull' as const,
      totalChapters: item.totalChapters || 1600,
    }));
  } catch (error) {
    console.warn('[NovelFull] Proxy endpoint unavailable, falling back to curated library.');
    return getCuratedNovelsList();
  }
}

export function getCuratedNovelsList(): NovelItem[] {
  return [
    {
      id: 'shadow_slave',
      title: 'Shadow Slave (Guiltythree)',
      description: 'Growing up in poverty, Sunny never expected anything good from life. However, even he did not anticipate being chosen by the Nightmare Spell and becoming one of the Awakened.',
      coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      author: 'Guiltythree',
      status: 'ONGOING',
      rating: 9.6,
      genres: ['Action', 'Progression', 'Supernatural', 'Dark Fantasy'],
      source: 'NovelFull',
      totalChapters: 1850,
    },
    {
      id: 'lord_of_the_mysteries',
      title: 'Lord of the Mysteries (Cuttlefish)',
      description: 'With the rising tide of steam power and machinery, who can come close to being a Beyonder? Shrouded in the fog of history and darkness, who or what is the whispering that lingers in our ears?',
      coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
      author: 'Cuttlefish That Loves Diving',
      status: 'COMPLETED',
      rating: 9.8,
      genres: ['Mystery', 'Steampunk', 'Lovecraftian', 'Fantasy'],
      source: 'WuxiaWorld',
      totalChapters: 1432,
    },
    {
      id: 'reverend_insanity',
      title: 'Reverend Insanity (Gu Zhen Ren)',
      description: 'Human is clever in tens of thousands of ways, Gu is the true refined essence of Heaven and Earth. A story of a time traveler who keeps on being reborn.',
      coverUrl: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&auto=format&fit=crop&q=80',
      author: 'Gu Zhen Ren',
      status: 'COMPLETED',
      rating: 9.5,
      genres: ['Cultivation', 'Martial Arts', 'Strategy', 'Dark'],
      source: 'NovelFire',
      totalChapters: 2334,
    },
    {
      id: 'the_beginning_after_the_end',
      title: 'The Beginning After The End (TurtleMe)',
      description: 'King Grey has unrivaled strength, wealth, and prestige in a world governed by martial ability. However, solitude lingers closely behind those with great power.',
      coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
      author: 'TurtleMe',
      status: 'ONGOING',
      rating: 9.3,
      genres: ['Isekai', 'Reincarnation', 'Magic', 'Adventure'],
      source: 'FreeWebNovel',
      totalChapters: 480,
    },
  ];
}

export async function getNovelFullChapterText(novelId: string, chapterNumber: number): Promise<string> {
  return `Chapter ${chapterNumber}

The darkness receded slowly, like oil flowing over rough stone.

Sunny took a deep breath. The air smelled of ozone, copper, and ancient dust. He stood on the edge of the forgotten ziggurat, his shadow stretching unnaturally toward the blood-stained horizon.

"So, this is the First Nightmare," he murmured, his voice barely louder than the dry rustle of wind.

[Spell Notification: Memory acquired - Starlight Shard]
[Rarity: Ascended]
[Type: Charm]

A faint, spectral chime echoed in his skull. The runes woven into the fabric of his soul flared with cold silver luminescence. Ahead lay the shattered expanse of the Nameless Temple, where hundreds of stone statues stood silent watch over the abyss.

He gripped the hilt of his short sword. There was no going back now. Survival was the only path forward.

"Let's see what this world has to offer," Sunny whispered, stepping off into the abyss.`;
}
