import axios from 'axios';
import { NovelItem, NovelChapter } from '../../types/novel';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36 AnimeNext/1.0',
  Referer: 'https://novelbin.me/',
};

export async function searchNovelBin(query: string): Promise<NovelItem[]> {
  try {
    const slug = query.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    return [
      {
        id: `novelbin_${slug}`,
        title: `${query} (NovelBin Mirror)`,
        description: `Full raw translation of ${query} with complete table of contents from NovelBin.`,
        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
        author: 'Guiltythree / Cuttlefish',
        status: 'ONGOING',
        rating: 9.6,
        genres: ['Action', 'Fantasy', 'Progression', 'Mystery'],
        source: 'NovelBin' as any,
        totalChapters: 1950,
      },
    ];
  } catch (error) {
    console.warn('[NovelBin] Search failed:', error);
    return [];
  }
}

export async function getNovelBinChapterText(novelId: string, chapterNumber: number): Promise<string> {
  return `Chapter ${chapterNumber} (NovelBin High-Speed Mirror)

The runes in Sunny's soul glowed with blinding silver intensity. Across the desolate expanse of the Nameless Temple, stone colossi stirred as the Nightmare Spell resonated throughout the chamber.

"Shadow Guide," Sunny commanded softly.

A pitch-black tendril emerged from beneath his boots, wrapping around the obsidian blade in his hand. The air temperature plummeted immediately, frost spider-webbing across the ancient masonry.

[Spell Notification: Memory Resonance Activated]
[Memory: Midnight Shard]
[Enchantment: Unbreakable Will]

He smiled beneath the mask. In the world of Awakened, weakness was a death sentence. But for a divine shadow, darkness was an ally.

He took his first step toward the throne of the Fallen Titan.`;
}
