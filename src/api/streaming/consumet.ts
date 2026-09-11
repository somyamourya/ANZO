import axios from 'axios';
import { StreamData, VideoSource, SubtitleTrack } from '../../types/anime';

const CONSUMET_PAHE_BASE = 'https://anime-api-phi.vercel.app/anime/animepahe';

export async function extractPaheStream(
  animeTitle: string,
  episodeNumber: number
): Promise<StreamData | null> {
  try {
    const cleanTitle = animeTitle.replace(/[^\w\s-]/gi, '').trim();
    const searchRes = await axios.get(`${CONSUMET_PAHE_BASE}/${encodeURIComponent(cleanTitle)}`, { timeout: 7000 });
    const results = searchRes.data?.results || [];
    if (results.length === 0) return null;

    const paheId = results[0].id;
    const infoRes = await axios.get(`${CONSUMET_PAHE_BASE}/info/${encodeURIComponent(paheId)}`, { timeout: 7000 });
    const episodes = infoRes.data?.episodes || [];
    const targetEp = episodes.find((ep: any) => ep.number === episodeNumber) || episodes[episodeNumber - 1];
    if (!targetEp) return null;

    const watchRes = await axios.get(`${CONSUMET_PAHE_BASE}/watch/${encodeURIComponent(targetEp.id)}`, { timeout: 8000 });
    const watchData = watchRes.data;

    if (!watchData || !watchData.sources || watchData.sources.length === 0) return null;

    const sources: VideoSource[] = watchData.sources.map((s: any) => ({
      url: s.url,
      quality: s.quality || 'auto',
      isM3U8: s.isM3U8 ?? s.url.includes('.m3u8'),
    }));

    return {
      sources,
      subtitles: [],
      provider: 'AnimePahe',
      serverName: 'Pahe HLS Stream',
      headers: watchData.headers,
    };
  } catch (error) {
    console.warn('[AnimePahe Provider] Extraction failed:', error);
    return null;
  }
}
