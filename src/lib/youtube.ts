// Reads the channel's latest long video at build time from YouTube's public
// RSS feed (no API key). The "UULF" playlist holds uploads without Shorts,
// which are vertical and would not fit the 16:9 cover.
const CHANNEL_ID = 'UCAfelCEggeAR-jMoGgKpQTQ';
const FEED = `https://www.youtube.com/feeds/videos.xml?playlist_id=UULF${CHANNEL_ID.slice(2)}`;

// Used when the feed cannot be read, so a network hiccup never breaks the build.
const FALLBACK = { id: 'P0IYECs7lxA', title: 'Natankyū' };

export interface LatestVideo {
  id: string;
  title: string;
  thumbnail: string;
}

const decode = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

async function get(url: string, method = 'GET') {
  return fetch(url, { method, signal: AbortSignal.timeout(8000) });
}

async function thumbnailFor(id: string) {
  const maxres = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
  try {
    if ((await get(maxres, 'HEAD')).ok) return maxres;
  } catch {}
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

let cached: Promise<LatestVideo> | undefined;

export function getLatestVideo(): Promise<LatestVideo> {
  cached ??= (async () => {
    let video = FALLBACK;
    try {
      const res = await get(FEED);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const entry = (await res.text()).split('<entry>')[1] ?? '';
      const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
      const title = entry.match(/<title>([^<]*)<\/title>/)?.[1];
      if (id) video = { id, title: title ? decode(title) : FALLBACK.title };
    } catch (e) {
      console.warn(`[youtube] feed unavailable, using ${FALLBACK.id}: ${(e as Error).message}`);
    }
    return { ...video, thumbnail: await thumbnailFor(video.id) };
  })();
  return cached;
}
