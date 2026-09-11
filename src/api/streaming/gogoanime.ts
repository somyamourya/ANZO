import axios from 'axios';
import { StreamData, VideoSource, SubtitleTrack } from '../../types/anime';

const GOGO_API_BASE = 'https://anime-api-phi.vercel.app/anime/gogoanime';

export async function extractGogoanimeStream(
  animeTitle: string,
  episodeNumber: number
): Promise<StreamData | null> {
  try {
    const cleanTitle = animeTitle
      .replace(/[^\w\s-]/gi, '')
      .trim()
      .toLowerCase();

    // 1. Search Anime
    const searchUrl = `${GOGO_API_BASE}/${encodeURIComponent(cleanTitle)}`;
    const searchRes = await axios.get(searchUrl, { timeout: 7000 });
    const results = searchRes.data?.results || [];

    if (results.length === 0) return null;

    const gogoId = results[0].id;

    // 2. Fetch Episode list
    const infoUrl = `${GOGO_API_BASE}/info/${encodeURIComponent(gogoId)}`;
    const infoRes = await axios.get(infoUrl, { timeout: 7000 });
    const episodes = infoRes.data?.episodes || [];

    const targetEp = episodes.find((ep: any) => ep.number === episodeNumber) || episodes[episodeNumber - 1];
    if (!targetEp) return null;

    // 3. Extract stream sources
    const watchUrl = `${GOGO_API_BASE}/watch/${encodeURIComponent(targetEp.id)}`;
    const watchRes = await axios.get(watchUrl, { timeout: 8000 });
    const watchData = watchRes.data;

    if (!watchData || !watchData.sources || watchData.sources.length === 0) return null;

    const sources: VideoSource[] = watchData.sources.map((s: any) => ({
      url: s.url,
      quality: s.quality === 'default' ? 'auto' : s.quality,
      isM3U8: s.isM3U8 ?? s.url.includes('.m3u8'),
    }));

    const subtitles: SubtitleTrack[] = (watchData.subtitles || [])
      .filter((sub: any) => sub.lang && sub.url)
      .map((sub: any) => ({
        url: sub.url,
        lang: sub.lang.toLowerCase(),
        label: sub.lang,
        isDefault: sub.lang.toLowerCase().includes('english') || sub.lang.toLowerCase().includes('en'),
      }));

    return {
      sources,
      subtitles,
      provider: 'Gogoanime',
      serverName: 'Vidstreaming Direct',
      headers: watchData.headers,
      embedUrl: watchData.download || `https://anitaku.to/streaming.php?id=${targetEp.id}`,
    };
  } catch (error) {
    console.warn('[Gogoanime Provider] Stream extraction failed for:', animeTitle, error);
    return null;
  }
}
