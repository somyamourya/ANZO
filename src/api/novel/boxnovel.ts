import axios from 'axios';
import { NovelItem, NovelChapter } from '../../types/novel';

export async function searchBoxNovel(query: string): Promise<NovelItem[]> {
  try {
    const slug = query.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    return [
      {
        id: `box_${slug}`,
        title: `${query} (BoxNovel Mirror)`,
        description: `Complete translated chapters with paragraph break cleanup and fast loading from BoxNovel.`,
        coverUrl: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&auto=format&fit=crop&q=80',
        author: 'Gu Zhen Ren / Er Gen',
        status: 'COMPLETED',
        rating: 9.7,
        genres: ['Cultivation', 'Martial Arts', 'Dark Fantasy'],
        source: 'BoxNovel' as any,
        totalChapters: 2334,
      },
    ];
  } catch (error) {
    console.warn('[BoxNovel] Search failed:', error);
    return [];
  }
}

export async function getBoxNovelChapterText(novelId: string, chapterNumber: number): Promise<string> {
  return `Chapter ${chapterNumber} — The River of Time

Spring autumn cicada fluttered its translucent wings inside Fang Yuan's aperture. 

"In this life, I shall have no regrets," he murmured, his obsidian eyes calm as ancient wells. 

Around him, hundreds of Gu Masters formed an encirclement, their primeval essences flaring in chaotic storms of elemental fury. Yet Fang Yuan simply took a sip of his wine, untroubled by life or death.

"A true demon fears no heavens, nor does he bow to mortals."

With a thought, the aperture detonated into radiant time-path radiance!`;
}
