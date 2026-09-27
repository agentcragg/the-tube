// The YouTube IFrame Player API, loaded once, on demand. Only the parts the
// trailer player uses are typed here.

export const STATE = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 } as const;

export type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  getIframe(): HTMLIFrameElement;
  destroy(): void;
};

type YTPlayerOptions = {
  videoId: string;
  host?: string;
  width?: string | number;
  height?: string | number;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: (e: { target: YTPlayer }) => void;
    onStateChange?: (e: { data: number; target: YTPlayer }) => void;
    onError?: (e: { data: number; target: YTPlayer }) => void;
  };
};

export type YTApi = {
  Player: new (el: HTMLElement, options: YTPlayerOptions) => YTPlayer;
};

type YTWindow = Window & { YT?: YTApi & { loaded?: number }; onYouTubeIframeAPIReady?: () => void };

const API = "https://www.youtube.com/iframe_api";
const GIVE_UP = 10_000; // then the player falls back to a plain embed

let loading: Promise<YTApi> | null = null;

export function loadYouTubeApi(): Promise<YTApi> {
  if (loading) return loading;
  loading = new Promise<YTApi>((resolve, reject) => {
    const w = window as YTWindow;
    const ready = () => (w.YT?.Player && w.YT.loaded ? w.YT : null);
    const already = ready();
    if (already) return resolve(already);

    const fail = () => {
      loading = null;
      reject(new Error("The YouTube player didn't load"));
    };
    // Another part of the site may be waiting on the same API: keep its callback.
    // Polling as well covers anyone who replaces this callback after us.
    const previous = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      previous?.();
      const yt = ready();
      if (yt) finish(yt);
    };
    const started = Date.now();
    const poll = window.setInterval(() => {
      const yt = ready();
      if (yt) finish(yt);
      else if (Date.now() - started > GIVE_UP) {
        window.clearInterval(poll);
        fail();
      }
    }, 100);
    function finish(yt: YTApi) {
      window.clearInterval(poll);
      resolve(yt);
    }

    if (document.querySelector(`script[src="${API}"]`)) return;
    const s = document.createElement("script");
    s.src = API;
    s.async = true;
    s.onerror = () => {
      window.clearInterval(poll);
      s.remove();
      fail();
    };
    document.head.appendChild(s);
  });
  return loading;
}

/** "01:43", as on the player's clock */
export function clock(seconds: number) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const pad = (n: number) => String(n).padStart(2, "0");
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`;
}

/** "1:43", as on a thumbnail badge */
export function shortClock(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
