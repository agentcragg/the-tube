// Some stills have black bars baked into the picture: a film shot wider than
// 16:9 in a YouTube thumbnail, say. These work out how thick the bars are in
// the browser, so a frame can zoom just past them. Only near-black bars of
// equal size on opposite sides count, so a night sky or a shadow down one
// side isn't mistaken for one.

export type Bars = { v: number; h: number }; // bar on each side, as a fraction of the height / width

// Hosts that allow the browser to read their pixels (they send CORS headers).
// Pictures from anywhere else are left as they are.
const READABLE_HOSTS = ["i.ytimg.com", "image.tmdb.org"];

export function canMeasure(src: string) {
  try {
    return READABLE_HOSTS.includes(new URL(src).hostname);
  } catch {
    return false;
  }
}

const cache = new Map<string, Bars>();
const NONE: Bars = { v: 0, h: 0 };
const SAMPLE_WIDTH = 160;
const DARK = 24; // brightest a bar pixel can be, out of 255
const MARGIN = 0.012; // trim a hair more (about one sample row), so no dark line is left at the edge

export function measureBars(img: HTMLImageElement): Bars {
  const key = img.currentSrc || img.src;
  const known = cache.get(key);
  if (known) return known;

  let bars = NONE;
  try {
    const W = img.naturalWidth;
    const H = img.naturalHeight;
    const canvas = document.createElement("canvas");
    const sw = SAMPLE_WIDTH;
    const sh = Math.max(1, Math.round((H * sw) / W));
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (W && H && ctx) {
      ctx.drawImage(img, 0, 0, sw, sh);
      const d = ctx.getImageData(0, 0, sw, sh).data;
      const lum = (x: number, y: number) => {
        const i = (y * sw + x) * 4;
        return 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      };
      const rowDark = (y: number) => {
        for (let x = 0; x < sw; x++) if (lum(x, y) >= DARK) return false;
        return true;
      };
      const colDark = (x: number) => {
        for (let y = 0; y < sh; y++) if (lum(x, y) >= DARK) return false;
        return true;
      };
      const run = (n: number, dark: (i: number) => boolean) => {
        let k = 0;
        while (k < n / 3 && dark(k)) k++;
        return k;
      };
      const top = run(sh, rowDark);
      const bottom = run(sh, (k) => rowDark(sh - 1 - k));
      const left = run(sw, colDark);
      const right = run(sw, (k) => colDark(sw - 1 - k));
      const pair = (a: number, b: number, n: number) =>
        a / n > 0.02 && b / n > 0.02 && Math.abs(a - b) / n < 0.04 ? Math.min(a, b) / n + MARGIN : 0;
      bars = { v: pair(top, bottom, sh), h: pair(left, right, sw) };
    }
  } catch {
    // The pixels couldn't be read: leave the picture alone
  }
  cache.set(key, bars);
  return bars;
}

/**
 * How much to zoom a picture shown with object-fit: cover so none of its bars
 * show. imageAspect and frameAspect are width / height.
 */
export function zoomPastBars({ v, h }: Bars, imageAspect: number, frameAspect: number) {
  if (!v && !h) return 1;
  // Cover already crops the longer side, which may take the bars off anyway
  const zv = imageAspect >= frameAspect ? 1 / (1 - 2 * v) : imageAspect / (frameAspect * (1 - 2 * v));
  const zh = imageAspect >= frameAspect ? frameAspect / (imageAspect * (1 - 2 * h)) : 1 / (1 - 2 * h);
  return Math.max(1, zv, zh);
}
