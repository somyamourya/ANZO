import axios from 'axios';

const ANISKIP_BASE_URL = 'https://api.aniskip.com/v2/skip-times';

export interface SkipInterval {
  startTime: number;
  endTime: number;
}

export interface AniSkipResult {
  op?: SkipInterval;
  ed?: SkipInterval;
  statusCode: number;
}

export async function fetchAniSkipTimes(
  malId: number,
  episodeNumber: number,
  episodeLengthSeconds: number = 1440
): Promise<AniSkipResult> {
  try {
    const types = ['op', 'ed', 'mixed-op', 'mixed-ed', 'recap'];
    const queryTypes = types.map((t) => `types=${t}`).join('&');
    const url = `${ANISKIP_BASE_URL}/${malId}/${episodeNumber}?${queryTypes}&episodeLength=${episodeLengthSeconds}`;

    const response = await axios.get(url, { timeout: 6000 });
    const results = response.data?.results || [];

    let op: SkipInterval | undefined;
    let ed: SkipInterval | undefined;

    for (const item of results) {
      if (item.skipType === 'op' || item.skipType === 'mixed-op') {
        op = {
          startTime: item.interval.startTime,
          endTime: item.interval.endTime,
        };
      } else if (item.skipType === 'ed' || item.skipType === 'mixed-ed') {
        ed = {
          startTime: item.interval.startTime,
          endTime: item.interval.endTime,
        };
      }
    }

    return {
      op,
      ed,
      statusCode: response.data?.statusCode || 200,
    };
  } catch (error) {
    // Graceful fallback if no skip times are registered for this episode
    return {
      statusCode: 404,
    };
  }
}
