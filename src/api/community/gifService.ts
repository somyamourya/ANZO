export interface AnimeGifItem {
  id: string;
  title: string;
  url: string;
  category: string;
  previewUrl: string;
}

const CURATED_ANIME_GIFS: AnimeGifItem[] = [
  {
    id: 'gif_hype_1',
    title: 'Gojo Satoru Domain Expansion',
    category: 'Hype',
    url: 'https://media.giphy.com/media/UgV8Y7bDxsZDCP057i/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/UgV8Y7bDxsZDCP057i/giphy.gif',
  },
  {
    id: 'gif_hype_2',
    title: 'Sukuna Malevolent Shrine',
    category: 'Hype',
    url: 'https://media.giphy.com/media/4lu5FuhtrbaOQgKN57/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/4lu5FuhtrbaOQgKN57/giphy.gif',
  },
  {
    id: 'gif_fight_1',
    title: 'Sung Jinwoo Arise Solo Leveling',
    category: 'Fight',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnZodmg4b2dpdTV4cG1sYnl2cGt2aHN2bXk2a3VwYmN1Z2Q3eWppciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKMt1VVNkHV2PaE/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnZodmg4b2dpdTV4cG1sYnl2cGt2aHN2bXk2a3VwYmN1Z2Q3eWppciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKMt1VVNkHV2PaE/giphy.gif',
  },
  {
    id: 'gif_reaction_1',
    title: 'Anya Shocked Heh',
    category: 'Reaction',
    url: 'https://media.giphy.com/media/FWAcpJsFT9mVRv0e7a/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/FWAcpJsFT9mVRv0e7a/giphy.gif',
  },
  {
    id: 'gif_laugh_1',
    title: 'Luffy Laughing Gear 5',
    category: 'Laugh',
    url: 'https://media.giphy.com/media/fZdzEHC8sMC0E/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/fZdzEHC8sMC0E/giphy.gif',
  },
  {
    id: 'gif_cry_1',
    title: 'Deku Crying Waterfall',
    category: 'Cry',
    url: 'https://media.giphy.com/media/L95W4wv8nnb9K/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/L95W4wv8nnb9K/giphy.gif',
  },
  {
    id: 'gif_love_1',
    title: 'Marin Kitagawa Sparkle Smile',
    category: 'Love',
    url: 'https://media.giphy.com/media/kU4v59GqCksW0w7p4q/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/kU4v59GqCksW0w7p4q/giphy.gif',
  },
  {
    id: 'gif_fight_2',
    title: 'Demon Slayer Hinokami Kagura',
    category: 'Fight',
    url: 'https://media.giphy.com/media/jhqGI273rk87u/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/jhqGI273rk87u/giphy.gif',
  },
];

export async function searchAnimeGifs(query = '', category = 'All'): Promise<AnimeGifItem[]> {
  // Simulates instant or keyword filtered animated GIF gallery
  let results = CURATED_ANIME_GIFS;
  if (category && category !== 'All') {
    results = results.filter((g) => g.category.toLowerCase() === category.toLowerCase());
  }
  if (query.trim()) {
    const q = query.toLowerCase();
    results = results.filter((g) => g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q));
  }
  return results;
}

export function getGifCategories(): string[] {
  return ['All', 'Hype', 'Reaction', 'Fight', 'Laugh', 'Cry', 'Love'];
}
