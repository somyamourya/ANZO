import axios from 'axios';
import { NovelItem } from '../../types/novel';

export async function searchNovelFire(query: string): Promise<NovelItem[]> {
  const clean = query.toLowerCase().trim();
  const mockNovels: NovelItem[] = [
    {
      id: 'coiling_dragon',
      title: 'Coiling Dragon (I Eat Tomatoes)',
      description: 'Empires rise and fall on the Yulan Continent. Saints, immortal beings of unimaginable power, battle using spells and swords, leaving swaths of destruction in their wake.',
      coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop&q=80',
      author: 'I Eat Tomatoes',
      status: 'COMPLETED',
      rating: 9.1,
      genres: ['Cultivation', 'Action', 'Fantasy'],
      source: 'NovelFire',
      totalChapters: 806,
    },
  ];

  return mockNovels.filter((n) => n.title.toLowerCase().includes(clean));
}
