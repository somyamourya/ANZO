import axios from 'axios';
import { StreamData, SubtitleTrack, VideoSource } from '../../types/anime';

// HiAnime / Zoro / MegaCloud extraction endpoints & public proxies
const CONSUMET_API_BASE = 'https://anime-api-phi.vercel.app/anime/zoro';
const BACKUP_ZORO_API = 'https://api.amvstr.me/api/v2';

export async function extractHiAnimeStream(
  animeTitle: string,
  episodeNumber: number
): Promise<StreamData | null> {
  try {
    const cleanTitle = animeTitle
      .replace(/[^\w\s-]/gi, '')
      .trim()
      .toLowerCase();

    // 1. Search anime ID on Zoro/HiAnime
    const searchUrl = `${CONSUMET_API_BASE}/${encodeURIComponent(cleanTitle)}`;
    const searchRes = await axios.get(searchUrl, { timeout: 7000 });
    const results = searchRes.data?.results || [];

    if (results.length === 0) return null;

    const zoroAnimeId = results[0].id;

    // 2. Fetch anime episode list
    const epUrl = `${CONSUMET_API_BASE}/info?id=${encodeURIComponent(zoroAnimeId)}`;
    const epRes = await axios.get(epUrl, { timeout: 7000 });
    const episodes = epRes.data?.episodes || [];

    const targetEp = episodes.find((ep: any) => ep.number === episodeNumber) || episodes[episodeNumber - 1];
    if (!targetEp) return null;

    // 3. Extract stream sources (MegaCloud / VidCloud)
    const watchUrl = `${CONSUMET_API_BASE}/watch?episodeId=${encodeURIComponent(targetEp.id)}&server=vidcloud`;
    const watchRes = await axios.get(watchUrl, { timeout: 8000 });
    const watchData = watchRes.data;

    if (!watchData || !watchData.sources || watchData.sources.length === 0) return null;

    const sources: VideoSource[] = watchData.sources.map((s: any) => ({
      url: s.url,
      quality: s.quality === 'auto' ? 'auto' : (s.quality || 'default'),
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
      provider: 'HiAnime (MegaCloud)',
      serverName: 'MegaCloud Fast HLS',
      intro: watchData.intro,
      outro: watchData.outro,
      headers: watchData.headers,
      embedUrl: watchData.embedURL || `https://megacloud.tv/embed-2/e-1/${targetEp.id}`,
    };
  } catch (error) {
    console.warn('[HiAnime Provider] Stream extraction fallback triggered for:', animeTitle, error);
    return null;
  }
}
